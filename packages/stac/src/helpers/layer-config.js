import log from "loglevel";
import mustache from "mustache";
import { applyValuesToUrl } from "./url.js";

/**
 * What one collection's layer config editors hold, keyed by editor type.
 *
 * @typedef {Partial<Record<"style" | "tileUrl", Record<string, any>>>} FormValues
 */

/**
 * Binds layer config helpers to one collection's form values.
 * Allows UI form states (e.g. band selections, color scales) to survive a layer rebuild
 * without passing the state through every layer creation call.
 */
export const createLayerConfigHelpers = () => {
  /** @type {FormValues} */
  const values = {};
  return {
    extractLayerConfig: extractLayerConfig.bind(null, values),
    applyRasterFormValue: applyRasterFormValue.bind(null, values),
    persistLayerConfig: persistLayerConfig.bind(null, values),
  };
};

/**
 * Separates the layerConfig (jsonform schema & legend) out of a style json,
 * seeding the collection's remembered form values back into it.
 *
 * @param {FormValues} state
 * @param {import("../types").EodashStyleJson} [style]
 * @param {Record<string,any>} [rasterJsonform]
 * @param {"style" | "tileUrl"} [layerConfigType]
 **/
function extractLayerConfig(state, style, rasterJsonform, layerConfigType) {
  if (!style && !rasterJsonform) {
    return { layerConfig: undefined, style: undefined };
  }
  if (style) {
    style = { ...style };
  }

  if (style?.variables) {
    // render the saved rescale/gamma from the first frame
    style.variables = applyStyleVariables(state, style.variables);
  }

  if (rasterJsonform) {
    return {
      layerConfig: {
        schema: restorePersistedSchema(
          rasterJsonform.jsonform,
          state,
          "tileUrl",
        ),
        legend: rasterJsonform.legend,
        type: "tileUrl",
      },
      style,
    };
  }

  /** @type {import("../types").EodashLayerConfig | undefined} */
  let layerConfig = undefined;

  if (style?.jsonform) {
    // this explicitly sets legend only if jsonform is configured
    const type = layerConfigType || "style";
    layerConfig = {
      schema: restorePersistedSchema(style.jsonform, state, type),
      type,
    };
    delete style.jsonform;
    if (style?.legend) {
      layerConfig.legend = style.legend;
      delete style.legend;
    }
  }
  log.debug(
    "extracted layerConfig",
    JSON.parse(JSON.stringify({ layerConfig, style })),
  );

  return { layerConfig, style };
}

/**
 * Deep-clones `schema` and overwrites each leaf property's `default` with the
 * matching entry in `values` (keyed by property name), walking nested
 * `properties`, `oneOf`/`allOf`/`anyOf` branches and local `$ref`s. Leaves the
 * original schema untouched so shared/cached schemas are not mutated.
 *
 * @param {Record<string, any>} schema
 * @param {Record<string, any>} values - Flat map of property name -> persisted value.
 * @returns {Record<string, any>}
 */
function seedSchemaDefaults(schema, values) {
  if (!schema || typeof schema !== "object" || !values) return schema;
  const cloned = JSON.parse(JSON.stringify(schema));

  /**
   * @param {Record<string, any> | undefined} node
   * @param {Set<string>} seenRefs
   */
  const walk = (node, seenRefs) => {
    if (!node || typeof node !== "object") return;
    if (typeof node.$ref === "string" && !seenRefs.has(node.$ref)) {
      walk(
        resolveLocalRef(node.$ref, cloned),
        new Set([...seenRefs, node.$ref]),
      );
    }
    if (node.properties) {
      for (const [key, propSchema] of Object.entries(node.properties)) {
        if (
          key in values &&
          /** @type {any} */ (propSchema)?.type !== "object"
        ) {
          /** @type {any} */ (propSchema).default = JSON.parse(
            JSON.stringify(values[key]),
          );
        } else {
          walk(/** @type {any} */ (propSchema), seenRefs);
        }
      }
    }
    for (const combinator of ["oneOf", "allOf", "anyOf"]) {
      if (Array.isArray(node[combinator]))
        node[combinator].forEach((/** @type {any} */ branch) =>
          walk(branch, seenRefs),
        );
    }
  };
  walk(cloned, new Set());
  return cloned;
}

/**
 * Resolves a local `$ref` pointer (e.g. `#/definitions/foo`) against `rootSchema`.
 *
 * @param {string} ref
 * @param {Record<string, any>} rootSchema
 * @returns {Record<string, any> | undefined}
 */
function resolveLocalRef(ref, rootSchema) {
  if (!ref.startsWith("#/")) return undefined;
  return ref
    .slice(2)
    .split("/")
    .reduce(
      (node, part) => node?.[part.replace(/~1/g, "/").replace(/~0/g, "~")],
      rootSchema,
    );
}

