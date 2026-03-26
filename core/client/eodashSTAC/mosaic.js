import axios from "@/plugins/axios";
import { Item } from "stac-js";
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
 * Fetches the STAC definition for the mosaic. TODO: reuse registered queries
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {{ "filter-lang": "cql2-json", filter: object, sortby: object[] } | null} [body] - The cql2-json POST body.
 * @returns {Promise<import("stac-ts").StacItem | null>}
 */
export async function registerMosaic(mosaicEndpoint, body) {
  if (!mosaicEndpoint) {
    return null;
  }
  if (!body) {
    console.trace("[eodash] No query provided for mosaic registration");
    return null;
  }
  log.debug(
    "[eodash] Registering mosaic endpoint",
    mosaicEndpoint,
    "with body",
    body,
  );
  return await axios
    .post(mosaicEndpoint, body)
    .then((response) => response.data)
    .catch((error) => {
      console.error("[eodash] Failed to register mosaic:", error);
      return null;
    });
}

/**
 * Creates a layer configuration for the mosaic.
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {{ "filter-lang": "cql2-json", filter: object, sortby: object[] } | null} [body] - The cql2-json POST body.
 * @returns {Promise<Record<string, any>[]>}
 */
export async function createMosaicLayers(mosaicEndpoint, body) {
  const mosaicStac = await registerMosaic(mosaicEndpoint, body);
  if (!mosaicStac) {
    return [];
  }

  // treat the mosaic STAC as an item
  const item = new Item(mosaicStac);
  const tileJSONLink = item.links.find((l) => l.rel === "tilejson");
  if (!tileJSONLink) {
    return [];
  }

  // TODO: build rendering params dynamically from timeRange, cloudCover, and rasterForm
  const tileParams =
    "?tile_scale=2&assets=B04&assets=B03&assets=B02&color_formula=Gamma%20RGB%203.2%20Saturation%200.8%20Sigmoidal%20RGB%2025%200.35&nodata=0&minzoom=9&collection=sentinel-2-l2a&format=png";
  const url = tileJSONLink.href + tileParams;

  mosaicState.latestLayer = {
    type: "Tile",
    properties: {
      id: `mosaic;:;${Date.now()}`,
      title: "Mosaic Layer",
    },
    source: {
      type: "TileJSON",
      url,
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
 * Removes existing layers in the AnalysisGroup and adds the mosaic layer.
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {{ "filter-lang": "cql2-json", filter: object, sortby: object[] } | null} [body] - The cql2-json POST body.
 */
export async function renderMosaic(mosaicEndpoint, body) {
  const mapLayers = getLayers();
  const { analysisGroup, layers } = ensureAnalysisGroup(mapLayers);
  const mosaicLayers = await createMosaicLayers(mosaicEndpoint, body);

  if (!mosaicLayers.length) {
    return;
  }

  const selectedStac = useSTAcStore().selectedStac;
  if (selectedStac) {
    // TODO: covercases that do not include pre-aggregation links
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
 * Updates the mosaic layer based on the current filters in mosaicState.
 * @param {string | undefined | null} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {{ timeRange?: [string, string]; collection?: string; cloudCover?: { min: number, max: number } }} queries - Optional CQL queries.
 */
export async function updateMosaicLayer(
  mosaicEndpoint,
  { timeRange, collection, cloudCover } = {},
) {
  if (!mosaicEndpoint) {
    return;
  }
  /** @type {object[]} */
  const filters = [];
  if (timeRange && Array.isArray(timeRange) && timeRange.length === 2) {
    const timeFilter = {
      op: "between",
      args: [
        { property: "datetime" },
        { timestamp: new Date(timeRange[0]).toISOString() },
        { timestamp: new Date(timeRange[1]).toISOString() },
      ],
    };
    filters.push(timeFilter);
  }

  if (collection) {
    filters.push({
      op: "=",
      args: [{ property: "collection" }, collection],
    });
  }

  if (
    cloudCover !== undefined &&
    (cloudCover.min > 0 || cloudCover.max < 100)
  ) {
    filters.push({
      op: "between",
      args: [{ property: "eo:cloud_cover" }, cloudCover.min, cloudCover.max],
    });
  }

  let body = null;
  if (filters.length > 0) {
    const filter =
      filters.length === 1 ? filters[0] : { op: "and", args: filters };
    body = {
      "filter-lang": /** @type {const} */ ("cql2-json"),
      filter,
      sortby: [{ field: "datetime", direction: "desc" }],
    };
  }

  mosaicState.query = body;
  await renderMosaic(mosaicEndpoint, body);
}
/**
 * Renders the latest mosaic layer stored in mosaicState.
 */
export function renderLatestMosaic() {
  if (!mosaicState.latestLayer) {
    return;
  }
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
 *
 * @param {number} zoomLevel
 * @param {number} [threshold=mosaicState.visibilityThreshold]
 */
function toggleMosaicVisibility(
  zoomLevel,
  threshold = mosaicState.visibilityThreshold,
) {
  if (!mosaicState.latestLayer) {
    return;
  }
  /** @type {string} */
  const layerId = mosaicState.latestLayer.properties.id;
  const layer = mapEl.value?.getLayerById(layerId);
  if (!layer) {
    return;
  }
  layer.setVisible(zoomLevel >= threshold);
}
/**
 *
 * @param {string} mosaicEndpoint
 * @param {{collection?:string, timeRange?:[string, string], cloudCover?: { min: number, max: number }}} [filters]
 */
export async function initMosaic(
  mosaicEndpoint,
  { timeRange, collection, cloudCover } = {},
) {
  await updateMosaicLayer(mosaicEndpoint, {
    ...(collection && { collection }),
    ...(timeRange && { timeRange }),
    ...(cloudCover !== undefined && { cloudCover }),
  }).then(async () => {
    await nextTick(() => {
      toggleMosaicVisibility(mapPosition.value[2] ?? 0);
    });
  });
}

/**
 *
 * @param {string | undefined | null} mosaicEndpoint
 * @param {{collection?:string, timeRange?:[string, string]}} filters
 * @param {ReturnType<typeof import("@/store/stac").useSTAcStore>} store
 * @param {string[]} [indicators]
 */
export function useInitMosaic(
  mosaicEndpoint,
  { timeRange } = {},
  store,
  indicators,
) {
  if (!mosaicEndpoint) {
    return;
  }

  function shouldInitiate() {
    if (!store.selectedStac?.id) return false;
    if (indicators?.length && !indicators.includes(store.selectedStac.id))
      return false;
    return true;
  }

  const stopWatcher = watch(mapPosition, (updatedPos, oldPos) => {
    const [_oldX, _oldY, oldZ] = oldPos;
    const [_x, _y, z] = updatedPos;
    if (!z || z === oldZ) {
      return;
    }
    toggleMosaicVisibility(z);
  });

  onMounted(async () => {
    if (!shouldInitiate()) return;
    initMosaic(mosaicEndpoint, {
      collection: store.selectedStac?.id,
      timeRange,
    });
  });
  useOnLayersUpdate(() => {
    if (!shouldInitiate()) return;
    initMosaic(mosaicEndpoint, {
      collection: store.selectedStac?.id,
      timeRange,
    });
  });
  onUnmounted(() => {
    mosaicState.latestLayer = null;
    stopWatcher();
  });
}
