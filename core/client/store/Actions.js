import { registeredProjections } from "@/store/States";
import { getProjectionCode } from "@/utils/helpers";
/**
 * Returns the current layers of the `eox-map`
 * @param {string} [el="eox-map"] - `eox-map` element selector
 * @returns {object[]}
 */
export const getLayers = (el = "eox-map") =>
  customElements.get("eo-dash")
    ? document
        .querySelector("eo-dash")
        ?.shadowRoot?.querySelector(el)
        //@ts-expect-error `layers` doesn't exist on type element
        ?.layers.toReversed()
    : //@ts-expect-error `layers` doesn't exist on type element
      document.querySelector(el)?.layers.toReversed();

/**
 * Register EPSG projection in `eox-map`
 * @param {string|number|{name: string, def: string}} [projection]*/
export const registerProjection = async (projection) => {
  let code = getProjectionCode(projection);
  if (!code || registeredProjections.includes(code)) {
    return;
  }
  const eoxMap =
    /** @type {HTMLElement & Record<string,any> | null | undefined} */ (
      customElements.get("eo-dash")
        ? document
            .querySelector("eo-dash")
            ?.shadowRoot?.querySelector("eox-map")
        : document.querySelector("eox-map")
    );
  registeredProjections.push(code);
  if (typeof projection === "object") {
    // registering whole projection definition
    await eoxMap?.registerProjection(code, projection.def);
  } else {
    await eoxMap?.registerProjectionFromCode(code);
  }
};

/**
 * Change `eox-map` projection from an `EPSG` projection
 *  @param {string|number|{name: string, def: string}} [projection]*/
export const changeMapProjection = async (projection) => {
  let code = getProjectionCode(projection);
  const eoxMap =
    /** @type {HTMLElement & Record<string,any> | null | undefined} */ (
      customElements.get("eo-dash")
        ? document
            .querySelector("eo-dash")
            ?.shadowRoot?.querySelector("eox-map")
        : document.querySelector("eox-map")
    );
  if (!code) {
    eoxMap?.setAttribute("projection", "EPSG:3857");
    return;
  }
  if (!registeredProjections.includes(code)) {
    await registerProjection(projection);
  }

  code = eoxMap?.getAttribute("projection") === code ? "EPSG:3857" : code;
  eoxMap?.setAttribute("projection", code);
};
