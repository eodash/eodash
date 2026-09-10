import axios from "@/plugins/axios";
import {
  datetime,
  indicator,
  isGlobe,
  mapEl,
  mapPosition,
} from "@/store/states";
import { ANALYSIS_GROUP, assignGroupLayers } from "@/eodashSTAC/layers";
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
import { registerProjection } from "@/store/actions";
import {
  encodeURLObject,
  LAYER_ID_SEPARATOR,
  extractLayerTimeValues,
  getProjectionCode,
  normalizeNodata,
  normalizeRescale,
  resolveRenders,
  resolveTmsByProjection,
  tmsToTileGridOptions,
} from "@eodash/stac/helpers";
import { useSTAcStore } from "@/store/stac";
import { eodashCollections } from "@/store/stac";
import log from "loglevel";
import { buildCqlFilter } from "./cql";

const mosaicReturnToOverviewKey = Symbol("mosaic:return-to-overview");

/**
 * Composable providing reactive state and event bus for mosaic layer management.
 */
export const useMosaicState = createSharedComposable(() => {
  /** @type {import("vue").ShallowRef<import("@eox/map").EoxLayer | null>} */
  const latestLayer = shallowRef(null);
  /** @type {import("vue").Ref<Record<string, string> | null>} */
  const query = ref(null);
  /** @type {import("vue").Ref<number>} */
  const visibilityThreshold = ref(8);
  /** @type {import("vue").Ref<boolean>} */
  const isItemView = ref(false);
  /** @type {import("vue").Ref<boolean>} */
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
 * Builds and renders the mosaic layer on the map.
 * @param {string} mosaicEndpoint - TileJSON endpoint URL for the mosaic
 * @param {Record<string, string> | null} [params] - Query parameters for the TileJSON request
 */
export async function renderMosaic(mosaicEndpoint, params) {
  const mosaicLayers = await createMosaicLayers(mosaicEndpoint, params);

  if (!mosaicLayers.length) {
    return;
  }

  const { selectedStac } = useSTAcStore();
  if (selectedStac) {
    const eodashCol = eodashCollections.find((ec) => ec.id === selectedStac.id);
    const dates = (await eodashCol?.getDates()) ?? [];
    const { timeControlValues } = extractLayerTimeValues(dates, datetime.value);
    if (timeControlValues) {
      //@ts-expect-error properties is optional upstream, always built here
      mosaicLayers[0].properties.timeControlValues = timeControlValues;
      //@ts-expect-error properties is optional upstream, always built here
      mosaicLayers[0].properties.timeControlProperty = "TIME";
    }
  }

  assignGroupLayers(mapEl.value, ANALYSIS_GROUP, mosaicLayers);
  const { latestLayer } = useMosaicState();
  latestLayer.value = mosaicLayers[0];
  //@ts-expect-error source is optional upstream, always built here
  log.debug("[eodash] Mosaic layer rendered.", mosaicLayers[0].source.url);
}

/**
 * Updates the mosaic layer using temporal and item filters.
 * @param {string | undefined | null} mosaicEndpoint - TileJSON endpoint URL
 * @param {{ timeRange?: [string, string]; filters?: import("@/types").ItemFilterFilters }} [queries] - Filter parameters
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
 * Renders the cached mosaic layer from the shared state onto the map.
 */
export function renderLatestMosaic() {
  const { latestLayer } = useMosaicState();
  if (!latestLayer.value) return;
  assignGroupLayers(mapEl.value, ANALYSIS_GROUP, [latestLayer.value]);
}

/**
 * Initializes and displays the mosaic layer for a given time range.
 * @param {string} mosaicEndpoint - TileJSON endpoint URL
 * @param {[string, string] | undefined} timeRange - Start and end datetime strings
 */
export async function initMosaic(mosaicEndpoint, timeRange) {
  await updateMosaicLayer(mosaicEndpoint, { timeRange });
  await nextTick();
  const zoom =
    mapPosition.value[2] ?? mapEl.value?.map?.getView()?.getZoom() ?? 0;
  toggleMosaicVisibility(zoom);
}

/**
 * Composable that initializes the mosaic layer and synchronizes visibility with map state.
 * @param {string | null | undefined} mosaicEndpoint - TileJSON endpoint URL
 * @param {import("vue").Ref<[string, string]> | undefined} timeRange - Reactive time range
 * @param {string[]} [indicators] - Optional list of collection IDs to restrict mosaic activation
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
    scheduleMosaicDataCheck();
    const [_oldX, _oldY, oldZ] = oldPos;
    const [_x, _y, z] = updatedPos;
    if (!z || z === oldZ) return;
    toggleMosaicVisibility(z);
  });

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
 * Shared debounced function to schedule mosaic layer updates.
 *
 * @returns {(mosaicEndpoint: string | undefined | null, timeRange: [string, string] | undefined, filters?: import("@/types").ItemFilterFilters) => void}
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
 * Creates the Tile XYZ layer definition for the mosaic.
 * @param {string} mosaicEndpoint - TileJSON endpoint URL
 * @param {Record<string, string> | null} [params] - Query parameters for TileJSON request
 * @returns {Promise<import("@eox/map/src/layers").EOxLayerType<"Tile", "XYZ">[]>}
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

  const store = useSTAcStore();

  const projection =
    /** @type {string | number | {name: string, def: string} | undefined} */ (
      preset.projection
    ) ?? "EPSG:3857";
  const projectionCode = getProjectionCode(projection);
  await registerProjection(projection);

  const tms = resolveTmsByProjection(
    projectionCode,
    store.tileMatrixSetRegistry,
  );
  const tmsId = tms?.id || "WebMercatorQuad";

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
  const tileJsonUrl = `${mosaicEndpoint.replace("/WebMercatorQuad/", `/${tmsId}/`)}?${renderParamsStr}${tileParams.toString()}`;

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

  const layer = {
    type: /** @type {const} */ ("Tile"),
    minZoom: useMosaicState().visibilityThreshold.value,
    properties: {
      id: `${indicator.value}${LAYER_ID_SEPARATOR}mosaic`,
      title: "Mosaic Layer",
    },
    source: {
      type: /** @type {const} */ ("XYZ"),
      url: tileJSON.tiles[0],
      projection: projectionCode,
    },
  };
  const tileSize = preset.tilesize || 512;
  // @ts-expect-error tileGrid is added here and supported in eox-map layer definition
  layer.source.tileGrid = {
    tileSize,
  };
  if (tms) {
    const tmsOptions = tmsToTileGridOptions(tms, [tileSize, tileSize]);
    // @ts-expect-error tileGrid supported in eox-map
    layer.source.tileGrid = { ...layer.source.tileGrid, ...tmsOptions };
  }
  return [layer];
}

/**
 * Converts a datetime input into an ISO date string (YYYY-MM-DD).
 * @param {string | Date} time - Input datetime
 * @returns {string | null}
 */
function timeToDate(time) {
  if (!time) return null;
  const date = new Date(time);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

/**
 * Normalizes map zoom level across 2D map and 3D globe camera altitudes.
 *
 * @param {number} rawZ - Raw zoom level or camera altitude
 * @returns {number} Normalized zoom level
 */
export function normalizeGlobeZoom(rawZ) {
  if (!isGlobe.value) return rawZ;
  const zoomFactor = mapEl.value?.globeConfig?.useHighLOD ? 1 : 2;
  return Math.log2(21_050_000 / rawZ) + zoomFactor;
}

/**
 * Checks whether features or assets exist within the current 2D map viewport.
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

/** Debounced check for asset presence in the viewport. */
const scheduleMosaicDataCheck = useDebounceFn(checkMosaicDataInView, 300);

/**
 * Toggles mosaic layer visibility in 3D globe mode based on altitude threshold.
 * @param {number} zoomLevel - Current zoom level or altitude
 * @param {number} [threshold] - Optional visibility threshold override
 */
function toggleMosaicVisibility(zoomLevel, threshold) {
  if (!isGlobe.value) return;
  const { latestLayer, visibilityThreshold } = useMosaicState();
  if (!latestLayer.value) return;

  //@ts-expect-error properties is optional upstream, always built here
  const layerId = /** @type {string} */ (latestLayer.value.properties.id);
  const layer = mapEl.value?.getLayerById(layerId);
  if (!layer) return;

  const eqZoom = normalizeGlobeZoom(zoomLevel);
  layer.setVisible(eqZoom >= (threshold ?? visibilityThreshold.value));
}
