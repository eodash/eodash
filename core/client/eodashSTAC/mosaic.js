import axios from "@/plugins/axios";
import {
  datetime,
  indicator,
  isGlobe,
  mapEl,
  mapPosition,
} from "@/store/states";
import { getLayers } from "@/store/actions";
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import {
  createSharedComposable,
  useDebounceFn,
  useEventBus,
} from "@vueuse/core";
import { useEodash, useOnLayersUpdate } from "@/composables";
import {
  encodeURLObject,
  extractLayerTimeValues,
  normalizeNodata,
  normalizeRescale,
  resolveRenders,
} from "./helpers";
import { useSTAcStore } from "@/store/stac";
import { eodashCollections } from "@/utils/states";
import log from "loglevel";
import { buildCqlFilter } from "./cql";

const mosaicReturnToOverviewKey = Symbol("mosaic:return-to-overview");

/**
 * Shared mosaic state across all components. Stores the latest mosaic layer,
 * query parameters, visibility threshold, item-view flag, and an event bus
 * for the "Back to overview" user action .
 */
export const useMosaicState = createSharedComposable(() => {
  /** @type {import("vue").ShallowRef<Record<string, any> | null>} */
  const latestLayer = shallowRef(null);
  /** @type {import("vue").Ref<Record<string, string> | null>} */
  const query = ref(null);
  /** @type {import("vue").Ref<number>} */
  const visibilityThreshold = ref(8);
  /** @type {import("vue").Ref<boolean>} */
  const isItemView = ref(false);
  /** @type {import("vue").Ref<boolean>} - filtered mosaic has assets in the current view */
  const hasDataInView = ref(true);
  const returnToOverview = useEventBus(mosaicReturnToOverviewKey);

  const store = useSTAcStore();
  /** @type {import("vue").ComputedRef<string | null>} */
  const mosaicEndpoint = computed(() => {
    if (!store.rasterEndpoint || !store.selectedStac?.id) return null;
    return `${store.rasterEndpoint}/collections/${store.selectedStac.id}/WebMercatorQuad/tilejson.json`;
  });

  return {
    latestLayer,
    query,
    visibilityThreshold,
    isItemView,
    hasDataInView,
    returnToOverview,
    mosaicEndpoint,
  };
});

/**
 * Modifies the layers collection to display the mosaic layer.
 * @param {string} mosaicEndpoint - The TileJSON URL for the mosaic.
 * @param {Record<string, string> | null} [params] - Query params forwarded to the tilejson URL.
 */
export async function renderMosaic(mosaicEndpoint, params) {
  const mosaicLayers = await createMosaicLayers(mosaicEndpoint, params);

  if (!mosaicLayers.length) {
    return;
  }

  const { selectedStac } = useSTAcStore();
  if (selectedStac) {
    const eodashCol = eodashCollections.find(
      (ec) => ec.collectionStac?.id === selectedStac.id,
    );
    const dates = (await eodashCol?.getDates()) ?? [];
    const { timeControlValues } = extractLayerTimeValues(dates, datetime.value);
    if (timeControlValues) {
      mosaicLayers[0].properties.timeControlValues = timeControlValues;
      mosaicLayers[0].properties.timeControlProperty = "TIME";
    }
  }

  assignAnalysisLayer(mosaicLayers);
  const { latestLayer } = useMosaicState();
  latestLayer.value = mosaicLayers[0];
  log.debug("[eodash] Mosaic layer rendered.", mosaicLayers[0].source.url);
}

/**
 * Updates the mosaic layer based on the current filters.
 * @param {string | undefined | null} mosaicEndpoint - The TileJSON URL for the mosaic.
 * @param {{ timeRange?: [string, string]; filters?: import("@/types").ItemFilterFilters }} [queries]
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
      params.datetime = start === end ? start : `${start}/${end}`;
    }
  }

  const cqlFilter = buildCqlFilter(filters);
  if (cqlFilter) {
    params.filter = cqlFilter;
    params["filter-lang"] = "cql2-text";
  }

  const queryParams = Object.keys(params).length > 0 ? params : null;
  const { query } = useMosaicState();
  query.value = queryParams;
  await renderMosaic(mosaicEndpoint, queryParams);
}

/**
 * Renders the latest mosaic layer stored in the shared mosaic state.
 */
