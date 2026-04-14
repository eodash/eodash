import axios from "@/plugins/axios";
import { mosaicState } from "@/utils/states";
import { datetime, mapEl, mapPosition } from "@/store/states";
import { getLayers } from "@/store/actions";
import { nextTick, onMounted, onUnmounted, watch } from "vue";
import { useOnLayersUpdate } from "@/composables";
import { extractLayerTimeValues } from "./helpers";
import { toAbsolute } from "stac-js/src/http.js";
import { useSTAcStore } from "@/store/stac";
import log from "loglevel";

/**
 * Each handler is responsible for a specific asset type.
 * It receives the raw asset object and returns the full TiTiler `assets` param
 * string, or null if the asset is not usable.
 * Add new entries here to support additional asset types (e.g. COG, GeoTIFF).
 * @typedef {{ key: string, getAssetParam: (asset: Record<string, any>) => string | null, id: string }} AssetHandler
 */

/**
 * Registry of TiTiler-supported STAC asset types.
 * @type {AssetHandler[]}
 */
const ASSET_HANDLERS = [
  {
    id: "geozarr-sentinel-2",
    key: "reflectance",
    getAssetParam: (asset) => {
      const vars = asset["bands"];
      if (!vars) return null;
      //@ts-expect-error todo
      const bands = vars.map((b) => b.name);
      const rgb = ["b04", "b03", "b02"].every((b) => bands.includes(b))
        ? ["b04", "b03", "b02"]
        : bands.slice(0, 3);
      return `reflectance|bands=${rgb.join(",")}`;
    },
  },
];

/**
 * Builds the TiTiler `assets` query param from a STAC item's assets.
 * Iterates registered handlers in order and returns the first non-null result.
 * @param {Record<string, any> | null | undefined} assets
 * @returns {string | null}
 */
export function buildAssetsParam(assets) {
  if (!assets) return null;

  for (const handler of ASSET_HANDLERS) {
    const asset = assets[handler.key];
    if (!asset) continue;
    const param = handler.getAssetParam(asset);
    if (param) return param;
  }

  return null;
}

/**
 * Resolves the assets of the first available STAC item for the selected collection.
 * Uses the currently selected item if it is a full StacItem with assets, otherwise
 * fetches the first item from the collection's items endpoint.
 */
async function fetchItemAssets() {
  const store = useSTAcStore();
  const { selectedItem, selectedStac, stacEndpoint } = store;
  if (selectedItem && "assets" in selectedItem) {
    return selectedItem.assets;
  }

  if (!selectedStac || !stacEndpoint) return null;

  const selfLink = selectedStac.links?.find((l) => l.rel === "self")?.href;
  const itemsLink = selectedStac.links?.find((l) => l.rel === "items");

  let itemsUrl;
  if (itemsLink) {
    const base = toAbsolute(itemsLink.href, selfLink || stacEndpoint);
    itemsUrl = base + (base.includes("?") ? "&" : "?") + "limit=1";
  } else {
    itemsUrl = `${stacEndpoint}/collections/${selectedStac.id}/items?limit=1`;
  }

  try {
    const resp = await axios.get(itemsUrl);
    const features = resp.data?.features;
    if (features?.length) {
      return features[0].assets ?? null;
    }
  } catch (e) {
    console.warn("[eodash] Failed to fetch item assets for mosaic", e);
  }

  return null;
}

/**
 * Creates a layer configuration for the mosaic.
 * @param {string} mosaicEndpoint - The TileJSON URL for the mosaic.
 * @param {Record<string, string> | null} [params] - Query params (datetime, filter, etc.).
 * @returns {Promise<Record<string, any>[]>}
 */
export async function createMosaicLayers(mosaicEndpoint, params) {
  const assets = await fetchItemAssets();
  const assetsParam = buildAssetsParam(assets);

  if (!assetsParam) {
    console.warn("[eodash] No suitable assets found for mosaic layer.");
    return [];
  }

  // TODO: expose rescale and color_formula as configurable rendering options
  const tileParams = new URLSearchParams({
    tilesize: "512",
    assets: assetsParam,
    rescale: "0,1",
    color_formula: "gamma rgb 1.3, sigmoidal rgb 6 0.1, saturation 1.2",
    ...params,
  });
  const tileJsonUrl = `${mosaicEndpoint}?${tileParams.toString()}`;

  const tileJSON = await axios
    .get(tileJsonUrl)
    .then((res) => res.data)
    .catch((err) => {
      console.error("Failed to fetch mosaic TileJSON", err);
      return null;
    });
  if (!tileJSON?.tiles?.[0]) {
    console.warn("[eodash] No tile URL found in mosaic TileJSON response.");
    return [];
  }

  mosaicState.latestLayer = {
    type: "Tile",
    properties: {
      id: `mosaic;:;${Date.now()}`,
      title: "Mosaic Layer",
    },
    source: {
      type: "XYZ",
      url: tileJSON.tiles[0],
    },
  };
  return [mosaicState.latestLayer];
}

