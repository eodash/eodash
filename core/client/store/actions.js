import {
  errorState,
  mapEl,
  mapCompareEl,
  registeredProjections,
  activeTemplate,
  datetime,
  poi,
  comparePoi,
  areChartsSeparateLayout,
  chartData,
  compareChartData,
} from "@/store/states";
import {
  eodashCollections,
  eodashCompareCollections,
  useSTAcStore,
} from "@/store/stac";
import { assignDataLayers } from "@/eodashSTAC/layers";
import { getProjectionCode } from "@eodash/stac/helpers";
import registerProjectionDefinition from "@eox/map/src/helpers/register-projection";
import registerProjectionFromCode from "@eox/map/src/helpers/register-projection-from-code";
import { useEmitLayersUpdate } from "@/composables";
import log from "loglevel";

/**
 * Returns the current layers of {@link mapEl}.
 *
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const getLayers = () => mapEl.value?.layers ?? [];

/**
 * Returns the current layers of {@link mapCompareEl}.
 *
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const getCompareLayers = () => mapCompareEl.value?.layers ?? [];

/**
 * Assigns layers to an EOxMap instance and emits an update event when provided.
 *
 * @param {(import("@eox/map").EOxMap) | null} [map] - Map instance
 * @param {Record<string, any>[]} [layers] - Layers to assign
 * @param {import("@/types").LayersEventBusKeys} [event] - Optional event to emit
 */
export const assignLayers = async (map, layers, event) => {
  if (!map || !layers) {
    return;
  }
  try {
    map.layers = /** @type {import("@eox/map").EoxLayer[]} */ (layers);
  } catch (error) {
    errorState.value = {
      message: "Some layers could not be rendered correctly",
      details: `${error}`,
      severity: "warning",
    };
    return;
  }
  if (event) {
    useEmitLayersUpdate(event, map, layers);
  }
};

/**
 * Registers a spatial projection definition globally in proj4 and OpenLayers.
 *
 * @param {string | number | { name: string, def: string, extent?: number[] }} [projection] - Projection code or definition object
 */
export const registerProjection = async (projection) => {
  const code = getProjectionCode(projection);
  if (!code || registeredProjections.includes(code)) {
    return;
  }
  log.debug("Unregistered projection found, registering it", code);
  if (typeof projection === "object") {
    registerProjectionDefinition(code, projection.def, projection.extent);
  } else {
    await registerProjectionFromCode(code);
  }
  registeredProjections.push(code);
};
/**
 * Changes `eox-map` projection to an EPSG projection.
 *
 * @param {string | number | { name: string, def: string }} [projection]
 */
export const changeMapProjection = async (projection) => {
  let code = getProjectionCode(projection);

  if (!code) {
    mapEl.value?.setAttribute("projection", "EPSG:3857");
    mapCompareEl.value?.setAttribute("projection", "EPSG:3857");
    return;
  }

  if (!registeredProjections.includes(code)) {
    await registerProjection(projection);
  }

  code = mapEl.value?.getAttribute("projection") === code ? "EPSG:3857" : code;
  mapEl.value?.setAttribute("projection", code);
  mapCompareEl.value?.setAttribute("projection", code);
};

/**
 * Sets the datetime the dashboard shows and rebuilds the data layers to match.
 * An open compare pane follows the same datetime.
 *
 * @param {string} value - ISO datetime
 */
export const setDatetime = async (value) => {
  datetime.value = value;
  const { selectedStac, selectedCompareStac } = useSTAcStore();

  await assignDataLayers(mapEl.value, {
    readers: eodashCollections,
    stac: selectedStac,
    timeOrItem: value,
    event: "time:updated",
  });

  if (selectedCompareStac) {
    await assignDataLayers(mapCompareEl.value, {
      readers: eodashCompareCollections,
      stac: selectedCompareStac,
      timeOrItem: value,
      event: "compareTime:updated",
    });
  }
};

/**
 *
 * @param {string} template
 */
export const setActiveTemplate = (template) => {
  activeTemplate.value = template;
  log.debug("Setting active template to", template);
};

/**
 * Checks whether the collection requires an EodashProcess widget.
 *
 * @param {import("@eodash/stac").STACCollection | null | undefined} collection
 * @param {boolean} [compare=false] - Whether to check for the compare collection
 * @returns {boolean}
 */
export const includesProcess = (collection, compare = false) => {
  const isPoiAlive = compare ? !!comparePoi.value : !!poi.value;

  return (
    collection?.links?.some((link) => link.rel === "service") || isPoiAlive
  );
};

/**
 * Checks whether the main or compare chart has data to display.
 *
 * @param {boolean} [compare=false] - Whether to check for the compare collection
 * @returns {boolean}
 */
export const shouldShowChartWidget = (compare = false) => {
  return (
    !!areChartsSeparateLayout.value &&
    !!(compare ? compareChartData.value : chartData.value)
  );
};
