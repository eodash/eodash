import { vi } from "vitest";

/**
 * Shared OpenLayers stand-ins for the layercontrol surface (unit
 * `eodashSTAC/layer-update` + browser `EodashLayerControl`).
 */

/**
 * Map-backed OL layer stand-in: `get`/`set` property bag plus spyable source
 * accessors, mirroring what `updateLayerUrl`/`updateGeoZarrBands` and the
 * layercontrol events read.
 *
 * @param {object} [options]
 * @param {string} [options.id] Value returned by `get("id")`.
 * @param {Record<string, any>} [options.jsonDefinition] Value returned by `get("_jsonDefinition")`.
 * @param {Record<string, any>} [options.source] Value returned by `getSource()`.
 * @returns {{ get: (k: string) => any, set: (k: string, v: any) => void, getSource: () => Record<string, any>, setSource: import("vitest").Mock }}
 */
export const fakeOlLayer = ({ id, jsonDefinition, source = {} } = {}) => {
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
 *
 * @param {string} url
 * @param {Record<string, any>} [schema]
 * @returns {{ type: string, properties: { layerConfig: { schema: Record<string, any> } }, source: { url: string } }}
 */
export const vtDefinition = (url, schema = VT_SCHEMA) => ({
  type: "VectorTile",
  properties: { layerConfig: { schema } },
  source: { url },
});
