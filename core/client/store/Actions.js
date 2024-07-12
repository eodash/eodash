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