export function renderLatestMosaic() {
  const { latestLayer } = useMosaicState();
  if (!latestLayer.value) return;
  assignAnalysisLayer([latestLayer.value]);
}

/**
 * @param {string} mosaicEndpoint - The TileJSON URL for the mosaic.
 * @param {[string, string] | undefined} timeRange
 */
export async function initMosaic(mosaicEndpoint, timeRange) {
  await updateMosaicLayer(mosaicEndpoint, { timeRange });
  await nextTick();
  const zoom =
    mapPosition.value[2] ?? mapEl.value?.map?.getView()?.getZoom() ?? 0;
  toggleMosaicVisibility(zoom);
}

/**
 * Vue composable that initializes the mosaic layer and keeps it in sync with
 * map zoom and layer updates.
 * @param {string | null | undefined} mosaicEndpoint - Pass null/undefined to disable.
 * @param {import("vue").Ref<[string, string]> | undefined} timeRange
 * @param {string[]} [indicators] - If provided, mosaic only activates for these collection IDs.
 */
export function useInitMosaic(mosaicEndpoint, timeRange, indicators) {
  if (!mosaicEndpoint) return;

  const store = useSTAcStore();
  const { isItemView, latestLayer, query, hasDataInView } = useMosaicState();

  function shouldInitiate() {
    if (isItemView.value) return false;
    if (!store.selectedStac?.id) return false;
    if (indicators !== undefined && !indicators.includes(store.selectedStac.id))
      return false;
    return true;
  }

  const stopWatcher = watch(mapPosition, (updatedPos, oldPos) => {
    // Any pan or zoom changes the viewport bbox; re-check data presence.
    scheduleMosaicDataCheck();
    const [_oldX, _oldY, oldZ] = oldPos;
    const [_x, _y, z] = updatedPos;
    if (!z || z === oldZ) return;
    toggleMosaicVisibility(z);
  });

  // Re-check when filters/time change, and re-apply visibility once it lands.
  const stopQueryWatch = watch(query, () => scheduleMosaicDataCheck());

  onMounted(async () => {
    if (!shouldInitiate()) return;
    initMosaic(mosaicEndpoint, timeRange?.value);
  });

  useOnLayersUpdate((evt) => {
    if (evt !== "layers:updated") return;
    if (!shouldInitiate()) return;
    initMosaic(mosaicEndpoint, timeRange?.value);
  });

  onUnmounted(() => {
    latestLayer.value = null;
    query.value = null;
    hasDataInView.value = true;
    stopWatcher();
    stopQueryWatch();
  });
}

/**
 * Shared debounced scheduler for mosaic updates. All callers share a single
 * timer so concurrent updates (e.g. datetime + filter changes from different
 * widgets within the debounce window) coalesce into one final update.
 *
 * @returns {(mosaicEndpoint: string | undefined | null, timeRange: [string,string] | undefined, filters?: import("@/types").ItemFilterFilters) => void}
 */
export const useScheduleMosaicUpdate = createSharedComposable(() =>
  useDebounceFn(
    /**
     * @param {string | undefined | null} mosaicEndpoint
     * @param {[string, string] | undefined} timeRange
     * @param {import("@/types").ItemFilterFilters} [filters]
     */
    (mosaicEndpoint, timeRange, filters) => {
      updateMosaicLayer(mosaicEndpoint, { timeRange, filters });
    },
    300,
  ),
);

/**
 * Creates a layer configuration for the mosaic.
 * @param {string} mosaicEndpoint - The TileJSON URL for the mosaic.
 * @param {Record<string, string> | null} [params] - Query params (datetime, filter, etc.).
 * @returns {Promise<Record<string, any>[]>}
 */
