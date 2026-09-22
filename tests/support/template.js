import { vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { axios } from "@/plugins/axios";
import { getBaseConfig } from "../../templates/baseConfig";
import { mountApp } from "./app";

export const TIMEOUT = 1000 * 15;

/** A 1x1 png vite serves from the repo. Same origin, so the measurement ignores it. */
const LOCAL_TILE = "/tests/support/assets/tile.png";

/**
 * A map and nothing else, passed as `over.templates` to boot a benchmark. The
 * widgets it drops each add cost that is not layer construction: a native fetch
 * per iteration, a re-render per layer, and a script off a CDN.
 */
export const MAP_ONLY = {
  gap: 0,
  background: {
    id: "background-map",
    type: "internal",
    widget: {
      name: "EodashMap",
      properties: {
        zoomToExtent: false,
        // Set explicitly, or `EodashMap` falls back to an OSM source whose url
        // OpenLayers builds internally, where no config walk can find it.
        baseLayers: [
          {
            type: "Tile",
            source: { type: "XYZ", url: LOCAL_TILE },
            properties: { id: "basemap", title: "Background" },
          },
        ],
      },
    },
  },
  widgets: [],
};

/**
 * Point the basemaps at the local tile. Live, the s2maps shards fail over half
 * their requests. Substituted rather than routed, because registering a route
 * turns the http cache off for the whole browser context.
 *
 * @param {any} config
 * @returns {number} urls replaced
 */
const pinBasemapsInConfig = (config) => {
  let replaced = 0;
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "string" && value.includes("s2maps-tiles.eu")) {
      config[key] = LOCAL_TILE;
      replaced += 1;
    } else if (value && typeof value === "object") {
      replaced += pinBasemapsInConfig(value);
    }
  }
  return replaced;
};

/** Once per module graph, which browser mode gives each test file. */
let areBasemapsPinned = false;

/**
 * The same substitution over every STAC document read. Collections declare their
 * own basemaps as `xyz` links, which the config never sees, and those are the
 * bulk of the tiles.
 */
const pinBasemapsInStac = () => {
  if (areBasemapsPinned || !axios.interceptors) {
    return;
  }
  areBasemapsPinned = true;
  axios.interceptors.response.use((response) => {
    if (response.data && typeof response.data === "object") {
      pinBasemapsInConfig(response.data);
    }
    return response;
  });
};

/**
 * Boot a template against a STAC endpoint (or a full deep link) and wait until
 * the map and the root catalog are ready.
 *
 * `over` merges into the config, which is how a suite supplies a template of
 * its own — the benches boot a map with no widgets around it.
 *
 * @param {{ template?: string, endpoint: string, api?: boolean, rasterEndpoint?: string, initialUrl?: string, over?: Record<string, any> }} opts
 */
export async function bootTemplate({
  template = "expert",
  endpoint,
  api = false,
  rasterEndpoint,
  initialUrl,
  over = {},
}) {
  const store = useSTAcStore(pinia);
  pinBasemapsInStac();
  const app = mountApp({
    ...(initialUrl ? { initialUrl } : { template }),
    // No remote fonts: the loader throws when a stylesheet cannot be reached.
    config: () => {
      const config = getBaseConfig({
        stacEndpoint: {
          endpoint,
          api,
          ...(rasterEndpoint && { rasterEndpoint }),
        },
        //@ts-expect-error workaround to not fallback
        brand: { font: null },
        ...over,
      });
      // Only that the substitution is still wired: the walk covers every stock
      // template, so it cannot speak for the one that boots. A template with no
      // `baseLayers` of its own falls back to OpenLayers' OSM source, whose url
      // is built internally where no walk can reach it.
      if (!pinBasemapsInConfig(config)) {
        throw new Error("no s2maps url left to replace: this helper is dead");
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