/**
 * Ensure the AnalysisGroup exists in the layers collection.
 * @param {Record<string, any>[]} layersCollection
 * @returns {{ layers: Record<string, any>[], analysisGroup: Record<string, any> }}
 */
function ensureAnalysisGroup(layersCollection) {
  let analysisGroup = layersCollection.find(
    (l) => l?.properties?.id === "AnalysisGroup",
  );

  if (!analysisGroup) {
    analysisGroup = {
      type: "Group",
      properties: {
        id: "AnalysisGroup",
        title: "Data Layers",
      },
      layers: [],
    };
    layersCollection.push(analysisGroup);
  }

  return { layers: layersCollection, analysisGroup };
}

/**
 * Fetches time control values from the collection's pre-aggregation link, if present.
 * @param {import("stac-ts").StacCollection} selectedStac
 * @param {string} fallbackBaseUrl
 * @returns {Promise<{ timeControlValues: any, timeControlProperty: string } | null>}
 */
async function fetchPreAggregationTimeValues(selectedStac, fallbackBaseUrl) {
  const preAggregationLink = selectedStac.links?.find(
    (l) => l.rel === "pre-aggregation" && l["aggregation:interval"] === "daily",
  );
  if (!preAggregationLink) return null;

  try {
    const selfLink = selectedStac.links?.find((l) => l.rel === "self")?.href;
    const url = toAbsolute(
      preAggregationLink.href,
      selfLink || fallbackBaseUrl,
    );
    const items = await axios.get(url).then((resp) => resp.data);
    const { timeControlValues } = extractLayerTimeValues(items, datetime.value);
    return timeControlValues
      ? { timeControlValues, timeControlProperty: "TIME" }
      : null;
  } catch (e) {
    console.warn("[eodash] Failed to fetch pre-aggregation for mosaic", e);
    return null;
  }
}

/**
 * Modifies the layers collection to display the mosaic layer.
 * @param {string} mosaicEndpoint - The TileJSON URL for the mosaic.
 * @param {Record<string, string> | null} [params] - Query params forwarded to the tilejson URL.
 */
export async function renderMosaic(mosaicEndpoint, params) {
  const mapLayers = getLayers();
  const { analysisGroup, layers } = ensureAnalysisGroup(mapLayers);
  const mosaicLayers = await createMosaicLayers(mosaicEndpoint, params);

  if (!mosaicLayers.length) {
    return;
  }

  const { selectedStac } = useSTAcStore();
  if (selectedStac) {
    // TODO: cover cases that do not include pre-aggregation links
    const timeValues = await fetchPreAggregationTimeValues(
      selectedStac,
      mosaicEndpoint,
    );
    if (timeValues) {
      mosaicLayers[0].properties.timeControlValues =
        timeValues.timeControlValues;
      mosaicLayers[0].properties.timeControlProperty =
        timeValues.timeControlProperty;
    }
  }

  analysisGroup.layers = mosaicLayers;

  if (mapEl.value) {
    // Reassign to trigger map re-render after in-place layer mutation
    mapEl.value.layers = /** @type {import("@eox/map").EoxLayer[]} */ ([
      ...layers,
    ]);
  }

  log.debug("[eodash] Mosaic layer rendered.", mosaicLayers[0].source.url);
}

/**
 * Updates the mosaic layer based on the current filters.
 * @param {string | undefined | null} mosaicEndpoint - The TileJSON URL for the mosaic.
 * @param {{ timeRange?: [string, string]; filters?: Record<string, import("^/EodashTimeSlider/types").Filter> }} [queries]
 */
export async function updateMosaicLayer(
  mosaicEndpoint,
  { timeRange, filters } = {},
) {
  if (!mosaicEndpoint) return;

  /** @type {Record<string, string>} */
  const params = {};

  if (timeRange && Array.isArray(timeRange) && timeRange.length === 2) {
    const start = timeToDate(timeRange[0]);
    const end = timeToDate(timeRange[1]);
    if (start && end) {
      params.datetime = `${start}/${end}`;
    }
  }

  const cqlFilter = buildCqlFilter(filters);
  if (cqlFilter) {
    params.filter = cqlFilter;
    params["filter-lang"] = "cql2-text";
  }

  const query = Object.keys(params).length > 0 ? params : null;
  mosaicState.query = query;
  await renderMosaic(mosaicEndpoint, query);
}

/**
 * Renders the latest mosaic layer stored in mosaicState.
 */
