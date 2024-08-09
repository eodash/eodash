import { mapEl, mapCompareEl, registeredProjections } from "@/store/States";
import { getProjectionCode } from "@/utils/helpers";

/**
 * Returns the current layers of {@link mapEl}
 * @returns {Record<string,any>[]}
 */
export const getLayers = () => mapEl.value?.layers.toReversed();

/**
 * Register EPSG projection in `eox-map`
 * @param {string|number|{name: string, def: string, extent: number[]|undefined}} [projection]*/
export const registerProjection = async (projection) => {
  let code = getProjectionCode(projection);
  if (!code || registeredProjections.includes(code)) {
    return;
  }

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
