import {
  mapEl,
  mapCompareEl,
  registeredProjections,
  activeTemplate,
  poi,
  comparePoi,
  areChartsSeparateLayout,
  chartData,
  compareChartData,
} from "@/store/states";
import { getProjectionCode } from "@/eodashSTAC/helpers";
import log from "loglevel";

/**
 * Returns the current layers of {@link mapEl}
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const getLayers = () => mapEl.value?.layers ?? [];

/**
 * Returns the current layers of {@link mapCompareEl}
 * * @returns {import("@eox/map").EoxLayer[]}
 */
export const getCompareLayers = () => mapCompareEl.value?.layers ?? [];

/**
 * Register EPSG projection in `eox-map`
 * @param {string|number|{name: string, def: string, extent?:number[]}} [projection]*/
export const registerProjection = async (projection) => {
  let code = getProjectionCode(projection);
  if (!code || registeredProjections.includes(code)) {
    return;
  }
  log.debug("Unregistered projection found, registering it", code);
  registeredProjections.push(code);
  if (typeof projection === "object") {
    // registering whole projection definition
    await mapEl.value?.registerProjection(
      code,
      projection.def,
      projection.extent,
    );
    // also registering for comparison map
    await mapCompareEl.value?.registerProjection(
      code,
      projection.def,
      projection.extent,
    );
  } else {
    await mapEl.value?.registerProjectionFromCode(code);
    // also registering for comparison map
    await mapCompareEl.value?.registerProjectionFromCode(code);
  }
};
/**
 * Change `eox-map` projection from an `EPSG` projection
 *  @param {string|number|{name: string, def: string}} [projection]*/
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
 *
 * @param {string} template
 */
export const setActiveTemplate = (template) => {
  activeTemplate.value = template;
  log.debug("Setting active template to", template);
};

/**
 * Check whether the collection needs an EodashProcess Widget
 * @param {import("stac-ts").StacCollection | null | undefined} collection
 * @param {boolean} [compare=false] - Whether to check for compare collection
 * @returns
 */
export const includesProcess = (collection, compare = false) => {
  const isPoiAlive = compare ? !!comparePoi.value : !!poi.value;

  return (
    collection?.links?.some((link) => link.rel === "service") || isPoiAlive
  );
};

/**
 * Check whether main or compare chart have data to show
 * @param {boolean} [compare=false] - Whether to check for compare collection
 * @returns
 */
export const hasChartData = (compare = false) => {
  return (
    areChartsSeparateLayout.value &&
    (compare ? compareChartData.value : chartData.value)
  );
};
