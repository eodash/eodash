/**
 * Returns the current layers of the `eox-map`
 * @param {string} [el="eox-map"] - `eox-map` element selector
 * @returns {object[]}
 */
//@ts-expect-error layers doesn't exist on type element
export const getLayers = (el = "eox-map") => document.querySelector(el)?.layers.toReversed();
