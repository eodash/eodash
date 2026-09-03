import { vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../templates/baseConfig";
import { mountApp } from "./app";

export const TIMEOUT = 1000 * 15;

/** A 1x1 png vite serves from the repo. Same origin, so the measurement ignores it. */
const LOCAL_TILE = "/tests/support/assets/tile.png";

/**
 * Point the basemaps at that tile for the measured run. Basemaps are not what
 * these tests exercise, and live the s2maps shards fail over half their
 * requests, each failure taking as long as the network needs to give up. Done
 * by substituting the url string wherever a template holds one, rather than
 * routing the browser: playwright turns the http cache off for a whole context
 * while a route is registered, which would change every other request too.
 *
 * @param {any} node
 * @returns {number} urls replaced
 */
const useLocalBasemaps = (node) => {
  let replaced = 0;
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === "string" && value.includes("s2maps-tiles.eu")) {
      node[key] = LOCAL_TILE;
      replaced += 1;
    } else if (value && typeof value === "object") {
      replaced += useLocalBasemaps(value);
    }
  }
  return replaced;
};

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
    config: () => {
      const config = getBaseConfig({
        stacEndpoint: { endpoint, api },
        //@ts-expect-error workaround to not fallback
        brand: { font: null },
      });
      if (import.meta.env.VITE_PERF && !useLocalBasemaps(config)) {
        throw new Error(
          "no s2maps url left to replace: the measured run would go to the live network",
        );
      }
      return config;
    },
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
