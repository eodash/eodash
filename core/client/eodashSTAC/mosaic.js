import axios from "@/plugins/axios";
import { datetime, mapEl, mapPosition } from "@/store/states";
import { ANALYSIS_GROUP, assignGroupLayers } from "@/eodashSTAC/layers";
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import {
  createSharedComposable,
  useDebounceFn,
  useEventBus,
} from "@vueuse/core";
import { useOnLayersUpdate } from "@/composables";
import { registerProjection } from "@/store/actions";
import { extractLayerTimeValues } from "@eodash/stac/helpers";
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
  /** @type {import("vue").ShallowRef<import("@/types").MosaicQueryInput>} */
  const queryInput = shallowRef({});
  // reads the TileJSON params; takes the input they are built from
  const query = computed({
    get: () => buildMosaicQuery(queryInput.value),
    /** @param {import("@/types").MosaicQueryInput | null} input - null resets, a part left out keeps its last value */
    set: (input) => {
      queryInput.value = input
        ? {
            timeRange: input.timeRange ?? queryInput.value.timeRange,
            filters: input.filters ?? queryInput.value.filters,
          }
        : {};
    },
  });
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
 * Builds the mosaic layer through the selected collection's reader and renders it on the map.
 * @param {Record<string, string> | null} [params] - Query parameters for the TileJSON request
 */
export async function renderMosaic(params) {
  const { selectedStac } = useSTAcStore();
  const eodashCol = eodashCollections.find((ec) => ec.id === selectedStac?.id);
  if (!eodashCol?.buildMosaicLayer) {
    console.warn(
      `[eodash] no mosaic for "${selectedStac?.id}": the collection needs a raster endpoint and render presets`,
    );
    return;
  }
  const { layer, projection } = await eodashCol.buildMosaicLayer(params);
  if (!layer) {
    return;
  }
  await registerProjection(projection);

  const { latestLayer, visibilityThreshold, isItemView } = useMosaicState();
  layer.minZoom = visibilityThreshold.value;
  //@ts-expect-error properties is optional upstream, always built here
  layer.properties.layerControlToolsExpand = true;

  const dates = (await eodashCol.getDates()) ?? [];
  const { timeControlValues } = extractLayerTimeValues(dates, datetime.value);
  if (timeControlValues) {
    //@ts-expect-error properties is optional upstream, always built here
    layer.properties.timeControlValues = timeControlValues;
    //@ts-expect-error properties is optional upstream, always built here
    layer.properties.timeControlProperty = "TIME";
    //@ts-expect-error properties is optional upstream, always built here
    layer.properties.collectionId = eodashCol.id;
  }

  latestLayer.value = layer;
  if (isItemView.value) return;
  assignGroupLayers(mapEl.value, ANALYSIS_GROUP, [layer]);
  //@ts-expect-error source is optional upstream, always built here
  log.debug("[eodash] Mosaic layer rendered.", layer.source.url);
}

/**
 * Updates the mosaic layer using temporal and item filters.
 * @param {string | undefined | null} mosaicEndpoint - TileJSON endpoint URL
 * @param {import("@/types").MosaicQueryInput} [queries] - Filter parameters
 */
export async function updateMosaicLayer(mosaicEndpoint, queries = {}) {
  if (!mosaicEndpoint) return;

  const { query } = useMosaicState();
  query.value = queries;
  await renderMosaic(query.value);
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
 * Composable that initializes the mosaic layer and synchronizes visibility with map state.
 * @param {string | null | undefined} mosaicEndpoint - TileJSON endpoint URL
 * @param {import("vue").Ref<[string, string]> | undefined} timeRange - Reactive time range
 * @param {string[]} [indicators] - Optional list of collection IDs to restrict mosaic activation
 */
export function useInitMosaic(mosaicEndpoint, timeRange, indicators) {
  if (!mosaicEndpoint) return;

  const store = useSTAcStore();
  const { isItemView, latestLayer, query, hasDataInView } = useMosaicState();
  // render the inital mosaic
  const scheduleMosaicUpdate = useScheduleMosaicUpdate();

  function shouldInitiate() {
    if (isItemView.value) return false;
    if (!store.selectedStac?.id) return false;
    if (indicators !== undefined && !indicators.includes(store.selectedStac.id))
      return false;
    return true;
  }

  const stopWatcher = watch(mapPosition, () => scheduleMosaicDataCheck());

  const stopQueryWatch = watch(query, () => scheduleMosaicDataCheck());

  onMounted(() => {
    if (!shouldInitiate()) return;
    scheduleMosaicUpdate(mosaicEndpoint, timeRange?.value);
  });

  useOnLayersUpdate((evt) => {
    if (evt !== "layers:updated") return;
    if (!shouldInitiate()) return;
    scheduleMosaicUpdate(mosaicEndpoint, timeRange?.value);
  });

  onUnmounted(() => {
    scheduleMosaicUpdate.cancel();
    latestLayer.value = null;
    query.value = null;
    hasDataInView.value = true;
    stopWatcher();
    stopQueryWatch();
  });
}

/**
 * Shared debounced function to schedule mosaic layer updates.
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
 * Builds the TileJSON query of the mosaic from its time range and item filters.
 * @param {import("@/types").MosaicQueryInput} input
 * @returns {Record<string, string> | null}
 */
function buildMosaicQuery({ timeRange, filters }) {
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

  return Object.keys(params).length > 0 ? params : null;
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
 * Checks whether features or assets exist within the current 2D map viewport.
 */
export async function checkMosaicDataInView() {
  const { hasDataInView, query, mosaicEndpoint, visibilityThreshold } =
    useMosaicState();
  const extent = mapEl.value?.lonLatExtent;
  if (
    !extent ||
    !mosaicEndpoint.value ||
    (mapPosition.value[2] ?? 0) < visibilityThreshold.value
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
