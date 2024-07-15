import { registeredProjections } from "@/store/States";

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
 * @param {string|number} [code]*/
export const registerProjection = async (code) => {
  code = typeof code === "number" ? `EPSG:${code}` : code;
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
  await eoxMap?.registerProjectionFromCode(code);
};
/**
 * Change `eox-map` projection from an `EPSG` code
 *  @param {string|number} [code]*/
export const changeMapProjection = async (code) => {
  code = typeof code === "number" ? `EPSG:${code}` : code;
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
    await registerProjection(code);
  }

  code = eoxMap?.getAttribute("projection") === code ? "EPSG:3857" : code;
  eoxMap?.setAttribute("projection", code);
};