/**
 * Flattens a nested jsonform value into a single map keyed by leaf property name
 * (e.g. `{ rescaleRed: { minRed, maxRed } }` -> `{ minRed, maxRed }`). Arrays are
 * kept whole (bands stay a single value).
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
function flattenFormValues(obj) {
  /** @type {Record<string, any>} */
  const result = {};
  for (const key in obj) {
    if (
      obj[key] !== null &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(result, flattenFormValues(obj[key]));
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * @param {FormValues} state
 * @param {"style" | "tileUrl"} type
 * @returns {Record<string, any> | undefined}
 */
function getCachedConfig(state, type) {
  return state[type];
}

/**
 * Remembers what a layer config editor now holds, for the next build to restore.
 *
 * @param {FormValues} state
 * @param {import("../types").EodashLayerConfig} layerConfig - the config the edited layer was built with
 * @param {Record<string, any>} value - current jsonform value
 */
function persistLayerConfig(state, layerConfig, value) {
  const type = layerConfig?.type;
  if (type !== "style" && type !== "tileUrl") return;
  // form opted out of persistence (top level schema option)
  if (layerConfig.schema?.options?.persist_state === false) return;
  state[type] = value;
}

/**
 * Restores a remembered selection onto a rebuilt schema by seeding its leaf
 * defaults — the channel the range/minmax and bands editors honor on a fresh
 * mount (they ignore startval).
 * @param {Record<string, any>} schema
 * @param {FormValues} state
 * @param {"style" | "tileUrl"} type
 * @returns {Record<string, any>} seeded schema (original untouched)
 */
function restorePersistedSchema(schema, state, type) {
  // form opted out of persistence
  if (schema?.options?.persist_state === false) return schema;
  const cached = getCachedConfig(state, type);
  if (!cached || !Object.keys(cached).length) return schema;
  return seedSchemaDefaults(schema, flattenFormValues(cached));
}

/**
 * Mirrors the remembered style variables onto a rebuilt style so the layer
 * renders the saved rescale/gamma from the first frame.
 * @param {FormValues} state
 * @param {Record<string, any>} [variables]
 * @returns {Record<string, any> | undefined}
 */
function applyStyleVariables(state, variables) {
  const cached = getCachedConfig(state, "style");
  if (!cached || !variables) return variables;
  const values = flattenFormValues(cached);
  const merged = { ...variables };
  for (const key of Object.keys(merged)) {
    if (key in values) merged[key] = values[key];
  }
  return merged;
}

/**
 * Writes the remembered tileUrl selection into a rebuilt layer's source (WMS
 * params or the tile URL) so eox reads it back as the form's start values
 * (`getStartVals`). Mutates in place.
 * @param {FormValues} state
 * @param {Record<string, any>} layer - built layer json
 */
function applyRasterFormValue(state, layer) {
  if (layer?.properties?.layerConfig?.type !== "tileUrl") return;
  const value = getCachedConfig(state, "tileUrl");
  const source = layer.source;
  if (!source || !value || !Object.keys(value).length) return;
  if (source.params) {
    Object.assign(source.params, flattenFormValues(value));
    return;
  }
  if (typeof source.url === "string") {
    source.url = applyValuesToUrl(source.url, value);
  } else if (Array.isArray(source.urls)) {
    source.urls = /** @type {string[]} */ (source.urls).map((u) =>
      applyValuesToUrl(u, value),
    );
  }
}

/**
 * Fetches or extracts the raster form configuration for a STAC object.
 * Supports direct JSON objects, data URIs, and URL strings.
 * Renders placeholders against the provided item context.
 *
 * @param {import("../types").RasterForm|string|undefined} rasterform - The rasterform property from the STAC object.
 * @param {import("../http.js").HttpClient} http
 * @param {import("../types").STACItem} [item] - Item the form is rendered against.
 * @returns {Promise<import("../types").RasterForm|undefined>}
 */
export async function fetchRasterForm(rasterform, http, item) {
  /** @type {import("../types").RasterForm | undefined} */
  let form = undefined;
  if (typeof rasterform === "object" && rasterform) {
    form = /** @type {import("../types").RasterForm} */ (rasterform);
  } else if (typeof rasterform === "string" && rasterform) {
    form = await http.get(rasterform);
  }
  if (!form || !item) {
    return form;
  }
  return renderConfigTemplate(form, item);
}

/**
 * Renders `${...}` placeholders in a JSON config against a view, e.g.
 * `${properties.sat:orbit_state}` against a STAC item. Returns the input
 * unchanged when it holds no placeholders or rendering fails.
 *
 * @template T
 * @param {T} json
 * @param {Record<string, any>} view - lookup context for the placeholders
 * @returns {T}
 */
export function renderConfigTemplate(json, view) {
  if (!json || typeof json !== "object") {
    return json;
  }
  const str = JSON.stringify(json);
  if (!str.includes("${")) {
    return json;
  }
  try {
    return JSON.parse(
      mustache.render(str, view, {}, { tags: ["${", "}"], escape: (v) => v }),
    );
  } catch (e) {
    log.warn("[eodash] failed to render config template:", e);
    return json;
  }
}

/**
 * Locates the first sub-schema matching a specific format by walking properties and combinators.
 * Returns the schema path from the root as an array of keys/indices, or undefined if not found.
 *
 * @param {Record<string, any> | null | undefined} schema
 * @param {string} [format="bands"]
 * @returns {(string | number)[] | undefined}
 */
export function getBandsProperty(schema, format = "bands") {
  if (!schema || typeof schema !== "object") return undefined;
  if (schema.format === format) return [];

  if (schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      const sub = getBandsProperty(schema.properties[key], format);
      if (sub) return ["properties", key, ...sub];
    }
  }

  for (const combinator of ["oneOf", "allOf", "anyOf"]) {
    if (!Array.isArray(schema[combinator])) continue;
    for (let i = 0; i < schema[combinator].length; i++) {
      const sub = getBandsProperty(schema[combinator][i], format);
      if (sub) return [combinator, i, ...sub];
    }
  }

  return undefined;
}
