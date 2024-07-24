import { mapEl, registeredProjections } from "@/store/States";

/**
 * Returns the current layers of {@link mapEl}
 * @returns {Record<string,any>[]}
 */
export const getLayers = () => mapEl.value?.layers.toReversed();

/**
 * Register EPSG projection in `eox-map`
 * @param {string|number} [code]*/
export const registerProjection = async (code) => {
  code = typeof code === "number" ? `EPSG:${code}` : code;
  if (!code || registeredProjections.includes(code)) {
    return;
  }

  registeredProjections.push(code);
  await mapEl.value?.registerProjectionFromCode(code);
};
/**
 * Change `eox-map` projection from an `EPSG` code
 *  @param {string|number} [code]*/
export const changeMapProjection = async (code) => {
  code = typeof code === "number" ? `EPSG:${code}` : code;

  if (!code) {
    mapEl.value?.setAttribute("projection", "EPSG:3857");
    return;
  }

  if (!registeredProjections.includes(code)) {
    await registerProjection(code);
  }

  code = mapEl.value?.getAttribute("projection") === code ? "EPSG:3857" : code;
  mapEl.value?.setAttribute("projection", code);
};
