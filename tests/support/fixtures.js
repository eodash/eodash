import { vi } from "vitest";
import { createApp } from "vue";
import { eodashKey } from "@/utils/keys";
import { provideEodashInstance } from "@/composables";

/**
 * Map-backed OL layer stand-in: `get`/`set` property bag plus spyable source
 * accessors, mirroring what `updateLayerUrl`/`updateGeoZarrBands` and the
 * layercontrol events read.
 * @param {object} [options]
 * @param {string} [options.id] Value returned by `get("id")`.
 * @param {Record<string, any>} [options.jsonDefinition] Value returned by `get("_jsonDefinition")`.
 * @param {Record<string, any>} [options.source] Value returned by `getSource()`.
 * @returns {{ get: (k: string) => any, set: (k: string, v: any) => void, getSource: () => Record<string, any>, setSource: import("vitest").Mock }}
 */
export const mockOlLayer = ({ id, jsonDefinition, source = {} } = {}) => {
  /** @type {Map<string, any>} */
  const props = new Map();
  if (id !== undefined) props.set("id", id);
  if (jsonDefinition !== undefined)
    props.set("_jsonDefinition", jsonDefinition);
  return {
    get: (k) => props.get(k),
    set: (k, v) => props.set(k, v),
    getSource: () => source,
    setSource: vi.fn(),
  };
};

/** Jsonform schema exposing one `url_key`-mapped property. */
export const VT_SCHEMA = {
  properties: { flood: { url_key: "flood_percent" } },
};

/**
 * A VectorTile `_jsonDefinition` whose layerConfig schema drives url_key injection.
 * @param {string} url
 * @param {Record<string, any>} [schema]
 * @returns {{ type: string, properties: { layerConfig: { schema: Record<string, any> } }, source: { url: string } }}
 */
export const vtDefinition = (url, schema = VT_SCHEMA) => ({
  type: "VectorTile",
  properties: { layerConfig: { schema } },
  source: { url },
});

/**
 * A minimal valid STAC collection; override any field (links, assets, extent).
 * @param {Record<string, any>} [over]
 */
export const stacCollection = (over = {}) => ({
  type: "Collection",
  stac_version: "1.0.0",
  id: "coll",
  title: "Coll",
  description: "d",
  license: "proprietary",
  extent: {
    spatial: { bbox: [[0, 0, 1, 1]] },
    temporal: { interval: [[null, null]] },
  },
  links: [],
  assets: {},
  ...over,
});

/**
 * Route an axios `get` mock by url; anything unlisted rejects loudly so a
 * forgotten fixture fails the test instead of hanging.
 * @param {{ get: import("vitest").Mock<(url: string) => Promise<unknown>> }} axiosMock
 * @param {Record<string, any>} responses url -> response data
 */
export const serveUrls = (axiosMock, responses) => {
  axiosMock.get.mockImplementation((url) =>
    url in responses
      ? Promise.resolve({ data: responses[url] })
      : Promise.reject(new Error(`unmocked url ${url}`)),
  );
};

/**
 * Satisfy the `useEodash()` singleton without mounting, for code that reads it
 * outside a component (createLayers, mosaic).
 * @param {Record<string, any>} [config]
 */
export const provideEodash = (config = { id: "test" }) => {
  const app = createApp({});
  app.provide(eodashKey, /** @type {any} */ (config));
  app.runWithContext(() => provideEodashInstance());
  return app;
};
