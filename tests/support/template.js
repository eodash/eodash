import { vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../templates/baseConfig";
import { mountApp } from "./app";

export const TIMEOUT = 1000 * 15;

/**
 * Boot a template against a STAC endpoint (or a full deep link) and wait until
 * the map and the root catalog are ready.
 *
 * @param {{ template?: string, endpoint: string, api?: boolean, initialUrl?: string }} opts
 */
export async function bootTemplate({
  template = "expert",
  endpoint,
  api = false,
  initialUrl,
}) {
  const store = useSTAcStore(pinia);
  const app = mountApp({
    ...(initialUrl ? { initialUrl } : { template }),
    // No remote fonts: the loader throws when a stylesheet cannot be reached.
    config: () =>
      getBaseConfig({
        stacEndpoint: { endpoint, api },
        //@ts-expect-error workaround to not fallback
        brand: { font: null },
      }),
  });
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);

  await vi.waitFor(
    () => {
      if (!(query("eox-map") && store.stac?.length)) {
        throw new Error("app did not boot");
      }
    },
    { timeout: TIMEOUT },
  );

  return { app, container: app.container, query, store };
}

/**
 * Boot the expert template; see {@link bootTemplate}.
 * @param {{ endpoint: string, initialUrl?: string }} opts
 */
export const bootExpert = (opts) => bootTemplate(opts);

/**
 * Select an indicator through the store and wait until it is the selection.
 * Requires a booted app ({@link bootExpert} guarantees the catalog is loaded).
 *
 * @param {ReturnType<typeof useSTAcStore>} store
 * @param {string} id
 */
export async function selectIndicator(store, id) {
  const child = store.stac?.find((l) => l.id === id);
  if (!child) throw new Error(`indicator "${id}" not in catalog`);
  await store.loadSelectedSTAC(child.href);
  await vi.waitFor(
    () => {
      if (store.selectedStac?.id !== id) {
        throw new Error(`indicator "${id}" not selected`);
      }
    },
    { timeout: TIMEOUT },
  );
}

/**
 * The layerId the process drawtools is bound to (its selection target).
 * @param {Element} root
 */
export const drawtoolsLayerId = (root) =>
  /** @type {any} */ (
    root
      .querySelector("eox-jsonform")
      ?.shadowRoot?.querySelector("eox-drawtools")
  )?.layerId;

/**
 * The features of the drawtools' target layer on the map.
 * @param {Element} root
 * @returns {any[]}
 */
export const targetFeatures = (root) =>
  /** @type {any} */ (root.querySelector("eox-map"))
    ?.getLayerById(drawtoolsLayerId(root))
    ?.getSource?.()
    ?.getFeatures?.() ?? [];

/**
 * Select a feature the way a map click does; drawtools consumes the event.
 * @param {Element} root
 * @param {number} index
 */
export const selectFeature = (root, index) => {
  const feature = targetFeatures(root)[index];
  if (!feature) throw new Error(`feature #${index} not on the target layer`);
  root.querySelector("eox-map")?.dispatchEvent(
    new CustomEvent("select", {
      detail: { id: "SelectLayerClickInteraction", feature },
    }),
  );
};
