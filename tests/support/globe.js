import { vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { isGlobe } from "@/store/states";
import { TIMEOUT } from "./template";

// eox-map leaves the globe through a camera flight (OpenGlobus default 1000 ms)
// and only finishes its teardown when that flight ends.
const EXIT_FLIGHT_MS = 1500;

/**
 * The map button that toggles the globe. Found by its tooltip text, which is
 * hidden until hover and so absent from the accessible name.
 * @param {Element} root
 * @param {string} label "switch to 3D" or "switch to 2D"
 */
export const globeButton = (root, label) =>
  [...root.querySelectorAll("button")].find((button) =>
    button.textContent?.includes(label),
  );

/**
 * Wait until `check` returns a truthy value and return it. Unlike `expect.poll`,
 * this also works in hooks.
 * @template T
 * @param {() => T} check
 * @param {string} what named in the timeout error
 * @param {number} [timeout]
 */
export const until = (check, what, timeout = TIMEOUT) =>
  vi.waitFor(
    () => {
      const value = check();
      if (!value) throw new Error(`${what}: not yet`);
      return value;
    },
    { timeout },
  );

/**
 * Whether eox-map and eodash both show the globe. `mapEl.projection` alone is
 * not enough: it reads "globe" until an exit flight has finished.
 * @param {any} mapEl
 */
export const inGlobe = (mapEl) =>
  mapEl.globeEnabled === true &&
  mapEl.shadowRoot.querySelector("#map")?.style.display === "none" &&
  isGlobe.value;

/**
 * Whether the map is still in the globe once any exit flight an action may
 * have started would have finished.
 * @param {any} mapEl
 */
export async function staysInGlobe(mapEl) {
  await new Promise((resolve) => setTimeout(resolve, EXIT_FLIGHT_MS));
  return inGlobe(mapEl);
}

/**
 * Whether eox-map tore the globe down and eodash agrees.
 * @param {any} mapEl
 */
export const leftGlobe = (mapEl) =>
  mapEl.globe === null &&
  !mapEl.shadowRoot.querySelector("#globe") &&
  mapEl.globeEnabled === false &&
  !isGlobe.value;

/**
 * Switch to the globe through the map button and wait for OpenGlobus to build
 * its planet.
 * @param {Element} root
 * @param {any} mapEl
 */
export async function enterGlobe(root, mapEl) {
  // the button mounts once an indicator is selected
  const button = await until(
    () => globeButton(root, "switch to 3D"),
    "3D button",
  );
  await userEvent.click(button);
  await until(() => inGlobe(mapEl), "globe enabled");
  await until(() => mapEl.globe.planet.layers.length, "globe layers");
}

/**
 * Switch back to 2D through the map button and wait for eox-map's teardown.
 * @param {Element} root
 * @param {any} mapEl
 */
export async function leaveGlobe(root, mapEl) {
  const button = globeButton(root, "switch to 2D");
  if (!button) throw new Error("no 2D button");
  await userEvent.click(button);
  await until(
    () => mapEl.shadowRoot.querySelector("#map")?.style.display === "",
    "2D map shown",
  );
}

/**
 * Whether a pointer at the centre of `element` would land on it.
 * @param {Element} element
 */
export const takesPointer = (element) => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return element.contains(
    document.elementFromPoint(left + width / 2, top + height / 2),
  );
};

/**
 * The OpenGlobus layer eox-map built for an OL layer id.
 * @param {any} mapEl
 * @param {string | undefined} id
 */
export const globeLayer = (mapEl, id) =>
  mapEl.globe?.planet?.getLayerByName(id);

/**
 * The first match of `selector` under `root`, through nested shadow roots.
 * Throws when there is none, so a moved control fails with its selector.
 * @param {Element | Document} root
 * @param {string} selector
 * @returns {any}
 */
export const deepQuery = (root, selector) => {
  const [match] = deepQueryAll(root, selector);
  if (!match) throw new Error(`nothing matches ${selector}`);
  return match;
};

/**
 * Every match of `selector` under `root`, through nested shadow roots.
 * @param {Element | Document | ShadowRoot} root
 * @param {string} selector
 * @returns {Element[]}
 */
const deepQueryAll = (root, selector) => [
  ...(root instanceof Element && root.shadowRoot
    ? deepQueryAll(root.shadowRoot, selector)
    : []),
  ...root.querySelectorAll(selector),
  ...[...root.querySelectorAll("*")].flatMap((el) =>
    el.shadowRoot ? deepQueryAll(el.shadowRoot, selector) : [],
  ),
];

/**
 * The layer control row for a layer id, once the layer control rendered it.
 * @param {string | undefined} id
 * @returns {Promise<Element>}
 */
export const layerControlRow = (id) =>
  until(
    () =>
      deepQueryAll(document, "eox-layercontrol-layer").find(
        (el) => Reflect.get(el, "layer")?.get("id") === id,
      ),
    `layer control row for ${id}`,
  );

/**
 * Move a range input the way a drag does: set the value, fire `input` and `change`.
 * @param {Element} input
 * @param {number} value
 */
export const slide = (input, value) => {
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("not an input");
  }
  input.value = String(value);
  input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
};

/**
 * Drag the minimum of a layer's style range onto its maximum, the way the
 * minmax slider reports the end of a drag. Returns the value it set.
 * @param {string | undefined} id
 */
export async function dragRangeMinToMax(id) {
  const row = await layerControlRow(id);
  // the form builds its editors asynchronously
  const range = await vi.waitFor(
    () =>
      deepQuery(
        deepQuery(row, "eox-layercontrol-layerconfig"),
        "tc-range-slider",
      ),
    { timeout: TIMEOUT },
  );
  const value1 = range.value2;
  Object.assign(range, { value1 });
  range.dispatchEvent(new CustomEvent("change", { detail: { value1 } }));
  return value1;
}

/**
 * Pick an indicator through the "Select indicator" popup, by its card title.
 * @param {string} title
 */
export async function chooseIndicator(title) {
  await userEvent.click(page.getByRole("button", { name: "Select indicator" }));
  // inside the popup: the panels, layer control and stac info repeat the title
  const popup = await until(
    () => document.querySelector("eox-itemfilter"),
    "indicator popup",
  );
  await userEvent.click(
    page.elementLocator(popup).getByText(title, { exact: true }),
  );
  // the popup stays in the DOM while it closes
  await until(() => !document.querySelector("eox-itemfilter"), "popup closed");
}