export function renderLatestMosaic() {
  if (!mosaicState.latestLayer) return;

  const mapLayers = getLayers();
  const { analysisGroup, layers } = ensureAnalysisGroup(mapLayers);
  analysisGroup.layers = [mosaicState.latestLayer];

  if (mapEl.value) {
    // Reassign to trigger map re-render after in-place layer mutation
    mapEl.value.layers = /** @type {import("@eox/map").EoxLayer[]} */ ([
      ...layers,
    ]);
  }
}

/**
 * @param {number} zoomLevel
 * @param {number} [threshold=mosaicState.visibilityThreshold]
 */
function toggleMosaicVisibility(
  zoomLevel,
  threshold = mosaicState.visibilityThreshold,
) {
  if (!mosaicState.latestLayer) return;

  const layerId = /** @type {string} */ (mosaicState.latestLayer.properties.id);
  const layer = mapEl.value?.getLayerById(layerId);
  if (!layer) return;

  layer.setVisible(zoomLevel >= threshold);
}

/**
 * @param {string} mosaicEndpoint - The TileJSON URL for the mosaic.
 * @param {{ timeRange?: [string, string]; cloudCover?: { min: number, max: number } }} [params]
 */
export async function initMosaic(
  mosaicEndpoint,
  { timeRange, cloudCover } = {},
) {
  await updateMosaicLayer(mosaicEndpoint, {
    ...(timeRange && { timeRange }),
    ...(cloudCover !== undefined && { cloudCover }),
  }).then(async () => {
    await nextTick(() => {
      toggleMosaicVisibility(mapPosition.value[2] ?? 0);
    });
  });
}

/**
 * Vue composable that initializes the mosaic layer and keeps it in sync with
 * map zoom and layer updates.
 * @param {string | null | undefined} mosaicEndpoint - Pass null/undefined to disable.
 * @param {{ timeRange?: [string, string] }} [options]
 * @param {string[]} [indicators] - If provided, mosaic only activates for these collection IDs.
 */
export function useInitMosaic(mosaicEndpoint, { timeRange } = {}, indicators) {
  if (!mosaicEndpoint) return;

  const store = useSTAcStore();

  function shouldInitiate() {
    if (!store.selectedStac?.id) return false;
    if (indicators?.length && !indicators.includes(store.selectedStac.id))
      return false;
    return true;
  }

  const stopWatcher = watch(mapPosition, (updatedPos, oldPos) => {
    const [_oldX, _oldY, oldZ] = oldPos;
    const [_x, _y, z] = updatedPos;
    if (!z || z === oldZ) return;
    toggleMosaicVisibility(z);
  });

  onMounted(async () => {
    if (!shouldInitiate()) return;
    initMosaic(mosaicEndpoint, { timeRange });
  });

  useOnLayersUpdate(() => {
    if (!shouldInitiate()) return;
    // Re-add the existing layer without re-fetching when the endpoint hasn't
    // changed — this preserves the current time/filter query baked into the tile URL.
    const endpointPath = new URL(mosaicEndpoint).pathname;
    const isSameEndpoint =
      mosaicState.latestLayer?.source?.url?.includes(endpointPath);
    if (mosaicState.latestLayer && isSameEndpoint) {
      renderLatestMosaic();
      nextTick(() => toggleMosaicVisibility(mapPosition.value[2] ?? 0));
    } else {
      initMosaic(mosaicEndpoint, { timeRange });
    }
  });

  onUnmounted(() => {
    mosaicState.latestLayer = null;
    stopWatcher();
  });
}

/**
 * Converts a filters record (from eox-itemfilter) to a CQL2-text filter string
 * suitable for TiTiler's `filter` query param.
 * Property names containing special characters (e.g. `:`) are double-quoted.
 * @param {Record<string, import("^/EodashTimeSlider/types").Filter> | null | undefined} filters
 * @returns {string}
 */
export function buildCqlFilter(filters) {
  if (!filters) return "";

  /** @type {string[]} */
  const parts = [];

  for (const filter of Object.values(filters)) {
    if (!filter?.key) continue;

    // Quote property names that contain non-word characters (e.g. "eo:cloud_cover")
    const prop = /\W/.test(filter.key) ? `"${filter.key}"` : filter.key;

    if (filter.type === "range" && filter.state) {
      const { min, max } = filter.state;
      if (min && min > (filter.min ?? -Infinity)) {
        parts.push(`${prop} >= ${min}`);
      }
      if (max && max < (filter.max ?? Infinity)) {
        parts.push(`${prop} <= ${max}`);
      }
    } else if (
      filter.type === "multiselect" &&
      filter.stringifiedState?.length
    ) {
      parts.push(`${prop} IN (${filter.stringifiedState})`);
    } else if (filter.type === "select" && filter.stringifiedState) {
      parts.push(`${prop} = '${filter.stringifiedState}'`);
    }
  }

  return parts.join(" AND ");
}

/**
 * @param {string | Date} time
 * @returns {string | null}
 */
function timeToDate(time) {
  if (!time) return null;
  const date = new Date(time);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}