async function createMosaicLayers(mosaicEndpoint, params) {
  const { selectedStac } = useSTAcStore();
  const renders = resolveRenders(selectedStac, useEodash()?.options?.renders);
  const preset = renders ? Object.values(renders)[0] : undefined;
  if (!preset) {
    console.warn(
      "[eodash] No render preset (collection `renders` nor `options.renders`) for the mosaic layer.",
    );
    return [];
  }

  const renderParamsStr = encodeURLObject({
    // TiTiler treats assets and expression as mutually exclusive band selection
    assets: preset.expression ? undefined : preset.assets,
    expression: preset.expression,
    nodata: normalizeNodata(preset.nodata),
    resampling: preset.resampling,
    color_formula: preset.color_formula,
    colormap: preset.colormap,
    colormap_name: preset.colormap_name,
    rescale: normalizeRescale(preset.rescale),
  });

  const tileParams = new URLSearchParams({
    tilesize: `${preset.tilesize ?? "512"}`,
    ...params,
  });
  const tileJsonUrl = `${mosaicEndpoint}?${renderParamsStr}${tileParams.toString()}`;

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

  return [
    {
      type: "Tile",
      minZoom: useMosaicState().visibilityThreshold.value,
      properties: {
        id: `${indicator.value};:;mosaic`,
        title: "Mosaic Layer",
      },
      source: {
        type: "XYZ",
        url: tileJSON.tiles[0],
      },
    },
  ];
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

/**
 * Returns the OL-equivalent zoom from `mapPosition[2]`. In 2D the raw value
 * is already the OL zoom. In globe mode the raw value is camera altitude in
 * meters; convert it via eox-map's internal formula so callers can compare
 * against a single (2D-style) threshold.
 *
 * @param {number} rawZ
 * @returns {number}
 */
export function normalizeGlobeZoom(rawZ) {
  if (!isGlobe.value) return rawZ;
  const zoomFactor = mapEl.value?.globeConfig?.useHighLOD ? 1 : 2;
  return Math.log2(21_050_000 / rawZ) + zoomFactor;
}

/**
 * check whether the filtered dataset has any assets in the current 2D view
 */
export async function checkMosaicDataInView() {
  const { hasDataInView, query, mosaicEndpoint, visibilityThreshold } =
    useMosaicState();
  const extent = mapEl.value?.lonLatExtent;
  if (
    !extent ||
    isGlobe.value ||
    !mosaicEndpoint.value ||
    normalizeGlobeZoom(mapPosition.value[2] ?? 0) < visibilityThreshold.value
  ) {
    hasDataInView.value = true;
    return;
  }

  if (extent.some(Number.isNaN)) return;

  const base = mosaicEndpoint.value.replace(
    "/WebMercatorQuad/tilejson.json",
    "",
  );
  const [minx, miny, maxx, maxy] = extent;
  const params = new URLSearchParams({ limit: "1", ...(query.value ?? {}) });
  try {
    const { data } = await axios.get(
      `${base}/bbox/${minx},${miny},${maxx},${maxy}/assets?${params}`,
    );
    const count = Array.isArray(data)
      ? data.length
      : Object.keys(data ?? {}).length;
    hasDataInView.value = count > 0;
  } catch {
    hasDataInView.value = true;
  }
}

/** Shared debounced data-presence check; coalesces rapid pan/zoom/filter changes. */
const scheduleMosaicDataCheck = useDebounceFn(checkMosaicDataInView, 300);

/**
 * @param {number} zoomLevel
 * @param {number} [threshold] - defaults to the shared visibility threshold
 */
function toggleMosaicVisibility(zoomLevel, threshold) {
  //  Only globe needs manual toggling.
  if (!isGlobe.value) return;
  const { latestLayer, visibilityThreshold } = useMosaicState();
  if (!latestLayer.value) return;

  const layerId = /** @type {string} */ (latestLayer.value.properties.id);
  const layer = mapEl.value?.getLayerById(layerId);
  if (!layer) return;

  const eqZoom = normalizeGlobeZoom(zoomLevel);
  layer.setVisible(eqZoom >= (threshold ?? visibilityThreshold.value));
}

/**
 * Writes layers into the AnalysisGroup and triggers a map re-render.
 * @param {Record<string, any>[]} layersToAssign
 */
function assignAnalysisLayer(layersToAssign) {
  const mapLayers = getLayers();
  const { analysisGroup, layers } = ensureAnalysisGroup(mapLayers);
  analysisGroup.layers = layersToAssign;
  if (mapEl.value) {
    // Reassign to trigger map re-render after in-place layer mutation
    mapEl.value.layers = /** @type {import("@eox/map").EoxLayer[]} */ ([
      ...layers,
    ]);
  }
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
