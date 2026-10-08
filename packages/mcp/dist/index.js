#!/usr/bin/env node
import {
  CUSTOM_WIDGET_GUIDES,
  MAX_GEOJSON_VERTICES,
  countGeoJsonVertices,
  createDummyCollectionForItem,
  createSafeHttpClient,
  getMetadata,
  hasCircularReference,
  instrumentTool,
  loadTemplateExamples,
  logger,
  sanitizeText,
  selectCatalogIndicator,
} from "./helpers.js";
import { createExpressApp as createExpressApp$1 } from "./server.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import Fuse from "fuse.js";
import { z } from "zod";
import Ajv from "ajv";
import addFormats from "ajv-formats";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (
  mod || (cb((mod = { exports: {} }).exports, mod), (cb = null)),
  mod.exports
);
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function")
    for (
      var keys = __getOwnPropNames(from), i = 0, n = keys.length, key;
      i < n;
      i++
    ) {
      key = keys[i];
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
    }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default")
      ? __defProp(target, "default", {
          value: mod,
          enumerable: true,
        })
      : target,
    mod,
  )
);
//#endregion
//#region tools/widgets.js
/**
 * Register widget discovery and inspection tools
 */
function registerWidgetTools(server, widgetsData) {
  server.registerTool(
    "list_widgets",
    {
      description:
        "List built-in eodash widgets with capability tags, summaries, prop counts, and store interactions.",
      inputSchema: z.object({
        category: z.string().optional().describe("Filter by category"),
        tag: z
          .string()
          .optional()
          .describe(
            "Filter by tag (map, time, filter, catalog, layer, chart, process, stac)",
          ),
        search: z.string().optional().describe("Free-text search query"),
      }),
    },
    instrumentTool("list_widgets", async ({ category, tag, search }) => {
      let list = Object.values(widgetsData);
      if (category) {
        const catLower = category.toLowerCase();
        list = list.filter((w) => w.category?.toLowerCase().includes(catLower));
      }
      if (tag) {
        const tagLower = tag.toLowerCase();
        list = list.filter(
          (w) =>
            w.tags?.some((t) => t.toLowerCase().includes(tagLower)) ||
            w.category?.toLowerCase().includes(tagLower) ||
            w.name?.toLowerCase().includes(tagLower) ||
            w.summary?.toLowerCase().includes(tagLower),
        );
      }
      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(
          (w) =>
            w.name?.toLowerCase().includes(sLower) ||
            w.summary?.toLowerCase().includes(sLower) ||
            w.tags?.some((t) => t.toLowerCase().includes(sLower)) ||
            w.category?.toLowerCase().includes(sLower),
        );
      }
      const summaryList = list.map((w) => ({
        name: w.name,
        category: w.category,
        tags: w.tags || [],
        summary: w.summary,
        isBackground: w.isBackground,
        propCount: w.props?.length || 0,
        storeInteractions: {
          reads: w.storeInteractions?.reads || [],
          writes: w.storeInteractions?.writes || [],
        },
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(summaryList, null, 2),
          },
        ],
      };
    }),
  );
  server.registerTool(
    "get_widget_details",
    {
      description:
        "Get details for a specific eodash widget: props, store interactions, STAC extensions, config example, and guide.",
      inputSchema: z.object({
        widgetName: z
          .string()
          .optional()
          .describe("Widget name (e.g. EodashMap, EodashItemCatalog)"),
        name: z.string().optional().describe("Alias for widgetName"),
      }),
    },
    instrumentTool("get_widget_details", async ({ widgetName, name }) => {
      const targetName = widgetName || name;
      const widget = targetName ? widgetsData[targetName] : null;
      if (!widget)
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Widget '${targetName || "undefined"}' not found in eodash widgets registry. Available widgets: ${Object.keys(widgetsData).join(", ")}`,
            },
          ],
        };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(widget, null, 2),
          },
        ],
      };
    }),
  );
}
//#endregion
//#region tools/architecture.js
/**
 * Register architecture documentation tools
 */
function registerArchitectureTools(server, architectureData) {
  server.registerTool(
    "get_custom_widget_guide",
    {
      description:
        "Get guide and code templates for creating custom eodash widgets.",
      inputSchema: z.object({
        type: z
          .enum([
            "web-component",
            "functional",
            "iframe",
            "eox-elements",
            "all",
          ])
          .optional()
          .default("all")
          .describe("Custom widget type"),
      }),
    },
    instrumentTool("get_custom_widget_guide", async ({ type }) => {
      const selectedType = type || "all";
      const guides = CUSTOM_WIDGET_GUIDES;
      const selectedContent =
        selectedType === "all"
          ? guides
          : { [selectedType]: guides[selectedType] };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(selectedContent, null, 2),
          },
        ],
      };
    }),
  );
  server.registerTool(
    "get_eodash_architecture",
    {
      description:
        "Get eodash architecture docs: grid layout, templates, Pinia store, deployment modes.",
      inputSchema: z.object({
        topic: z
          .enum([
            "overview",
            "grid-layout",
            "templates",
            "custom-widgets",
            "reactive-store",
            "all",
          ])
          .optional()
          .default("all")
          .describe("Architecture topic"),
      }),
    },
    instrumentTool("get_eodash_architecture", async ({ topic }) => {
      let result;
      if (topic === "all") result = architectureData;
      else if (topic === "overview")
        result = { overview: architectureData.overview };
      else if (topic === "grid-layout")
        result = { gridSystem: architectureData.gridSystem };
      else if (topic === "templates")
        result = { templateSystem: architectureData.templateSystem };
      else if (topic === "custom-widgets")
        result = { customWidgetSystem: architectureData.customWidgetSystem };
      else if (topic === "reactive-store")
        result = { reactiveStore: architectureData.reactiveStore };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result || architectureData, null, 2),
          },
        ],
      };
    }),
  );
}
//#endregion
//#region generators/examples.js
var __filename$1 = fileURLToPath(import.meta.url);
var __dirname$1 = path.dirname(__filename$1);
var EXAMPLES_DIR = path.resolve(__dirname$1, "../data/examples");
var cachedExamples = null;
/**
 * Load examples registry from data/examples/*.json category files and file-backed templates
 * @returns {Array<{ id: string, title: string, category: string, tags: string[], description: string, targetContext: string, code: any }>}
 */
function getExamples() {
  if (cachedExamples) return cachedExamples;
  const jsonExamples = [];
  if (fs.existsSync(EXAMPLES_DIR)) {
    const files = fs
      .readdirSync(EXAMPLES_DIR)
      .filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(EXAMPLES_DIR, file);
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) jsonExamples.push(...parsed);
        else if (parsed && typeof parsed === "object")
          jsonExamples.push(parsed);
      } catch (err) {
        logger.error({
          event: "load_example_error",
          file,
          error: err.message,
        });
      }
    }
  }
  const templateExamples = loadTemplateExamples();
  cachedExamples = [...jsonExamples, ...templateExamples];
  return cachedExamples;
}
var FUSE_OPTIONS = {
  keys: [
    {
      name: "tags",
      weight: 0.4,
    },
    {
      name: "title",
      weight: 0.3,
    },
    {
      name: "description",
      weight: 0.2,
    },
    {
      name: "id",
      weight: 0.05,
    },
    {
      name: "code",
      weight: 0.05,
    },
  ],
  getFn: (obj, path) => {
    const val = Fuse.config.getFn(obj, path);
    if (val && typeof val === "object") return JSON.stringify(val);
    return val;
  },
  threshold: 0.32,
  ignoreLocation: true,
  minMatchCharLength: 2,
  findAllMatches: true,
};
/**
 * Search and retrieve curated eodash configuration snippets using Fuse.js
 * @param {{ query?: string, category?: string, limit?: number }} [options]
 */
function findExamples({ query, category, limit = 5 } = {}) {
  let candidates = getExamples();
  if (category && category !== "all")
    candidates = candidates.filter((ex) => ex.category === category);
  let matchedItems = candidates;
  if (query && query.trim()) {
    const trimmed = query.trim();
    const fuse = new Fuse(candidates, FUSE_OPTIONS);
    const searchResults = fuse.search(trimmed);
    if (searchResults.length === 0 && trimmed.includes(" ")) {
      const terms = trimmed.split(/\s+/).filter(Boolean);
      const scoreMap = /* @__PURE__ */ new Map();
      for (const term of terms)
        for (const res of fuse.search(term)) {
          const current = scoreMap.get(res.item.id) || {
            item: res.item,
            score: 0,
          };
          current.score += 1 - (res.score ?? 0);
          scoreMap.set(res.item.id, current);
        }
      matchedItems = Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item);
    } else matchedItems = searchResults.map((r) => r.item);
  }
  const totalFound = matchedItems.length;
  const paginated = matchedItems.slice(0, Math.min(20, Math.max(1, limit)));
  return {
    totalFound,
    query: query || null,
    category: category || "all",
    results: paginated,
  };
}
//#endregion
//#region generators/validator/schemas.js
var COLLECTION_SCHEMA_URL =
  "https://eodash.github.io/eodash-schemas/catalog/collection-schema.json";
var INDICATOR_SCHEMA_URL =
  "https://eodash.github.io/eodash-schemas/catalog/indicator-schema.json";
/** @type {{ ajv: any; validateCatalogCollection: any; validateCatalogIndicator: any } | null} */
var cachedValidators = null;
/**
 * Creates and configures an Ajv instance with custom formats
 */
function createAjvInstance() {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
    logger: {
      log: (...args) => logger.debug(...args),
      warn: () => {},
      error: (...args) => logger.error(...args),
    },
  });
  addFormats(ajv);
  ajv.addFormat("stac-endpoint", {
    type: "string",
    validate: (url) => typeof url === "string" && url.length > 0,
  });
  ajv.addFormat("datetime-iso8601", {
    type: "string",
    validate: (dt) => !Number.isNaN(Date.parse(dt)),
  });
  ajv.addFormat("style-url", {
    type: "string",
    validate: (url) =>
      typeof url === "string" &&
      (url.startsWith("http") || url.startsWith("/")),
  });
  ajv.addFormat("coordinate-pair", {
    type: "array",
    validate: (arr) =>
      Array.isArray(arr) &&
      arr.length === 2 &&
      typeof arr[0] === "number" &&
      typeof arr[1] === "number",
  });
  ajv.addFormat("polygon-coordinates", {
    type: "array",
    validate: (coords) => {
      if (!Array.isArray(coords) || coords.length === 0) return false;
      const ring = coords[0];
      return (
        Array.isArray(ring) &&
        ring.length >= 4 &&
        ring.every(
          (pt) =>
            Array.isArray(pt) &&
            pt.length === 2 &&
            pt.every((n) => typeof n === "number"),
        )
      );
    },
  });
  ajv.addFormat("bounding-box", {
    type: "array",
    validate: (b) =>
      Array.isArray(b) &&
      b.length === 4 &&
      b.every((n) => typeof n === "number"),
  });
  ajv.addFormat("point", {
    type: "array",
    validate: (p) =>
      Array.isArray(p) &&
      p.length === 2 &&
      p.every((n) => typeof n === "number"),
  });
  ajv.addFormat("datetime", {
    type: "string",
    validate: (dt) =>
      typeof dt === "string" &&
      (!Number.isNaN(Date.parse(dt)) || /^\d{4}\d{2}\d{2}/.test(dt)),
  });
  ajv.addFormat("markdown", {
    type: "string",
    validate: (s) => typeof s === "string",
  });
  ajv.addFormat("categories", { validate: () => true });
  return ajv;
}
/**
 * Fetch remote schemas directly from authoritative eodash-schemas URL
 */
async function loadSchemas() {
  const [colSchema, indSchema] = await Promise.all([
    fetch(COLLECTION_SCHEMA_URL).then(async (r) => {
      if (!r.ok)
        throw new Error(
          `HTTP ${r.status} ${r.statusText} fetching collection schema from ${COLLECTION_SCHEMA_URL}`,
        );
      return r.json();
    }),
    fetch(INDICATOR_SCHEMA_URL).then(async (r) => {
      if (!r.ok)
        throw new Error(
          `HTTP ${r.status} ${r.statusText} fetching indicator schema from ${INDICATOR_SCHEMA_URL}`,
        );
      return r.json();
    }),
  ]);
  return {
    colSchema,
    indSchema,
  };
}
/**
 * Initialize or get cached compiled validators
 */
async function getValidators() {
  if (cachedValidators) return cachedValidators;
  const ajv = createAjvInstance();
  const { colSchema, indSchema } = await loadSchemas();
  cachedValidators = {
    ajv,
    validateCatalogCollection: ajv.compile(colSchema),
    validateCatalogIndicator: ajv.compile(indSchema),
  };
  return cachedValidators;
}
//#endregion
//#region generators/validator/rules.js
/**
 * Performs custom EODash domain rule validations
 * on parsed catalog config object.
 */
function validateCustomRules(parsed, errors, warnings) {
  if (parsed.Resources && Array.isArray(parsed.Resources))
    for (let i = 0; i < parsed.Resources.length; i++) {
      const res = parsed.Resources[i];
      if (res.Flatstyle !== void 0)
        errors.push({
          path: `/Resources/${i}/Flatstyle`,
          keyword: "additionalProperties",
          message:
            "Property 'Flatstyle' does not exist on Resources. Use 'Style' for resource styles (Flatstyle is only valid under Process outputs).",
          suggestion: "Rename 'Flatstyle' to 'Style' with a valid URL string.",
        });
      if (res.Rasterform && typeof res.Rasterform === "object") {
        if (
          (res.Rasterform.oneOf || res.Rasterform.anyOf) &&
          res.Rasterform.options?.keep_oneof_values !== false
        )
          warnings.push(
            `Resource[${i}] Rasterform uses branching (oneOf/anyOf) without "keep_oneof_values": false in options. This may cause values to leak between branches in json-editor.`,
          );
      }
    }
}
//#endregion
//#region generators/validator.js
/**
 * Validate an EODash catalog configuration against official eodash schemas and custom domain rules
 */
async function validateCatalogConfig({ config, configType = "auto" } = {}) {
  let parsed = config;
  if (typeof config === "string")
    try {
      parsed = JSON.parse(config);
    } catch (err) {
      return {
        valid: false,
        configType: "unknown",
        schemaUrl: "",
        errors: [
          {
            path: "/",
            message: `JSON Parse error: ${err.message}`,
            suggestion: "Ensure configuration is valid JSON.",
          },
        ],
        warnings: [],
        summary: `Validation failed: Invalid JSON syntax.`,
      };
    }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return {
      valid: false,
      configType: "unknown",
      schemaUrl: "",
      errors: [
        {
          path: "/",
          message: "Configuration must be a JSON object.",
        },
      ],
      warnings: [],
      summary: "Validation failed: Root configuration must be an object.",
    };
  const rawType = String(configType).toLowerCase().trim();
  let resolvedType = rawType;
  if (rawType === "auto") {
    if (Array.isArray(parsed.Collections)) resolvedType = "indicator";
    else resolvedType = "collection";
  } else if (rawType === "indicator") resolvedType = "indicator";
  else resolvedType = "collection";
  const { validateCatalogCollection, validateCatalogIndicator, usedFallback } =
    await getValidators();
  const isIndicator = resolvedType === "indicator";
  const validator = isIndicator
    ? validateCatalogIndicator
    : validateCatalogCollection;
  const schemaUrl = isIndicator ? INDICATOR_SCHEMA_URL : COLLECTION_SCHEMA_URL;
  const valid = validator(parsed);
  const errors = [];
  const warnings = [];
  if (!valid && validator.errors)
    for (const err of validator.errors) {
      const errPath = err.instancePath || "/";
      let suggestion = "";
      if (err.keyword === "required")
        suggestion = `Add missing required property '${err.params.missingProperty}'.`;
      else if (err.keyword === "type")
        suggestion = `Property '${errPath}' should be of type '${err.params.type}'.`;
      else if (err.keyword === "enum")
        suggestion = `Allowed values are: ${err.params.allowedValues.join(", ")}.`;
      errors.push({
        path: errPath,
        keyword: err.keyword,
        message: err.message,
        params: err.params,
        suggestion: suggestion || void 0,
      });
    }
  validateCustomRules(parsed, errors, warnings);
  const isActuallyValid = valid && errors.length === 0;
  return {
    valid: isActuallyValid,
    configType: resolvedType,
    schemaUrl,
    usedFallback: Boolean(usedFallback),
    errors,
    warnings,
    summary: isActuallyValid
      ? `Configuration is valid according to ${resolvedType} schema.`
      : `Validation failed with ${errors.length} error(s)${warnings.length ? ` and ${warnings.length} warning(s)` : ""}.`,
  };
}
//#endregion
//#region tools/discovery.js
/**
 * Register search, example discovery, and config validation tools
 */
function registerDiscoveryTools(server) {
  server.registerTool(
    "find_examples",
    {
      description:
        "SHOULD USE: Query verified working examples before authoring or modifying Vega-Lite charts, vector/raster layer styles (OpenLayers flatstyles), JSONForm/rasterform schemas, STAC collections/indicators, or processing request bodies. Provides snippets with exact eodash conventions, preventing invalid properties, broken legends, and style syntax errors.",
      inputSchema: z.object({
        category: z
          .enum([
            "all",
            "chart-vega",
            "vector-style",
            "raster-style",
            "rasterform",
            "jsonform",
            "process-body",
            "collection",
            "indicator",
            "stac-item",
            "dashboard-scaffold",
            "dashboard-config",
          ])
          .optional()
          .default("all")
          .describe(
            "Config category filter: 'chart-vega' (Vega-Lite), 'vector-style' (OpenLayers flatstyles & dynamic legends), 'raster-style' (colormaps, band math), 'rasterform' / 'jsonform' (UI forms), 'process-body' (geoprocessing payloads), 'collection' / 'indicator' / 'stac-item' (STAC catalog configs), 'dashboard-scaffold' / 'dashboard-config'.",
          ),
        query: z
          .string()
          .optional()
          .describe(
            "Search keywords, visual types, or mechanics. E.g., 'grouped-bar dropdown', 'dynamic legend boundTo', 'raster colormap', 'sentinel-2 band math'. Leave empty to list category highlights.",
          ),
        limit: z.number().optional().default(5).describe("Max results (1-20)"),
      }),
    },
    instrumentTool("find_examples", async (params) => {
      const results = findExamples(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }),
  );
  server.registerTool(
    "validate_catalog_config",
    {
      description:
        "Validate eodash collection or indicator JSON configuration against schemas and rules.",
      inputSchema: z.object({
        config: z
          .union([z.string(), z.record(z.any())])
          .describe("Collection or indicator JSON string or object"),
        configType: z
          .enum(["auto", "collection", "indicator"])
          .optional()
          .default("auto")
          .describe("Target schema type"),
      }),
    },
    instrumentTool("validate_catalog_config", async (params) => {
      const results = await validateCatalogConfig(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }),
  );
}
//#endregion
//#region ../stac/src/http.js
/**
 * Query values for HTTP requests.
 *
 * @typedef {Record<string, string | number | undefined>} SearchQuery
 */
/**
 * HTTP client interface for internal library reads and builders.
 *
 * @typedef {object} HttpClient
 * @property {<T = any>(url: string, params?: SearchQuery) => Promise<T>} get reads json
 */
/**
 * An Axios-compatible instance interface.
 *
 * @typedef {object} AxiosInstance
 * @property {(url: string, config?: { params?: SearchQuery }) => Promise<{ data: any }>} get
 */
/**
 * Creates an HTTP client for making API requests.
 * Uses the provided client or defaults to native `fetch`.
 *
 * @param {object} [context]
 * @param {AxiosInstance} [context.client]
 * @returns {HttpClient}
 */
var createHTTPInstance = ({ client } = {}) => ({
  get: async (url, params) => {
    if (client) return (await client.get(url, params && { params })).data;
    const response = await fetch(withQuery(url, params));
    if (!response.ok)
      throw new Error(`${response.status} ${response.statusText} for ${url}`);
    return response.json();
  },
});
/**
 * @param {string} url
 * @param {SearchQuery} [params]
 */
function withQuery(url, params) {
  if (!params) return url;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== void 0) query.set(key, String(value));
  const search = query.toString();
  return search ? `${url}?${search}` : url;
}
//#endregion
//#region ../stac/src/helpers/assets.js
/**
 * Determines if a STAC link or asset acts as a base layer or an overlay based on its roles.
 *
 * @param {import("../types").STACLink | import("../types").STACAsset | undefined} linkOrAsset
 * @returns {boolean}
 */
var isBaseLayerOrOverlay = (linkOrAsset) => {
  return !!linkOrAsset?.roles?.some(
    (role) => role === "baselayer" || role === "overlay",
  );
};
/**
 * Translates STAC roles ("visible", "invisible", "overlay", "baselayer") into properties.
 * Modifies the properties object in-place and returns it.
 *
 * @param {Record<string,any>} properties
 * @param {import("../types").STACLink | import("../types").STACAsset} linkOrAsset
 */
var extractRoles = (properties, linkOrAsset) => {
  linkOrAsset.roles?.forEach((role) => {
    if (role === "visible") properties.visible = true;
    else if (role === "invisible") properties.visible = false;
    if (role === "overlay" || role === "baselayer") properties.group = role;
  });
  return properties;
};
/**
 * Finds a GeoParquet collection mirror asset (`application/vnd.apache.parquet`).
 *
 * @param {import("../types").STACCollection} collection
 * @returns {import("../types").STACAsset | undefined}
 */
var findParquetMirror = (collection) =>
  Object.values(collection.assets ?? {}).find(
    (asset) =>
      asset.type === "application/vnd.apache.parquet" &&
      asset.roles?.includes("collection-mirror"),
  );
//#endregion
//#region ../../node_modules/mustache/mustache.mjs
var import_loglevel = /* @__PURE__ */ __toESM(
  /* @__PURE__ */ __commonJSMin((exports, module) => {
    (function (root, definition) {
      "use strict";
      if (typeof define === "function" && define.amd) define(definition);
      else if (typeof module === "object" && module.exports)
        module.exports = definition();
      else root.log = definition();
    })(exports, function () {
      "use strict";
      var noop = function () {};
      var undefinedType = "undefined";
      var isIE =
        typeof window !== undefinedType &&
        typeof window.navigator !== undefinedType &&
        /Trident\/|MSIE /.test(window.navigator.userAgent);
      var logMethods = ["trace", "debug", "info", "warn", "error"];
      var _loggersByName = {};
      var defaultLogger = null;
      function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === "function") return method.bind(obj);
        else
          try {
            return Function.prototype.bind.call(method, obj);
          } catch (e) {
            return function () {
              return Function.prototype.apply.apply(method, [obj, arguments]);
            };
          }
      }
      function traceForIE() {
        if (console.log) {
          if (console.log.apply) console.log.apply(console, arguments);
          else
            Function.prototype.apply.apply(console.log, [console, arguments]);
        }
        if (console.trace) console.trace();
      }
      function realMethod(methodName) {
        if (methodName === "debug") methodName = "log";
        if (typeof console === undefinedType) return false;
        else if (methodName === "trace" && isIE) return traceForIE;
        else if (console[methodName] !== void 0)
          return bindMethod(console, methodName);
        else if (console.log !== void 0) return bindMethod(console, "log");
        else return noop;
      }
      function replaceLoggingMethods() {
        var level = this.getLevel();
        for (var i = 0; i < logMethods.length; i++) {
          var methodName = logMethods[i];
          this[methodName] =
            i < level ? noop : this.methodFactory(methodName, level, this.name);
        }
        this.log = this.debug;
        if (typeof console === undefinedType && level < this.levels.SILENT)
          return "No console available for logging";
      }
      function enableLoggingWhenConsoleArrives(methodName) {
        return function () {
          if (typeof console !== undefinedType) {
            replaceLoggingMethods.call(this);
            this[methodName].apply(this, arguments);
          }
        };
      }
      function defaultMethodFactory(methodName, _level, _loggerName) {
        return (
          realMethod(methodName) ||
          enableLoggingWhenConsoleArrives.apply(this, arguments)
        );
      }
      function Logger(name, factory) {
        var self = this;
        /**
         * The level inherited from a parent logger (or a global default). We
         * cache this here rather than delegating to the parent so that it stays
         * in sync with the actual logging methods that we have installed (the
         * parent could change levels but we might not have rebuilt the loggers
         * in this child yet).
         * @type {number}
         */
        var inheritedLevel;
        /**
         * The default level for this logger, if any. If set, this overrides
         * `inheritedLevel`.
         * @type {number|null}
         */
        var defaultLevel;
        /**
         * A user-specific level for this logger. If set, this overrides
         * `defaultLevel`.
         * @type {number|null}
         */
        var userLevel;
        var storageKey = "loglevel";
        if (typeof name === "string") storageKey += ":" + name;
        else if (typeof name === "symbol") storageKey = void 0;
        function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || "silent").toUpperCase();
          if (typeof window === undefinedType || !storageKey) return;
          try {
            window.localStorage[storageKey] = levelName;
            return;
          } catch (ignore) {}
          try {
            window.document.cookie =
              encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
        }
        function getPersistedLevel() {
          var storedLevel;
          if (typeof window === undefinedType || !storageKey) return;
          try {
            storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}
          if (typeof storedLevel === undefinedType)
            try {
              var cookie = window.document.cookie;
              var cookieName = encodeURIComponent(storageKey);
              var location = cookie.indexOf(cookieName + "=");
              if (location !== -1)
                storedLevel = /^([^;]+)/.exec(
                  cookie.slice(location + cookieName.length + 1),
                )[1];
            } catch (ignore) {}
          if (self.levels[storedLevel] === void 0) storedLevel = void 0;
          return storedLevel;
        }
        function clearPersistedLevel() {
          if (typeof window === undefinedType || !storageKey) return;
          try {
            window.localStorage.removeItem(storageKey);
          } catch (ignore) {}
          try {
            window.document.cookie =
              encodeURIComponent(storageKey) +
              "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {}
        }
        function normalizeLevel(input) {
          var level = input;
          if (
            typeof level === "string" &&
            self.levels[level.toUpperCase()] !== void 0
          )
            level = self.levels[level.toUpperCase()];
          if (
            typeof level === "number" &&
            level >= 0 &&
            level <= self.levels.SILENT
          )
            return level;
          else
            throw new TypeError(
              "log.setLevel() called with invalid level: " + input,
            );
        }
        self.name = name;
        self.levels = {
          TRACE: 0,
          DEBUG: 1,
          INFO: 2,
          WARN: 3,
          ERROR: 4,
          SILENT: 5,
        };
        self.methodFactory = factory || defaultMethodFactory;
        self.getLevel = function () {
          if (userLevel != null) return userLevel;
          else if (defaultLevel != null) return defaultLevel;
          else return inheritedLevel;
        };
        self.setLevel = function (level, persist) {
          userLevel = normalizeLevel(level);
          if (persist !== false) persistLevelIfPossible(userLevel);
          return replaceLoggingMethods.call(self);
        };
        self.setDefaultLevel = function (level) {
          defaultLevel = normalizeLevel(level);
          if (!getPersistedLevel()) self.setLevel(level, false);
        };
        self.resetLevel = function () {
          userLevel = null;
          clearPersistedLevel();
          replaceLoggingMethods.call(self);
        };
        self.enableAll = function (persist) {
          self.setLevel(self.levels.TRACE, persist);
        };
        self.disableAll = function (persist) {
          self.setLevel(self.levels.SILENT, persist);
        };
        self.rebuild = function () {
          if (defaultLogger !== self)
            inheritedLevel = normalizeLevel(defaultLogger.getLevel());
          replaceLoggingMethods.call(self);
          if (defaultLogger === self)
            for (var childName in _loggersByName)
              _loggersByName[childName].rebuild();
        };
        inheritedLevel = normalizeLevel(
          defaultLogger ? defaultLogger.getLevel() : "WARN",
        );
        var initialLevel = getPersistedLevel();
        if (initialLevel != null) userLevel = normalizeLevel(initialLevel);
        replaceLoggingMethods.call(self);
      }
      defaultLogger = new Logger();
      defaultLogger.getLogger = function getLogger(name) {
        if (
          (typeof name !== "symbol" && typeof name !== "string") ||
          name === ""
        )
          throw new TypeError("You must supply a name when creating a logger.");
        var logger = _loggersByName[name];
        if (!logger)
          logger = _loggersByName[name] = new Logger(
            name,
            defaultLogger.methodFactory,
          );
        return logger;
      };
      var _log = typeof window !== undefinedType ? window.log : void 0;
      defaultLogger.noConflict = function () {
        if (typeof window !== undefinedType && window.log === defaultLogger)
          window.log = _log;
        return defaultLogger;
      };
      defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
      };
      defaultLogger["default"] = defaultLogger;
      return defaultLogger;
    });
  })(),
  1,
);
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */
var objectToString = Object.prototype.toString;
var isArray =
  Array.isArray ||
  function isArrayPolyfill(object) {
    return objectToString.call(object) === "[object Array]";
  };
function isFunction(object) {
  return typeof object === "function";
}
/**
 * More correct typeof string handling array
 * which normally returns typeof 'object'
 */
function typeStr(obj) {
  return isArray(obj) ? "array" : typeof obj;
}
function escapeRegExp(string) {
  return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
/**
 * Null safe way of checking whether or not an object,
 * including its prototype, has a given property
 */
function hasProperty(obj, propName) {
  return obj != null && typeof obj === "object" && propName in obj;
}
/**
 * Safe way of detecting whether or not the given thing is a primitive and
 * whether it has the given property
 */
function primitiveHasOwnProperty(primitive, propName) {
  return (
    primitive != null &&
    typeof primitive !== "object" &&
    primitive.hasOwnProperty &&
    primitive.hasOwnProperty(propName)
  );
}
var regExpTest = RegExp.prototype.test;
function testRegExp(re, string) {
  return regExpTest.call(re, string);
}
var nonSpaceRe = /\S/;
function isWhitespace(string) {
  return !testRegExp(nonSpaceRe, string);
}
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};
function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
}
var whiteRe = /\s*/;
var spaceRe = /\s+/;
var equalsRe = /\s*=/;
var curlyRe = /\s*\}/;
var tagRe = /#|\^|\/|>|\{|&|=|!/;
/**
 * Breaks up the given `template` string into a tree of tokens. If the `tags`
 * argument is given here it must be an array with two string values: the
 * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
 * course, the default is to use mustaches (i.e. mustache.tags).
 *
 * A token is an array with at least 4 elements. The first element is the
 * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
 * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
 * all text that appears outside a symbol this element is "text".
 *
 * The second element of a token is its "value". For mustache tags this is
 * whatever else was inside the tag besides the opening symbol. For text tokens
 * this is the text itself.
 *
 * The third and fourth elements of the token are the start and end indices,
 * respectively, of the token in the original template.
 *
 * Tokens that are the root node of a subtree contain two more elements: 1) an
 * array of tokens in the subtree and 2) the index in the original template at
 * which the closing tag for that section begins.
 *
 * Tokens for partials also contain two more elements: 1) a string value of
 * indendation prior to that tag and 2) the index of that tag on that line -
 * eg a value of 2 indicates the partial is the third tag on this line.
 */
function parseTemplate(template, tags) {
  if (!template) return [];
  var lineHasNonSpace = false;
  var sections = [];
  var tokens = [];
  var spaces = [];
  var hasTag = false;
  var nonSpace = false;
  var indentation = "";
  var tagIndex = 0;
  function stripSpace() {
    if (hasTag && !nonSpace) while (spaces.length) delete tokens[spaces.pop()];
    else spaces = [];
    hasTag = false;
    nonSpace = false;
  }
  var openingTagRe, closingTagRe, closingCurlyRe;
  function compileTags(tagsToCompile) {
    if (typeof tagsToCompile === "string")
      tagsToCompile = tagsToCompile.split(spaceRe, 2);
    if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
      throw new Error("Invalid tags: " + tagsToCompile);
    openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
    closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
    closingCurlyRe = new RegExp("\\s*" + escapeRegExp("}" + tagsToCompile[1]));
  }
  compileTags(tags || mustache.tags);
  var scanner = new Scanner(template);
  var start, type, value, chr, token, openSection;
  while (!scanner.eos()) {
    start = scanner.pos;
    value = scanner.scanUntil(openingTagRe);
    if (value)
      for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
        chr = value.charAt(i);
        if (isWhitespace(chr)) {
          spaces.push(tokens.length);
          indentation += chr;
        } else {
          nonSpace = true;
          lineHasNonSpace = true;
          indentation += " ";
        }
        tokens.push(["text", chr, start, start + 1]);
        start += 1;
        if (chr === "\n") {
          stripSpace();
          indentation = "";
          tagIndex = 0;
          lineHasNonSpace = false;
        }
      }
    if (!scanner.scan(openingTagRe)) break;
    hasTag = true;
    type = scanner.scan(tagRe) || "name";
    scanner.scan(whiteRe);
    if (type === "=") {
      value = scanner.scanUntil(equalsRe);
      scanner.scan(equalsRe);
      scanner.scanUntil(closingTagRe);
    } else if (type === "{") {
      value = scanner.scanUntil(closingCurlyRe);
      scanner.scan(curlyRe);
      scanner.scanUntil(closingTagRe);
      type = "&";
    } else value = scanner.scanUntil(closingTagRe);
    if (!scanner.scan(closingTagRe))
      throw new Error("Unclosed tag at " + scanner.pos);
    if (type == ">")
      token = [
        type,
        value,
        start,
        scanner.pos,
        indentation,
        tagIndex,
        lineHasNonSpace,
      ];
    else token = [type, value, start, scanner.pos];
    tagIndex++;
    tokens.push(token);
    if (type === "#" || type === "^") sections.push(token);
    else if (type === "/") {
      openSection = sections.pop();
      if (!openSection)
        throw new Error('Unopened section "' + value + '" at ' + start);
      if (openSection[1] !== value)
        throw new Error(
          'Unclosed section "' + openSection[1] + '" at ' + start,
        );
    } else if (type === "name" || type === "{" || type === "&") nonSpace = true;
    else if (type === "=") compileTags(value);
  }
  stripSpace();
  openSection = sections.pop();
  if (openSection)
    throw new Error(
      'Unclosed section "' + openSection[1] + '" at ' + scanner.pos,
    );
  return nestTokens(squashTokens(tokens));
}
/**
 * Combines the values of consecutive text tokens in the given `tokens` array
 * to a single token.
 */
function squashTokens(tokens) {
  var squashedTokens = [];
  var token, lastToken;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    if (token) {
      if (token[0] === "text" && lastToken && lastToken[0] === "text") {
        lastToken[1] += token[1];
        lastToken[3] = token[3];
      } else {
        squashedTokens.push(token);
        lastToken = token;
      }
    }
  }
  return squashedTokens;
}
/**
 * Forms the given array of `tokens` into a nested tree structure where
 * tokens that represent a section have two additional items: 1) an array of
 * all tokens that appear in that section and 2) the index in the original
 * template that represents the end of that section.
 */
function nestTokens(tokens) {
  var nestedTokens = [];
  var collector = nestedTokens;
  var sections = [];
  var token, section;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    switch (token[0]) {
      case "#":
      case "^":
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case "/":
        section = sections.pop();
        section[5] = token[2];
        collector =
          sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
    }
  }
  return nestedTokens;
}
/**
 * A simple string scanner that is used by the template parser to find
 * tokens in template strings.
 */
function Scanner(string) {
  this.string = string;
  this.tail = string;
  this.pos = 0;
}
/**
 * Returns `true` if the tail is empty (end of string).
 */
Scanner.prototype.eos = function eos() {
  return this.tail === "";
};
/**
 * Tries to match the given regular expression at the current position.
 * Returns the matched text if it can match, the empty string otherwise.
 */
Scanner.prototype.scan = function scan(re) {
  var match = this.tail.match(re);
  if (!match || match.index !== 0) return "";
  var string = match[0];
  this.tail = this.tail.substring(string.length);
  this.pos += string.length;
  return string;
};
/**
 * Skips all text until the given regular expression can be matched. Returns
 * the skipped string, which is the entire tail if no match can be made.
 */
Scanner.prototype.scanUntil = function scanUntil(re) {
  var index = this.tail.search(re),
    match;
  switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
  }
  this.pos += match.length;
  return match;
};
/**
 * Represents a rendering context by wrapping a view object and
 * maintaining a reference to the parent context.
 */
function Context(view, parentContext) {
  this.view = view;
  this.cache = { ".": this.view };
  this.parent = parentContext;
}
/**
 * Creates a new context using the given view with this context
 * as the parent.
 */
Context.prototype.push = function push(view) {
  return new Context(view, this);
};
/**
 * Returns the value of the given name in this context, traversing
 * up the context hierarchy if the value is absent in this context's view.
 */
Context.prototype.lookup = function lookup(name) {
  var cache = this.cache;
  var value;
  if (cache.hasOwnProperty(name)) value = cache[name];
  else {
    var context = this,
      intermediateValue,
      names,
      index,
      lookupHit = false;
    while (context) {
      if (name.indexOf(".") > 0) {
        intermediateValue = context.view;
        names = name.split(".");
        index = 0;
        /**
         * Using the dot notion path in `name`, we descend through the
         * nested objects.
         *
         * To be certain that the lookup has been successful, we have to
         * check if the last object in the path actually has the property
         * we are looking for. We store the result in `lookupHit`.
         *
         * This is specially necessary for when the value has been set to
         * `undefined` and we want to avoid looking up parent contexts.
         *
         * In the case where dot notation is used, we consider the lookup
         * to be successful even if the last "object" in the path is
         * not actually an object but a primitive (e.g., a string, or an
         * integer), because it is sometimes useful to access a property
         * of an autoboxed primitive, such as the length of a string.
         **/
        while (intermediateValue != null && index < names.length) {
          if (index === names.length - 1)
            lookupHit =
              hasProperty(intermediateValue, names[index]) ||
              primitiveHasOwnProperty(intermediateValue, names[index]);
          intermediateValue = intermediateValue[names[index++]];
        }
      } else {
        intermediateValue = context.view[name];
        /**
         * Only checking against `hasProperty`, which always returns `false` if
         * `context.view` is not an object. Deliberately omitting the check
         * against `primitiveHasOwnProperty` if dot notation is not used.
         *
         * Consider this example:
         * ```
         * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
         * ```
         *
         * If we were to check also against `primitiveHasOwnProperty`, as we do
         * in the dot notation case, then render call would return:
         *
         * "The length of a football field is 9."
         *
         * rather than the expected:
         *
         * "The length of a football field is 100 yards."
         **/
        lookupHit = hasProperty(context.view, name);
      }
      if (lookupHit) {
        value = intermediateValue;
        break;
      }
      context = context.parent;
    }
    cache[name] = value;
  }
  if (isFunction(value)) value = value.call(this.view);
  return value;
};
/**
 * A Writer knows how to take a stream of tokens and render them to a
 * string, given a context. It also maintains a cache of templates to
 * avoid the need to parse the same template twice.
 */
function Writer() {
  this.templateCache = {
    _cache: {},
    set: function set(key, value) {
      this._cache[key] = value;
    },
    get: function get(key) {
      return this._cache[key];
    },
    clear: function clear() {
      this._cache = {};
    },
  };
}
/**
 * Clears all cached templates in this writer.
 */
Writer.prototype.clearCache = function clearCache() {
  if (typeof this.templateCache !== "undefined") this.templateCache.clear();
};
/**
 * Parses and caches the given `template` according to the given `tags` or
 * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
 * that is generated from the parse.
 */
Writer.prototype.parse = function parse(template, tags) {
  var cache = this.templateCache;
  var cacheKey = template + ":" + (tags || mustache.tags).join(":");
  var isCacheEnabled = typeof cache !== "undefined";
  var tokens = isCacheEnabled ? cache.get(cacheKey) : void 0;
  if (tokens == void 0) {
    tokens = parseTemplate(template, tags);
    isCacheEnabled && cache.set(cacheKey, tokens);
  }
  return tokens;
};
/**
 * High-level method that is used to render the given `template` with
 * the given `view`.
 *
 * The optional `partials` argument may be an object that contains the
 * names and templates of partials that are used in the template. It may
 * also be a function that is used to load partial templates on the fly
 * that takes a single argument: the name of the partial.
 *
 * If the optional `config` argument is given here, then it should be an
 * object with a `tags` attribute or an `escape` attribute or both.
 * If an array is passed, then it will be interpreted the same way as
 * a `tags` attribute on a `config` object.
 *
 * The `tags` attribute of a `config` object must be an array with two
 * string values: the opening and closing tags used in the template (e.g.
 * [ "<%", "%>" ]). The default is to mustache.tags.
 *
 * The `escape` attribute of a `config` object must be a function which
 * accepts a string as input and outputs a safely escaped string.
 * If an `escape` function is not provided, then an HTML-safe string
 * escaping function is used as the default.
 */
Writer.prototype.render = function render(template, view, partials, config) {
  var tags = this.getConfigTags(config);
  var tokens = this.parse(template, tags);
  var context = view instanceof Context ? view : new Context(view, void 0);
  return this.renderTokens(tokens, context, partials, template, config);
};
/**
 * Low-level method that renders the given array of `tokens` using
 * the given `context` and `partials`.
 *
 * Note: The `originalTemplate` is only ever used to extract the portion
 * of the original template that was contained in a higher-order section.
 * If the template doesn't use higher-order sections, this argument may
 * be omitted.
 */
Writer.prototype.renderTokens = function renderTokens(
  tokens,
  context,
  partials,
  originalTemplate,
  config,
) {
  var buffer = "";
  var token, symbol, value;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    value = void 0;
    token = tokens[i];
    symbol = token[0];
    if (symbol === "#")
      value = this.renderSection(
        token,
        context,
        partials,
        originalTemplate,
        config,
      );
    else if (symbol === "^")
      value = this.renderInverted(
        token,
        context,
        partials,
        originalTemplate,
        config,
      );
    else if (symbol === ">")
      value = this.renderPartial(token, context, partials, config);
    else if (symbol === "&") value = this.unescapedValue(token, context);
    else if (symbol === "name")
      value = this.escapedValue(token, context, config);
    else if (symbol === "text") value = this.rawValue(token);
    if (value !== void 0) buffer += value;
  }
  return buffer;
};
Writer.prototype.renderSection = function renderSection(
  token,
  context,
  partials,
  originalTemplate,
  config,
) {
  var self = this;
  var buffer = "";
  var value = context.lookup(token[1]);
  function subRender(template) {
    return self.render(template, context, partials, config);
  }
  if (!value) return;
  if (isArray(value))
    for (var j = 0, valueLength = value.length; j < valueLength; ++j)
      buffer += this.renderTokens(
        token[4],
        context.push(value[j]),
        partials,
        originalTemplate,
        config,
      );
  else if (
    typeof value === "object" ||
    typeof value === "string" ||
    typeof value === "number"
  )
    buffer += this.renderTokens(
      token[4],
      context.push(value),
      partials,
      originalTemplate,
      config,
    );
  else if (isFunction(value)) {
    if (typeof originalTemplate !== "string")
      throw new Error(
        "Cannot use higher-order sections without the original template",
      );
    value = value.call(
      context.view,
      originalTemplate.slice(token[3], token[5]),
      subRender,
    );
    if (value != null) buffer += value;
  } else
    buffer += this.renderTokens(
      token[4],
      context,
      partials,
      originalTemplate,
      config,
    );
  return buffer;
};
Writer.prototype.renderInverted = function renderInverted(
  token,
  context,
  partials,
  originalTemplate,
  config,
) {
  var value = context.lookup(token[1]);
  if (!value || (isArray(value) && value.length === 0))
    return this.renderTokens(
      token[4],
      context,
      partials,
      originalTemplate,
      config,
    );
};
Writer.prototype.indentPartial = function indentPartial(
  partial,
  indentation,
  lineHasNonSpace,
) {
  var filteredIndentation = indentation.replace(/[^ \t]/g, "");
  var partialByNl = partial.split("\n");
  for (var i = 0; i < partialByNl.length; i++)
    if (partialByNl[i].length && (i > 0 || !lineHasNonSpace))
      partialByNl[i] = filteredIndentation + partialByNl[i];
  return partialByNl.join("\n");
};
Writer.prototype.renderPartial = function renderPartial(
  token,
  context,
  partials,
  config,
) {
  if (!partials) return;
  var tags = this.getConfigTags(config);
  var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
  if (value != null) {
    var lineHasNonSpace = token[6];
    var tagIndex = token[5];
    var indentation = token[4];
    var indentedValue = value;
    if (tagIndex == 0 && indentation)
      indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
    var tokens = this.parse(indentedValue, tags);
    return this.renderTokens(tokens, context, partials, indentedValue, config);
  }
};
Writer.prototype.unescapedValue = function unescapedValue(token, context) {
  var value = context.lookup(token[1]);
  if (value != null) return value;
};
Writer.prototype.escapedValue = function escapedValue(token, context, config) {
  var escape = this.getConfigEscape(config) || mustache.escape;
  var value = context.lookup(token[1]);
  if (value != null)
    return typeof value === "number" && escape === mustache.escape
      ? String(value)
      : escape(value);
};
Writer.prototype.rawValue = function rawValue(token) {
  return token[1];
};
Writer.prototype.getConfigTags = function getConfigTags(config) {
  if (isArray(config)) return config;
  else if (config && typeof config === "object") return config.tags;
  else return;
};
Writer.prototype.getConfigEscape = function getConfigEscape(config) {
  if (config && typeof config === "object" && !isArray(config))
    return config.escape;
  else return;
};
var mustache = {
  name: "mustache.js",
  version: "4.2.0",
  tags: ["{{", "}}"],
  clearCache: void 0,
  escape: void 0,
  parse: void 0,
  render: void 0,
  Scanner: void 0,
  Context: void 0,
  Writer: void 0,
  /**
   * Allows a user to override the default caching strategy, by providing an
   * object with set, get and clear methods. This can also be used to disable
   * the cache by setting it to the literal `undefined`.
   */
  set templateCache(cache) {
    defaultWriter.templateCache = cache;
  },
  /**
   * Gets the default or overridden caching object from the default writer.
   */
  get templateCache() {
    return defaultWriter.templateCache;
  },
};
var defaultWriter = new Writer();
/**
 * Clears all cached templates in the default writer.
 */
mustache.clearCache = function clearCache() {
  return defaultWriter.clearCache();
};
/**
 * Parses and caches the given template in the default writer and returns the
 * array of tokens it contains. Doing this ahead of time avoids the need to
 * parse templates on the fly as they are rendered.
 */
mustache.parse = function parse(template, tags) {
  return defaultWriter.parse(template, tags);
};
/**
 * Renders the `template` with the given `view`, `partials`, and `config`
 * using the default writer.
 */
mustache.render = function render(template, view, partials, config) {
  if (typeof template !== "string")
    throw new TypeError(
      'Invalid template! Template should be a "string" but "' +
        typeStr(template) +
        '" was given as the first argument for mustache#render(template, view, partials)',
    );
  return defaultWriter.render(template, view, partials, config);
};
mustache.escape = escapeHtml;
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;
//#endregion
//#region ../stac/src/helpers/url.js
/**
 * Resolves a URL href relative to a base URL if not already absolute.
 *
 * @param {string} href
 * @param {string} [baseUrl]
 * @returns {string}
 */
var toAbsolute = (href, baseUrl) =>
  baseUrl ? new URL(href, baseUrl).toString() : href;
/**
 * Serializes an object into a query string compatible with TiTiler.
 * Arrays repeat the key per element, nested elements comma-join, and objects are JSON-encoded.
 *
 * @param {Record<string,any>} obj
 * @returns {string}
 */
function encodeURLObject(obj) {
  let str = "";
  for (const key in obj) {
    const value = obj[key];
    if (value === null || value === void 0 || value === "") continue;
    switch (Array.isArray(value) ? "array" : typeof value) {
      case "array":
        for (const val of value)
          if (Array.isArray(val)) str += `${key}=${val.join(",")}&`;
          else str += `${key}=${encodeURIComponent(val)}&`;
        break;
      case "object":
        str += `${key}=${encodeURIComponent(JSON.stringify(value))}&`;
        break;
      default:
        str += `${key}=${encodeURIComponent(value)}&`;
    }
  }
  return str;
}
/**
 * Extracts absolute collection URLs from a STAC indicator or catalog.
 *
 * @param {import("../types").STACCatalog | import("../types").STACCollection | import("../types").STACItem | null} stacObject
 * @param {string} basepath
 * @returns {string[]}
 */
function extractCollectionUrls(stacObject, basepath) {
  /** @type {string[]} */
  const collectionUrls = [];
  const children = stacObject?.links?.filter(
    (link) => link.rel === "child" && link.type?.includes("json"),
  );
  if (!children?.length) {
    collectionUrls.push(basepath);
    return collectionUrls;
  }
  children.forEach((link) => {
    if (link.href.startsWith("http")) {
      collectionUrls.push(link.href);
      return;
    }
    collectionUrls.push(toAbsolute(link.href, basepath));
  });
  return collectionUrls;
}
/**
 * Injects jsonform values into a tile URL's search parameters.
 * Nested objects spread into sub-keys, and arrays become repeated parameters.
 *
 * @param {string} url
 * @param {Record<string, any>} values
 * @returns {string}
 */
function applyValuesToUrl(url, values) {
  const [base, query] = url.split("?");
  const searchParams = new URLSearchParams(query || "");
  for (const [key, value] of Object.entries(values)) {
    if (value === void 0 || value === null || value === "") continue;
    if (Array.isArray(value)) {
      searchParams.delete(key);
      value.forEach((v) => searchParams.append(key, String(v)));
    } else if (typeof value === "object") {
      for (const [k, v] of Object.entries(value))
        if (v !== void 0 && v !== null && v !== "")
          searchParams.set(k, String(v));
    } else searchParams.set(key, String(value));
  }
  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}
//#endregion
//#region ../stac/src/helpers/layer-config.js
/**
 * Stored layer configuration form values keyed by editor type.
 *
 * @typedef {Partial<Record<"style" | "tileUrl", Record<string, any>>>} FormValues
 */
/**
 * Creates layer configuration helpers bound to a collection's persistent form state.
 */
var createLayerConfigHelpers = () => {
  /** @type {FormValues} */
  const values = {};
  return {
    extractLayerConfig: extractLayerConfig.bind(null, values),
    applyRasterFormValue: applyRasterFormValue.bind(null, values),
    persistLayerConfig: persistLayerConfig.bind(null, values),
  };
};
/**
 * Extracts layerConfig from a style JSON and restores persisted form values.
 *
 * @param {FormValues} state
 * @param {import("../types").EodashStyleJson} [style]
 * @param {Record<string, any>} [rasterJsonform]
 * @param {"style" | "tileUrl"} [layerConfigType]
 * @returns {{ layerConfig: import("../types").EodashLayerConfig | undefined, style: import("../types").EodashStyleJson | undefined }}
 */
function extractLayerConfig(state, style, rasterJsonform, layerConfigType) {
  if (!style && !rasterJsonform)
    return {
      layerConfig: void 0,
      style: void 0,
    };
  if (style) style = { ...style };
  if (style?.variables)
    style.variables = applyStyleVariables(state, style.variables);
  if (rasterJsonform)
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
  /** @type {import("../types").EodashLayerConfig | undefined} */
  let layerConfig = void 0;
  if (style?.jsonform) {
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
  import_loglevel.default.debug(
    "extracted layerConfig",
    JSON.parse(
      JSON.stringify({
        layerConfig,
        style,
      }),
    ),
  );
  return {
    layerConfig,
    style,
  };
}
/**
 * Deep-clones schema and sets leaf property defaults from persisted values.
 *
 * @param {Record<string, any>} schema
 * @param {Record<string, any>} values - Flat map of property name to persisted value
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
    if (typeof node.$ref === "string" && !seenRefs.has(node.$ref))
      walk(
        resolveLocalRef(node.$ref, cloned),
        /* @__PURE__ */ new Set([...seenRefs, node.$ref]),
      );
    if (node.properties)
      for (const [key, propSchema] of Object.entries(node.properties))
        if (key in values && propSchema?.type !== "object")
          /** @type {any} */ propSchema.default = JSON.parse(
            JSON.stringify(values[key]),
          );
        else walk(propSchema, seenRefs);
    for (const combinator of ["oneOf", "allOf", "anyOf"])
      if (Array.isArray(node[combinator]))
        node[combinator].forEach((branch) => walk(branch, seenRefs));
  };
  walk(cloned, /* @__PURE__ */ new Set());
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
  if (!ref.startsWith("#/")) return void 0;
  return ref
    .slice(2)
    .split("/")
    .reduce(
      (node, part) => node?.[part.replace(/~1/g, "/").replace(/~0/g, "~")],
      rootSchema,
    );
}
/**
 * Flattens a nested form value object into a single map keyed by property name.
 *
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
function flattenFormValues(obj) {
  /** @type {Record<string, any>} */
  const result = {};
  for (const key in obj)
    if (
      obj[key] !== null &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key])
    )
      Object.assign(result, flattenFormValues(obj[key]));
    else result[key] = obj[key];
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
 * Persists the current layer configuration form values into state.
 *
 * @param {FormValues} state
 * @param {import("../types").EodashLayerConfig} layerConfig - Layer configuration metadata
 * @param {Record<string, any>} value - Current form value
 */
function persistLayerConfig(state, layerConfig, value) {
  const type = layerConfig?.type;
  if (type !== "style" && type !== "tileUrl") return;
  if (layerConfig.schema?.options?.persist_state === false) return;
  state[type] = value;
}
/**
 * Restores persisted form values onto a rebuilt schema by seeding leaf defaults.
 *
 * @param {Record<string, any>} schema
 * @param {FormValues} state
 * @param {"style" | "tileUrl"} type
 * @returns {Record<string, any>} Seeded schema
 */
function restorePersistedSchema(schema, state, type) {
  if (schema?.options?.persist_state === false) return schema;
  const cached = getCachedConfig(state, type);
  if (!cached || !Object.keys(cached).length) return schema;
  return seedSchemaDefaults(schema, flattenFormValues(cached));
}
/**
 * Applies persisted style variables onto a style configuration.
 *
 * @param {FormValues} state
 * @param {Record<string, any>} [variables]
 * @returns {Record<string, any> | undefined}
 */
function applyStyleVariables(state, variables) {
  const cached = getCachedConfig(state, "style");
  if (!cached || !variables) return variables;
  const values = flattenFormValues(cached);
  const merged = { ...variables };
  for (const key of Object.keys(merged))
    if (key in values) merged[key] = values[key];
  return merged;
}
/**
 * Applies persisted tileUrl values to a layer's source params or URL.
 *
 * @param {FormValues} state
 * @param {Record<string, any>} layer - Built layer object
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
  if (typeof source.url === "string")
    source.url = applyValuesToUrl(source.url, value);
  else if (Array.isArray(source.urls))
    source.urls = source.urls.map((u) => applyValuesToUrl(u, value));
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
async function fetchRasterForm(rasterform, http, item) {
  /** @type {import("../types").RasterForm | undefined} */
  let form = void 0;
  if (typeof rasterform === "object" && rasterform) form = rasterform;
  else if (typeof rasterform === "string" && rasterform)
    form = await http.get(rasterform);
  if (!form || !item) return form;
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
function renderConfigTemplate(json, view) {
  if (!json || typeof json !== "object") return json;
  const str = JSON.stringify(json);
  if (!str.includes("${")) return json;
  try {
    return JSON.parse(
      mustache.render(
        str,
        view,
        {},
        {
          tags: ["${", "}"],
          escape: (v) => v,
        },
      ),
    );
  } catch (e) {
    import_loglevel.default.warn(
      "[eodash] failed to render config template:",
      e,
    );
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
function getBandsProperty(schema, format = "bands") {
  if (!schema || typeof schema !== "object") return void 0;
  if (schema.format === format) return [];
  if (schema.properties)
    for (const key of Object.keys(schema.properties)) {
      const sub = getBandsProperty(schema.properties[key], format);
      if (sub) return ["properties", key, ...sub];
    }
  for (const combinator of ["oneOf", "allOf", "anyOf"]) {
    if (!Array.isArray(schema[combinator])) continue;
    for (let i = 0; i < schema[combinator].length; i++) {
      const sub = getBandsProperty(schema[combinator][i], format);
      if (sub) return [combinator, i, ...sub];
    }
  }
}
//#endregion
//#region ../stac/src/helpers/style.js
/**
 * Extracts a single non-link style JSON from a STAC Item optionally for a selected key mapping
 * @param { import("../types").STACItem | import("../types").STACCollection | null | undefined} stacObject
 * @param {import("../http.js").HttpClient} http
 * @param {string | undefined} linkKey
 * @param {string | undefined} assetKey
 * @returns
 **/
var fetchStyle = async (
  stacObject,
  http,
  linkKey = void 0,
  assetKey = void 0,
) => {
  if (!stacObject) return void 0;
  let styleLink = null;
  if (linkKey)
    styleLink = stacObject.links.find(
      (link) =>
        link.rel.includes("style") &&
        link["links:keys"] &&
        link["links:keys"].includes(linkKey),
    );
  else if (assetKey)
    styleLink = stacObject.links.find(
      (link) =>
        link.rel.includes("style") &&
        link["asset:keys"] &&
        link["asset:keys"].includes(assetKey),
    );
  else {
    import_loglevel.default.debug(
      "Neither link key, nor asset key input, can not match any style to layer.",
      stacObject.id,
    );
    return {};
  }
  if (styleLink) {
    /** @type {import("../types").EodashStyleJson} */
    const styleJson = await http.get(styleLink.href);
    import_loglevel.default.debug(
      "fetched styles JSON",
      JSON.parse(JSON.stringify(styleJson)),
    );
    return { ...styleJson };
  }
};
/**
 * Resolves a style by preferring the item's own `style` link and falling back
 * to the collection's. Takes the same key arguments as `fetchStyle`. `${...}`
 * placeholders are rendered against `item` (see {@link renderConfigTemplate}).
 *
 * @param {import("../types").STACItem | import("../types").STACCollection} item
 * @param {import("../types").STACCollection | null | undefined} collection
 * @param {import("../http.js").HttpClient} http
 * @param {string} [linkKey]
 * @param {string} [assetKey]
 * @returns {Promise<import("../types").EodashStyleJson | undefined>}
 */
var resolveStyle = async (item, collection, http, linkKey, assetKey) => {
  const style =
    (await fetchStyle(item, http, linkKey, assetKey)) ??
    (await fetchStyle(collection, http, linkKey, assetKey));
  if (!style || !item) return style;
  return renderConfigTemplate(style, item);
};
/**
 * @param {import("../types").STACCollection | undefined | null} collection
 * @returns {object}
 */
function extractLayerLegend(collection) {
  let extraProperties = {};
  if (collection?.assets?.legend?.href)
    extraProperties = {
      description: `<div style="width: 100%">
          <img src="${collection.assets.legend.href}" style="max-height:70px; margin-top:-15px; margin-bottom:-20px;" />
        </div>`,
    };
  if (collection && collection["eox:colorlegend"])
    extraProperties = { layerLegend: collection["eox:colorlegend"] };
  return extraProperties;
}
/**
 * @param { import("../types").STACLink } link
 * @returns {object}
 */
function extractEoxLegendLink(link) {
  let extraProperties = {};
  if (link["eox:colorlegend"])
    extraProperties = { layerLegend: link["eox:colorlegend"] };
  return extraProperties;
}
/**
 * adds tooltip to the layer if the style has tooltip property
 * @param {Record<string,any>} layer
 * @param {import("../types").EodashStyleJson} [style]
 */
var addTooltipInteraction = (layer, style) => {
  if (style?.tooltip)
    layer.interactions = [
      {
        type: "select",
        options: {
          id: `${layer.properties.id}_selectInteraction`,
          active: true,
          condition: "pointermove",
          style: {
            "stroke-color": "#335267",
            "stroke-width": 4,
          },
        },
      },
    ];
};
//#endregion
//#region ../stac/src/helpers/items.js
/**
 * Checks if a given object qualifies as a valid STAC Item.
 *
 * @param {*} stacObject
 * @returns {stacObject is import("../types").STACItem}
 */
function isSTACItem(stacObject) {
  return (
    stacObject &&
    typeof stacObject === "object" &&
    stacObject.collection &&
    stacObject.id &&
    stacObject.properties &&
    typeof stacObject.properties === "object"
  );
}
/**
 * Generates a GeoJSON FeatureCollection from a list of STAC Links that contain a `latlng` property.
 *
 * @param {import("../types").STACLink[]} [links]
 * @param {Record<string,any>} [extraProperties]
 * @param {string} [rel = "item"]
 */
function generateFeatures(links, extraProperties = {}, rel = "item") {
  /**
   * @type {import("../types").GeoJSONFeature[]}
   */
  const features = [];
  links?.forEach((element) => {
    if (element.rel === rel && "latlng" in element) {
      const [lat, lon] = element.latlng.split(",").map((it) => Number(it));
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        properties: {
          ...element,
          ...extraProperties,
        },
      });
    }
  });
  return {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: { name: "EPSG:4326" },
    },
    features,
  };
}
//#endregion
//#region ../stac/src/helpers/datetime.js
/**
 * Identifies the preferred datetime property available in a given set of STAC links or items.
 * Checks for `datetime`, `start_datetime`, or `end_datetime`, in that order of preference.
 *
 * @param {import("../types").STACLink[] | import("../types").STACItem[] | undefined | null} [linksOrItems]
 */
function getDatetimeProperty(linksOrItems) {
  if (!linksOrItems?.length) return;
  const first = linksOrItems[0];
  let checkProperties = false;
  if (isSTACItem(first)) checkProperties = true;
  const datetimeProperties = ["datetime", "start_datetime", "end_datetime"];
  if (checkProperties)
    for (const prop of datetimeProperties) {
      if (
        !linksOrItems.some(
          (l) => isSTACItem(l) && isDatetime(l.properties?.[prop]),
        )
      )
        continue;
      return prop;
    }
  for (const prop of datetimeProperties) {
    if (!linksOrItems.some((l) => isDatetime(l[prop]))) continue;
    return prop;
  }
}
/**
 * Checks whether a value is a valid string or Date representation of a datetime.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isDatetime(value) {
  return typeof value === "string" || value instanceof Date;
}
/**
 * Finds the index of the time value closest to the target datetime.
 * Equidistant candidates resolve to the earlier one. Returns -1 if no match is found.
 *
 * @param {number[]} times - Array of epoch milliseconds, ordered oldest to newest.
 * @param {import("../types").Datetime} [datetime] - Target datetime to compare against.
 */
function findClosestIndex(times, datetime) {
  const target = datetime ? new Date(datetime).getTime() : NaN;
  if (isNaN(target) || !times.length) return -1;
  return times.reduce(
    (best, time, index) =>
      Math.abs(time - target) < Math.abs(times[best] - target) ? index : best,
    0,
  );
}
/**
 * Builds layer control parameters (`layerDatetime` and `timeControlValues`) from a list of dates.
 * Snaps the `currentStep` to the nearest available date if not exactly matched.
 *
 * @param {Date[] | undefined} dates
 * @param {string | null} [currentStep] - Target datetime; snapped to the closest available date.
 * @returns {{ layerDatetime: Record<string, any> | undefined, timeControlValues: { date: string }[] | undefined }}
 */
var extractLayerTimeValues = (dates, currentStep) => {
  if (!currentStep || !dates?.length || dates.length <= 1)
    return {
      layerDatetime: void 0,
      timeControlValues: void 0,
    };
  const controlValues = dates.map((d) => d.toISOString()).sort();
  const timeControlValues = controlValues.map((date) => ({ date }));
  currentStep = new Date(currentStep).toISOString();
  if (!controlValues.includes(currentStep)) {
    const target = new Date(currentStep).getTime();
    currentStep = controlValues.reduce((best, d) =>
      Math.abs(new Date(d).getTime() - target) <
      Math.abs(new Date(best).getTime() - target)
        ? d
        : best,
    );
  }
  return {
    layerDatetime: {
      controlValues,
      currentStep,
      slider: true,
      navigation: true,
      play: false,
      displayFormat: "DD.MM.YYYY HH:mm",
      animateOnClickInterval: false,
      showUTC: true,
    },
    timeControlValues,
  };
};
/**
 * Finds a layer by its ID, across nested groups.
 *
 * @param {import("@eox/map").EoxLayer[]} layers
 * @param {string} layer - Layer ID
 * @returns {import("@eox/map").EoxLayer | undefined}
 */
var findLayer = (layers, layer) => {
  for (const lyr of layers) {
    if (lyr.type === "Group") {
      const found = findLayer(lyr.layers, layer);
      if (!found) continue;
      return found;
    }
    if (lyr.properties?.id === layer) return lyr;
  }
};
/**
 * Finds all layers matching the collection prefix of a reference layer.
 *
 * @param {import("@eox/map").EoxLayer[]} layers
 * @param {import("@eox/map").EoxLayer | undefined} referenceLayer - Reference layer containing the prefix
 * @returns {import("@eox/map").EoxLayer[]} Matching layer objects
 */
var findLayersByLayerPrefix = (layers, referenceLayer) => {
  if (!layers || !referenceLayer) return [];
  const refId = referenceLayer?.properties?.id;
  if (typeof refId !== "string" || !refId.includes(";:;"))
    throw new Error(`Reference layer ID must contain a ';:;' separator.`);
  const prefix = refId.split(";:;")[0];
  const matches = [];
  for (const layer of layers)
    if (layer.type === "Group" && Array.isArray(layer.layers))
      matches.push(...findLayersByLayerPrefix(layer.layers, referenceLayer));
    else {
      const id = layer?.properties?.id;
      if (typeof id === "string" && id.split(";:;")[0] === prefix)
        matches.push(layer);
    }
  return matches;
};
/**
 * Replaces target layers immutably, preserving unchanged array references.
 *
 * @param {import("@eox/map").EoxLayer[]} layers - The layers to replace within
 * @param {string | string[]} toRemove - ID(s) of layers to remove
 * @param {import("@eox/map").EoxLayer[]} toInsert - New layers to insert
 * @returns {import("@eox/map").EoxLayer[]}
 */
var replaceLayer = (layers, toRemove, toInsert) => {
  const removeIds = new Set(Array.isArray(toRemove) ? toRemove : [toRemove]);
  let inserted = false;
  const result = [];
  for (const layer of layers) {
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      const newGroupLayers = replaceLayer(layer.layers, toRemove, toInsert);
      result.push(
        newGroupLayers !== layer.layers
          ? {
              ...layer,
              layers: newGroupLayers,
            }
          : layer,
      );
      continue;
    }
    const id = layer?.properties?.id;
    if (id && removeIds.has(id)) {
      if (!inserted) {
        result.push(...toInsert);
        inserted = true;
      }
      continue;
    }
    result.push(layer);
  }
  return result.length === layers.length &&
    result.every((l, i) => l === layers[i])
    ? layers
    : result;
};
/**
 * Generates a unique layer ID from STAC link metadata and projection.
 *
 * @param {string} collectionId
 * @param {string} itemId
 * @param {import("../types").STACLink} link
 * @param {string | import("ol/proj").ProjectionLike} projectionCode
 * @returns {string}
 */
var createLayerID = (collectionId, itemId, link, projectionCode) => {
  const linkId = link.id || link.title || link.href;
  let lId = [
    collectionId ?? "",
    itemId ?? "",
    linkId ?? "",
    projectionCode ?? "",
  ].join(";:;");
  if (isBaseLayerOrOverlay(link))
    lId = [linkId ?? "", projectionCode ?? ""].join(";:;");
  import_loglevel.default.debug("Generated Layer ID", lId);
  return lId;
};
/**
 * Generates a unique layer ID for a STAC asset by index.
 *
 * @param {string} collectionId
 * @param {string} itemId
 * @param {number} index
 * @returns {string}
 */
var createAssetID = (collectionId, itemId, index) => {
  let lId = [collectionId ?? "", itemId ?? "", index ?? ""].join(";:;");
  import_loglevel.default.debug("Generated Asset ID", lId);
  return lId;
};
/**
 * Applies link visibility roles to layer properties based on link role definitions in the collection.
 *
 * @param {import("../types").STACCollection | null | undefined} collection - STAC collection
 * @param {import("@eox/map").EoxLayer[]} [layers] - Layers to apply roles to
 */
var applyVisibilityRoles = (collection, layers = []) => {
  const visibilityLinks = (collection?.links ?? []).filter(
    (link) =>
      Array.isArray(link.roles) &&
      (link.roles.includes("disable") || link.roles.includes("hidden")),
  );
  for (const link of visibilityLinks) {
    const targets = layers.filter(
      (layer) =>
        typeof layer.properties?.id === "string" &&
        layer.properties.id.split(";:;")[0] === link.id,
    );
    for (const target of targets) {
      if (!target?.properties) continue;
      if (link.roles.includes("disable")) {
        target.properties.visible = false;
        target.properties.layerControlExpand = false;
      } else target.properties.layerControlHide = true;
    }
  }
};
/**
 * Default fallback base layer (OpenStreetMap) when no baselayer links are provided by STAC.
 * @type {import("@eox/map").EoxLayer[]}
 */
var DEFAULT_BASE_LAYERS = [
  {
    type: "Tile",
    properties: {
      id: "osm",
      title: "OpenStreetMap",
      group: "baselayer",
      visible: true,
      layerControlExclusive: true,
    },
    source: { type: "OSM" },
  },
];
/**
 * Normalizes baselayer visibility and exclusivity on a set of base layers.
 *
 * @param {import("@eox/map").EoxLayer[]} baseLayers
 * @param {import("@eox/map").EoxLayer[]} [fallbackBaseLayers]
 * @returns {import("@eox/map").EoxLayer[]}
 */
var normalizeBaseLayers = (
  baseLayers,
  fallbackBaseLayers = DEFAULT_BASE_LAYERS,
) => {
  if (baseLayers.length) {
    const layers = baseLayers.map((bl) => ({
      ...bl,
      properties: { ...(bl.properties || {}) },
    }));
    let counter = 0;
    let lastPos = 0;
    for (let indx = 0; indx < layers.length; indx++) {
      const bl = layers[indx];
      if (!("visible" in bl.properties)) bl.properties.visible = false;
      if (bl.properties.visible) {
        counter++;
        lastPos = indx;
      }
    }
    if (counter === 0) layers[0].properties.visible = true;
    if (counter > 0)
      layers.forEach((bl, indx) => {
        bl.properties.visible = indx === lastPos;
      });
    layers.forEach((bl) => {
      bl.properties.layerControlExclusive = true;
    });
    return layers;
  }
  return [...fallbackBaseLayers];
};
//#endregion
//#region ../stac/src/helpers/projection.js
/**
 * Standardizes a projection input into a string identifier.
 * Supports EPSG numbers, raw strings, or projection objects.
 *
 * @param {string|number|{name: string, def: string}} [projection]
 * @returns {string}
 */
var getProjectionCode = (projection) => {
  let code = projection;
  switch (typeof projection) {
    case "number":
      code = `EPSG:${projection}`;
      break;
    case "string":
      code = projection;
      break;
    case "object":
      code = projection?.name;
  }
  return code;
};
/**
 * Extracts the projection code from a STAC item, link, or asset.
 * Checks modern `proj:code` first, falling back to `proj:epsg` or `eodash:proj4_def`.
 *
 * @param {import("../types").STACCollection | import("../types").STACItem | import("../types").STACAsset | import("../types").STACLink | { "proj:code"?: string, "proj:epsg"?: number | null, "eodash:proj4_def"?: import("../types").Projection, "eodash:mapProjection"?: import("../types").Projection } | Record<string, any> | undefined | null} [source]
 * @returns {import("../types").Projection | undefined}
 */
var getProjection = (source) =>
  source?.["eodash:mapProjection"] ||
  source?.["proj:code"] ||
  source?.["proj:epsg"] ||
  source?.["eodash:proj4_def"] ||
  void 0;
/**
 * Resolves a TileMatrixSet definition by projection code.
 * @param {string} projectionCode - e.g. "EPSG:3857"
 * @param {Record<string, any> | null} customRegistry - registry with tileset to definition mappings
 * @returns {Record<string, any> | undefined}
 */
function resolveTmsByProjection(projectionCode, customRegistry) {
  if (!projectionCode || !customRegistry) return void 0;
  const code = projectionCode.toUpperCase();
  const tmsEntries = Object.values(customRegistry);
  for (const tms of tmsEntries) {
    const crs = tms.crs || "";
    if (
      crs.includes(code) ||
      (code.startsWith("EPSG:") &&
        (crs.endsWith(`/${code.split(":")[1]}`) ||
          crs.includes(`::${code.split(":")[1]}`)))
    )
      return tms;
  }
}
/**
 * Converts a OGC TileMatrixSet definition to OpenLayers TileGrid options.
 * @param {Record<string, any>} tms - The TileMatrixSet JSON definition
 * @param {[number, number]} [targetTileSize] - Optional target tile size for upscaling
 * @returns {Record<string, any>}
 */
function tmsToTileGridOptions(tms, targetTileSize = [512, 512]) {
  if (!tms?.tileMatrices?.length) return {};
  const firstMatrix = tms.tileMatrices[0];
  let origin = firstMatrix.pointOfOrigin;
  let resolutions = tms.tileMatrices.map((m) => m.cellSize);
  const matrixIds = tms.tileMatrices.map((m) => m.id);
  const originalTileWidth = firstMatrix.tileWidth;
  const originalTileHeight = firstMatrix.tileHeight;
  if (["N", "Lat", "Y"].includes(tms.orderedAxes?.[0]))
    origin = [origin[1], origin[0]];
  let tileSize = [originalTileWidth, originalTileHeight];
  if (targetTileSize) {
    const scale = targetTileSize[0] / originalTileWidth;
    resolutions = resolutions.map((r) => r / scale);
    tileSize = targetTileSize;
  }
  const sizeX =
    firstMatrix.matrixWidth * originalTileWidth * firstMatrix.cellSize;
  const sizeY =
    firstMatrix.matrixHeight * originalTileHeight * firstMatrix.cellSize;
  const extent = [origin[0], origin[1] - sizeY, origin[0] + sizeX, origin[1]];
  return {
    origin,
    resolutions,
    matrixIds,
    tileSize,
    extent,
  };
}
//#endregion
//#region ../stac/src/helpers/geojson.js
/**
 * @param {string[]} geojsonUrls
 * @param {import("../http.js").HttpClient} [http] -  uses fetch by default
 */
async function mergeGeojsons(geojsonUrls, http = createHTTPInstance()) {
  if (!geojsonUrls.length) return;
  if (geojsonUrls.length === 1) return geojsonUrls[0];
  const merged = {
    type: "FeatureCollection",
    /** @type {import("ol").Feature[]} */
    features: [],
  };
  await Promise.all(
    geojsonUrls.map((url) =>
      http.get(url).then((geojson) => {
        merged.features.push(...(geojson.features ?? []));
      }),
    ),
  );
  return (
    "data:application/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(merged))
  );
}
//#endregion
//#region ../stac/src/layers/assets.js
/**
 * Generates map layers from STAC asset data (GeoTIFF, GeoJSON, FlatGeoBuf, Zarr).
 *
 * @param {string} collectionId
 * @param {string} title
 * @param {Record<string,import("../types").STACAsset>} assets
 * @param {import("../types").STACItem | import("../types").STACCollection} stacObject
 * @param {Record<string, unknown>} [layerDatetime]
 * @param {object | null} [extraProperties]
 * @param {import("../types").STACCollection | null} [collection]
 * @param {object} [options]
 * @param {import("../http.js").HttpClient} [options.http]
 * @param {import("../types").LayerConfigHelpers} [options.layerConfigHelpers]
 * @returns {Promise<{ layers: import("@eox/map").EoxLayer[], projections: import("../types").Projection[] }>}
 **/
async function createLayersFromAssets(
  collectionId,
  title,
  assets,
  stacObject,
  layerDatetime,
  extraProperties,
  collection,
  options = {},
) {
  const {
    http = createHTTPInstance(),
    layerConfigHelpers = createLayerConfigHelpers(),
  } = options;
  const { extractLayerConfig } = layerConfigHelpers;
  import_loglevel.default.debug("Creating layers from assets");
  /** @type {import("@eox/map").EoxLayer[]} */
  const jsonArray = [];
  /** @type {import("../types").Projection[]} */
  const projections = [];
  const geoTIFFSources = [];
  const geoTIFFIdx = [];
  const geoJsonSources = [];
  const geoJsonIdx = [];
  const fgbIdx = [];
  const fgbSources = [];
  const zarrAssetIds = [];
  const zarrIdx = [];
  const assetIds = [];
  for (const [idx, assetId] of Object.keys(assets).entries()) {
    assetIds.push(assetId);
    if (
      assets[assetId]?.type?.includes("application/geo+json") &&
      assets[assetId]?.href?.includes("http")
    ) {
      geoJsonSources.push(assets[assetId].href);
      geoJsonIdx.push(idx);
    } else if (
      assets[assetId]?.type?.includes("application/vnd.flatgeobuf") &&
      assets[assetId]?.href?.includes("http")
    ) {
      fgbSources.push(assets[assetId].href);
      fgbIdx.push(idx);
    } else if (
      assets[assetId]?.type ==
      "application/vnd.zarr; version=3; profile=multiscales"
    ) {
      zarrAssetIds.push(assetId);
      zarrIdx.push(idx);
    } else if (
      assets[assetId]?.type?.includes("image/tiff") &&
      assets[assetId]?.href?.includes("http")
    ) {
      geoTIFFIdx.push(idx);
      geoTIFFSources.push({
        url: assets[assetId].href,
        ...(assets[assetId].attribution
          ? { attributions: assets[assetId].attribution }
          : {}),
      });
    } else if (assets[assetId]?.type?.includes("application/geodb+json")) {
      const responseData = await http.get(assets[assetId].href);
      if (
        !responseData ||
        !Array.isArray(responseData) ||
        responseData.length === 0
      ) {
        console.error(
          "[eodash] GeoDB response data is not in expected format",
          responseData,
        );
        continue;
      }
      /** @type {Record<string,any>[]} */
      const features = [];
      responseData.forEach((ftr, i) => {
        const { geometry, ...properties } = ftr;
        if (geometry.type === "MultiPoint" || geometry.type === "MultiPolygon")
          geometry.coordinates.forEach((coordPair, j) => {
            const singleGeometry = {
              type: geometry.type === "MultiPoint" ? "Point" : "Polygon",
              coordinates: coordPair,
            };
            features.push({
              type: "Feature",
              id: `${i}_${j}`,
              properties,
              geometry: singleGeometry,
            });
          });
        else
          features.push({
            type: "Feature",
            properties,
            id: `${i}`,
            geometry,
          });
      });
      const geojson = {
        type: "FeatureCollection",
        features,
      };
      geoJsonSources.push(
        "data:application/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(geojson)),
      );
      geoJsonIdx.push(idx);
    }
  }
  if (geoTIFFSources.length)
    for (const [i, geotiffSource] of geoTIFFSources.entries()) {
      const assetName = assetIds[geoTIFFIdx[i]];
      let { layerConfig, style } = extractLayerConfig(
        await resolveStyle(stacObject, collection, http, void 0, assetName),
      );
      let assetLayerId = createAssetID(
        collectionId,
        stacObject.id,
        geoTIFFIdx[i],
      );
      const isBaseOrOverlay = isBaseLayerOrOverlay(assets[assetName]);
      if (isBaseOrOverlay) assetLayerId = assetName;
      import_loglevel.default.debug(
        "Creating WebGLTile layer from GeoTIFF",
        assetLayerId,
      );
      import_loglevel.default.debug("Configured Sources", geoTIFFSources);
      const sources =
        stacObject?.["eodash:merge_assets"] !== false
          ? geoTIFFSources
          : [geotiffSource];
      const layer = {
        /** @type {"WebGLTile"} */
        type: "WebGLTile",
        source: {
          /** @type {"GeoTIFF"} */
          type: "GeoTIFF",
          normalize: !style,
          interpolate: false,
          sources,
          sourceOptions: { blockSize: 65536 },
        },
        properties: {
          id: assetLayerId,
          title: assets[assetName]?.title || title,
          ...(!isBaseOrOverlay && { layerConfig }),
          layerDatetime,
        },
        style,
      };
      if (extraProperties)
        layer.properties = {
          ...layer.properties,
          ...extraProperties,
        };
      extractRoles(layer.properties, assets[assetName]);
      addTooltipInteraction(layer, style);
      jsonArray.push(layer);
      if (stacObject?.["eodash:merge_assets"] !== false) break;
    }
  if (zarrAssetIds.length)
    for (const [i, assetName] of zarrAssetIds.entries()) {
      const { layerConfig, style } = extractLayerConfig(
        await resolveStyle(stacObject, collection, http, void 0, assetName),
      );
      const defaultBands = getBandsProperty(layerConfig?.schema)?.reduce(
        (node, key) => node?.[key],
        layerConfig?.schema,
      )?.default ?? ["b04", "b03", "b02"];
      let assetLayerId = createAssetID(collectionId, stacObject.id, zarrIdx[i]);
      const isBaseOrOverlay = isBaseLayerOrOverlay(assets[assetName]);
      if (isBaseOrOverlay) assetLayerId = assetName;
      import_loglevel.default.debug(
        "Creating WebGLTile layer from GeoZarr",
        assetLayerId,
      );
      const layer = {
        /** @type {"WebGLTile"} */
        type: "WebGLTile",
        properties: {
          id: assetLayerId,
          title: assets[assetName]?.title || title,
          ...(!isBaseOrOverlay && { layerConfig }),
          layerDatetime,
        },
        source: {
          /** @type {"GeoZarr"} */
          type: "GeoZarr",
          url: assets[assetName].href,
          bands: defaultBands,
        },
        ...(style ? { style } : {}),
      };
      if (extraProperties)
        layer.properties = {
          ...layer.properties,
          ...extraProperties,
        };
      extractRoles(layer.properties, assets[assetName]);
      jsonArray.push(layer);
    }
  if (geoJsonSources.length)
    for (const [i, geoJsonSource] of geoJsonSources.entries()) {
      const assetName = assetIds[geoJsonIdx[i]];
      let { layerConfig, style } = extractLayerConfig(
        await resolveStyle(stacObject, collection, http, void 0, assetName),
      );
      let assetLayerId = createAssetID(
        collectionId,
        stacObject.id,
        geoJsonIdx[i],
      );
      const isBaseOrOverlay = isBaseLayerOrOverlay(assets[assetName]);
      if (isBaseOrOverlay) assetLayerId = assetName;
      import_loglevel.default.debug(
        `Creating Vector layer from GeoJsons`,
        assetLayerId,
      );
      const assetProjection = getProjection(assets[assetName]);
      if (assetProjection) projections.push(assetProjection);
      const projection = getProjectionCode(assetProjection) || "EPSG:4326";
      const layer = {
        /** @type {"Vector"} */
        type: "Vector",
        source: {
          /** @type {"Vector"} */
          type: "Vector",
          url:
            stacObject?.["eodash:merge_assets"] === false
              ? geoJsonSource
              : await mergeGeojsons(geoJsonSources, http),
          format: {
            /** @type {"GeoJSON"} */
            type: "GeoJSON",
            dataProjection: projection,
          },
          ...(assets[assetName].attribution
            ? { attributions: assets[assetName].attribution }
            : {}),
        },
        properties: {
          id: assetLayerId,
          title: assets[assetName]?.title || title,
          layerDatetime,
          ...(layerConfig &&
            !isBaseOrOverlay && {
              layerConfig: {
                ...layerConfig,
                style,
              },
            }),
        },
        ...(!style?.variables && { style }),
        interactions: [],
      };
      layer.properties = {
        ...layer.properties,
        ...(extraProperties ?? {}),
      };
      extractRoles(layer.properties, assets[assetName]);
      addTooltipInteraction(layer, style);
      jsonArray.push(layer);
      if (stacObject?.["eodash:merge_assets"] !== false) break;
    }
  if (fgbSources.length)
    for (const [i, fgbSource] of fgbSources.entries()) {
      const assetName = assetIds[fgbIdx[i]];
      let { layerConfig, style } = extractLayerConfig(
        await resolveStyle(stacObject, collection, http, void 0, assetName),
      );
      let assetLayerId = createAssetID(collectionId, stacObject.id, fgbIdx[i]);
      const isBaseOrOverlay = isBaseLayerOrOverlay(assets[assetName]);
      if (isBaseOrOverlay) assetLayerId = assetName;
      import_loglevel.default.debug(
        `Creating Vector layer from FlatGeoBuf`,
        assetLayerId,
      );
      const assetProjection = getProjection(assets[assetName]);
      if (assetProjection) projections.push(assetProjection);
      const projection = getProjectionCode(assetProjection) || "EPSG:4326";
      const layer = {
        /** @type {"Vector"} */
        type: "Vector",
        source: {
          url:
            stacObject?.["eodash:merge_assets"] === false
              ? fgbSource
              : fgbSources,
          /** @type {"FlatGeoBuf"} */
          type: "FlatGeoBuf",
          projection,
          ...(assets[assetName].attribution
            ? { attributions: assets[assetName].attribution }
            : {}),
        },
        properties: {
          id: assetLayerId,
          title: assets[assetName]?.title || title,
          layerDatetime,
          ...(layerConfig &&
            !isBaseOrOverlay && {
              layerConfig: {
                ...layerConfig,
                style,
              },
            }),
        },
        ...(!style?.variables && { style }),
        interactions: [],
      };
      layer.properties = {
        ...layer.properties,
        ...(extraProperties ?? {}),
      };
      extractRoles(layer.properties, assets[assetName]);
      addTooltipInteraction(layer, style);
      jsonArray.push(layer);
      if (stacObject?.["eodash:merge_assets"] !== false) break;
    }
  return {
    layers: jsonArray,
    projections,
  };
}
//#endregion
//#region ../stac/src/helpers/themes.js
/**
 * Default theme styles for observation points with SVG marker paths.
 *
 * @type {import("../types").ObservationPointsThemes}
 */
var OBSERVATION_POINT_THEMES = {
  agriculture: {
    color: "#F2AF25",
    icon: "M7.33,18.33C6.5,17.17 6.5,15.83 6.5,14.5C8.17,15.5 9.83,16.5 10.67,17.67L11,18.23V15.95C9.5,15.05 8.08,14.13 7.33,13.08C6.5,11.92 6.5,10.58 6.5,9.25C8.17,10.25 9.83,11.25 10.67,12.42L11,13V10.7C9.5,9.8 8.08,8.88 7.33,7.83C6.5,6.67 6.5,5.33 6.5,4C8.17,5 9.83,6 10.67,7.17C10.77,7.31 10.86,7.46 10.94,7.62C10.77,7 10.66,6.42 10.65,5.82C10.64,4.31 11.3,2.76 11.96,1.21C12.65,2.69 13.34,4.18 13.35,5.69C13.36,6.32 13.25,6.96 13.07,7.59C13.15,7.45 13.23,7.31 13.33,7.17C14.17,6 15.83,5 17.5,4C17.5,5.33 17.5,6.67 16.67,7.83C15.92,8.88 14.5,9.8 13,10.7V13L13.33,12.42C14.17,11.25 15.83,10.25 17.5,9.25C17.5,10.58 17.5,11.92 16.67,13.08C15.92,14.13 14.5,15.05 13,15.95V18.23L13.33,17.67C14.17,16.5 15.83,15.5 17.5,14.5C17.5,15.83 17.5,17.17 16.67,18.33C15.92,19.38 14.5,20.3 13,21.2V23H11V21.2C9.5,20.3 8.08,19.38 7.33,18.33Z",
  },
  water: {
    color: "#73A6C7",
    icon: "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z",
  },
  oceans: {
    color: "#6DA2C5",
    icon: "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z",
  },
  land: {
    color: "#019E73",
    icon: "M14,6L10.25,11L13.1,14.8L11.5,16C9.81,13.75 7,10 7,10L1,18H23L14,6Z",
  },
  health: {
    color: "#32322C",
    icon: "M18 14H14V18H10V14H6V10H10V6H14V10H18M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2M20 20H4V4H20V20Z",
  },
  "covid-19": {
    color: "#32322C",
    icon: "M18 14H14V18H10V14H6V10H10V6H14V10H18M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2M20 20H4V4H20V20Z",
  },
  combined: {
    color: "#56B4E9",
    icon: "M9,5A7,7 0 0,0 2,12A7,7 0 0,0 9,19C10.04,19 11.06,18.76 12,18.32C12.94,18.76 13.96,19 15,19A7,7 0 0,0 22,12A7,7 0 0,0 15,5C13.96,5 12.94,5.24 12,5.68C11.06,5.24 10.04,5 9,5M9,7C9.34,7 9.67,7.03 10,7.1C8.72,8.41 8,10.17 8,12C8,13.83 8.72,15.59 10,16.89C9.67,16.96 9.34,17 9,17A5,5 0 0,1 4,12A5,5 0 0,1 9,7M15,7A5,5 0 0,1 20,12A5,5 0 0,1 15,17C14.66,17 14.33,16.97 14,16.9C15.28,15.59 16,13.83 16,12C16,10.17 15.28,8.41 14,7.11C14.33,7.04 14.66,7 15,7Z",
  },
  air: {
    color: "#475faf",
    icon: "M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,11A1,1 0 0,0 19,10C18.72,10 18.47,10.11 18.29,10.29C17.9,10.68 17.27,10.68 16.88,10.29C16.5,9.9 16.5,9.27 16.88,8.88C17.42,8.34 18.17,8 19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14H5A1,1 0 0,1 4,13A1,1 0 0,1 5,12H19M18,18H4A1,1 0 0,1 3,17A1,1 0 0,1 4,16H18A3,3 0 0,1 21,19A3,3 0 0,1 18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1 15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89 17.72,20 18,20A1,1 0 0,0 19,19A1,1 0 0,0 18,18Z",
  },
  atmosphere: {
    color: "#475faf",
    icon: "M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,11A1,1 0 0,0 19,10C18.72,10 18.47,10.11 18.29,10.29C17.9,10.68 17.27,10.68 16.88,10.29C16.5,9.9 16.5,9.27 16.88,8.88C17.42,8.34 18.17,8 19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14H5A1,1 0 0,1 4,13A1,1 0 0,1 5,12H19M18,18H4A1,1 0 0,1 3,17A1,1 0 0,1 4,16H18A3,3 0 0,1 21,19A3,3 0 0,1 18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1 15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89 17.72,20 18,20A1,1 0 0,0 19,19A1,1 0 0,0 18,18Z",
  },
  climate: {
    color: "#475faf",
    icon: "M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,11A1,1 0 0,0 19,10C18.72,10 18.47,10.11 18.29,10.29C17.9,10.68 17.27,10.68 16.88,10.29C16.5,9.9 16.5,9.27 16.88,8.88C17.42,8.34 18.17,8 19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14H5A1,1 0 0,1 4,13A1,1 0 0,1 5,12H19M18,18H4A1,1 0 0,1 3,17A1,1 0 0,1 4,16H18A3,3 0 0,1 21,19A3,3 0 0,1 18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1 15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89 17.72,20 18,20A1,1 0 0,0 19,19A1,1 0 0,0 18,18Z",
  },
  economy: {
    color: "#8E81AF",
    icon: "M15 18.5C12.5 18.5 10.32 17.08 9.24 15H15L16 13H8.58C8.53 12.67 8.5 12.34 8.5 12S8.53 11.33 8.58 11H15L16 9H9.24C10.32 6.92 12.5 5.5 15 5.5C16.61 5.5 18.09 6.09 19.23 7.07L21 5.3C19.41 3.87 17.3 3 15 3C11.08 3 7.76 5.5 6.5 9H3L2 11H6.06C6 11.33 6 11.66 6 12S6 12.67 6.06 13H3L2 15H6.5C7.76 18.5 11.08 21 15 21C17.31 21 19.41 20.13 21 18.7L19.22 16.93C18.09 17.91 16.62 18.5 15 18.5Z",
  },
  commerce: {
    color: "#8E81AF",
    icon: "M15 18.5C12.5 18.5 10.32 17.08 9.24 15H15L16 13H8.58C8.53 12.67 8.5 12.34 8.5 12S8.53 11.33 8.58 11H15L16 9H9.24C10.32 6.92 12.5 5.5 15 5.5C16.61 5.5 18.09 6.09 19.23 7.07L21 5.3C19.41 3.87 17.3 3 15 3C11.08 3 7.76 5.5 6.5 9H3L2 11H6.06C6 11.33 6 11.66 6 12S6 12.67 6.06 13H3L2 15H6.5C7.76 18.5 11.08 21 15 21C17.31 21 19.41 20.13 21 18.7L19.22 16.93C18.09 17.91 16.62 18.5 15 18.5Z",
  },
  society: {
    color: "#8ac501",
    icon: "M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z",
  },
  biomass: {
    color: "#009E73",
    icon: "M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z",
  },
  extremes: {
    color: "#a1280a",
    icon: "M11 15H6L13 1V9H18L11 23V15Z",
  },
  energy: {
    color: "#475faf",
    icon: "M11 15H6L13 1V9H18L11 23V15Z",
  },
  tourism: {
    color: "#80510aff",
    icon: "M17.47 8.67H19V23H17.47V12.6C16.67 12.44 15.92 12.14 15.21 11.71S13.9 10.78 13.39 10.2L12.77 13.27L15 15.47V23H13V17L10.76 14.8L8.89 23H6.73C6.73 23 9.86 7.22 9.89 7.09C10 6.61 10.22 6.24 10.59 6C10.96 5.73 11.33 5.6 11.71 5.6C12.1 5.6 12.46 5.69 12.79 5.87C13.13 6.04 13.39 6.29 13.58 6.61L14.64 8.24C14.93 8.78 15.32 9.25 15.81 9.63S16.86 10.3 17.47 10.5V8.67M8.55 5.89L7.4 5.65C6.83 5.5 6.31 5.62 5.84 5.94C5.38 6.26 5.1 6.7 5 7.28L4.19 11.26C4.16 11.55 4.22 11.81 4.38 12.05C4.54 12.29 4.75 12.42 5 12.46L7.21 12.89L8.55 5.89M13 1C11.9 1 11 1.9 11 3S11.9 5 13 5 15 4.11 15 3 14.11 1 13 1Z",
  },
  sport: {
    color: "#e98e65ff",
    icon: "M19.04 4.85C17.34 3.2 15.33 2.25 13 2V5.62L22 10.8C21.72 8.5 20.73 6.5 19.04 4.85M12 22C15.44 22 18.16 20.62 20.17 17.86L17.06 16L8.07 21.2C9.32 21.73 10.64 22 12 22M13 11.41L21.15 16.07C21.59 15.13 21.88 14.14 22 13.11L13 7.93V11.41M3.88 17.81C4.54 18.72 5.26 19.46 6.05 20L15.04 14.9L12 13.15L3.88 17.81M11.04 2C10 2.09 9 2.36 8 2.8V13.15L11.04 11.41V2M2 12C2 13.39 2.3 14.77 2.89 16.12L6 14.28V4C3.33 6 2 8.65 2 12Z",
  },
  cryosphere: {
    color: "#42C7B8",
    icon: "M20.79,13.95L18.46,14.57L16.46,13.44V10.56L18.46,9.43L20.79,10.05L21.31,8.12L19.54,7.65L20,5.88L18.07,5.36L17.45,7.69L15.45,8.82L13,7.38V5.12L14.71,3.41L13.29,2L12,3.29L10.71,2L9.29,3.41L11,5.12V7.38L8.5,8.82L6.5,7.69L5.92,5.36L4,5.88L4.47,7.65L2.7,8.12L3.22,10.05L5.55,9.43L7.55,10.56V13.45L5.55,14.58L3.22,13.96L2.7,15.89L4.47,16.36L4,18.12L5.93,18.64L6.55,16.31L8.55,15.18L11,16.62V18.88L9.29,20.59L10.71,22L12,20.71L13.29,22L14.7,20.59L13,18.88V16.62L15.5,15.17L17.5,16.3L18.12,18.63L20,18.12L19.53,16.35L21.3,15.88L20.79,13.95M9.5,10.56L12,9.11L14.5,10.56V13.44L12,14.89L9.5,13.44V10.56Z",
  },
  industry: {
    color: "#8d845cff",
    icon: "M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 4.7,1.7L9,6L6,9L1.6,4.7C0.4,7.1 0.9,10.1 2.9,12.1C4.8,14 7.5,14.5 9.8,13.6L18.9,22.7C19.3,23.1 19.9,23.1 20.3,22.7L22.6,20.4C23.1,20 23.1,19.3 22.7,19Z",
  },
};
//#endregion
//#region ../stac/src/helpers/auth.js
/**
 * Applies authentication logic to a link or asset URL based on the STAC authentication extension.
 * Reads schemas defined on the STAC Item to determine the authentication type (e.g., API keys).
 *
 * @param {import("../types").STACItem} item
 * @param {import("../types").AuthLink | import("../types").STACAsset} linkOrAsset
 * @param { Record<string, unknown> | undefined } optionsObject - Options object passed to handlers and modified if needed.
 * @returns {{url: string, optionsObject: Record<string, unknown> | undefined}}
 */
function handleAuthenticationOfLink(item, linkOrAsset, optionsObject) {
  for (const authRef of linkOrAsset["auth:refs"] || []) {
    const scheme = item["auth:schemes"]?.[authRef];
    if (scheme)
      switch (scheme.type) {
        case "apiKey":
          return handleApiKeyBasedAuth(scheme, linkOrAsset.href, optionsObject);
        default:
          console.error(
            `eodash does not support referenced authentication scheme ${authRef}`,
          );
      }
  }
  return {
    url: linkOrAsset.href,
    optionsObject,
  };
}
/**
 * Generic handler for possible authentications schemes as defined in STAC authentication extension.
 * @param {import("../types").ApiKeyAuthScheme} schemeDef
 * @param { string } href
 * @param { Record<string, unknown> | undefined } optionsObject
 * @returns { {url: string, optionsObject: Record<string, unknown> | undefined} }
 */
function handleApiKeyBasedAuth(schemeDef, href, optionsObject) {
  let url = href;
  switch (schemeDef.in) {
    case "query": {
      const apiKey = schemeDef.name;
      const envVar = "EODASH_" + apiKey;
      const envValue = getEnv()[envVar];
      if (envValue) {
        if (typeof optionsObject !== "undefined")
          optionsObject = {
            ...optionsObject,
            apiKey: envValue,
          };
        else url = setQueryParam(href, apiKey, envValue);
      } else
        console.error(
          `env variable ${envVar} for authentication parameter ${apiKey} not set`,
        );
      break;
    }
    default:
      console.error("eodash does not support any referenced handler");
  }
  return {
    url,
    optionsObject,
  };
}
/**
 * Inserts or replaces a query parameter in a URL string (without escaping special characters).
 *
 * @param {string} url - Input URL (may contain special characters)
 * @param {string} key - Query parameter key (e.g. "token", "authCode")
 * @param {string} value - Value to set for the key
 * @returns {string} - Updated URL string
 */
function setQueryParam(url, key, value) {
  const [base, hash] = url.split("#", 2);
  const pattern = new RegExp(`([?&])${key}=[^&#]*`, "i");
  if (pattern.test(base)) url = base.replace(pattern, `$1${key}=${value}`);
  else url = `${base}${base.includes("?") ? "&" : "?"}${key}=${value}`;
  if (hash) url += "#" + hash;
  return url;
}
/**
 * The environment as the host exposes it, from either source. Read per call, so
 * a host that polyfills `globalThis.process` after this module loads is seen.
 *
 * @returns {Record<string, string | undefined>}
 */
function getEnv() {
  const proc = globalThis.process;
  return {
    ...import.meta.env,
    ...proc?.env,
  };
}
//#endregion
//#region ../stac/src/helpers/renders.js
/**
 * Resolves the render presets for a collection.
 * Prefers client-provided configurations over the collection's native STAC `renders` extension.
 *
 * @param {import("../types").STACCollection | null | undefined} collection
 * @param {Record<string, Record<string, import("../types").Render>> | undefined} [configRenders]
 * @returns {Record<string, import("../types").Render> | undefined}
 */
function resolveRenders(collection, configRenders) {
  const config = collection?.id ? configRenders?.[collection.id] : void 0;
  if (config) return config;
  return collection?.renders ?? void 0;
}
/**
 * Normalizes TiTiler rescale arrays into `[min, max]` pairs.
 * Unnested numeric lists are chunked (e.g., `[0,0.4,0,0.1]` -> `[[0,0.4],[0,0.1]]`).
 *
 * @param {number[]|number[][]|undefined} rescale - Flat or nested rescale values.
 * @returns {number[][]|undefined} Rescale as `[min, max]` pairs.
 */
function normalizeRescale(rescale) {
  if (!rescale?.length || Array.isArray(rescale[0])) return rescale;
  const pairs = [];
  for (let i = 0; i < rescale.length; i += 2)
    pairs.push(
      /** @type {number[]} */
      rescale.slice(i, i + 2),
    );
  return pairs;
}
/**
 * Normalizes nodata values by stripping out redundant `NaN` strings or numbers.
 * `NaN` is the implicit fill for float data in TiTiler.
 *
 * @param {string|number|undefined} nodata - Nodata value from render or asset metadata.
 * @returns {string|number|undefined}
 */
function normalizeNodata(nodata) {
  if (typeof nodata === "number" && Number.isNaN(nodata)) return void 0;
  if (typeof nodata === "string" && nodata.trim().toLowerCase() === "nan")
    return void 0;
  return nodata;
}
/**
 * Adapts an XYZ tile URL to use TiTiler's upscaling mechanism.
 * Depending on the titiler version configured, it modifies either the `{y}` coordinate or appends a `tilesize` query parameter.
 *
 * @param {string} url - The XYZ tile URL template.
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2, scaleFactor?: number }>} upscalingEndpoints
 * @returns {{ url: string; tileSize: [number, number] } | null} Returns null if no endpoint matches.
 */
function applyTitilerUpscaling(url, upscalingEndpoints) {
  const match = upscalingEndpoints.find((entry) => {
    const endpointUrl = typeof entry === "string" ? entry : entry.url;
    return url.includes(endpointUrl);
  });
  if (!match) return null;
  const version = typeof match === "string" ? 1 : (match.titilerVersion ?? 1);
  let scaleFactor = typeof match === "string" ? 2 : (match.scaleFactor ?? 2);
  if (version === 2) {
    const [base, query] = url.split("?");
    const params = new URLSearchParams(query);
    const tilesize = Math.round(256 * scaleFactor).toString();
    params.set("tilesize", tilesize);
    return {
      url: `${base}?${params.toString()}`,
      tileSize: [512, 512],
    };
  }
  scaleFactor = Math.min(scaleFactor, 4);
  const exponent = Math.round(scaleFactor).toString();
  return {
    url: url.replace("{y}", `{y}@${exponent}x`),
    tileSize: [512, 512],
  };
}
//#endregion
//#region ../stac/src/layers/links.js
/**
 * Generates map layers from STAC web service links (WMS, WMTS, XYZ, VectorTile, MapboxStyle).
 *
 * @param {string} collectionId
 * @param {string} title
 * @param {import("../types").STACItem} item
 * @param {Record<string,any>} [layerDatetime]
 * @param {object | null} [extraProperties]
 * @param {import("../types").STACCollection} [collection]
 * @param {object} [options]
 * @param {string} [options.viewProjection]
 * @param {Record<string, any> | null} [options.tileMatrixSets]
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [options.upscalingEndpoints]
 * @param {import("../http.js").HttpClient} [options.http]
 * @param {import("../types").LayerConfigHelpers} [options.layerConfigHelpers]
 * @returns {Promise<{ layers: import("@eox/map").EoxLayer[], projections: import("../types").Projection[] }>}
 */
var createLayersFromLinks = async (
  collectionId,
  title,
  item,
  layerDatetime,
  extraProperties,
  collection,
  options = {},
) => {
  const {
    viewProjection,
    tileMatrixSets = null,
    upscalingEndpoints = [],
    http = createHTTPInstance(),
    layerConfigHelpers = createLayerConfigHelpers(),
  } = options;
  const { extractLayerConfig, applyRasterFormValue } = layerConfigHelpers;
  import_loglevel.default.debug("Creating layers from links");
  /** @type {import("@eox/map").EoxLayer[]} */
  const jsonArray = [];
  /** @type {import("../types").Projection[]} */
  const projections = [];
  const wmsArray = item.links.filter(isWMSLink);
  const wmtsArray = item.links.filter(isWMTSLink);
  const xyzArray = item.links.filter(isXYZLink);
  const vectorTileArray = item.links.filter(isVectorTileLink);
  const mapboxStyleDocumentArray = item.links.filter(isMapboxStyleDocumentLink);
  const tilejsonArray = xyzArray.length
    ? []
    : item.links.filter(isTileJSONLink);
  const viewProjectionCode = viewProjection || "EPSG:3857";
  /**
   * Cache of fetched raster forms keyed by source identifier or definition.
   *
   * @type {Map<string | import("../types").RasterForm | undefined, Promise<import("../types").RasterForm | undefined>>}
   */
  const rasterForms = /* @__PURE__ */ new Map();
  /**
   * Resolves the raster form configuration for a link from the link, item, or collection level.
   *
   * @param {import("../types").WebMapLink} link
   * @returns {Promise<import("../types").RasterForm | undefined>}
   */
  const resolveRasterForm = (link) => {
    const source =
      link["eodash:rasterform"] ||
      item?.["eodash:rasterform"] ||
      collection?.["eodash:rasterform"];
    const form = rasterForms.get(source) ?? fetchRasterForm(source, http, item);
    rasterForms.set(source, form);
    return form;
  };
  for (const wmsLink of wmsArray ?? []) {
    const wmsLinkProjection = getProjection(wmsLink);
    if (wmsLinkProjection) projections.push(wmsLinkProjection);
    const linkProjectionCode =
      getProjectionCode(wmsLinkProjection) || "EPSG:4326";
    const linkId = createLayerID(
      collectionId,
      item.id,
      wmsLink,
      viewProjectionCode,
    );
    const isBaseOrOverlay = isBaseLayerOrOverlay(wmsLink);
    let { layerConfig } = extractLayerConfig(
      {},
      isBaseOrOverlay ? void 0 : await resolveRasterForm(wmsLink),
      "tileUrl",
    );
    import_loglevel.default.debug("WMS Layer added", linkId);
    const tileSize =
      "wms:tilesize" in wmsLink
        ? [wmsLink["wms:tilesize"], wmsLink["wms:tilesize"]]
        : [512, 512];
    let json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: linkId,
        title: wmsLink.title || title || item.id,
        ...(!!layerDatetime && { layerDatetime }),
        ...(!!layerConfig && { layerConfig }),
      },
      source: {
        /** @type {"TileWMS"} */
        type: "TileWMS",
        url: wmsLink.href,
        projection: linkProjectionCode,
        tileGrid: { tileSize },
        ...(wmsLink.attribution ? { attributions: wmsLink.attribution } : {}),
        params: {
          LAYERS: wmsLink["wms:layers"],
          TILED: true,
        },
      },
    };
    if (isBaseOrOverlay) json.preload = Infinity;
    if ("wms:version" in wmsLink)
      json.source.params["VERSION"] = wmsLink["wms:version"];
    extractRoles(json.properties, wmsLink);
    if ("wms:dimensions" in wmsLink)
      Object.assign(json.source.params, wmsLink["wms:dimensions"]);
    if ("wms:styles" in wmsLink)
      json.source.params["STYLES"] = wmsLink["wms:styles"];
    if (extraProperties !== null)
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(wmsLink),
      };
    applyRasterFormValue(json);
    jsonArray.push(json);
  }
  for (const wmtsLink of wmtsArray ?? []) {
    const wmtsLinkProjection = getProjection(wmtsLink);
    if (wmtsLinkProjection) projections.push(wmtsLinkProjection);
    const { layerConfig } = extractLayerConfig(
      {},
      isBaseLayerOrOverlay(wmtsLink)
        ? void 0
        : await resolveRasterForm(wmtsLink),
      "tileUrl",
    );
    const linkProjectionCode = getProjectionCode(
      wmtsLinkProjection || "EPSG:3857",
    );
    let json;
    const linkId = createLayerID(
      collectionId,
      item.id,
      wmtsLink,
      viewProjectionCode,
    );
    let { style, matrixSet, ...dimensionsWithoutStyle } = {
      ...(wmtsLink["wmts:dimensions"] || {}),
    };
    let extractedStyle = style || "default";
    import_loglevel.default.debug("WMTS Layer from capabilities added", linkId);
    json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: linkId,
        title: wmtsLink.title || title || item.id,
        layerDatetime,
        ...(layerConfig && { layerConfig }),
      },
      source: {
        /** @type {"WMTSCapabilities"} */
        type: "WMTSCapabilities",
        url: buildCapabilitiesUrl(wmtsLink.href),
        layer: wmtsLink["wmts:layer"],
        projection: linkProjectionCode,
        style: extractedStyle,
        ...(matrixSet ? { matrixSet } : {}),
        ...(wmtsLink.attribution ? { attributions: wmtsLink.attribution } : {}),
        dimensions: dimensionsWithoutStyle,
      },
    };
    extractRoles(json.properties, wmtsLink);
    if (extraProperties !== null)
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(wmtsLink),
      };
    applyRasterFormValue(json);
    jsonArray.push(json);
  }
  for (const xyzLink of xyzArray ?? []) {
    const xyzLinkProjection = getProjection(xyzLink);
    const isBaseOrOverlay = isBaseLayerOrOverlay(xyzLink);
    let { layerConfig } = extractLayerConfig(
      {},
      isBaseOrOverlay ? void 0 : await resolveRasterForm(xyzLink),
      "tileUrl",
    );
    if (xyzLinkProjection) projections.push(xyzLinkProjection);
    const projectionCode = getProjectionCode(xyzLinkProjection || "EPSG:3857");
    const linkId = createLayerID(
      collectionId,
      item.id,
      xyzLink,
      viewProjectionCode,
    );
    let xyzUrl = xyzLink.href;
    const upscaling = applyTitilerUpscaling(xyzUrl, upscalingEndpoints);
    if (upscaling) xyzUrl = upscaling.url;
    if (xyzUrl.includes("s2maps-tiles.eu"))
      xyzUrl = xyzUrl.replace("s2maps-tiles.eu", "{a-e}.s2maps-tiles.eu");
    import_loglevel.default.debug("XYZ Layer added", linkId);
    let json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: linkId,
        title: xyzLink.title || title || item.id,
        roles: xyzLink.roles,
        layerDatetime,
        ...(layerConfig && { layerConfig }),
      },
      source: {
        /** @type {"XYZ"} */
        type: "XYZ",
        url: xyzUrl,
        projection: projectionCode,
        ...(xyzLink.attribution ? { attributions: xyzLink.attribution } : {}),
      },
    };
    const tms = resolveTmsByProjection(projectionCode, tileMatrixSets);
    const tileSize = upscaling?.tileSize ?? [256, 256];
    json.source.tileGrid = { tileSize };
    if (tms) {
      const tmsOptions = tmsToTileGridOptions(tms, tileSize);
      json.source.tileGrid = {
        ...json.source.tileGrid,
        ...tmsOptions,
      };
    }
    if (isBaseOrOverlay) json.preload = Infinity;
    extractRoles(json.properties, xyzLink);
    if (extraProperties !== null)
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(xyzLink),
      };
    applyRasterFormValue(json);
    jsonArray.push(json);
  }
  for (const tilejsonLink of tilejsonArray) {
    const tileJSON = await http.get(tilejsonLink.href).catch((err) => {
      console.error("[eodash] Failed to fetch item TileJSON", err);
      return null;
    });
    if (!tileJSON?.tiles?.[0]) {
      console.warn(
        "[eodash] No tile URL in item TileJSON response",
        tilejsonLink.href,
      );
      continue;
    }
    if (tileJSON.vector_layers || tileJSON.scheme === "tms") {
      console.warn(
        "[eodash] Unsupported TileJSON (only raster XYZ is supported)",
        tilejsonLink.href,
      );
      continue;
    }
    const tilejsonProjection = getProjection(tilejsonLink);
    if (tilejsonProjection) projections.push(tilejsonProjection);
    const projectionCode = getProjectionCode(tilejsonProjection || "EPSG:3857");
    const { layerConfig } = extractLayerConfig(
      {},
      isBaseLayerOrOverlay(tilejsonLink)
        ? void 0
        : await resolveRasterForm(tilejsonLink),
      "tileUrl",
    );
    const linkId = createLayerID(
      collectionId,
      item.id,
      tilejsonLink,
      viewProjectionCode,
    );
    import_loglevel.default.debug("TileJSON layer added", linkId);
    /** @type {Record<string, any>} */
    const json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: linkId,
        title: tilejsonLink.title || title || item.id,
        roles: tilejsonLink.roles,
        layerDatetime,
        ...(layerConfig && { layerConfig }),
      },
      source: {
        /** @type {"XYZ"} */
        type: "XYZ",
        ...(tileJSON.tiles.length > 1
          ? { urls: tileJSON.tiles }
          : { url: tileJSON.tiles[0] }),
        projection: projectionCode,
        ...(tilejsonLink.attribution || tileJSON.attribution
          ? { attributions: tilejsonLink.attribution || tileJSON.attribution }
          : {}),
      },
    };
    if (Number.isFinite(tileJSON.minzoom)) json.minZoom = tileJSON.minzoom;
    if (Number.isFinite(tileJSON.maxzoom)) json.maxZoom = tileJSON.maxzoom;
    extractRoles(json.properties, tilejsonLink);
    if (extraProperties !== null)
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(tilejsonLink),
      };
    applyRasterFormValue(json);
    jsonArray.push(json);
  }
  for (const vectorTileLink of vectorTileArray ?? []) {
    const vectorTileLinkProjection = getProjection(vectorTileLink);
    if (vectorTileLinkProjection) projections.push(vectorTileLinkProjection);
    const projectionCode = getProjectionCode(
      vectorTileLinkProjection || "EPSG:3857",
    );
    const linkId = createLayerID(
      collectionId,
      item.id,
      vectorTileLink,
      viewProjectionCode,
    );
    import_loglevel.default.debug("Vector Tile Layer added", linkId);
    let { layerConfig, style } = extractLayerConfig(
      await resolveStyle(
        item,
        collection,
        http,
        vectorTileLink["key"] || void 0,
      ),
    );
    let href = vectorTileLink.href;
    if ("auth:schemes" in item && "auth:refs" in vectorTileLink) {
      const { url } = handleAuthenticationOfLink(item, vectorTileLink, void 0);
      href = url;
    }
    const json = {
      /** @type {"VectorTile"} */
      type: "VectorTile",
      declutter: true,
      properties: {
        id: linkId,
        title: vectorTileLink.title || title || item.id,
        roles: vectorTileLink.roles,
        layerDatetime,
        ...(layerConfig &&
          !isBaseLayerOrOverlay(vectorTileLink) && {
            layerConfig: {
              ...layerConfig,
              style,
            },
          }),
      },
      source: {
        /** @type {"VectorTile"} */
        type: "VectorTile",
        format: {
          /** @type {"MVT"} */
          type: "MVT",
          idProperty: vectorTileLink.idProperty,
          layers: vectorTileLink.layers,
        },
        url: href,
        projection: projectionCode,
        ...(vectorTileLink.attribution
          ? { attributions: vectorTileLink.attribution }
          : {}),
      },
      interactions: [],
      ...(!style?.variables && { style }),
    };
    addTooltipInteraction(json, style);
    extractRoles(json.properties, vectorTileLink);
    if (extraProperties !== null)
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(vectorTileLink),
      };
    jsonArray.push(json);
  }
  for (const mapboxStyleDocumentLink of mapboxStyleDocumentArray ?? []) {
    const mapboxStyleDocumentLinkProjection = getProjection(
      mapboxStyleDocumentLink,
    );
    if (mapboxStyleDocumentLinkProjection)
      projections.push(mapboxStyleDocumentLinkProjection);
    const projectionCode = getProjectionCode(
      mapboxStyleDocumentLinkProjection || "EPSG:3857",
    );
    const linkId = createLayerID(
      collectionId,
      item.id,
      mapboxStyleDocumentLink,
      viewProjectionCode,
    );
    import_loglevel.default.debug("Mapbox Style Document Layer added", linkId);
    let href = mapboxStyleDocumentLink.href;
    let applyOptions = mapboxStyleDocumentLink?.applyOptions || {};
    if ("auth:schemes" in item && "auth:refs" in mapboxStyleDocumentLink) {
      const { url, optionsObject } = handleAuthenticationOfLink(
        item,
        mapboxStyleDocumentLink,
        applyOptions,
      );
      applyOptions = optionsObject ?? applyOptions;
      href = url;
    }
    const json = {
      /** @type {"MapboxStyle"} */
      type: "MapboxStyle",
      properties: {
        id: linkId,
        title: mapboxStyleDocumentLink.title || title || item.id,
        roles: mapboxStyleDocumentLink.roles,
        layerDatetime,
        mapboxStyle: href,
        projection: projectionCode,
        ...(mapboxStyleDocumentLink.attribution
          ? { attributions: mapboxStyleDocumentLink.attribution }
          : {}),
        applyOptions,
      },
      interactions: [],
    };
    extractRoles(json.properties, mapboxStyleDocumentLink);
    if (extraProperties !== null)
      json.properties = {
        ...json.properties,
        ...extraProperties,
        ...extractEoxLegendLink(mapboxStyleDocumentLink),
      };
    jsonArray.push(json);
  }
  return {
    layers: jsonArray,
    projections,
  };
};
/**
 * Build a WMTS GetCapabilities URL from a base endpoint URL.
 * If the URL already points to a capabilities document, return as-is.
 *
 * @param {string} href
 * @returns {string}
 */
function buildCapabilitiesUrl(href) {
  if (href.includes("GetCapabilities") || href.endsWith(".xml")) return href;
  const url = new URL(href);
  url.searchParams.set("service", "WMTS");
  url.searchParams.set("request", "GetCapabilities");
  return url.toString();
}
/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").WMSLink}
 */
function isWMSLink(link) {
  return link.rel === "wms";
}
/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").WMTSLink}
 */
function isWMTSLink(link) {
  return link.rel === "wmts";
}
/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").XYZLink}
 */
function isXYZLink(link) {
  return link.rel === "xyz";
}
/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").TileJSONLink}
 */
function isTileJSONLink(link) {
  return link.rel === "tilejson";
}
/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").VectorTileLink}
 */
function isVectorTileLink(link) {
  return link.rel === "vector-tile";
}
/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").MapboxStyleDocumentLink}
 */
function isMapboxStyleDocumentLink(link) {
  return link.rel === "mapbox-style-document";
}
//#endregion
//#region ../stac/src/layers/collection.js
/** Standard layer identifier for observation points. */
var OBSERVATION_POINTS_ID = "geodb-collection";
/**
 * Generates map base layers and overlays declared at the STAC Collection level.
 *
 * @param {import("../types").STACCollection} collection - STAC Collection
 * @param {Parameters<typeof createLayersFromLinks>[6] & { client?: import("../http.js").AxiosInstance }} [options] - Build options and HTTP client
 * @returns {Promise<import("../types").BuiltLayers>}
 */
var getIndicatorLayers = async (collection, { client, ...rest } = {}) => {
  const options = {
    ...rest,
    http: rest.http ?? createHTTPInstance({ client }),
  };
  const assets = Object.fromEntries(
    Object.entries(collection.assets ?? {}).filter(([, asset]) =>
      isBaseLayerOrOverlay(asset),
    ),
  );
  const title = collection.title || collection.id;
  const built = await Promise.all([
    createLayersFromLinks(
      collection.id ?? "",
      title,
      collection,
      void 0,
      void 0,
      void 0,
      options,
    ),
    createLayersFromAssets(
      collection.id ?? "",
      title,
      assets,
      collection,
      void 0,
      void 0,
      void 0,
      options,
    ),
  ]);
  return {
    layers: built.flatMap((result) => result.layers),
    projections: built.flatMap((result) => result.projections),
  };
};
/**
 * Creates a vector layer containing spatial observation points across collections.
 *
 * @param {import("../types").STACCollection[]} collections - Array of STAC Collections
 * @param {object} [options]
 * @param {import("../types").ObservationPointsThemes} [options.themes] - Theme styling options
 * @param {import("@eox/map").EoxLayer[]} [options.currentLayers] - Layers whose interactions are preserved
 * @returns {import("@eox/map").EoxLayer | null} Vector layer definition or null if no points exist
 */
var getObservationPointsLayer = (
  collections,
  { themes = OBSERVATION_POINT_THEMES, currentLayers = [] } = {},
) => {
  const features = collections.filter(isObservationPoints).flatMap(
    (collection) =>
      generateFeatures(
        collection.links,
        {
          collection_id: collection.id,
          geoDBID: collection.geoDBID,
          themes: collection.themes ?? [],
        },
        collection.locations ? "child" : "item",
      ).features,
  );
  if (!features.length) return null;
  return {
    type: "Vector",
    properties: {
      id: OBSERVATION_POINTS_ID,
      title: "Observation Points",
    },
    source: {
      type: "Vector",
      url:
        "data:," +
        encodeURIComponent(
          JSON.stringify({
            type: "FeatureCollection",
            crs: {
              type: "name",
              properties: { name: "EPSG:4326" },
            },
            features,
          }),
        ),
      format: "GeoJSON",
    },
    style: themeStyle(themes),
    interactions: [
      ...(findLayer(currentLayers, OBSERVATION_POINTS_ID)?.interactions ?? []),
    ],
  };
};
/**
 * Whether a collection's items are places: a geoDB endpoint, or one stating
 * that its children are locations.
 *
 * @param {import("../types").STACCollection} collection
 */
function isObservationPoints(collection) {
  return collection.endpointtype === "GeoDB" || !!collection.locations;
}
/**
 * A flat style per theme, falling through to a plain circle.
 *
 * @param {import("../types").ObservationPointsThemes} themes
 */
function themeStyle(themes) {
  return [
    ...Object.entries(themes).map(([theme, { color, icon }], index) => ({
      ...(index !== 0 && { else: true }),
      filter: ["==", ["get", "themes", 0], theme],
      style: { "icon-src": markerIcon(color, icon) },
    })),
    {
      else: true,
      style: {
        "circle-radius": 10,
        "circle-fill-color": "#00417077",
        "circle-stroke-color": "#004170",
        "fill-color": "#00417077",
        "stroke-color": "#004170",
      },
    },
  ];
}
/**
 * @param {string} color
 * @param {string} icon an svg path
 */
function markerIcon(color, icon) {
  const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="30" stroke="white" fill="${color}" stroke-width="4"/>
              <path d="${icon}" fill="#fff" transform="translate(19.5, 20) scale(1.3) "/>
            </svg>
            `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
//#endregion
//#region ../stac/src/layers/renders.js
/**
 * Creates map layers based on the STAC render extension configuration.
 * Resolves properties from the item, collection, or explicit overrides.
 *
 * @param {string} rasterURL
 * @param {import("../types").STACCollection | undefined | null} collection
 * @param {import("../types").STACItem | undefined | null} item
 * @param {Record<string, any>} [extraProperties]
 * @param {object} [options]
 * @param {Record<string, Record<string, import("../types").Render>>} [options.renders]
 * @param {Record<string, any> | null} [options.tileMatrixSets]
 * @param {import("../http.js").HttpClient} [options.http]
 * @param {import("../types").LayerConfigHelpers} [options.layerConfigHelpers]
 * @returns {Promise<{ layers: import("@eox/map").EoxLayer[], projections: import("../types").Projection[] }>}
 */
var createLayerFromRender = async (
  rasterURL,
  collection,
  item,
  extraProperties,
  options = {},
) => {
  const {
    renders: configRenders,
    tileMatrixSets = null,
    http = createHTTPInstance(),
    layerConfigHelpers = createLayerConfigHelpers(),
  } = options;
  const { extractLayerConfig, applyRasterFormValue } = layerConfigHelpers;
  /** @type {import("../types").Projection[]} */
  const projections = [];
  const renders = resolveRenders(collection, configRenders) ?? item?.renders;
  if (!collection || !item || !renders)
    return {
      layers: [],
      projections,
    };
  if (
    item.links?.some(
      (link) =>
        (link.rel === "xyz" || link.rel === "tilejson") &&
        link.href?.includes(rasterURL),
    )
  )
    return {
      layers: [],
      projections,
    };
  let { layerConfig } = extractLayerConfig(
    {},
    await fetchRasterForm(
      item?.["eodash:rasterform"] || collection?.["eodash:rasterform"],
      http,
      item,
    ),
  );
  /**
   * Resolves the first defined property value across a render's assets.
   *
   * @param {import("../types").Render} render
   * @param {string} propertyName
   * @returns {any}
   */
  const getRenderAssetProperty = (render, propertyName) => {
    for (const assetKey of render.assets ?? []) {
      const value = (item?.assets?.[assetKey] ??
        collection?.assets?.[assetKey])?.[propertyName];
      if (value !== void 0) return value;
    }
  };
  const layers = [];
  for (const key in renders) {
    const title = renders[key].title;
    const expression =
      renders[key].expression ??
      getRenderAssetProperty(renders[key], "expression");
    const projection =
      renders[key].projection ??
      getRenderAssetProperty(renders[key], "projection") ??
      "EPSG:3857";
    const projectionCode = getProjectionCode(projection);
    projections.push(projection);
    const paramsObject = {
      assets: expression ? void 0 : renders[key].assets,
      expression,
      nodata: normalizeNodata(
        renders[key].nodata ?? getRenderAssetProperty(renders[key], "nodata"),
      ),
      resampling:
        renders[key].resampling ??
        getRenderAssetProperty(renders[key], "resampling"),
      color_formula:
        renders[key].color_formula ??
        getRenderAssetProperty(renders[key], "color_formula"),
      colormap:
        renders[key].colormap ??
        getRenderAssetProperty(renders[key], "colormap"),
      colormap_name:
        renders[key].colormap_name ??
        getRenderAssetProperty(renders[key], "colormap_name"),
      rescale: normalizeRescale(
        renders[key].rescale ?? getRenderAssetProperty(renders[key], "rescale"),
      ),
      bidx: renders[key].bidx,
      tilesize: renders[key].tilesize,
    };
    const tms = resolveTmsByProjection(projectionCode, tileMatrixSets);
    const tmsId = tms?.id || "WebMercatorQuad";
    const paramsStr = encodeURLObject(paramsObject);
    const url = `${rasterURL}/collections/${collection.id}/items/${item.id}/tiles/${tmsId}/{z}/{x}/{y}?${paramsStr}`;
    const json = {
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: createLayerID(
          collection.id,
          item.id,
          {
            id: key,
            href: "",
            title,
            rel: "",
          },
          projectionCode,
        ),
        title,
        ...extraProperties,
        layerConfig: { ...layerConfig },
      },
      source: {
        /** @type {"XYZ"} */
        type: "XYZ",
        url,
        projection: projectionCode,
      },
    };
    const tilesize = renders[key].tilesize || 512;
    if (tms) {
      const tmsOptions = tmsToTileGridOptions(tms, [tilesize, tilesize]);
      json.source.tileGrid = tmsOptions;
    } else if (renders[key].tilesize)
      json.source.tileGrid = { tileSize: renders[key].tilesize };
    applyRasterFormValue(json);
    layers.push(json);
  }
  return {
    layers,
    projections,
  };
};
//#endregion
//#region ../stac/src/layers/index.js
/**
 * Context provided by the caller to build layers. Includes HTTP configuration, map state, and external overrides.
 *
 * @typedef {object} BuildContext
 * @property {import("../types").BBox} [bbox]
 * @property {string} [title]
 * @property {string} [itemDatetime]
 * @property {string} [color]
 * @property {string} [rasterEndpoint]
 * @property {string} [viewProjection]
 * @property {Record<string, any> | null} [tileMatrixSets]
 * @property {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [upscalingEndpoints]
 * @property {Record<string, Record<string, import("../types").Render>>} [renders]
 * @property {import("../http.js").HttpClient} [http]
 * @property {import("../types").LayerConfigHelpers} [layerConfigHelpers]
 * @property {boolean} [stateful] - whether the built item becomes the reader's `item`. Default `true`.
 */
/** Link relations supported for layer rendering. */
var RENDERABLE_RELS = [
  "wms",
  "xyz",
  "wmts",
  "vector-tile",
  "mapbox-style-document",
  "tilejson",
];
/**
 * Generates @eox/map layer definitions and projection definitions for a single STAC Item.
 * Evaluates web service links (WMS, WMTS, XYZ, VectorTile), data assets (COG, GeoTIFF, GeoJSON, Zarr),
 * and STAC Render extensions.
 *
 * @param {import("../types").STACItem} item - Target STAC Item containing data links/assets
 * @param {BuildContext & { stac: import("../types").STACCollection, getDates: (datetime?: import("../types").Datetime) => Promise<Date[]> }} context - Context dependencies (HTTP client, STAC collection, state config)
 * @returns {Promise<{ layers: import("@eox/map").EoxLayer[], projections: import("../types").Projection[] }>} Layer array for @eox/map and required projections
 */
var buildLayers = async (item, context) => {
  const {
    stac: collection,
    getDates,
    title = collection.title || collection.id || "",
    itemDatetime,
    color,
    rasterEndpoint,
    viewProjection,
    tileMatrixSets,
    upscalingEndpoints,
    renders,
    http = createHTTPInstance(),
    layerConfigHelpers = createLayerConfigHelpers(),
  } = context;
  const options = {
    viewProjection,
    tileMatrixSets,
    upscalingEndpoints,
    renders,
    http,
    layerConfigHelpers,
  };
  import_loglevel.default.debug("Building layers", item, title, itemDatetime);
  /** @type {import("../types").Projection[]} */
  const projections = [];
  const indicatorProjection = getProjection(item);
  if (indicatorProjection) projections.push(indicatorProjection);
  if (isObservationPoints(collection))
    return {
      layers: [],
      projections,
    };
  const itemDate =
    item.properties?.datetime ??
    item.properties?.start_datetime ??
    itemDatetime;
  const { layerDatetime, timeControlValues } = extractLayerTimeValues(
    await getDates(itemDate ?? void 0),
    itemDate,
  );
  const dataAssets = Object.keys(item.assets ?? {}).reduce((data, ast) => {
    if (item.assets[ast].roles?.includes("data")) data[ast] = item.assets[ast];
    return data;
  }, {});
  if (!(
    item.links.some((link) => RENDERABLE_RELS.includes(link.rel)) ||
    Object.keys(dataAssets).length
  ))
    return {
      layers: [
        await buildStacLayer(item, collection, title, http, layerConfigHelpers),
      ],
      projections,
    };
  const extraProperties = {
    ...extractLayerLegend(collection),
    ...(color && { color }),
    ...(timeControlValues && {
      timeControlValues,
      timeControlProperty: "TIME",
    }),
    ...(!!collection["eodash:layerExclusive"] && {
      layerControlExclusive: true,
      layerControlExpand: false,
    }),
  };
  const built = await Promise.all([
    createLayersFromLinks(
      collection.id,
      title,
      item,
      layerDatetime,
      extraProperties,
      collection,
      options,
    ),
    createLayersFromAssets(
      collection.id,
      title || collection.title || item.id,
      dataAssets,
      item,
      layerDatetime,
      extraProperties,
      collection,
      options,
    ),
    ...(rasterEndpoint
      ? [
          createLayerFromRender(
            rasterEndpoint,
            collection,
            item,
            {
              ...extraProperties,
              ...(layerDatetime && { layerDatetime }),
            },
            options,
          ),
        ]
      : []),
  ]);
  return {
    layers: built.flatMap((result) => result.layers),
    projections: [
      ...projections,
      ...built.flatMap((result) => result.projections),
    ],
  };
};
/**
 * Fallback layer builder for items that cannot be explicitly matched to a supported rendering strategy.
 * Defers to the @eox/map STAC layer type to attempt extraction.
 *
 * @param {import("../types").STACItem} item
 * @param {import("../types").STACCollection} collection
 * @param {string} title
 * @param {import("../http.js").HttpClient} http
 * @param {import("../types").LayerConfigHelpers} layerConfigHelpers
 * @returns {Promise<import("@eox/map").EoxLayer>}
 */
async function buildStacLayer(
  item,
  collection,
  title,
  http,
  layerConfigHelpers,
) {
  const styles = renderConfigTemplate(await fetchStyle(item, http), item);
  const { layerConfig, style } = layerConfigHelpers.extractLayerConfig(styles);
  const json = {
    /** @type {"STAC"} */
    type: "STAC",
    displayWebMapLink: true,
    displayFootprint: false,
    data: item,
    properties: {
      id: collection.id,
      title: title || item.id,
      layerConfig,
    },
    style,
  };
  extractRoles(
    json.properties,
    item.links.find((link) => link.rel === "self") ?? item,
  );
  return json;
}
//#endregion
//#region ../stac/src/collections/base.js
/**
 * Creates the base collection reader implementing standard layer and item handling.
 *
 * @param {object} parts
 * @param {import("../types").STACCollection} parts.stac
 * @param {import("../http.js").HttpClient} parts.http
 * @param {(datetime?: import("../types").Datetime, bbox?: import("../types").BBox) => Promise<Date[]>} parts.getDates
 * @param {(datetime?: import("../types").Datetime, bbox?: import("../types").BBox) => Promise<import("../types").STACItem | undefined>} parts.getItem
 * @param {string} [parts.color]
 * @param {string} [parts.viewProjection]
 * @param {import("../types").BuildContext} [parts.rasterOptions] - Default raster configuration applied to layer builds
 */
var createCollectionBase = ({
  stac,
  http,
  getDates,
  getItem,
  color,
  viewProjection,
  rasterOptions,
}) => {
  const layerConfigHelpers = createLayerConfigHelpers();
  /** @type {import("../types").STACItem | undefined} */
  let builtItem;
  /**
   * Merges reader defaults with call-specific build options.
   *
   * @param {import("../layers/index.js").BuildContext} buildCtx
   * @returns {Parameters<typeof buildLayers>[1]}
   */
  const getBuildContext = (buildCtx) => ({
    ...rasterOptions,
    ...buildCtx,
    color: buildCtx.color ?? color,
    viewProjection: buildCtx.viewProjection ?? viewProjection,
    http: buildCtx.http ?? http,
    layerConfigHelpers: buildCtx.layerConfigHelpers ?? layerConfigHelpers,
    stac,
    getDates: (datetime) => getDates(datetime, buildCtx.bbox),
  });
  return {
    id: stac.id,
    stac,
    color,
    /**
     * The STAC item this collection's layers were last built from.
     */
    get item() {
      return builtItem;
    },
    /**
     * Allows clearing the item only
     */
    set item(item) {
      if (item !== void 0) {
        console.warn(
          "[eodash/stac] a collection's item follows its build, only `undefined` can be assigned",
        );
        return;
      }
      builtItem = void 0;
    },
    /**
     * Persists the current layer configuration editor state.
     */
    persistLayerConfig: layerConfigHelpers.persistLayerConfig,
    /**
     * Builds map layers from a specified STAC item.
     *
     * @param {import("../types").STACItem} item
     * @param {import("../layers/index.js").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers>}
     */
    buildLayers: async (item, context = {}) => {
      const built = await buildLayers(item, getBuildContext(context));
      if (context.stateful !== false) builtItem = item;
      return {
        ...built,
        item,
      };
    },
    /**
     * Retrieves the item nearest to the specified datetime and builds its layers.
     *
     * @param {import("../types").Datetime} [datetime]
     * @param {import("../layers/index.js").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers>}
     */
    getLayers: async (datetime, context = {}) => {
      const item = await getItem(datetime, context.bbox);
      if (context.stateful !== false) builtItem = void 0;
      if (!item) {
        console.warn(
          "[eodash] the collection has no item to build layers from",
        );
        return {
          layers: [],
          projections: [],
          item: void 0,
        };
      }
      const built = await buildLayers(item, getBuildContext(context));
      if (context.stateful !== false) builtItem = item;
      return {
        ...built,
        item,
      };
    },
    /**
     * Replaces the layers belonging to this collection in `currentLayers`.
     *
     * @param {import("../types").Datetime} datetime
     * @param {string} layerId - Target layer ID to update
     * @param {import("@eox/map").EoxLayer[]} currentLayers - The map's current layers
     * @param {import("../layers/index.js").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers>} The updated layers and their projections
     */
    updateLayers: async (datetime, layerId, currentLayers, context = {}) => {
      const item = await getItem(datetime, context.bbox);
      if (!item) {
        console.warn("[eodash] the collection has no item at", datetime);
        return {
          layers: [],
          projections: [],
        };
      }
      const toBeReplaced = findLayersByLayerPrefix(
        currentLayers,
        findLayer(currentLayers, layerId),
      );
      if (!toBeReplaced.length) {
        console.warn("[eodash] no layer of this collection to update", layerId);
        return {
          layers: [],
          projections: [],
        };
      }
      const { layers, projections } = await buildLayers(
        item,
        getBuildContext(context),
      );
      if (context.stateful !== false) builtItem = item;
      return {
        layers: replaceLayer(
          currentLayers,
          toBeReplaced.map((layer) => layer.properties?.id ?? ""),
          layers,
        ),
        projections,
        item,
      };
    },
    /**
     * Resolves the temporal extent of the collection.
     * Uses collection-level metadata if available; otherwise extrapolates from items.
     *
     * @returns {Promise<import("../types").TemporalExtent | undefined>}
     */
    getTemporalExtent: async () => {
      const [start, end] = stac.extent?.temporal?.interval?.[0] ?? [];
      if (start && end)
        return {
          start: new Date(start),
          end: new Date(end),
        };
      const dates = await getDates();
      const from = start ? new Date(start) : dates.at(0);
      const to = end ? new Date(end) : dates.at(-1);
      return from && to
        ? {
            start: from,
            end: to,
          }
        : void 0;
    },
  };
};
//#endregion
//#region ../stac/src/collections/api.js
/** Field selection parameter including timestamp properties and excluding heavy payloads. */
var DATE_FIELDS =
  "properties.datetime,properties.start_datetime,properties.end_datetime,-assets,-geometry,-links,-bbox";
/**
 * Creates a STAC collection reader backed by a STAC API `/search` endpoint.
 *
 * @param {object} context
 * @param {string} context.url - Collection URL
 * @param {import("../types").STACCollection} context.stac - Collection metadata
 * @param {import("../http.js").HttpClient} context.http - HTTP client instance
 * @param {string} [context.color] - Collection layer tint color
 * @param {string} [context.viewProjection] - Map view projection
 * @param {import("../types").BuildContext} [context.rasterOptions] - Raster rendering options
 * @param {number} [context.maxItems=1000] - Maximum items returned per search query
 */
var createAPICollection = ({
  url,
  stac,
  http,
  color,
  viewProjection,
  rasterOptions,
  maxItems = 1e3,
}) => {
  const searchUrl =
    url.replace(/\/+$/, "").split("/").slice(0, -2).join("/") + "/search";
  /**
   * Searches the API's `/search` endpoint. `collections` defaults to this
   * collection.
   *
   * @param {import("../types").SearchParams} params
   * @returns {Promise<import("../types").ItemCollection>}
   */
  const search = async (params) =>
    http.get(searchUrl, {
      collections: stac.id,
      ...params,
    });
  /**
   * The items covering `bbox`, oldest first.
   *
   * @param {import("../types").BBox} [bbox]
   * @returns {Promise<import("../types").STACItem[]>}
   */
  const getItems = async (bbox) => {
    const { features, numberMatched } = await search({
      ...(bbox && { bbox: bbox.join(",") }),
      limit: maxItems,
      sortby: "datetime",
    });
    if ((numberMatched ?? 0) > maxItems)
      console.warn(
        `[eodash] ${numberMatched} items exist, reading the first ${maxItems}. Narrow the search with a bbox.`,
      );
    return features;
  };
  /**
   * Every datetime the collection has an item for, oldest first. A daily
   * `pre-aggregation` link answers for the whole archive in one request;
   * under a `bbox` the items are enumerated instead. When more items exist
   * than one search returns, the dates window centres on `datetime`.
   *
   * @param {import("../types").Datetime} [datetime] the date the window centres on
   * @param {import("../types").BBox} [bbox]
   * @returns {Promise<Date[]>}
   */
  const getDates = async (datetime, bbox) => {
    const aggregated = bbox
      ? void 0
      : await fetchDailyAggregation(stac, url, http);
    if (aggregated?.buckets)
      return sortDates(aggregated.buckets.map((bucket) => bucket.key));
    const scope = {
      ...(bbox && { bbox: bbox.join(",") }),
      fields: DATE_FIELDS,
    };
    const { features, numberMatched } = await search({
      ...scope,
      limit: maxItems,
      sortby: "datetime",
    });
    if ((numberMatched ?? 0) <= maxItems) return getItemDates(features);
    const target = datetime ? new Date(datetime) : void 0;
    if (!target || isNaN(target.getTime())) {
      console.warn(
        `[eodash] ${numberMatched} dates exist, reading the oldest ${maxItems}. Narrow the search with a bbox.`,
      );
      return getItemDates(features);
    }
    const instant = target.toISOString();
    const half = Math.ceil(maxItems / 2);
    const [earlier, later] = await Promise.all([
      search({
        ...scope,
        datetime: `../${instant}`,
        limit: half,
        sortby: "-datetime",
      }),
      search({
        ...scope,
        datetime: `${instant}/..`,
        limit: half,
        sortby: "datetime",
      }),
    ]);
    const seen = /* @__PURE__ */ new Set();
    return getItemDates(
      [...earlier.features, ...later.features].filter(
        (item) => !seen.has(item.id) && seen.add(item.id),
      ),
    );
  };
  /**
   * The item closest to `datetime` within `bbox`, or the most recent one when
   * omitted. Equidistant items resolve to the earlier.
   *
   * @param {import("../types").Datetime} [datetime]
   * @param {import("../types").BBox} [bbox]
   * @returns {Promise<import("../types").STACItem | undefined>}
   */
  const getItem = async (datetime, bbox) => {
    const scope = bbox ? { bbox: bbox.join(",") } : {};
    const target = datetime ? new Date(datetime) : void 0;
    if (!target || isNaN(target.getTime())) {
      const { features } = await search({
        ...scope,
        limit: 1,
        sortby: "-datetime",
      });
      return features[0];
    }
    const instant = target.toISOString();
    const [earlier, later] = await Promise.all([
      search({
        ...scope,
        datetime: `../${instant}`,
        limit: 1,
        sortby: "-datetime",
      }),
      search({
        ...scope,
        datetime: `${instant}/..`,
        limit: 1,
        sortby: "datetime",
      }),
    ]);
    const items = [...earlier.features, ...later.features];
    const property = getDatetimeProperty(items);
    return (
      items[
        findClosestIndex(
          property
            ? items.map((item) =>
                new Date(item.properties[property] ?? "").getTime(),
              )
            : [],
          target,
        )
      ] ?? items[0]
    );
  };
  return Object.assign(
    createCollectionBase({
      stac,
      http,
      getDates,
      getItem,
      color,
      viewProjection,
      rasterOptions,
    }),
    {
      /** @type {"api"} */
      kind: "api",
      search,
      getItems,
      getDates,
      getItem,
    },
  );
};
/**
 * The datetimes of `items`, oldest first, dropping any that will not parse. The
 * two-sided search answers newest-first on one side, so the order is restored
 * here rather than assumed from the server.
 *
 * @param {import("../types").STACItem[]} items
 * @returns {Date[]}
 */
function getItemDates(items) {
  const property = getDatetimeProperty(items);
  if (!property) return [];
  return sortDates(items.map((item) => item.properties[property]));
}
/**
 * @param {(string | null | undefined)[]} values
 * @returns {Date[]} oldest first, without the unparseable ones
 */
function sortDates(values) {
  return values
    .map((value) => new Date(value ?? ""))
    .sort((a, b) => a.getTime() - b.getTime());
}
/**
 * The collection's precomputed daily item counts, or nothing when it has none
 * or the document cannot be read.
 *
 * @param {import("../types").STACCollection} stac
 * @param {string} url base for resolving the link when the collection carries no `self`
 * @param {import("../http.js").HttpClient} http
 * @returns {Promise<import("../types").Aggregation | undefined>}
 */
async function fetchDailyAggregation(stac, url, http) {
  const link = stac.links.find(isDailyPreAggregation);
  if (!link) return;
  const self = stac.links.find((l) => l.rel === "self")?.href;
  try {
    return (
      await http.get(toAbsolute(link.href, self || url))
    ).aggregations.find(
      (aggregation) =>
        aggregation.key?.startsWith("datetime_") || aggregation.interval,
    );
  } catch (error) {
    console.warn("[eodash] Failed to fetch pre-aggregation", error);
    return;
  }
}
/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").PreAggregationLink}
 */
function isDailyPreAggregation(link) {
  return (
    link.rel === "pre-aggregation" && link["aggregation:interval"] === "daily"
  );
}
//#endregion
//#region ../../node_modules/hyparquet/src/constants.js
/** @type {import('../src/types.d.ts').ParquetType[]} */
var ParquetTypes = [
  "BOOLEAN",
  "INT32",
  "INT64",
  "INT96",
  "FLOAT",
  "DOUBLE",
  "BYTE_ARRAY",
  "FIXED_LEN_BYTE_ARRAY",
];
/** @type {import('../src/types.d.ts').Encoding[]} */
var Encodings = [
  "PLAIN",
  "GROUP_VAR_INT",
  "PLAIN_DICTIONARY",
  "RLE",
  "BIT_PACKED",
  "DELTA_BINARY_PACKED",
  "DELTA_LENGTH_BYTE_ARRAY",
  "DELTA_BYTE_ARRAY",
  "RLE_DICTIONARY",
  "BYTE_STREAM_SPLIT",
];
/** @type {import('../src/types.d.ts').FieldRepetitionType[]} */
var FieldRepetitionTypes = ["REQUIRED", "OPTIONAL", "REPEATED"];
/** @type {import('../src/types.d.ts').ConvertedType[]} */
var ConvertedTypes = [
  "UTF8",
  "MAP",
  "MAP_KEY_VALUE",
  "LIST",
  "ENUM",
  "DECIMAL",
  "DATE",
  "TIME_MILLIS",
  "TIME_MICROS",
  "TIMESTAMP_MILLIS",
  "TIMESTAMP_MICROS",
  "UINT_8",
  "UINT_16",
  "UINT_32",
  "UINT_64",
  "INT_8",
  "INT_16",
  "INT_32",
  "INT_64",
  "JSON",
  "BSON",
  "INTERVAL",
];
/** @type {import('../src/types.d.ts').CompressionCodec[]} */
var CompressionCodecs = [
  "UNCOMPRESSED",
  "SNAPPY",
  "GZIP",
  "LZO",
  "BROTLI",
  "LZ4",
  "ZSTD",
  "LZ4_RAW",
];
/** @type {import('../src/types.d.ts').PageType[]} */
var PageTypes = ["DATA_PAGE", "INDEX_PAGE", "DICTIONARY_PAGE", "DATA_PAGE_V2"];
/** @type {import('../src/types.d.ts').BoundaryOrder[]} */
var BoundaryOrders = ["UNORDERED", "ASCENDING", "DESCENDING"];
/** @type {import('../src/types.d.ts').EdgeInterpolationAlgorithm[]} */
var EdgeInterpolationAlgorithms = [
  "SPHERICAL",
  "VINCENTY",
  "THOMAS",
  "ANDOYER",
  "KARNEY",
];
//#endregion
//#region ../../node_modules/hyparquet/src/wkb.js
/**
 * WKB (Well-Known Binary) decoder for geometry objects.
 *
 * @param {DataReader} reader
 * @returns {Geometry} geometry object
 */
function wkbToGeojson(reader) {
  const flags = getFlags(reader);
  if (flags.type === 1)
    return {
      type: "Point",
      coordinates: readPosition(reader, flags),
    };
  else if (flags.type === 2)
    return {
      type: "LineString",
      coordinates: readLine(reader, flags),
    };
  else if (flags.type === 3)
    return {
      type: "Polygon",
      coordinates: readPolygon(reader, flags),
    };
  else if (flags.type === 4) {
    const points = [];
    for (let i = 0; i < flags.count; i++)
      points.push(readPosition(reader, getFlags(reader)));
    return {
      type: "MultiPoint",
      coordinates: points,
    };
  } else if (flags.type === 5) {
    const lines = [];
    for (let i = 0; i < flags.count; i++)
      lines.push(readLine(reader, getFlags(reader)));
    return {
      type: "MultiLineString",
      coordinates: lines,
    };
  } else if (flags.type === 6) {
    const polygons = [];
    for (let i = 0; i < flags.count; i++)
      polygons.push(readPolygon(reader, getFlags(reader)));
    return {
      type: "MultiPolygon",
      coordinates: polygons,
    };
  } else if (flags.type === 7) {
    const geometries = [];
    for (let i = 0; i < flags.count; i++) geometries.push(wkbToGeojson(reader));
    return {
      type: "GeometryCollection",
      geometries,
    };
  } else throw new Error(`Unsupported geometry type: ${flags.type}`);
}
/**
 * Extract ISO WKB flags and base geometry type.
 *
 * @param {DataReader} reader
 * @returns {WkbFlags}
 */
function getFlags(reader) {
  const { view } = reader;
  const littleEndian = view.getUint8(reader.offset++) === 1;
  const rawType = view.getUint32(reader.offset, littleEndian);
  reader.offset += 4;
  const type = rawType % 1e3;
  const flags = Math.floor(rawType / 1e3);
  let count = 0;
  if (type > 1 && type <= 7) {
    count = view.getUint32(reader.offset, littleEndian);
    reader.offset += 4;
  }
  let dim = 2;
  if (flags) dim++;
  if (flags === 3) dim++;
  return {
    littleEndian,
    type,
    dim,
    count,
  };
}
/**
 * @param {DataReader} reader
 * @param {WkbFlags} flags
 * @returns {number[]}
 */
function readPosition(reader, flags) {
  const points = [];
  for (let i = 0; i < flags.dim; i++) {
    const coord = reader.view.getFloat64(reader.offset, flags.littleEndian);
    reader.offset += 8;
    points.push(coord);
  }
  return points;
}
/**
 * @param {DataReader} reader
 * @param {WkbFlags} flags
 * @returns {number[][]}
 */
function readLine(reader, flags) {
  const points = [];
  for (let i = 0; i < flags.count; i++)
    points.push(readPosition(reader, flags));
  return points;
}
/**
 * @param {DataReader} reader
 * @param {WkbFlags} flags
 * @returns {number[][][]}
 */
function readPolygon(reader, flags) {
  const { view } = reader;
  const rings = [];
  for (let r = 0; r < flags.count; r++) {
    const count = view.getUint32(reader.offset, flags.littleEndian);
    reader.offset += 4;
    rings.push(
      readLine(reader, {
        ...flags,
        count,
      }),
    );
  }
  return rings;
}
/**
 * @typedef {object} WkbFlags
 * @property {boolean} littleEndian
 * @property {number} type
 * @property {number} dim
 * @property {number} count
 */
/**
 * @import {DataReader, Geometry} from '../src/types.js'
 */
//#endregion
//#region ../../node_modules/hyparquet/src/convert.js
/**
 * @import {ColumnDecoder, DecodedArray, Encoding, ParquetParsers} from '../src/types.js'
 */
var decoder$2 = new TextDecoder();
/**
 * Default type parsers when no custom ones are given
 * @type ParquetParsers
 */
var DEFAULT_PARSERS = {
  timestampFromMilliseconds(millis) {
    return new Date(Number(millis));
  },
  timestampFromMicroseconds(micros) {
    return new Date(Number(micros / 1000n));
  },
  timestampFromNanoseconds(nanos) {
    return new Date(Number(nanos / 1000000n));
  },
  dateFromDays(days) {
    return /* @__PURE__ */ new Date(days * 864e5);
  },
  stringFromBytes(bytes) {
    return bytes && decoder$2.decode(bytes);
  },
  jsonFromBytes(bytes) {
    return bytes && JSON.parse(decoder$2.decode(bytes));
  },
  geometryFromBytes(bytes) {
    return (
      bytes &&
      wkbToGeojson({
        view: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
        offset: 0,
      })
    );
  },
  geographyFromBytes(bytes) {
    return (
      bytes &&
      wkbToGeojson({
        view: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
        offset: 0,
      })
    );
  },
  uuidFromBytes(bytes) {
    if (!bytes) return void 0;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return (
      hex.slice(0, 8) +
      "-" +
      hex.slice(8, 12) +
      "-" +
      hex.slice(12, 16) +
      "-" +
      hex.slice(16, 20) +
      "-" +
      hex.slice(20, 32)
    );
  },
};
/**
 * Convert known types from primitive to rich, and dereference dictionary.
 *
 * @param {DecodedArray} data series of primitive types
 * @param {DecodedArray | undefined} dictionary
 * @param {Encoding} encoding
 * @param {ColumnDecoder} columnDecoder
 * @returns {DecodedArray} series of rich types
 */
function convertWithDictionary(data, dictionary, encoding, columnDecoder) {
  if (dictionary && encoding.endsWith("_DICTIONARY")) {
    let output = data;
    if (data instanceof Uint8Array && !(dictionary instanceof Uint8Array))
      output = new dictionary.constructor(data.length);
    for (let i = 0; i < data.length; i++) output[i] = dictionary[data[i]];
    return output;
  } else return convert(data, columnDecoder);
}
/**
 * Convert known types from primitive to rich.
 *
 * @param {DecodedArray} data series of primitive types
 * @param {ColumnDecoder} columnDecoder
 * @returns {DecodedArray} series of rich types
 */
function convert(data, columnDecoder) {
  const { element, parsers, utf8 = true, schemaPath } = columnDecoder;
  const { type, converted_type: ctype, logical_type: ltype } = element;
  const nullable = element.repetition_type !== "REQUIRED";
  if (
    schemaPath?.some((s) => s.element.logical_type?.type === "VARIANT") &&
    type === "BYTE_ARRAY" &&
    ctype !== "UTF8" &&
    ltype?.type !== "STRING"
  )
    return data;
  if (ctype === "DECIMAL") {
    const factor = 10 ** -(element.scale || 0);
    const arr = new Array(data.length);
    for (let i = 0; i < arr.length; i++)
      if (data[i] instanceof Uint8Array)
        arr[i] = parseDecimal(data[i]) * factor;
      else arr[i] = Number(data[i]) * factor;
    return arr;
  }
  if (!ctype && type === "INT96")
    return Array.from(data).map((v) =>
      parsers.timestampFromNanoseconds(parseInt96Nanos(v)),
    );
  if (ctype === "DATE")
    return Array.from(data).map((v) => parsers.dateFromDays(v));
  if (ctype === "TIMESTAMP_MILLIS")
    return Array.from(data).map((v) => parsers.timestampFromMilliseconds(v));
  if (ctype === "TIMESTAMP_MICROS")
    return Array.from(data).map((v) => parsers.timestampFromMicroseconds(v));
  if (ctype === "JSON") return data.map((v) => parsers.jsonFromBytes(v));
  if (ctype === "BSON") throw new Error("parquet bson not supported");
  if (ctype === "INTERVAL") throw new Error("parquet interval not supported");
  if (ltype?.type === "GEOMETRY")
    return data.map((v) => parsers.geometryFromBytes(v));
  if (ltype?.type === "GEOGRAPHY")
    return data.map((v) => parsers.geographyFromBytes(v));
  if (ltype?.type === "UUID") return data.map((v) => parsers.uuidFromBytes(v));
  if (
    ctype === "UTF8" ||
    ltype?.type === "STRING" ||
    (utf8 && type === "BYTE_ARRAY")
  )
    return data.map((v) => parsers.stringFromBytes(v));
  if (
    ctype === "UINT_64" ||
    (ltype?.type === "INTEGER" && ltype.bitWidth === 64 && !ltype.isSigned)
  ) {
    if (data instanceof BigInt64Array)
      return new BigUint64Array(data.buffer, data.byteOffset, data.length);
    const arr = nullable
      ? new Array(data.length)
      : new BigUint64Array(data.length);
    for (let i = 0; i < arr.length; i++) arr[i] = data[i];
    return arr;
  }
  if (
    ctype === "UINT_32" ||
    (ltype?.type === "INTEGER" && ltype.bitWidth === 32 && !ltype.isSigned)
  ) {
    if (data instanceof Int32Array)
      return new Uint32Array(data.buffer, data.byteOffset, data.length);
    const arr = nullable
      ? new Array(data.length)
      : new Uint32Array(data.length);
    for (let i = 0; i < arr.length; i++)
      arr[i] = data[i] < 0 ? 4294967296 + data[i] : data[i];
    return arr;
  }
  if (ltype?.type === "FLOAT16") return Array.from(data).map(parseFloat16);
  if (ltype?.type === "TIMESTAMP") {
    const { unit } = ltype;
    /** @type {ParquetParsers[keyof ParquetParsers]} */
    let parser = parsers.timestampFromMilliseconds;
    if (unit === "MICROS") parser = parsers.timestampFromMicroseconds;
    if (unit === "NANOS") parser = parsers.timestampFromNanoseconds;
    const arr = new Array(data.length);
    for (let i = 0; i < arr.length; i++) arr[i] = parser(data[i]);
    return arr;
  }
  return data;
}
/**
 * @param {Uint8Array} bytes
 * @returns {number}
 */
function parseDecimal(bytes) {
  if (!bytes.length) return 0;
  let value = 0n;
  for (const byte of bytes) value = value * 256n + BigInt(byte);
  const bits = bytes.length * 8;
  if (value >= 2n ** BigInt(bits - 1)) value -= 2n ** BigInt(bits);
  return Number(value);
}
/**
 * Converts INT96 date format (hi 32bit days, lo 64bit nanos) to nanos since epoch
 * @param {bigint} value
 * @returns {bigint}
 */
function parseInt96Nanos(value) {
  const days = (value >> 64n) - 2440588n;
  const nano = value & 18446744073709551615n;
  return days * 86400000000000n + nano;
}
/**
 * @param {Uint8Array | undefined} bytes
 * @returns {number | undefined}
 */
function parseFloat16(bytes) {
  if (!bytes) return void 0;
  const int16 = (bytes[1] << 8) | bytes[0];
  const sign = int16 >> 15 ? -1 : 1;
  const exp = (int16 >> 10) & 31;
  const frac = int16 & 1023;
  if (exp === 0) return sign * 2 ** -14 * (frac / 1024);
  if (exp === 31) return frac ? NaN : sign * Infinity;
  return sign * 2 ** (exp - 15) * (1 + frac / 1024);
}
//#endregion
//#region ../../node_modules/hyparquet/src/schema.js
/**
 * Build a tree from the schema elements.
 *
 * @param {SchemaElement[]} schema
 * @param {number} rootIndex index of the root element
 * @param {string[]} path path to the element
 * @returns {SchemaTree} tree of schema elements
 */
function schemaTree(schema, rootIndex, path) {
  const element = schema[rootIndex];
  const children = [];
  let count = 1;
  if (element.num_children)
    while (children.length < element.num_children) {
      const childElement = schema[rootIndex + count];
      const child = schemaTree(schema, rootIndex + count, [
        ...path,
        childElement.name,
      ]);
      count += child.count;
      children.push(child);
    }
  return {
    count,
    element,
    children,
    path,
  };
}
/**
 * Get schema elements from the root to the given element name.
 *
 * @param {SchemaElement[]} schema
 * @param {string[]} name path to the element
 * @returns {SchemaTree[]} list of schema elements
 */
function getSchemaPath(schema, name) {
  let tree = schemaTree(schema, 0, []);
  const path = [tree];
  for (const part of name) {
    const child = tree.children.find((child) => child.element.name === part);
    if (!child) throw new Error(`parquet schema element not found: ${name}`);
    path.push(child);
    tree = child;
  }
  return path;
}
/**
 * Get all physical (leaf) column names.
 *
 * @param {SchemaTree} schemaTree
 * @returns {string[]} list of physical column names
 */
function getPhysicalColumns(schemaTree) {
  /** @type {string[]} */
  const columns = [];
  /** @param {SchemaTree} node */
  function traverse(node) {
    if (node.children.length)
      for (const child of node.children) traverse(child);
    else columns.push(node.path.join("."));
  }
  traverse(schemaTree);
  return columns;
}
/**
 * Get the max repetition level for a given schema path.
 *
 * @param {SchemaTree[]} schemaPath
 * @returns {number} max repetition level
 */
function getMaxRepetitionLevel(schemaPath) {
  let maxLevel = 0;
  for (const { element } of schemaPath)
    if (element.repetition_type === "REPEATED") maxLevel++;
  return maxLevel;
}
/**
 * Get the max definition level for a given schema path.
 *
 * @param {SchemaTree[]} schemaPath
 * @returns {number} max definition level
 */
function getMaxDefinitionLevel(schemaPath) {
  let maxLevel = 0;
  for (const { element } of schemaPath.slice(1))
    if (element.repetition_type !== "REQUIRED") maxLevel++;
  return maxLevel;
}
/**
 * Check if a column is list-like.
 *
 * @param {SchemaTree} schema
 * @returns {boolean} true if list-like
 */
function isListLike(schema) {
  if (!schema) return false;
  if (schema.element.converted_type !== "LIST") return false;
  if (schema.children.length > 1) return false;
  const firstChild = schema.children[0];
  if (firstChild.children.length > 1) return false;
  if (firstChild.element.repetition_type !== "REPEATED") return false;
  return true;
}
/**
 * Check if a column is map-like.
 *
 * @param {SchemaTree} schema
 * @returns {boolean} true if map-like
 */
function isMapLike(schema) {
  if (!schema) return false;
  if (schema.element.converted_type !== "MAP") return false;
  if (schema.children.length > 1) return false;
  const firstChild = schema.children[0];
  if (firstChild.children.length !== 2) return false;
  if (firstChild.element.repetition_type !== "REPEATED") return false;
  if (
    firstChild.children.find((child) => child.element.name === "key")?.element
      .repetition_type === "REPEATED"
  )
    return false;
  if (
    firstChild.children.find((child) => child.element.name === "value")?.element
      .repetition_type === "REPEATED"
  )
    return false;
  return true;
}
/**
 * Returns true if a column is non-nested.
 *
 * @param {SchemaTree[]} schemaPath
 * @returns {boolean}
 */
function isFlatColumn(schemaPath) {
  if (schemaPath.length !== 2) return false;
  const [, column] = schemaPath;
  if (column.element.repetition_type === "REPEATED") return false;
  if (column.children.length) return false;
  return true;
}
/**
 * @import {SchemaElement, SchemaTree} from '../src/types.js'
 */
//#endregion
//#region ../../node_modules/hyparquet/src/thrift.js
/**
 * @import {DataReader, ThriftObject, ThriftType} from '../src/types.js'
 */
var STOP = 0;
var TRUE = 1;
var FALSE = 2;
var BYTE = 3;
var I16 = 4;
var I32 = 5;
var I64 = 6;
var DOUBLE = 7;
var BINARY = 8;
var LIST = 9;
var STRUCT = 12;
/**
 * Parse TCompactProtocol
 *
 * @param {DataReader} reader
 * @returns {{ [key: `field_${number}`]: any }}
 */
function deserializeTCompactProtocol(reader) {
  /** @type {ThriftObject} */
  const value = {};
  let fid = 0;
  while (reader.offset < reader.view.byteLength) {
    const byte = reader.view.getUint8(reader.offset++);
    const type = byte & 15;
    if (type === STOP) break;
    const delta = byte >> 4;
    fid = delta ? fid + delta : readZigZag(reader);
    value[`field_${fid}`] = readElement(reader, type);
  }
  return value;
}
/**
 * Read a single element based on its type
 *
 * @param {DataReader} reader
 * @param {number} type
 * @returns {ThriftType}
 */
function readElement(reader, type) {
  switch (type) {
    case TRUE:
      return true;
    case FALSE:
      return false;
    case BYTE:
      return reader.view.getInt8(reader.offset++);
    case I16:
    case I32:
      return readZigZag(reader);
    case I64:
      return readZigZagBigInt(reader);
    case DOUBLE: {
      const value = reader.view.getFloat64(reader.offset, true);
      reader.offset += 8;
      return value;
    }
    case BINARY: {
      const stringLength = readVarInt(reader);
      const strBytes = new Uint8Array(
        reader.view.buffer,
        reader.view.byteOffset + reader.offset,
        stringLength,
      );
      reader.offset += stringLength;
      return strBytes;
    }
    case LIST: {
      const byte = reader.view.getUint8(reader.offset++);
      const elemType = byte & 15;
      let listSize = byte >> 4;
      if (listSize === 15) listSize = readVarInt(reader);
      const boolType = elemType === TRUE || elemType === FALSE;
      const values = new Array(listSize);
      for (let i = 0; i < listSize; i++)
        values[i] = boolType
          ? readElement(reader, BYTE) === 1
          : readElement(reader, elemType);
      return values;
    }
    case STRUCT:
      return deserializeTCompactProtocol(reader);
    default:
      throw new Error(`thrift unhandled type: ${type}`);
  }
}
/**
 * Read varint aka Unsigned LEB128.
 *
 * @param {DataReader} reader
 * @returns {number}
 */
function readVarInt(reader) {
  let result = 0;
  let shift = 0;
  while (true) {
    const byte = reader.view.getUint8(reader.offset++);
    result |= (byte & 127) << shift;
    if (!(byte & 128)) return result;
    shift += 7;
  }
}
/**
 * Read a varint as a bigint.
 *
 * @param {DataReader} reader
 * @returns {bigint}
 */
function readVarBigInt(reader) {
  let result = 0n;
  let shift = 0n;
  while (true) {
    const byte = reader.view.getUint8(reader.offset++);
    result |= BigInt(byte & 127) << shift;
    if (!(byte & 128)) return result;
    shift += 7n;
  }
}
/**
 * Read a zigzag number.
 * Zigzag folds positive and negative numbers into the positive number space.
 *
 * @param {DataReader} reader
 * @returns {number}
 */
function readZigZag(reader) {
  const zigzag = readVarInt(reader);
  return (zigzag >>> 1) ^ -(zigzag & 1);
}
/**
 * Read a zigzag bigint.
 *
 * @param {DataReader} reader
 * @returns {bigint}
 */
function readZigZagBigInt(reader) {
  const zigzag = readVarBigInt(reader);
  return (zigzag >> 1n) ^ -(zigzag & 1n);
}
//#endregion
//#region ../../node_modules/hyparquet/src/geoparquet.js
/**
 * @param {SchemaElement[]} schema
 * @param {KeyValue[] | undefined} key_value_metadata
 * @returns {void}
 */
function markGeoColumns(schema, key_value_metadata) {
  /** @type {Map<string, LogicalType>} */
  const columns = /* @__PURE__ */ new Map();
  const geo = key_value_metadata?.find(({ key }) => key === "geo")?.value;
  const decodedColumns = (geo && JSON.parse(geo)?.columns) ?? {};
  for (const [name, column] of Object.entries(decodedColumns)) {
    if (column.encoding !== "WKB") continue;
    const type = column.edges === "spherical" ? "GEOGRAPHY" : "GEOMETRY";
    const id = column.crs?.id ?? column.crs?.ids?.[0];
    const crs = id ? `${id.authority}:${id.code.toString()}` : void 0;
    columns.set(name, {
      type,
      crs,
    });
  }
  for (let i = 1; i < schema.length; i++) {
    const { logical_type, name, num_children, type } = schema[i];
    if (num_children) {
      i += num_children;
      continue;
    }
    if (type === "BYTE_ARRAY" && !logical_type)
      schema[i].logical_type = columns.get(name);
  }
}
/**
 * @import {KeyValue, LogicalType, SchemaElement} from '../src/types.js'
 */
//#endregion
//#region ../../node_modules/hyparquet/src/metadata.js
/**
 * @import {AsyncBuffer, FileMetaData, KeyValue, LogicalType, MetadataOptions, MinMaxType, ParquetParsers, SchemaElement, SchemaTree, Statistics, TimeUnit} from '../src/types.js'
 */
var defaultInitialFetchSize = 1 << 19;
var decoder$1 = new TextDecoder();
function decode(value) {
  return value && decoder$1.decode(value);
}
/**
 * Read parquet metadata from an async buffer.
 *
 * An AsyncBuffer is like an ArrayBuffer, but the slices are loaded
 * asynchronously, possibly over the network.
 *
 * You must provide the byteLength of the buffer, typically from a HEAD request.
 *
 * In theory, you could use suffix-range requests to fetch the end of the file,
 * and save a round trip. But in practice, this doesn't work because chrome
 * deems suffix-range requests as a not-safe-listed header, and will require
 * a pre-flight. So the byteLength is required.
 *
 * To make this efficient, we initially request the last 512kb of the file,
 * which is likely to contain the metadata. If the metadata length exceeds the
 * initial fetch, 512kb, we request the rest of the metadata from the AsyncBuffer.
 *
 * This ensures that we either make one 512kb initial request for the metadata,
 * or a second request for up to the metadata size.
 *
 * @param {AsyncBuffer} asyncBuffer parquet file contents
 * @param {MetadataOptions & { initialFetchSize?: number }} options initial fetch size in bytes (default 512kb)
 * @returns {Promise<FileMetaData>} parquet metadata object
 */
async function parquetMetadataAsync(
  asyncBuffer,
  {
    parsers,
    initialFetchSize = defaultInitialFetchSize,
    geoparquet = true,
  } = {},
) {
  if (!asyncBuffer || !(asyncBuffer.byteLength >= 0))
    throw new Error("parquet expected AsyncBuffer");
  const footerOffset = Math.max(0, asyncBuffer.byteLength - initialFetchSize);
  const footerBuffer = await asyncBuffer.slice(
    footerOffset,
    asyncBuffer.byteLength,
  );
  const footerView = new DataView(footerBuffer);
  if (footerView.getUint32(footerBuffer.byteLength - 4, true) !== 827474256)
    throw new Error("parquet file invalid (footer != PAR1)");
  const metadataLength = footerView.getUint32(
    footerBuffer.byteLength - 8,
    true,
  );
  if (metadataLength > asyncBuffer.byteLength - 8)
    throw new Error(
      `parquet metadata length ${metadataLength} exceeds available buffer ${asyncBuffer.byteLength - 8}`,
    );
  if (metadataLength + 8 > initialFetchSize) {
    const metadataOffset = asyncBuffer.byteLength - metadataLength - 8;
    const metadataBuffer = await asyncBuffer.slice(
      metadataOffset,
      footerOffset,
    );
    const combinedBuffer = new ArrayBuffer(metadataLength + 8);
    const combinedView = new Uint8Array(combinedBuffer);
    combinedView.set(new Uint8Array(metadataBuffer));
    combinedView.set(
      new Uint8Array(footerBuffer),
      footerOffset - metadataOffset,
    );
    return parquetMetadata(combinedBuffer, {
      parsers,
      geoparquet,
    });
  } else
    return parquetMetadata(footerBuffer, {
      parsers,
      geoparquet,
    });
}
/**
 * Read parquet metadata from a buffer synchronously.
 *
 * @param {ArrayBuffer} arrayBuffer parquet file footer
 * @param {MetadataOptions} options metadata parsing options
 * @returns {FileMetaData} parquet metadata object
 */
function parquetMetadata(arrayBuffer, { parsers, geoparquet = true } = {}) {
  if (!(arrayBuffer instanceof ArrayBuffer))
    throw new Error("parquet expected ArrayBuffer");
  const view = new DataView(arrayBuffer);
  const allParsers = {
    ...DEFAULT_PARSERS,
    ...parsers,
  };
  if (view.byteLength < 8) throw new Error("parquet file is too short");
  if (view.getUint32(view.byteLength - 4, true) !== 827474256)
    throw new Error("parquet file invalid (footer != PAR1)");
  const metadataLengthOffset = view.byteLength - 8;
  const metadataLength = view.getUint32(metadataLengthOffset, true);
  if (metadataLength > view.byteLength - 8)
    throw new Error(
      `parquet metadata length ${metadataLength} exceeds available buffer ${view.byteLength - 8}`,
    );
  const metadata = deserializeTCompactProtocol({
    view,
    offset: metadataLengthOffset - metadataLength,
  });
  const version = metadata.field_1;
  /** @type {SchemaElement[]} */
  const schema = metadata.field_2.map((field) => ({
    type: ParquetTypes[field.field_1],
    type_length: field.field_2,
    repetition_type: FieldRepetitionTypes[field.field_3],
    name: decode(field.field_4),
    num_children: field.field_5,
    converted_type: ConvertedTypes[field.field_6],
    scale: field.field_7,
    precision: field.field_8,
    field_id: field.field_9,
    logical_type: logicalType(field.field_10),
  }));
  const columnSchema = schema.filter((e) => e.type);
  const num_rows = metadata.field_3;
  const row_groups = metadata.field_4.map((rowGroup) => ({
    columns: rowGroup.field_1.map((column, columnIndex) => ({
      file_path: decode(column.field_1),
      file_offset: column.field_2,
      meta_data: column.field_3 && {
        type: ParquetTypes[column.field_3.field_1],
        encodings: column.field_3.field_2?.map((e) => Encodings[e]),
        path_in_schema: column.field_3.field_3.map(decode),
        codec: CompressionCodecs[column.field_3.field_4],
        num_values: column.field_3.field_5,
        total_uncompressed_size: column.field_3.field_6,
        total_compressed_size: column.field_3.field_7,
        key_value_metadata: column.field_3.field_8?.map((kv) => ({
          key: decode(kv.field_1),
          value: decode(kv.field_2),
        })),
        data_page_offset: column.field_3.field_9,
        index_page_offset: column.field_3.field_10,
        dictionary_page_offset: column.field_3.field_11,
        statistics: convertStats(
          column.field_3.field_12,
          columnSchema[columnIndex],
          allParsers,
        ),
        encoding_stats: column.field_3.field_13?.map((encodingStat) => ({
          page_type: PageTypes[encodingStat.field_1],
          encoding: Encodings[encodingStat.field_2],
          count: encodingStat.field_3,
        })),
        bloom_filter_offset: column.field_3.field_14,
        bloom_filter_length: column.field_3.field_15,
        size_statistics: column.field_3.field_16 && {
          unencoded_byte_array_data_bytes: column.field_3.field_16.field_1,
          repetition_level_histogram: column.field_3.field_16.field_2,
          definition_level_histogram: column.field_3.field_16.field_3,
        },
        geospatial_statistics: column.field_3.field_17 && {
          bbox: column.field_3.field_17.field_1 && {
            xmin: column.field_3.field_17.field_1.field_1,
            xmax: column.field_3.field_17.field_1.field_2,
            ymin: column.field_3.field_17.field_1.field_3,
            ymax: column.field_3.field_17.field_1.field_4,
            zmin: column.field_3.field_17.field_1.field_5,
            zmax: column.field_3.field_17.field_1.field_6,
            mmin: column.field_3.field_17.field_1.field_7,
            mmax: column.field_3.field_17.field_1.field_8,
          },
          geospatial_types: column.field_3.field_17.field_2,
        },
      },
      offset_index_offset: column.field_4,
      offset_index_length: column.field_5,
      column_index_offset: column.field_6,
      column_index_length: column.field_7,
      crypto_metadata: column.field_8,
      encrypted_column_metadata: column.field_9,
    })),
    total_byte_size: rowGroup.field_2,
    num_rows: rowGroup.field_3,
    sorting_columns: rowGroup.field_4?.map((sortingColumn) => ({
      column_idx: sortingColumn.field_1,
      descending: sortingColumn.field_2,
      nulls_first: sortingColumn.field_3,
    })),
    file_offset: rowGroup.field_5,
    total_compressed_size: rowGroup.field_6,
    ordinal: rowGroup.field_7,
  }));
  /** @type {KeyValue[] | undefined} */
  const key_value_metadata = metadata.field_5?.map((kv) => ({
    key: decode(kv.field_1),
    value: decode(kv.field_2),
  }));
  const created_by = decode(metadata.field_6);
  if (geoparquet) markGeoColumns(schema, key_value_metadata);
  return {
    version,
    schema,
    num_rows,
    row_groups,
    key_value_metadata,
    created_by,
    metadata_length: metadataLength,
  };
}
/**
 * Return a tree of schema elements from parquet metadata.
 *
 * @param {{schema: SchemaElement[]}} metadata parquet metadata object
 * @returns {SchemaTree} tree of schema elements
 */
function parquetSchema({ schema }) {
  return getSchemaPath(schema, [])[0];
}
/**
 * @param {any} logicalType
 * @returns {LogicalType | undefined}
 */
function logicalType(logicalType) {
  if (logicalType?.field_1) return { type: "STRING" };
  if (logicalType?.field_2) return { type: "MAP" };
  if (logicalType?.field_3) return { type: "LIST" };
  if (logicalType?.field_4) return { type: "ENUM" };
  if (logicalType?.field_5)
    return {
      type: "DECIMAL",
      scale: logicalType.field_5.field_1,
      precision: logicalType.field_5.field_2,
    };
  if (logicalType?.field_6) return { type: "DATE" };
  if (logicalType?.field_7)
    return {
      type: "TIME",
      isAdjustedToUTC: logicalType.field_7.field_1,
      unit: timeUnit(logicalType.field_7.field_2),
    };
  if (logicalType?.field_8)
    return {
      type: "TIMESTAMP",
      isAdjustedToUTC: logicalType.field_8.field_1,
      unit: timeUnit(logicalType.field_8.field_2),
    };
  if (logicalType?.field_10)
    return {
      type: "INTEGER",
      bitWidth: logicalType.field_10.field_1,
      isSigned: logicalType.field_10.field_2,
    };
  if (logicalType?.field_11) return { type: "NULL" };
  if (logicalType?.field_12) return { type: "JSON" };
  if (logicalType?.field_13) return { type: "BSON" };
  if (logicalType?.field_14) return { type: "UUID" };
  if (logicalType?.field_15) return { type: "FLOAT16" };
  if (logicalType?.field_16)
    return {
      type: "VARIANT",
      specification_version: logicalType.field_16.field_1,
    };
  if (logicalType?.field_17)
    return {
      type: "GEOMETRY",
      crs: decode(logicalType.field_17.field_1),
    };
  if (logicalType?.field_18)
    return {
      type: "GEOGRAPHY",
      crs: decode(logicalType.field_18.field_1),
      algorithm: EdgeInterpolationAlgorithms[logicalType.field_18.field_2],
    };
  return logicalType;
}
/**
 * @param {any} unit
 * @returns {TimeUnit}
 */
function timeUnit(unit) {
  if (unit.field_1) return "MILLIS";
  if (unit.field_2) return "MICROS";
  if (unit.field_3) return "NANOS";
  throw new Error("parquet time unit required");
}
/**
 * Convert column statistics based on column type.
 *
 * @param {any} stats
 * @param {SchemaElement} schema
 * @param {ParquetParsers} parsers
 * @returns {Statistics}
 */
function convertStats(stats, schema, parsers) {
  return (
    stats && {
      max: convertMetadata(stats.field_1, schema, parsers),
      min: convertMetadata(stats.field_2, schema, parsers),
      null_count: stats.field_3,
      distinct_count: stats.field_4,
      max_value: convertMetadata(stats.field_5, schema, parsers),
      min_value: convertMetadata(stats.field_6, schema, parsers),
      is_max_value_exact: stats.field_7,
      is_min_value_exact: stats.field_8,
    }
  );
}
/**
 * @param {Uint8Array | undefined} value
 * @param {SchemaElement} schema
 * @param {ParquetParsers} parsers
 * @returns {MinMaxType | undefined}
 */
function convertMetadata(value, schema, parsers) {
  const { type, converted_type, logical_type } = schema;
  if (value === void 0) return value;
  if (type === "BOOLEAN") return value[0] === 1;
  if (type === "BYTE_ARRAY") return parsers.stringFromBytes(value);
  const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
  if (type === "FLOAT" && view.byteLength === 4)
    return view.getFloat32(0, true);
  if (type === "DOUBLE" && view.byteLength === 8)
    return view.getFloat64(0, true);
  if (type === "INT32" && converted_type === "DECIMAL" && view.byteLength === 4)
    return view.getInt32(0, true) * 10 ** -(schema.scale || 0);
  if (type === "INT64" && converted_type === "DECIMAL" && view.byteLength === 8)
    return Number(view.getBigInt64(0, true)) * 10 ** -(schema.scale || 0);
  if (type === "INT32" && converted_type === "DATE")
    return parsers.dateFromDays(view.getInt32(0, true));
  if (type === "INT64" && converted_type === "TIMESTAMP_MILLIS")
    return parsers.timestampFromMilliseconds(view.getBigInt64(0, true));
  if (type === "INT64" && converted_type === "TIMESTAMP_MICROS")
    return parsers.timestampFromMicroseconds(view.getBigInt64(0, true));
  if (
    type === "INT64" &&
    logical_type?.type === "TIMESTAMP" &&
    logical_type?.unit === "NANOS"
  )
    return parsers.timestampFromNanoseconds(view.getBigInt64(0, true));
  if (
    type === "INT64" &&
    logical_type?.type === "TIMESTAMP" &&
    logical_type?.unit === "MICROS"
  )
    return parsers.timestampFromMicroseconds(view.getBigInt64(0, true));
  if (type === "INT64" && logical_type?.type === "TIMESTAMP")
    return parsers.timestampFromMilliseconds(view.getBigInt64(0, true));
  const unsigned =
    converted_type?.startsWith("UINT_") ||
    (logical_type?.type === "INTEGER" && !logical_type.isSigned);
  if (type === "INT32" && unsigned && view.byteLength === 4)
    return view.getUint32(0, true);
  if (type === "INT64" && unsigned && view.byteLength === 8)
    return view.getBigUint64(0, true);
  if (type === "INT32" && view.byteLength === 4) return view.getInt32(0, true);
  if (type === "INT64" && view.byteLength === 8)
    return view.getBigInt64(0, true);
  if (converted_type === "DECIMAL")
    return parseDecimal(value) * 10 ** -(schema.scale || 0);
  if (logical_type?.type === "FLOAT16") return parseFloat16(value);
  if (logical_type?.type === "UUID") return parsers.uuidFromBytes(value);
  if (type === "FIXED_LEN_BYTE_ARRAY") return value;
  return value;
}
//#endregion
//#region ../../node_modules/hyparquet/src/indexes.js
/**
 * @import {ColumnIndex, DataReader, OffsetIndex, PageLocation, ParquetParsers, SchemaElement} from '../src/types.js'
 */
/**
 * @param {DataReader} reader
 * @param {SchemaElement} schema
 * @param {Partial<ParquetParsers> | undefined} parsers
 * @returns {ColumnIndex}
 */
function readColumnIndex(reader, schema, parsers = void 0) {
  const allParsers = {
    ...DEFAULT_PARSERS,
    ...parsers,
  };
  const thrift = deserializeTCompactProtocol(reader);
  return {
    null_pages: thrift.field_1,
    min_values: thrift.field_2.map((m) =>
      convertMetadata(m, schema, allParsers),
    ),
    max_values: thrift.field_3.map((m) =>
      convertMetadata(m, schema, allParsers),
    ),
    boundary_order: BoundaryOrders[thrift.field_4],
    null_counts: thrift.field_5,
    repetition_level_histograms: thrift.field_6,
    definition_level_histograms: thrift.field_7,
  };
}
/**
 * @param {DataReader} reader
 * @returns {OffsetIndex}
 */
function readOffsetIndex(reader) {
  const thrift = deserializeTCompactProtocol(reader);
  return {
    page_locations: thrift.field_1.map((loc) => ({
      offset: loc.field_1,
      compressed_page_size: loc.field_2,
      first_row_index: loc.field_3,
    })),
    unencoded_byte_array_data_bytes: thrift.field_2,
  };
}
//#endregion
//#region ../../node_modules/hyparquet/src/xxhash.js
var MASK = 18446744073709551615n;
var PRIME1 = 11400714785074694791n;
var PRIME2 = 14029467366897019727n;
var PRIME3 = 1609587929392839161n;
var PRIME4 = 9650029242287828579n;
var PRIME5 = 2870177450012600261n;
/**
 * @param {bigint} x
 * @param {bigint} r rotation amount in bits (1..63)
 * @returns {bigint}
 */
function rotl64(x, r) {
  return ((x << r) | (x >> (64n - r))) & MASK;
}
/**
 * @param {bigint} acc
 * @param {bigint} val
 * @returns {bigint}
 */
function round(acc, val) {
  acc = (acc + val * PRIME2) & MASK;
  acc = rotl64(acc, 31n);
  return (acc * PRIME1) & MASK;
}
/**
 * @param {bigint} acc
 * @param {bigint} val
 * @returns {bigint}
 */
function mergeRound(acc, val) {
  acc ^= round(0n, val);
  return (acc * PRIME1 + PRIME4) & MASK;
}
/**
 * Compute the 64-bit xxHash of a byte buffer.
 *
 * @param {Uint8Array} input
 * @param {bigint} [seed]
 * @returns {bigint} 64-bit hash
 */
function xxhash64(input, seed = 0n) {
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);
  const len = input.byteLength;
  let offset = 0;
  let h64;
  if (len >= 32) {
    let v1 = (seed + PRIME1 + PRIME2) & MASK;
    let v2 = (seed + PRIME2) & MASK;
    let v3 = seed;
    let v4 = (seed - PRIME1) & MASK;
    while (offset + 32 <= len) {
      v1 = round(v1, view.getBigUint64(offset, true));
      offset += 8;
      v2 = round(v2, view.getBigUint64(offset, true));
      offset += 8;
      v3 = round(v3, view.getBigUint64(offset, true));
      offset += 8;
      v4 = round(v4, view.getBigUint64(offset, true));
      offset += 8;
    }
    h64 =
      (rotl64(v1, 1n) + rotl64(v2, 7n) + rotl64(v3, 12n) + rotl64(v4, 18n)) &
      MASK;
    h64 = mergeRound(h64, v1);
    h64 = mergeRound(h64, v2);
    h64 = mergeRound(h64, v3);
    h64 = mergeRound(h64, v4);
  } else h64 = (seed + PRIME5) & MASK;
  h64 = (h64 + BigInt(len)) & MASK;
  while (offset + 8 <= len) {
    h64 ^= round(0n, view.getBigUint64(offset, true));
    h64 = (rotl64(h64, 27n) * PRIME1 + PRIME4) & MASK;
    offset += 8;
  }
  if (offset + 4 <= len) {
    h64 ^= (BigInt(view.getUint32(offset, true)) * PRIME1) & MASK;
    h64 = (rotl64(h64, 23n) * PRIME2 + PRIME3) & MASK;
    offset += 4;
  }
  while (offset < len) {
    h64 ^= (BigInt(view.getUint8(offset)) * PRIME5) & MASK;
    h64 = (rotl64(h64, 11n) * PRIME1) & MASK;
    offset += 1;
  }
  h64 ^= h64 >> 33n;
  h64 = (h64 * PRIME2) & MASK;
  h64 ^= h64 >> 29n;
  h64 = (h64 * PRIME3) & MASK;
  h64 ^= h64 >> 32n;
  return h64;
}
//#endregion
//#region ../../node_modules/hyparquet/src/bloom.js
/**
 * @import {BloomFilter, DataReader, ParquetQueryFilter, SchemaElement} from '../src/types.js'
 */
var textEncoder = new TextEncoder();
var SALT = new Uint32Array([
  1203114875, 1150766481, 2284105051, 2729912477, 1884591559, 770785867,
  2667333959, 1550580529,
]);
/**
 * Map the high 32 bits of a hash to a block index in [0, numBlocks).
 *
 * @param {bigint} hash
 * @param {number} numBlocks
 * @returns {number}
 */
function blockIndex(hash, numBlocks) {
  return Number(((hash >> 32n) * BigInt(numBlocks)) >> 32n);
}
/**
 * Per-block mask: 8 uint32 words, each with a single bit set at position `(low32 * SALT[i]) >> 27`.
 *
 * @param {bigint} hash
 * @returns {Uint32Array}
 */
function blockMask(hash) {
  const m = /* @__PURE__ */ new Uint32Array(8);
  const low = Number(hash & 4294967295n) | 0;
  for (let i = 0; i < 8; i++) m[i] = 1 << (Math.imul(low, SALT[i]) >>> 27);
  return m;
}
/**
 * Test whether a hash might be present in a Split Block Bloom Filter.
 * False positives are possible; false negatives are not.
 *
 * @param {Uint32Array} blocks bloom filter words (8 * numBlocks long)
 * @param {bigint} hash 64-bit xxhash of the parquet-plain-encoded value
 * @returns {boolean}
 */
function sbbfContains(blocks, hash) {
  const offset = blockIndex(hash, blocks.length >> 3) << 3;
  const m = blockMask(hash);
  for (let i = 0; i < 8; i++)
    if ((blocks[offset + i] & m[i]) === 0) return false;
  return true;
}
/**
 * Parse a Split Block Bloom Filter from a reader positioned at the BloomFilterHeader.
 * Returns undefined when the header advertises an unsupported algorithm, hash, or
 * compression — callers should treat that as "cannot use this bloom filter."
 *
 * @param {DataReader} reader
 * @returns {BloomFilter | undefined}
 */
function readBloomFilter(reader) {
  const header = deserializeTCompactProtocol(reader);
  const numBytes = header.field_1;
  if (typeof numBytes !== "number" || numBytes <= 0 || numBytes % 32 !== 0)
    return void 0;
  if (!header.field_2?.field_1) return void 0;
  if (!header.field_3?.field_1) return void 0;
  if (!header.field_4?.field_1) return void 0;
  const { view, offset } = reader;
  if (offset + numBytes > view.byteLength)
    throw new Error(
      `parquet bloom filter truncated: need ${numBytes} bytes, have ${view.byteLength - offset}`,
    );
  const blocks = new Uint32Array(numBytes >> 2);
  for (let i = 0; i < blocks.length; i++)
    blocks[i] = view.getUint32(offset + i * 4, true);
  reader.offset = offset + numBytes;
  return {
    numBytes,
    blocks,
  };
}
/**
 * Hash a JS filter value as its parquet PLAIN-encoded bytes, suitable for a
 * bloom filter lookup. Returns undefined when the column's parser is lossy or
 * ambiguous (DATE, TIMESTAMP_*, DECIMAL, JSON, BSON, INT96, FLOAT16, UUID,
 * GEOMETRY, GEOGRAPHY, INTERVAL) or when the JS value type doesn't match the
 * column. Callers must treat undefined as "bloom filter cannot help."
 *
 * @param {any} value
 * @param {SchemaElement} element
 * @returns {bigint | undefined}
 */
function hashParquetValue(value, element) {
  if (value === null || value === void 0) return void 0;
  const { type, converted_type, logical_type } = element;
  if (type === "BOOLEAN") {
    if (typeof value !== "boolean") return void 0;
    return xxhash64(new Uint8Array([value ? 1 : 0]));
  }
  if (type === "FLOAT") {
    if (typeof value !== "number") return void 0;
    const buf = /* @__PURE__ */ new ArrayBuffer(4);
    new DataView(buf).setFloat32(0, value, true);
    return xxhash64(new Uint8Array(buf));
  }
  if (type === "DOUBLE") {
    if (typeof value !== "number") return void 0;
    const buf = /* @__PURE__ */ new ArrayBuffer(8);
    new DataView(buf).setFloat64(0, value, true);
    return xxhash64(new Uint8Array(buf));
  }
  if (type === "INT32") {
    if (
      converted_type === "DATE" ||
      converted_type === "DECIMAL" ||
      converted_type === "TIME_MILLIS"
    )
      return void 0;
    if (
      logical_type?.type === "DATE" ||
      logical_type?.type === "TIME" ||
      logical_type?.type === "DECIMAL"
    )
      return void 0;
    if (typeof value !== "number" || !Number.isInteger(value)) return void 0;
    const buf = /* @__PURE__ */ new ArrayBuffer(4);
    new DataView(buf).setInt32(0, value | 0, true);
    return xxhash64(new Uint8Array(buf));
  }
  if (type === "INT64") {
    if (
      converted_type === "TIMESTAMP_MILLIS" ||
      converted_type === "TIMESTAMP_MICROS"
    )
      return void 0;
    if (converted_type === "TIME_MICROS" || converted_type === "DECIMAL")
      return void 0;
    if (
      logical_type?.type === "TIMESTAMP" ||
      logical_type?.type === "TIME" ||
      logical_type?.type === "DECIMAL"
    )
      return void 0;
    let bigValue;
    if (typeof value === "bigint") bigValue = value;
    else if (typeof value === "number" && Number.isSafeInteger(value))
      bigValue = BigInt(value);
    else return void 0;
    const buf = /* @__PURE__ */ new ArrayBuffer(8);
    new DataView(buf).setBigUint64(0, BigInt.asUintN(64, bigValue), true);
    return xxhash64(new Uint8Array(buf));
  }
  if (type === "BYTE_ARRAY") {
    if (
      converted_type === "JSON" ||
      converted_type === "BSON" ||
      converted_type === "DECIMAL"
    )
      return void 0;
    if (
      logical_type?.type === "JSON" ||
      logical_type?.type === "BSON" ||
      logical_type?.type === "VARIANT"
    )
      return void 0;
    if (logical_type?.type === "GEOMETRY" || logical_type?.type === "GEOGRAPHY")
      return void 0;
    if (typeof value === "string") return xxhash64(textEncoder.encode(value));
    if (value instanceof Uint8Array) return xxhash64(value);
    return;
  }
  if (type === "FIXED_LEN_BYTE_ARRAY") {
    if (converted_type === "DECIMAL" || converted_type === "INTERVAL")
      return void 0;
    if (
      logical_type?.type === "DECIMAL" ||
      logical_type?.type === "UUID" ||
      logical_type?.type === "FLOAT16"
    )
      return void 0;
    if (logical_type?.type === "GEOMETRY" || logical_type?.type === "GEOGRAPHY")
      return void 0;
    if (value instanceof Uint8Array) return xxhash64(value);
    return;
  }
}
/**
 * Top-level column names that appear in $eq or $in predicates within a filter.
 * These are the only columns where a bloom filter can prove a value's absence
 * and let us skip a row group; any other operator can't be helped by a bloom.
 *
 * @param {ParquetQueryFilter | undefined} filter
 * @returns {Set<string>}
 */
function bloomEligibleColumns(filter) {
  /** @type {Set<string>} */
  const out = /* @__PURE__ */ new Set();
  walkBloomEligible(filter, out);
  return out;
}
/**
 * @param {ParquetQueryFilter | undefined} filter
 * @param {Set<string>} out
 */
function walkBloomEligible(filter, out) {
  if (!filter) return;
  if ("$and" in filter && Array.isArray(filter.$and)) {
    for (const sub of filter.$and) walkBloomEligible(sub, out);
    return;
  }
  if ("$or" in filter && Array.isArray(filter.$or)) {
    for (const sub of filter.$or) walkBloomEligible(sub, out);
    return;
  }
  if ("$nor" in filter) return;
  for (const [field, condition] of Object.entries(filter)) {
    if (field.startsWith("$")) continue;
    if (
      typeof condition === "object" &&
      condition !== null &&
      !Array.isArray(condition)
    ) {
      if ("$eq" in condition || "$in" in condition) out.add(field);
    } else out.add(field);
  }
}
//#endregion
//#region ../../node_modules/hyparquet/src/utils.js
/**
 * Concatenate two arrays fast.
 *
 * @param {any[]} aaa
 * @param {DecodedArray} bbb
 */
function concat(aaa, bbb) {
  const chunk = 1e4;
  for (let i = 0; i < bbb.length; i += chunk)
    aaa.push(...bbb.slice(i, i + chunk));
}
/**
 * Deep equality.
 *
 * @param {any} a
 * @param {any} b
 * @param {boolean} [strict]
 * @returns {boolean}
 */
function equals(a, b, strict = true) {
  if (strict ? a === b : a == b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (a instanceof Uint8Array && b instanceof Uint8Array) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  if (a instanceof Date || b instanceof Date)
    return (
      a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
    );
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++)
      if (!equals(a[i], b[i], strict)) return false;
    return true;
  }
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) return false;
  for (const k of aKeys) if (!equals(a[k], b[k], strict)) return false;
  return true;
}
/**
 * Get the byte length using fetch with a ranged GET request.
 * Aborts the request if server returns 200 instead of 206.
 *
 * @param {string} url
 * @param {RequestInit} [requestInit] fetch options
 * @param {typeof globalThis.fetch} [fetchFn] fetch function to use
 * @returns {Promise<number>}
 */
async function byteLengthFromUrlUsingGet(
  url,
  requestInit = {},
  fetchFn = globalThis.fetch,
) {
  const controller = new AbortController();
  const headers = new Headers(requestInit.headers);
  headers.set("Range", "bytes=0-0");
  const res = await fetchFn(url, {
    ...requestInit,
    headers,
    signal: controller.signal,
  });
  if (!res.ok) throw new Error(`fetch with range failed ${res.status}`);
  if (res.status === 206) {
    const contentRange = res.headers.get("Content-Range");
    if (!contentRange) throw new Error("missing content-range header");
    const match = contentRange.match(/bytes \d+-\d+\/(\d+)/);
    if (!match)
      throw new Error(`invalid content-range header: ${contentRange}`);
    return parseInt(match[1]);
  }
  if (res.status === 200) {
    const contentLength = res.headers.get("Content-Length");
    controller.abort();
    if (contentLength) return parseInt(contentLength);
  }
  throw new Error(
    "server does not support range requests and missing content-length",
  );
}
/**
 * Get the byte length of a URL using a HEAD request.
 * If HEAD fails with 403 (e.g., with signed S3 URLs), falls back to a ranged GET request.
 * If HEAD succeeds but Content-Length is missing, falls back to GET with range.
 * If requestInit is provided, it will be passed to fetch.
 *
 * @param {string} url
 * @param {RequestInit} [requestInit] fetch options
 * @param {typeof globalThis.fetch} [customFetch] fetch function to use
 * @returns {Promise<number>}
 */
async function byteLengthFromUrl(url, requestInit, customFetch) {
  const fetch = customFetch ?? globalThis.fetch;
  const res = await fetch(url, {
    ...requestInit,
    method: "HEAD",
  });
  if (res.status === 403)
    return byteLengthFromUrlUsingGet(url, requestInit, fetch);
  if (!res.ok) throw new Error(`fetch head failed ${res.status}`);
  const length = res.headers.get("Content-Length");
  if (!length) return byteLengthFromUrlUsingGet(url, requestInit, fetch);
  return parseInt(length);
}
/**
 * Construct an AsyncBuffer for a URL.
 * If byteLength is not provided, will make a HEAD request to get the file size.
 * If fetch is provided, it will be used instead of the global fetch.
 * If requestInit is provided, it will be passed to fetch.
 *
 * @param {object} options
 * @param {string} options.url
 * @param {number} [options.byteLength]
 * @param {typeof globalThis.fetch} [options.fetch] fetch function to use
 * @param {RequestInit} [options.requestInit]
 * @returns {Promise<AsyncBuffer>}
 */
async function asyncBufferFromUrl({
  url,
  byteLength,
  requestInit,
  fetch: customFetch,
}) {
  if (!url) throw new Error("missing url");
  const fetch = customFetch ?? globalThis.fetch;
  byteLength ??= await byteLengthFromUrl(url, requestInit, fetch);
  /**
   * A promise for the whole buffer, if range requests are not supported.
   * @type {Promise<ArrayBuffer>|undefined}
   */
  let buffer = void 0;
  const init = requestInit || {};
  return {
    byteLength,
    async slice(start, end) {
      if (buffer) return buffer.then((buffer) => buffer.slice(start, end));
      const headers = new Headers(init.headers);
      const endStr = end === void 0 ? "" : end - 1;
      headers.set("Range", `bytes=${start}-${endStr}`);
      const res = await fetch(url, {
        ...init,
        headers,
      });
      if (!res.ok || !res.body) throw new Error(`fetch failed ${res.status}`);
      if (res.status === 200) {
        buffer = res.arrayBuffer();
        return buffer.then((buffer) => buffer.slice(start, end));
      } else if (res.status === 206) return res.arrayBuffer();
      else
        throw new Error(`fetch received unexpected status code ${res.status}`);
    },
  };
}
/**
 * Flatten a list of lists into a single list.
 *
 * @param {DecodedArray[]} [chunks]
 * @returns {DecodedArray}
 */
function flatten(chunks) {
  if (!chunks) return [];
  if (chunks.length === 1) return chunks[0];
  /** @type {any[]} */
  const output = [];
  for (const chunk of chunks) concat(output, chunk);
  return output;
}
//#endregion
//#region ../../node_modules/hyparquet/src/filter.js
/**
 * @import {BloomFilter, ColumnPageStats, PageRanges, ParquetQueryFilter, RowGroup, SchemaElement} from '../src/types.js'
 */
var encoder = new TextEncoder();
/**
 * Returns the physical leaf paths referenced by a filter.
 *
 * @param {ParquetQueryFilter} [filter]
 * @returns {string[]}
 */
function pathsNeededForFilter(filter) {
  if (!filter) return [];
  /** @type {string[]} */
  const paths = [];
  if ("$and" in filter && Array.isArray(filter.$and))
    paths.push(...filter.$and.flatMap(pathsNeededForFilter));
  else if ("$or" in filter && Array.isArray(filter.$or))
    paths.push(...filter.$or.flatMap(pathsNeededForFilter));
  else if ("$nor" in filter && Array.isArray(filter.$nor))
    paths.push(...filter.$nor.flatMap(pathsNeededForFilter));
  else paths.push(...Object.keys(filter));
  return [...new Set(paths)];
}
/**
 * Returns an array of top-level column names needed to evaluate the filter.
 *
 * @param {ParquetQueryFilter} [filter]
 * @returns {string[]}
 */
function columnsNeededForFilter(filter) {
  return [
    ...new Set(pathsNeededForFilter(filter).map((path) => path.split(".")[0])),
  ];
}
/**
 * Match a record against a query filter
 *
 * @param {Record<string, any>} record
 * @param {ParquetQueryFilter} filter
 * @param {boolean} [strict]
 * @returns {boolean}
 */
function matchFilter(record, filter, strict = true) {
  if ("$and" in filter && Array.isArray(filter.$and))
    return filter.$and.every((subQuery) =>
      matchFilter(record, subQuery, strict),
    );
  if ("$or" in filter && Array.isArray(filter.$or))
    return filter.$or.some((subQuery) => matchFilter(record, subQuery, strict));
  if ("$nor" in filter && Array.isArray(filter.$nor))
    return !filter.$nor.some((subQuery) =>
      matchFilter(record, subQuery, strict),
    );
  return Object.entries(filter).every(([field, condition]) => {
    const value = resolve(record, field);
    if (
      typeof condition !== "object" ||
      condition === null ||
      Array.isArray(condition)
    )
      return equals(value, condition, strict);
    return Object.entries(condition || {}).every(([operator, target]) => {
      if (operator === "$gt")
        return value !== null && value !== void 0 && value > target;
      if (operator === "$gte")
        return value !== null && value !== void 0 && value >= target;
      if (operator === "$lt")
        return value !== null && value !== void 0 && value < target;
      if (operator === "$lte")
        return value !== null && value !== void 0 && value <= target;
      if (operator === "$eq") return equals(value, target, strict);
      if (operator === "$ne") return !equals(value, target, strict);
      if (operator === "$in")
        return Array.isArray(target) && matchesIn(value, target, strict);
      if (operator === "$nin")
        return Array.isArray(target) && !matchesIn(value, target, strict);
      if (operator === "$not")
        return !matchFilter({ value }, { value: target }, strict);
      return true;
    });
  });
}
/**
 * Match a value or one of its immediate array elements against a list.
 *
 * @param {any} value
 * @param {any[]} targets
 * @param {boolean} strict
 * @returns {boolean}
 */
function matchesIn(value, targets, strict) {
  return targets.some(
    (target) =>
      equals(value, target, strict) ||
      (Array.isArray(value) &&
        value.some((element) => equals(element, target, strict))),
  );
}
/**
 * Check if a row group can be skipped based on filter and column statistics,
 * optionally consulting per-column bloom filters for equality predicates that
 * statistics can't decide.
 *
 * @param {object} options
 * @param {RowGroup} options.rowGroup
 * @param {string[]} options.physicalColumns
 * @param {ParquetQueryFilter | undefined} options.filter
 * @param {boolean} [options.strict]
 * @param {Record<string, BloomFilter>} [options.bloomFilters] keyed by filter path
 * @param {Record<string, SchemaElement>} [options.schemaElements] keyed by physical leaf path
 * @returns {boolean} true if the row group can be skipped
 */
function canSkipRowGroup({
  rowGroup,
  physicalColumns,
  filter,
  strict = true,
  bloomFilters,
  schemaElements,
}) {
  if (!filter) return false;
  if ("$and" in filter && Array.isArray(filter.$and))
    return filter.$and.some((subFilter) =>
      canSkipRowGroup({
        rowGroup,
        physicalColumns,
        filter: subFilter,
        strict,
        bloomFilters,
        schemaElements,
      }),
    );
  if ("$or" in filter && Array.isArray(filter.$or))
    return filter.$or.every((subFilter) =>
      canSkipRowGroup({
        rowGroup,
        physicalColumns,
        filter: subFilter,
        strict,
        bloomFilters,
        schemaElements,
      }),
    );
  if ("$nor" in filter && Array.isArray(filter.$nor)) return false;
  for (const [field, condition] of Object.entries(filter)) {
    const columnIndex = physicalColumns.indexOf(field);
    if (columnIndex === -1) continue;
    const {
      min,
      max,
      min_value,
      max_value,
      null_count: nullCount,
    } = rowGroup.columns[columnIndex].meta_data?.statistics || {};
    const minVal = min_value !== void 0 ? min_value : min;
    const maxVal = max_value !== void 0 ? max_value : max;
    const haveStats = minVal !== void 0 && maxVal !== void 0;
    const bloom = bloomFilters?.[field];
    const element = schemaElements?.[field];
    const matchingNulls =
      matchFilter({ value: null }, { value: condition }, strict) &&
      (nullCount === void 0 || nullCount > 0);
    if (
      haveStats &&
      !matchingNulls &&
      canSkipStats(condition, minVal, maxVal, strict, element)
    )
      return true;
    for (const [operator, target] of Object.entries(condition || {}))
      if (bloom && element) {
        if (operator === "$eq") {
          const hash = hashParquetValue(target, element);
          if (hash !== void 0 && !sbbfContains(bloom.blocks, hash)) return true;
        }
        if (operator === "$in" && Array.isArray(target) && target.length > 0) {
          let allAbsent = true;
          for (const v of target) {
            const h = hashParquetValue(v, element);
            if (h === void 0 || sbbfContains(bloom.blocks, h)) {
              allAbsent = false;
              break;
            }
          }
          if (allAbsent) return true;
        }
      }
  }
  return false;
}
/**
 * Check if a page value range [minVal, maxVal] provably contains no value
 * matching the operator conditions.
 *
 * @param {any} condition operator object like { $gt: 5 }
 * @param {any} minVal lower bound (may be truncated, still a valid bound)
 * @param {any} maxVal upper bound (may be truncated, still a valid bound)
 * @param {boolean} strict
 * @param {SchemaElement} [element] physical schema element for the bounds
 * @returns {boolean} true if no value in the range can match
 */
function canSkipStats(condition, minVal, maxVal, strict, element) {
  if (minVal === void 0 || maxVal === void 0) return false;
  const mayContainNaN =
    element?.type === "FLOAT" ||
    element?.type === "DOUBLE" ||
    element?.logical_type?.type === "FLOAT16";
  for (const [operator, target] of Object.entries(condition || {})) {
    const minComparison = compareParquetValues(minVal, target, strict, element);
    const maxComparison = compareParquetValues(maxVal, target, strict, element);
    const relationalBoundsAreSafe =
      !(minVal instanceof Uint8Array || maxVal instanceof Uint8Array) &&
      (element?.type !== "BYTE_ARRAY" ||
        (typeof target === "string" &&
          [...target].every((character) => character.charCodeAt(0) <= 127)));
    if (
      operator === "$gt" &&
      relationalBoundsAreSafe &&
      maxComparison !== void 0 &&
      maxComparison <= 0
    )
      return true;
    if (
      operator === "$gte" &&
      relationalBoundsAreSafe &&
      maxComparison !== void 0 &&
      maxComparison < 0
    )
      return true;
    if (
      operator === "$lt" &&
      relationalBoundsAreSafe &&
      minComparison !== void 0 &&
      minComparison >= 0
    )
      return true;
    if (
      operator === "$lte" &&
      relationalBoundsAreSafe &&
      minComparison !== void 0 &&
      minComparison > 0
    )
      return true;
    if (operator === "$eq") {
      const targetMinComparison = compareParquetValues(
        target,
        minVal,
        strict,
        element,
      );
      const targetMaxComparison = compareParquetValues(
        target,
        maxVal,
        strict,
        element,
      );
      if (
        (targetMinComparison !== void 0 && targetMinComparison < 0) ||
        (targetMaxComparison !== void 0 && targetMaxComparison > 0)
      )
        return true;
    }
    if (
      operator === "$ne" &&
      !mayContainNaN &&
      equals(minVal, maxVal, strict) &&
      equals(minVal, target, strict)
    )
      return true;
    if (
      operator === "$in" &&
      Array.isArray(target) &&
      target.every((value) => {
        const valueMinComparison = compareParquetValues(
          value,
          minVal,
          strict,
          element,
        );
        const valueMaxComparison = compareParquetValues(
          value,
          maxVal,
          strict,
          element,
        );
        return (
          (valueMinComparison !== void 0 && valueMinComparison < 0) ||
          (valueMaxComparison !== void 0 && valueMaxComparison > 0)
        );
      })
    )
      return true;
    if (
      operator === "$nin" &&
      !mayContainNaN &&
      Array.isArray(target) &&
      equals(minVal, maxVal, strict) &&
      target.some((value) => equals(minVal, value, strict))
    )
      return true;
  }
  return false;
}
/**
 * Compare values using Parquet's unsigned lexicographic ordering for binary
 * values. Returns undefined when values do not have a safely comparable order.
 *
 * @param {any} a
 * @param {any} b
 * @param {boolean} strict
 * @param {SchemaElement} [element]
 * @returns {-1 | 0 | 1 | undefined}
 */
function compareParquetValues(a, b, strict, element) {
  if (element?.type === "BYTE_ARRAY") {
    if (typeof a !== "string" || typeof b !== "string") return void 0;
    return compareBytes(encoder.encode(a), encoder.encode(b));
  }
  if (a instanceof Uint8Array || b instanceof Uint8Array) {
    if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) return void 0;
    return compareBytes(a, b);
  }
  if (a < b) return -1;
  if (a > b) return 1;
  if (equals(a, b, strict)) return 0;
}
/**
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {-1 | 0 | 1}
 */
function compareBytes(a, b) {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  if (a.length < b.length) return -1;
  if (a.length > b.length) return 1;
  return 0;
}
/**
 * Check whether the filter condition accepts a null value.
 *
 * @param {any} condition
 * @param {boolean} strict
 * @returns {boolean}
 */
function matchesNull(condition, strict) {
  return matchFilter({ value: null }, { value: condition }, strict);
}
/**
 * Compute candidate row ranges within a row group that could match the filter,
 * based on per-page column index statistics.
 *
 * Returns sorted disjoint [start, end) row ranges relative to the group.
 * An empty array means the filter provably matches no rows in the group.
 * Returns undefined when the page statistics give no pruning information
 * (the caller must read the whole selection).
 *
 * @param {ParquetQueryFilter | undefined} filter
 * @param {Record<string, ColumnPageStats>} columnPages keyed by physical leaf path
 * @param {number} groupRows number of rows in the row group
 * @param {boolean} [strict]
 * @returns {PageRanges | undefined}
 */
function filterPageRanges(filter, columnPages, groupRows, strict = true) {
  if (!filter) return void 0;
  if ("$and" in filter && Array.isArray(filter.$and)) {
    /** @type {PageRanges | undefined} */
    let ranges;
    for (const subFilter of filter.$and)
      ranges = intersectRanges(
        ranges,
        filterPageRanges(subFilter, columnPages, groupRows, strict),
      );
    return ranges;
  }
  if ("$or" in filter && Array.isArray(filter.$or)) {
    /** @type {PageRanges} */
    let ranges = [];
    for (const subFilter of filter.$or) {
      const subRanges = filterPageRanges(
        subFilter,
        columnPages,
        groupRows,
        strict,
      );
      if (!subRanges) return void 0;
      ranges = unionRanges(ranges, subRanges);
    }
    return ranges;
  }
  if ("$nor" in filter && Array.isArray(filter.$nor)) return;
  /** @type {PageRanges | undefined} */
  let result;
  for (const [field, condition] of Object.entries(filter)) {
    const pages = columnPages[field];
    if (!pages) continue;
    const nullCanMatch = matchesNull(condition, strict);
    /** @type {PageRanges} */
    const keep = [];
    for (let i = 0; i < pages.pageStarts.length; i++) {
      const start = pages.pageStarts[i];
      const end =
        i + 1 < pages.pageStarts.length ? pages.pageStarts[i + 1] : groupRows;
      const nullCount = pages.nullCounts?.[i];
      const matchingNulls =
        nullCanMatch && (nullCount === void 0 || nullCount > 0);
      if (!(
        !pages.nullPages[i] &&
        !matchingNulls &&
        canSkipStats(
          condition,
          pages.minValues[i],
          pages.maxValues[i],
          strict,
          pages.element,
        )
      )) {
        const last = keep[keep.length - 1];
        if (last && last[1] === start) last[1] = end;
        else keep.push([start, end]);
      }
    }
    result = intersectRanges(result, keep);
  }
  return result;
}
/**
 * Intersect two sets of sorted disjoint ranges. Undefined means "everything".
 *
 * @param {PageRanges | undefined} a
 * @param {PageRanges | undefined} b
 * @returns {PageRanges | undefined}
 */
function intersectRanges(a, b) {
  if (!a) return b;
  if (!b) return a;
  /** @type {PageRanges} */
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const start = Math.max(a[i][0], b[j][0]);
    const end = Math.min(a[i][1], b[j][1]);
    if (start < end) out.push([start, end]);
    if (a[i][1] < b[j][1]) i++;
    else j++;
  }
  return out;
}
/**
 * Union two sets of sorted disjoint ranges.
 *
 * @param {PageRanges} a
 * @param {PageRanges} b
 * @returns {PageRanges}
 */
function unionRanges(a, b) {
  /** @type {PageRanges} */
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    const next =
      j >= b.length || (i < a.length && a[i][0] <= b[j][0]) ? a[i++] : b[j++];
    const last = out[out.length - 1];
    if (last && next[0] <= last[1]) last[1] = Math.max(last[1], next[1]);
    else out.push([next[0], next[1]]);
  }
  return out;
}
/**
 * Resolve a dot-notation path to a value in a nested object.
 *
 * @param {Record<string, any>} record
 * @param {string} path
 * @returns {any}
 */
function resolve(record, path) {
  let value = record;
  for (const part of path.split(".")) value = value?.[part];
  return value;
}
//#endregion
//#region ../../node_modules/hyparquet/src/plan.js
/**
 * @import {AsyncBuffer, BloomFilter, ByteRange, ChunkPlan, ColumnPageStats, FileMetaData, GroupPlan, PageLocation, PageRanges, ParquetParsers, ParquetQueryFilter, ParquetReadOptions, QueryPlan, RowGroup, SchemaElement, SchemaTree} from '../src/types.js'
 */
var runLimit = 1 << 21;
var columnGapLimit = 8192;
/**
 * Plan which byte ranges to read to satisfy a read request.
 * Metadata must be non-null.
 *
 * @param {ParquetReadOptions & { bloomFiltersByGroup?: Record<string, BloomFilter>[], schemaElements?: Record<string, SchemaElement>, pageRangesByGroup?: (PageRanges | undefined)[], pageLocationsByGroup?: Record<string, PageLocation[]>[] }} options
 * @returns {QueryPlan}
 */
function parquetPlan(options) {
  const { metadata, rowStart = 0, columns, useOffsetIndex = false } = options;
  if (!metadata) throw new Error("parquetPlan requires metadata");
  /** @type {GroupPlan[]} */
  const groups = [];
  /** @type {ByteRange[]} */
  const fetches = [];
  /** @type {ByteRange[]} */
  const indexes = [];
  const scanPlan = parquetPlanGroups(options);
  for (const group of scanPlan.groups) {
    const groupPlan = parquetPlanGroup({
      ...group,
      columns,
      useOffsetIndex,
    });
    groups.push(...groupPlan.groups);
    fetches.push(...groupPlan.fetches);
    indexes.push(...groupPlan.indexes);
  }
  fetches.push(...indexes);
  return {
    metadata,
    rowStart,
    rowEnd: scanPlan.rowEnd,
    columns,
    fetches,
    groups,
  };
}
/**
 * Select physical row-group ranges without planning column reads.
 *
 * @param {ParquetReadOptions & { bloomFiltersByGroup?: Record<string, BloomFilter>[], schemaElements?: Record<string, SchemaElement>, pageRangesByGroup?: (PageRanges | undefined)[], pageLocationsByGroup?: Record<string, PageLocation[]>[] }} options
 * @returns {{groups: {rowGroup: RowGroup, groupIndex: number, groupStart: number, groupRows: number, ranges: PageRanges, pageRanges?: PageRanges, pageLocations?: Record<string, PageLocation[]>}[], rowEnd: number}}
 */
function parquetPlanGroups({
  metadata,
  rowStart = 0,
  rowEnd = Infinity,
  columns,
  filter,
  filterStrict = true,
  bloomFiltersByGroup,
  schemaElements,
  pageRangesByGroup,
  pageLocationsByGroup,
}) {
  if (!metadata) throw new Error("parquetPlan requires metadata");
  const schemaTree = parquetSchema(metadata);
  const physicalColumns = getPhysicalColumns(schemaTree);
  const elementsByPath = filter
    ? {
        ...physicalSchemaElements(schemaTree),
        ...schemaElements,
      }
    : schemaElements;
  const groups = [];
  let groupStart = 0;
  for (
    let groupIndex = 0;
    groupIndex < metadata.row_groups.length;
    groupIndex++
  ) {
    const rowGroup = metadata.row_groups[groupIndex];
    const groupRows = Number(rowGroup.num_rows);
    const groupEnd = groupStart + groupRows;
    if (
      groupRows > 0 &&
      groupEnd > rowStart &&
      groupStart < rowEnd &&
      !canSkipRowGroup({
        rowGroup,
        physicalColumns,
        filter,
        strict: filterStrict,
        bloomFilters: bloomFiltersByGroup?.[groupIndex],
        schemaElements: elementsByPath,
      })
    ) {
      const selectStart = Math.max(rowStart - groupStart, 0);
      const selectEnd = Math.min(rowEnd - groupStart, groupRows);
      const pageRanges = pageRangesByGroup?.[groupIndex];
      const pageLocations = pageLocationsByGroup?.[groupIndex];
      /** @type {PageRanges} */
      let ranges = pageRanges
        ? pageRanges
            .map(([start, end]) => {
              return [Math.max(start, selectStart), Math.min(end, selectEnd)];
            })
            .filter(([start, end]) => start < end)
        : [[selectStart, selectEnd]];
      if (ranges.length > 1)
        ranges = rowGroup.columns.every((chunk) => {
          const columnName = chunk.meta_data?.path_in_schema[0];
          const columnPath = chunk.meta_data?.path_in_schema.join(".");
          if (columns && columnName && !columns.includes(columnName))
            return true;
          return (
            !!(chunk.offset_index_offset && chunk.offset_index_length) ||
            !!(columnPath && pageLocations?.[columnPath])
          );
        })
          ? coalesceOverlappingPageRanges(
              ranges,
              rowGroup,
              columns,
              pageLocations,
            )
          : [[ranges[0][0], ranges[ranges.length - 1][1]]];
      if (ranges.length)
        groups.push({
          rowGroup,
          groupIndex,
          groupStart,
          groupRows,
          ranges,
          pageRanges,
          pageLocations,
        });
    }
    groupStart = groupEnd;
  }
  return {
    groups,
    rowEnd: isFinite(rowEnd) ? rowEnd : groupStart,
  };
}
/**
 * Build byte plans for retained ranges in one row group.
 *
 * @param {object} options
 * @param {RowGroup} options.rowGroup
 * @param {number} options.groupStart
 * @param {number} options.groupRows
 * @param {PageRanges} options.ranges
 * @param {string[]} [options.columns]
 * @param {boolean} [options.useOffsetIndex]
 * @param {PageRanges} [options.pageRanges]
 * @param {Record<string, PageLocation[]>} [options.pageLocations]
 * @returns {{groups: GroupPlan[], fetches: ByteRange[], indexes: ByteRange[]}}
 */
function parquetPlanGroup({
  rowGroup,
  groupStart,
  groupRows,
  ranges,
  columns,
  useOffsetIndex = false,
  pageRanges,
  pageLocations,
}) {
  /** @type {ChunkPlan[]} */
  const chunks = [];
  /** @type {ByteRange[]} */
  const fetches = [];
  /** @type {ByteRange[]} */
  const indexes = [];
  const narrowed =
    ranges.length > 1 || ranges[0][0] > 0 || ranges[0][1] < groupRows;
  for (const chunk of rowGroup.columns) {
    const meta = chunk.meta_data;
    if (chunk.file_path) throw new Error("parquet file_path not supported");
    if (!meta) throw new Error("parquet column metadata is undefined");
    if (columns && !columns.includes(meta.path_in_schema[0])) continue;
    const columnOffset = meta.dictionary_page_offset || meta.data_page_offset;
    const startByte = Number(columnOffset);
    const endByte = Number(columnOffset + meta.total_compressed_size);
    const chunkPageLocations = pageLocations?.[meta.path_in_schema.join(".")];
    if (chunkPageLocations && narrowed)
      chunks.push({
        columnMetadata: meta,
        pageLocations: chunkPageLocations,
        range: {
          startByte,
          endByte,
        },
      });
    else if (
      (useOffsetIndex || pageRanges) &&
      chunk.offset_index_offset &&
      chunk.offset_index_length &&
      narrowed
    ) {
      const startByte = Number(chunk.offset_index_offset);
      chunks.push({
        columnMetadata: meta,
        offsetIndex: {
          startByte,
          endByte: startByte + chunk.offset_index_length,
        },
        range: {
          startByte: Number(columnOffset),
          endByte,
        },
      });
    } else
      chunks.push({
        columnMetadata: meta,
        range: {
          startByte,
          endByte,
        },
      });
  }
  /** @type {ByteRange[]} */
  const columnRanges = [];
  /** @type {ByteRange | undefined} */
  let run;
  for (const chunk of chunks) {
    if ("pageLocations" in chunk) continue;
    if ("offsetIndex" in chunk) indexes.push(chunk.offsetIndex);
    else if (columns) columnRanges.push(chunk.range);
    else if (run && chunk.range.endByte - run.startByte <= runLimit)
      run.endByte = chunk.range.endByte;
    else {
      if (run) fetches.push(run);
      run = { ...chunk.range };
    }
  }
  if (run) fetches.push(run);
  fetches.push(...coalesceByteRanges(columnRanges, columnGapLimit, runLimit));
  return {
    groups: ranges.map(([selectStart, selectEnd]) => ({
      chunks,
      rowGroup,
      groupStart,
      groupRows,
      selectStart,
      selectEnd,
    })),
    fetches,
    indexes,
  };
}
/**
 * Merge candidate ranges when any selected column would read an overlapping
 * data page for both ranges. Unknown page layouts are merged conservatively.
 *
 * @param {PageRanges} ranges
 * @param {RowGroup} rowGroup
 * @param {string[] | undefined} columns
 * @param {Record<string, PageLocation[]> | undefined} pageLocations
 * @returns {PageRanges}
 */
function coalesceOverlappingPageRanges(
  ranges,
  rowGroup,
  columns,
  pageLocations,
) {
  const selectedPageLayouts = rowGroup.columns
    .filter(
      (chunk) =>
        !columns || columns.includes(chunk.meta_data?.path_in_schema[0] || ""),
    )
    .map(
      (chunk) =>
        pageLocations?.[chunk.meta_data?.path_in_schema.join(".") || ""],
    );
  /** @type {PageRanges} */
  const merged = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    const overlapsPage =
      last &&
      selectedPageLayouts.some((pages) => {
        if (!pages) return true;
        const lastPages = pagesForRange(last, pages, Number(rowGroup.num_rows));
        const rangePages = pagesForRange(
          range,
          pages,
          Number(rowGroup.num_rows),
        );
        return lastPages[0] <= rangePages[1] && rangePages[0] <= lastPages[1];
      });
    if (last && overlapsPage) last[1] = range[1];
    else merged.push([...range]);
  }
  return merged;
}
/**
 * Return the inclusive indexes of the first and last pages overlapping a row
 * range. Offset indexes cover every row, so a valid range always finds a page.
 *
 * @param {[number, number]} range
 * @param {PageLocation[]} pages
 * @param {number} groupRows
 * @returns {[number, number]}
 */
function pagesForRange([rangeStart, rangeEnd], pages, groupRows) {
  let first = Infinity;
  let last = -Infinity;
  for (let i = 0; i < pages.length; i++) {
    const pageStart = Number(pages[i].first_row_index);
    if (
      (i + 1 < pages.length
        ? Number(pages[i + 1].first_row_index)
        : groupRows) > rangeStart &&
      pageStart < rangeEnd
    ) {
      first = Math.min(first, i);
      last = i;
    }
  }
  return [first, last];
}
/**
 * Fetch bloom filters for $eq / $in columns of row groups not already provably
 * skippable by statistics alone. Returns an array indexed by row-group ordinal;
 * each entry maps top-level column name → BloomFilter for any chunk whose
 * bloom filter we were able to parse. Adds one round-trip when at least one
 * bloom filter is fetched; otherwise returns synchronously.
 *
 * @param {object} options
 * @param {AsyncBuffer} options.file
 * @param {FileMetaData} options.metadata
 * @param {ParquetQueryFilter} options.filter
 * @param {boolean} [options.filterStrict]
 * @returns {Promise<Record<string, BloomFilter>[]>}
 */
async function prefetchBloomFilters({
  file,
  metadata,
  filter,
  filterStrict = true,
}) {
  const result = metadata.row_groups.map(() => ({}));
  const eligibleCols = bloomEligibleColumns(filter);
  if (eligibleCols.size === 0) return result;
  const physicalColumns = getPhysicalColumns(parquetSchema(metadata));
  /** @type {Promise<void>[]} */
  const tasks = [];
  metadata.row_groups.forEach((rowGroup, rgIdx) => {
    if (
      canSkipRowGroup({
        rowGroup,
        physicalColumns,
        filter,
        strict: filterStrict,
      })
    )
      return;
    for (const colName of eligibleCols) {
      const columnIdx = physicalColumns.indexOf(colName);
      if (columnIdx === -1) continue;
      const meta = rowGroup.columns[columnIdx]?.meta_data;
      if (!meta?.bloom_filter_offset || !meta.bloom_filter_length) continue;
      const start = Number(meta.bloom_filter_offset);
      const end = start + meta.bloom_filter_length;
      tasks.push(
        (async () => {
          const buffer = await file.slice(start, end);
          const bloom = readBloomFilter({
            view: new DataView(buffer),
            offset: 0,
          });
          if (bloom) result[rgIdx][colName] = bloom;
        })(),
      );
    }
  });
  if (tasks.length) await Promise.all(tasks);
  return result;
}
/**
 * Fetch page indexes (column index + offset index) for filter columns of row
 * groups that survive row-group-level pruning, and compute candidate row
 * ranges per group from the per-page min/max statistics.
 *
 * Returns pageRangesByGroup indexed by row-group ordinal: sorted disjoint
 * [start, end) row ranges (relative to the group) that could match the filter.
 * An empty array means the group provably contains no matching rows; undefined
 * means no page-level information was available for that group.
 * Also returns pageLocationsByGroup, mapping row-group ordinals and physical
 * leaf paths to page locations, so the read path can reuse the parsed offset
 * indexes without refetching them.
 *
 * @param {object} options
 * @param {AsyncBuffer} options.file
 * @param {FileMetaData} options.metadata
 * @param {ParquetQueryFilter} [options.filter]
 * @param {boolean} [options.filterStrict]
 * @param {number} [options.rowStart]
 * @param {number} [options.rowEnd]
 * @param {string[]} [options.columns]
 * @param {Record<string, BloomFilter>[]} [options.bloomFiltersByGroup]
 * @param {Record<string, SchemaElement>} [options.schemaElements]
 * @param {Partial<ParquetParsers>} [options.parsers]
 * @returns {Promise<{pageRangesByGroup: (PageRanges | undefined)[], pageLocationsByGroup: Record<string, PageLocation[]>[]}>}
 */
async function prefetchPageIndexes({
  file,
  metadata,
  filter,
  filterStrict = true,
  rowStart = 0,
  rowEnd = Infinity,
  columns,
  bloomFiltersByGroup,
  schemaElements,
  parsers,
}) {
  /** @type {(PageRanges | undefined)[]} */
  const pageRangesByGroup = metadata.row_groups.map(() => void 0);
  const pageLocationsByGroup = metadata.row_groups.map(() => ({}));
  if (filter && "$nor" in filter && Array.isArray(filter.$nor))
    return {
      pageRangesByGroup,
      pageLocationsByGroup,
    };
  const filterColumns = pathsNeededForFilter(filter);
  if (!filterColumns.length)
    return {
      pageRangesByGroup,
      pageLocationsByGroup,
    };
  const schemaTree = parquetSchema(metadata);
  const physicalColumns = getPhysicalColumns(schemaTree);
  const elementsByPath = {
    ...physicalSchemaElements(schemaTree),
    ...schemaElements,
  };
  /** @type {ByteRange[]} */
  const indexRanges = [];
  /** @type {((file: AsyncBuffer) => Promise<void>)[]} */
  const indexTasks = [];
  /** @type {{rgIdx: number, groupRows: number, columnPages: Record<string, ColumnPageStats>}[]} */
  const candidateGroups = [];
  let groupStart = 0;
  metadata.row_groups.forEach((rowGroup, rgIdx) => {
    const groupRows = Number(rowGroup.num_rows);
    const groupEnd = groupStart + groupRows;
    const overlaps =
      groupRows > 0 && groupEnd > rowStart && groupStart < rowEnd;
    groupStart = groupEnd;
    if (!overlaps) return;
    if (
      canSkipRowGroup({
        rowGroup,
        physicalColumns,
        filter,
        strict: filterStrict,
        bloomFilters: bloomFiltersByGroup?.[rgIdx],
        schemaElements: elementsByPath,
      })
    )
      return;
    /** @type {Record<string, ColumnPageStats>} */
    const columnPages = {};
    let columnTaskCount = 0;
    const scheduledOffsetPaths = /* @__PURE__ */ new Set();
    let hasFilterIndex = false;
    for (const columnName of filterColumns) {
      const columnIdx = physicalColumns.indexOf(columnName);
      if (columnIdx === -1) continue;
      const chunk = rowGroup.columns[columnIdx];
      if (!chunk?.meta_data) continue;
      if (!chunk.column_index_offset || !chunk.column_index_length) continue;
      if (!chunk.offset_index_offset || !chunk.offset_index_length) continue;
      const element = elementsByPath[columnName];
      if (!element) continue;
      hasFilterIndex = true;
      scheduledOffsetPaths.add(columnName);
      const columnIndexStart = Number(chunk.column_index_offset);
      const offsetIndexStart = Number(chunk.offset_index_offset);
      const columnIndexEnd = columnIndexStart + chunk.column_index_length;
      const offsetIndexEnd = offsetIndexStart + chunk.offset_index_length;
      indexRanges.push(
        {
          startByte: columnIndexStart,
          endByte: columnIndexEnd,
        },
        {
          startByte: offsetIndexStart,
          endByte: offsetIndexEnd,
        },
      );
      columnTaskCount++;
      indexTasks.push(async (prefetchedFile) => {
        const [columnIndexBuffer, offsetIndexBuffer] = await Promise.all([
          prefetchedFile.slice(columnIndexStart, columnIndexEnd),
          prefetchedFile.slice(offsetIndexStart, offsetIndexEnd),
        ]);
        const columnIndex = readColumnIndex(
          {
            view: new DataView(columnIndexBuffer),
            offset: 0,
          },
          element,
          parsers,
        );
        const offsetIndex = readOffsetIndex({
          view: new DataView(offsetIndexBuffer),
          offset: 0,
        });
        pageLocationsByGroup[rgIdx][columnName] = offsetIndex.page_locations;
        columnPages[columnName] = {
          minValues: columnIndex.min_values,
          maxValues: columnIndex.max_values,
          nullPages: columnIndex.null_pages,
          nullCounts: columnIndex.null_counts,
          pageStarts: offsetIndex.page_locations.map((page) =>
            Number(page.first_row_index),
          ),
          element,
        };
      });
    }
    if (hasFilterIndex)
      for (const chunk of rowGroup.columns) {
        const meta = chunk.meta_data;
        if (!meta) continue;
        const columnName = meta.path_in_schema[0];
        const columnPath = meta.path_in_schema.join(".");
        if (columns && !columns.includes(columnName)) continue;
        if (scheduledOffsetPaths.has(columnPath)) continue;
        if (!chunk.offset_index_offset || !chunk.offset_index_length) continue;
        scheduledOffsetPaths.add(columnPath);
        const offsetIndexStart = Number(chunk.offset_index_offset);
        const offsetIndexEnd = offsetIndexStart + chunk.offset_index_length;
        indexRanges.push({
          startByte: offsetIndexStart,
          endByte: offsetIndexEnd,
        });
        columnTaskCount++;
        indexTasks.push(async (prefetchedFile) => {
          const offsetIndexBuffer = await prefetchedFile.slice(
            offsetIndexStart,
            offsetIndexEnd,
          );
          const offsetIndex = readOffsetIndex({
            view: new DataView(offsetIndexBuffer),
            offset: 0,
          });
          pageLocationsByGroup[rgIdx][columnPath] = offsetIndex.page_locations;
        });
      }
    if (columnTaskCount)
      candidateGroups.push({
        rgIdx,
        groupRows,
        columnPages,
      });
  });
  if (indexTasks.length) {
    const prefetchedFile = prefetchAsyncBuffer(file, {
      fetches: coalesceByteRanges(indexRanges),
    });
    await Promise.all(indexTasks.map((task) => task(prefetchedFile)));
    for (const { rgIdx, groupRows, columnPages } of candidateGroups)
      pageRangesByGroup[rgIdx] = filterPageRanges(
        filter,
        columnPages,
        groupRows,
        filterStrict,
      );
  }
  return {
    pageRangesByGroup,
    pageLocationsByGroup,
  };
}
/**
 * Merge overlapping or touching byte ranges. By default no bytes are added;
 * pass maxGap to also merge ranges separated by up to maxGap unrequested bytes,
 * as long as the merged range stays within maxSize.
 *
 * @param {ByteRange[]} ranges
 * @param {number} [maxGap]
 * @param {number} [maxSize]
 * @returns {ByteRange[]}
 */
function coalesceByteRanges(ranges, maxGap = 0, maxSize = Infinity) {
  const sorted = ranges
    .map((range) => ({ ...range }))
    .sort((a, b) => a.startByte - b.startByte || a.endByte - b.endByte);
  /** @type {ByteRange[]} */
  const merged = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (
      last &&
      range.startByte <= last.endByte + maxGap &&
      Math.max(last.endByte, range.endByte) - last.startByte <= maxSize
    )
      last.endByte = Math.max(last.endByte, range.endByte);
    else merged.push(range);
  }
  return merged;
}
/**
 * Build a lookup from physical paths to leaf schema elements.
 *
 * @param {SchemaTree} schemaTree
 * @returns {Record<string, SchemaElement>}
 */
function physicalSchemaElements(schemaTree) {
  /** @type {Record<string, SchemaElement>} */
  const elements = {};
  /** @param {SchemaTree} node */
  function traverse(node) {
    if (node.children.length)
      for (const child of node.children) traverse(child);
    else elements[node.path.join(".")] = node.element;
  }
  traverse(schemaTree);
  return elements;
}
/**
 * Prefetch byte ranges from an AsyncBuffer.
 *
 * @param {AsyncBuffer} file
 * @param {{fetches: ByteRange[]}} options
 * @returns {AsyncBuffer}
 */
function prefetchAsyncBuffer(file, { fetches }) {
  const promises = fetches.map(({ startByte, endByte }) =>
    file.slice(startByte, endByte),
  );
  return {
    byteLength: file.byteLength,
    slice(start, end = file.byteLength) {
      const index = fetches.findIndex(
        ({ startByte, endByte }) => startByte <= start && end <= endByte,
      );
      if (index < 0) return file.slice(start, end);
      if (
        fetches[index].startByte !== start ||
        fetches[index].endByte !== end
      ) {
        const startOffset = start - fetches[index].startByte;
        const endOffset = end - fetches[index].startByte;
        if (promises[index] instanceof Promise)
          return promises[index].then((buffer) =>
            buffer.slice(startOffset, endOffset),
          );
        else return promises[index].slice(startOffset, endOffset);
      } else return promises[index];
    },
  };
}
//#endregion
//#region ../../node_modules/hyparquet/src/variant.js
/**
 * @import {DataReader, ParquetParsers, VariantMetadata} from '../src/types.js'
 */
var decoder = new TextDecoder();
/** @type {WeakMap<object, Map<string, VariantMetadata>>} */
var metadataCache = /* @__PURE__ */ new WeakMap();
/**
 * Recursively decode variant structs into native values.
 *
 * @param {any} value
 * @param {ParquetParsers} [parsers]
 * @returns {any}
 */
function decodeVariantColumn(value, parsers = DEFAULT_PARSERS) {
  if (Array.isArray(value))
    return value.map((entry) => decodeVariantColumn(entry, parsers));
  if (typeof value !== "object") return value;
  if ("metadata" in value) {
    const metadata = parseVariantMetadata(value.metadata);
    const shreddedFields =
      value.typed_value &&
      decodeTypedValue(value.typed_value, metadata, parsers);
    const binaryValue =
      value.value && readVariant(makeReader(value.value), metadata, parsers);
    if (shreddedFields && binaryValue)
      return {
        ...binaryValue,
        ...shreddedFields,
      };
    return shreddedFields ?? binaryValue;
  }
  return value;
}
/**
 * Decode a shredded variant typed_value field.
 *
 * @param {any} typedValue
 * @param {VariantMetadata} metadata
 * @param {ParquetParsers} parsers
 * @returns {any}
 */
function decodeTypedValue(typedValue, metadata, parsers) {
  if (typedValue instanceof Date) return typedValue;
  if (
    typedValue &&
    typeof typedValue === "object" &&
    !Array.isArray(typedValue) &&
    !(typedValue instanceof Uint8Array)
  ) {
    if (
      "typed_value" in typedValue &&
      typedValue.typed_value !== null &&
      typedValue.typed_value !== void 0
    )
      return decodeTypedValue(typedValue.typed_value, metadata, parsers);
    if ("value" in typedValue && typedValue.value instanceof Uint8Array)
      return readVariant(makeReader(typedValue.value), metadata, parsers);
    if ("typed_value" in typedValue || "value" in typedValue) return null;
    /** @type {Record<string, any>} */
    const result = {};
    for (const [key, field] of Object.entries(typedValue)) {
      if (!metadata.dictionary.includes(key)) continue;
      result[key] = decodeTypedValue(field, metadata, parsers);
    }
    return result;
  }
  if (typedValue instanceof Uint8Array)
    return readVariant(makeReader(typedValue), metadata, parsers);
  if (Array.isArray(typedValue))
    return typedValue.map((element) =>
      decodeTypedValue(element, metadata, parsers),
    );
  return typedValue;
}
/**
 * @param {Uint8Array} bytes
 * @returns {DataReader}
 */
function makeReader(bytes) {
  return {
    view: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    offset: 0,
  };
}
/**
 * Parse and cache variant metadata dictionary.
 *
 * @param {Uint8Array} bytes
 * @returns {VariantMetadata}
 */
function parseVariantMetadata(bytes) {
  let bufferCache = metadataCache.get(bytes.buffer);
  if (!bufferCache) {
    bufferCache = /* @__PURE__ */ new Map();
    metadataCache.set(bytes.buffer, bufferCache);
  }
  const key = `${bytes.byteOffset}:${bytes.byteLength}`;
  const cached = bufferCache.get(key);
  if (cached) return cached;
  const reader = makeReader(bytes);
  const header = reader.view.getUint8(reader.offset++);
  const version = header & 15;
  if (version !== 1)
    throw new Error(`parquet unsupported variant metadata version: ${version}`);
  const sorted = ((header >> 4) & 1) === 1;
  const offsetSize = ((header >> 6) & 3) + 1;
  const dictionarySize = readUnsigned(reader, offsetSize);
  const offsets = new Array(dictionarySize + 1);
  for (let i = 0; i < offsets.length; i++)
    offsets[i] = readUnsigned(reader, offsetSize);
  const base = reader.offset;
  const dictionary = new Array(dictionarySize);
  for (let i = 0; i < dictionarySize; i++) {
    const start = offsets[i];
    const end = offsets[i + 1];
    const strBytes = new Uint8Array(
      bytes.buffer,
      bytes.byteOffset + base + start,
      end - start,
    );
    dictionary[i] = decoder.decode(strBytes);
  }
  const metadata = {
    dictionary,
    sorted,
  };
  bufferCache.set(key, metadata);
  return metadata;
}
/**
 * @param {DataReader} reader
 * @param {number} byteWidth
 * @returns {number}
 */
function readUnsigned(reader, byteWidth) {
  let value = 0;
  for (let i = 0; i < byteWidth; i++)
    value |= reader.view.getUint8(reader.offset + i) << (i * 8);
  reader.offset += byteWidth;
  return value;
}
/**
 * @param {DataReader} reader
 * @param {VariantMetadata} metadata
 * @param {ParquetParsers} parsers
 * @returns {any}
 */
function readVariant(reader, metadata, parsers) {
  const typeByte = reader.view.getUint8(reader.offset++);
  const basicType = typeByte & 3;
  const header = typeByte >> 2;
  if (basicType === 0) return readVariantPrimitive(reader, header, parsers);
  if (basicType === 2)
    return readVariantObject(reader, header, metadata, parsers);
  if (basicType === 3)
    return readVariantArray(reader, header, metadata, parsers);
  const bytes = new Uint8Array(
    reader.view.buffer,
    reader.view.byteOffset + reader.offset,
    header,
  );
  reader.offset += header;
  return decoder.decode(bytes);
}
/**
 * @param {DataReader} reader
 * @param {number} typeId
 * @param {ParquetParsers} parsers
 * @returns {any}
 */
function readVariantPrimitive(reader, typeId, parsers) {
  switch (typeId) {
    case 0:
      return null;
    case 1:
      return true;
    case 2:
      return false;
    case 3: {
      const value = reader.view.getInt8(reader.offset);
      reader.offset += 1;
      return value;
    }
    case 4: {
      const value = reader.view.getInt16(reader.offset, true);
      reader.offset += 2;
      return value;
    }
    case 5: {
      const value = reader.view.getInt32(reader.offset, true);
      reader.offset += 4;
      return value;
    }
    case 6: {
      const value = reader.view.getBigInt64(reader.offset, true);
      reader.offset += 8;
      return value;
    }
    case 7: {
      const value = reader.view.getFloat64(reader.offset, true);
      reader.offset += 8;
      return value;
    }
    case 8:
      return readVariantDecimal(reader, 4);
    case 9:
      return readVariantDecimal(reader, 8);
    case 10:
      return readVariantDecimal(reader, 16);
    case 11: {
      const value = reader.view.getInt32(reader.offset, true);
      reader.offset += 4;
      return parsers.dateFromDays(value);
    }
    case 12:
    case 13: {
      const value = reader.view.getBigInt64(reader.offset, true);
      reader.offset += 8;
      return parsers.timestampFromMicroseconds(value);
    }
    case 14: {
      const value = reader.view.getFloat32(reader.offset, true);
      reader.offset += 4;
      return value;
    }
    case 15:
      return readVariantBinary(reader);
    case 16: {
      const bytes = readVariantBinary(reader);
      return decoder.decode(bytes);
    }
    case 17: {
      const value = reader.view.getBigInt64(reader.offset, true);
      reader.offset += 8;
      return value;
    }
    case 18:
    case 19: {
      const value = reader.view.getBigInt64(reader.offset, true);
      reader.offset += 8;
      return parsers.timestampFromNanoseconds(value);
    }
    case 20: {
      const bytes = new Uint8Array(
        reader.view.buffer,
        reader.view.byteOffset + reader.offset,
        16,
      );
      reader.offset += 16;
      const hex = Array.from(bytes, (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    default:
      throw new Error(`parquet unsupported variant primitive type: ${typeId}`);
  }
}
/**
 * @param {DataReader} reader
 * @param {number} header
 * @param {VariantMetadata} metadata
 * @param {ParquetParsers} parsers
 * @returns {Record<string, any>}
 */
function readVariantObject(reader, header, metadata, parsers) {
  const offsetWidth = (header & 3) + 1;
  const idWidth = ((header >> 2) & 3) + 1;
  const numElements =
    (header >> 4) & 1
      ? readUnsigned(reader, 4)
      : reader.view.getUint8(reader.offset++);
  /** @type {number[]} */
  const fieldIds = new Array(numElements);
  for (let i = 0; i < numElements; i++)
    fieldIds[i] = readUnsigned(reader, idWidth);
  const offsets = new Array(numElements + 1);
  for (let i = 0; i < offsets.length; i++)
    offsets[i] = readUnsigned(reader, offsetWidth);
  /** @type {Record<string, any>} */
  const out = {};
  for (let i = 0; i < numElements; i++) {
    const key = metadata.dictionary[fieldIds[i]];
    out[key] = readVariant(
      {
        view: reader.view,
        offset: reader.offset + offsets[i],
      },
      metadata,
      parsers,
    );
  }
  reader.offset += offsets[offsets.length - 1];
  return out;
}
/**
 * @param {DataReader} reader
 * @param {number} header
 * @param {VariantMetadata} metadata
 * @param {ParquetParsers} parsers
 * @returns {any[]}
 */
function readVariantArray(reader, header, metadata, parsers) {
  const fieldOffsetSize = header & 3;
  const isLarge = (header >> 2) & 1;
  const offsetWidth = fieldOffsetSize + 1;
  const numElements = readUnsigned(reader, isLarge ? 4 : 1);
  const offsets = new Array(numElements + 1);
  for (let i = 0; i < offsets.length; i++)
    offsets[i] = readUnsigned(reader, offsetWidth);
  const valuesStart = reader.offset;
  const result = new Array(numElements);
  for (let i = 0; i < numElements; i++) {
    const valueReader = {
      view: reader.view,
      offset: valuesStart + offsets[i],
    };
    result[i] = readVariant(valueReader, metadata, parsers);
  }
  reader.offset = valuesStart + offsets[offsets.length - 1];
  return result;
}
/**
 * @param {DataReader} reader
 * @param {number} width
 * @returns {number}
 */
function readVariantDecimal(reader, width) {
  const scale = reader.view.getUint8(reader.offset);
  reader.offset += 1;
  let unscaled;
  if (width === 4) {
    unscaled = BigInt(reader.view.getInt32(reader.offset, true));
    reader.offset += 4;
  } else if (width === 8) {
    unscaled = reader.view.getBigInt64(reader.offset, true);
    reader.offset += 8;
  } else {
    const low = reader.view.getBigUint64(reader.offset, true);
    unscaled = (reader.view.getBigInt64(reader.offset + 8, true) << 64n) | low;
    reader.offset += 16;
  }
  return Number(unscaled) * 10 ** -scale;
}
/**
 * @param {DataReader} reader
 * @returns {Uint8Array}
 */
function readVariantBinary(reader) {
  const length = reader.view.getUint32(reader.offset, true);
  reader.offset += 4;
  const bytes = new Uint8Array(
    reader.view.buffer,
    reader.view.byteOffset + reader.offset,
    length,
  );
  reader.offset += length;
  return bytes;
}
//#endregion
//#region ../../node_modules/hyparquet/src/assemble.js
/**
 * Reconstructs a complex nested structure from flat arrays of values and
 * definition and repetition levels, according to Dremel encoding.
 *
 * @param {any[]} output
 * @param {number[] | undefined} definitionLevels
 * @param {number[]} repetitionLevels
 * @param {DecodedArray} values
 * @param {SchemaTree[]} schemaPath
 * @returns {DecodedArray}
 */
function assembleLists(
  output,
  definitionLevels,
  repetitionLevels,
  values,
  schemaPath,
) {
  const maxDefinitionLevel = getMaxDefinitionLevel(schemaPath);
  if (!definitionLevels?.length && !repetitionLevels.length) {
    if (!maxDefinitionLevel || !values.length) return values;
    definitionLevels = new Array(values.length).fill(maxDefinitionLevel);
  }
  const n = definitionLevels?.length || repetitionLevels.length;
  const repetitionPath = schemaPath.map(
    ({ element }) => element.repetition_type,
  );
  let valueIndex = 0;
  const containerStack = [output];
  let currentContainer = output;
  let currentDepth = 0;
  let currentDefLevel = 0;
  let currentRepLevel = 0;
  if (repetitionLevels[0])
    while (
      currentDepth < repetitionPath.length - 2 &&
      currentRepLevel < repetitionLevels[0]
    ) {
      currentDepth++;
      if (repetitionPath[currentDepth] !== "REQUIRED") {
        currentContainer = currentContainer.at(-1);
        containerStack.push(currentContainer);
        currentDefLevel++;
      }
      if (repetitionPath[currentDepth] === "REPEATED") currentRepLevel++;
    }
  for (let i = 0; i < n; i++) {
    const def = definitionLevels?.length
      ? definitionLevels[i]
      : maxDefinitionLevel;
    const rep = repetitionLevels[i];
    while (
      currentDepth &&
      (rep < currentRepLevel || repetitionPath[currentDepth] !== "REPEATED")
    ) {
      if (repetitionPath[currentDepth] !== "REQUIRED") {
        containerStack.pop();
        currentDefLevel--;
      }
      if (repetitionPath[currentDepth] === "REPEATED") currentRepLevel--;
      currentDepth--;
    }
    currentContainer = containerStack.at(-1);
    while (
      (currentDepth < repetitionPath.length - 2 ||
        repetitionPath[currentDepth + 1] === "REPEATED") &&
      (currentDefLevel < def || repetitionPath[currentDepth + 1] === "REQUIRED")
    ) {
      currentDepth++;
      if (repetitionPath[currentDepth] !== "REQUIRED") {
        /** @type {any[]} */
        const newList = [];
        currentContainer.push(newList);
        currentContainer = newList;
        containerStack.push(newList);
        currentDefLevel++;
      }
      if (repetitionPath[currentDepth] === "REPEATED") currentRepLevel++;
    }
    if (def === maxDefinitionLevel) currentContainer.push(values[valueIndex++]);
    else if (currentDepth === repetitionPath.length - 2)
      currentContainer.push(null);
    else currentContainer.push([]);
  }
  if (!output.length)
    for (let i = 0; i < maxDefinitionLevel; i++) {
      /** @type {any[]} */
      const newList = [];
      currentContainer.push(newList);
      currentContainer = newList;
    }
  return output;
}
/**
 * Assemble a nested structure from subcolumn data.
 *
 * @param {Map<string, DecodedArray>} subcolumnData
 * @param {SchemaTree} schema top-level schema element
 * @param {ParquetParsers} parsers
 * @param {number} [depth] depth of nested structure
 */
function assembleNested(subcolumnData, schema, parsers, depth = 0) {
  const path = schema.path.join(".");
  const optional = schema.element.repetition_type === "OPTIONAL";
  const nextDepth = optional ? depth + 1 : depth;
  if (isListLike(schema)) {
    let sublist = schema.children[0];
    let subDepth = nextDepth;
    if (sublist.children.length === 1) {
      sublist = sublist.children[0];
      subDepth++;
    }
    assembleNested(subcolumnData, sublist, parsers, subDepth);
    const subcolumn = sublist.path.join(".");
    const values = subcolumnData.get(subcolumn);
    if (!values) throw new Error("parquet list column missing values");
    if (optional) flattenAtDepth(values, depth);
    subcolumnData.set(path, values);
    subcolumnData.delete(subcolumn);
    return;
  }
  if (isMapLike(schema)) {
    const mapName = schema.children[0].element.name;
    assembleNested(
      subcolumnData,
      schema.children[0].children[0],
      parsers,
      nextDepth + 1,
    );
    assembleNested(
      subcolumnData,
      schema.children[0].children[1],
      parsers,
      nextDepth + 1,
    );
    const keys = subcolumnData.get(`${path}.${mapName}.key`);
    const values = subcolumnData.get(`${path}.${mapName}.value`);
    if (!keys) throw new Error("parquet map column missing keys");
    if (!values) throw new Error("parquet map column missing values");
    if (keys.length !== values.length)
      throw new Error("parquet map column key/value length mismatch");
    const out = assembleMaps(keys, values, nextDepth);
    if (optional) flattenAtDepth(out, depth);
    subcolumnData.delete(`${path}.${mapName}.key`);
    subcolumnData.delete(`${path}.${mapName}.value`);
    subcolumnData.set(path, out);
    return;
  }
  if (schema.children.length) {
    const invertDepth =
      schema.element.repetition_type === "REQUIRED" ? depth : depth + 1;
    /** @type {Record<string, any>} */
    const struct = {};
    for (const child of schema.children) {
      assembleNested(subcolumnData, child, parsers, invertDepth);
      const childData = subcolumnData.get(child.path.join("."));
      if (!childData) throw new Error("parquet struct missing child data");
      struct[child.element.name] = childData;
    }
    for (const child of schema.children)
      subcolumnData.delete(child.path.join("."));
    let inverted = invertStruct(struct, invertDepth);
    if (schema.element.logical_type?.type === "VARIANT")
      inverted = decodeVariantColumn(inverted, parsers);
    if (optional) flattenAtDepth(inverted, depth);
    subcolumnData.set(path, inverted);
  }
}
/**
 * @import {DecodedArray, ParquetParsers, SchemaTree} from '../src/types.js'
 * @param {DecodedArray} arr
 * @param {number} depth
 */
function flattenAtDepth(arr, depth) {
  for (let i = 0; i < arr.length; i++)
    if (depth) flattenAtDepth(arr[i], depth - 1);
    else arr[i] = arr[i][0];
}
/**
 * @param {DecodedArray} keys
 * @param {DecodedArray} values
 * @param {number} depth
 * @returns {any[]}
 */
function assembleMaps(keys, values, depth) {
  const out = [];
  for (let i = 0; i < keys.length; i++)
    if (depth) out.push(assembleMaps(keys[i], values[i], depth - 1));
    else if (keys[i]) {
      /** @type {Record<string, any>} */
      const obj = {};
      for (let j = 0; j < keys[i].length; j++) {
        const value = values[i][j];
        obj[keys[i][j]] = value === void 0 ? null : value;
      }
      out.push(obj);
    } else out.push(void 0);
  return out;
}
/**
 * Invert a struct-like object by depth.
 *
 * @param {Record<string, any[]>} struct
 * @param {number} depth
 * @returns {any[]}
 */
function invertStruct(struct, depth) {
  const keys = Object.keys(struct);
  const length = struct[keys[0]]?.length;
  const out = [];
  for (let i = 0; i < length; i++) {
    /** @type {Record<string, any>} */
    const obj = {};
    for (const key of keys) {
      if (struct[key].length !== length)
        throw new Error("parquet struct parsing error");
      obj[key] = struct[key][i];
    }
    if (depth) out.push(invertStruct(obj, depth - 1));
    else out.push(obj);
  }
  return out;
}
//#endregion
//#region ../../node_modules/hyparquet/src/delta.js
/**
 * @import {DataReader} from '../src/types.js'
 */
/**
 * @param {DataReader} reader
 * @param {number} count number of values to read
 * @param {Int32Array | BigInt64Array} output
 */
function deltaBinaryUnpack(reader, count, output) {
  if (output instanceof Int32Array) {
    deltaBinaryUnpackInt32(reader, count, output);
    return;
  }
  const blockSize = readVarInt(reader);
  const miniblockPerBlock = readVarInt(reader);
  readVarInt(reader);
  let value = readZigZagBigInt(reader);
  let outputIndex = 0;
  output[outputIndex++] = value;
  const valuesPerMiniblock = blockSize / miniblockPerBlock;
  while (outputIndex < count) {
    const minDelta = readZigZagBigInt(reader);
    const bitWidths = new Uint8Array(miniblockPerBlock);
    for (let i = 0; i < miniblockPerBlock; i++)
      bitWidths[i] = reader.view.getUint8(reader.offset++);
    for (let i = 0; i < miniblockPerBlock && outputIndex < count; i++) {
      const bitWidth = bitWidths[i];
      if (bitWidth) {
        let bitpackPos = 0;
        let miniblockCount = valuesPerMiniblock;
        const mask = (1n << BigInt(bitWidth)) - 1n;
        while (miniblockCount && outputIndex < count) {
          let bits =
            BigInt(reader.view.getUint32(reader.offset, true) >>> bitpackPos) &
            mask;
          bitpackPos += bitWidth;
          while (bitpackPos >= 32) {
            bitpackPos -= 32;
            reader.offset += 4;
            if (bitpackPos)
              bits |=
                (BigInt(reader.view.getUint32(reader.offset, true)) <<
                  BigInt(bitWidth - bitpackPos)) &
                mask;
          }
          const delta = minDelta + bits;
          value += delta;
          output[outputIndex++] = value;
          miniblockCount--;
        }
        if (miniblockCount)
          reader.offset += Math.ceil(
            (miniblockCount * bitWidth + bitpackPos) / 8,
          );
      } else
        for (let j = 0; j < valuesPerMiniblock && outputIndex < count; j++) {
          value += minDelta;
          output[outputIndex++] = value;
        }
    }
  }
}
/**
 * Decode INT32 without BigInt arithmetic in the per-value loop.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @param {Int32Array} output
 */
function deltaBinaryUnpackInt32(reader, count, output) {
  const blockSize = readVarInt(reader);
  const miniblockPerBlock = readVarInt(reader);
  readVarInt(reader);
  let value = readZigZag(reader);
  let outputIndex = 0;
  output[outputIndex++] = value;
  const valuesPerMiniblock = blockSize / miniblockPerBlock;
  while (outputIndex < count) {
    const minDelta = readZigZag(reader);
    const bitWidthsOffset = reader.offset;
    reader.offset += miniblockPerBlock;
    for (let i = 0; i < miniblockPerBlock && outputIndex < count; i++) {
      const bitWidth = reader.view.getUint8(bitWidthsOffset + i);
      const end = reader.offset + (valuesPerMiniblock * bitWidth) / 8;
      let bitOffset = 0;
      for (let j = 0; j < valuesPerMiniblock && outputIndex < count; j++) {
        let residual = 0;
        let bitsRead = 0;
        while (bitsRead < bitWidth) {
          const bitsToRead = Math.min(8 - bitOffset, bitWidth - bitsRead);
          residual |=
            ((reader.view.getUint8(reader.offset) >>> bitOffset) &
              ((1 << bitsToRead) - 1)) <<
            bitsRead;
          bitsRead += bitsToRead;
          bitOffset += bitsToRead;
          if (bitOffset === 8) {
            bitOffset = 0;
            reader.offset++;
          }
        }
        value = (value + minDelta + residual) | 0;
        output[outputIndex++] = value;
      }
      reader.offset = end;
    }
  }
}
/**
 * @param {DataReader} reader
 * @param {number} count
 * @param {Uint8Array[]} output
 */
function deltaLengthByteArray(reader, count, output) {
  const lengths = new Int32Array(count);
  deltaBinaryUnpack(reader, count, lengths);
  for (let i = 0; i < count; i++) {
    output[i] = new Uint8Array(
      reader.view.buffer,
      reader.view.byteOffset + reader.offset,
      lengths[i],
    );
    reader.offset += lengths[i];
  }
}
/**
 * @param {DataReader} reader
 * @param {number} count
 * @param {Uint8Array[]} output
 */
function deltaByteArray(reader, count, output) {
  const prefixData = new Int32Array(count);
  deltaBinaryUnpack(reader, count, prefixData);
  const suffixData = new Int32Array(count);
  deltaBinaryUnpack(reader, count, suffixData);
  for (let i = 0; i < count; i++) {
    const suffix = new Uint8Array(
      reader.view.buffer,
      reader.view.byteOffset + reader.offset,
      suffixData[i],
    );
    if (prefixData[i]) {
      output[i] = new Uint8Array(prefixData[i] + suffixData[i]);
      output[i].set(output[i - 1].subarray(0, prefixData[i]));
      output[i].set(suffix, prefixData[i]);
    } else output[i] = suffix;
    reader.offset += suffixData[i];
  }
}
//#endregion
//#region ../../node_modules/hyparquet/src/encoding.js
/**
 * @import {DataReader, DecodedArray, ParquetType} from '../src/types.js'
 */
/**
 * Read values from a run-length encoded/bit-packed hybrid encoding.
 *
 * If length is zero, then read int32 length at the start.
 *
 * @param {DataReader} reader
 * @param {number} width - bitwidth
 * @param {DecodedArray} output
 * @param {number} [length] - length of the encoded data
 */
function readRleBitPackedHybrid(reader, width, output, length) {
  if (length === void 0) {
    length = reader.view.getUint32(reader.offset, true);
    reader.offset += 4;
  }
  const startOffset = reader.offset;
  let seen = 0;
  while (seen < output.length) {
    const header = readVarInt(reader);
    if (header & 1) seen = readBitPacked(reader, header, width, output, seen);
    else {
      const count = header >>> 1;
      readRle(reader, count, width, output, seen);
      seen += count;
    }
  }
  reader.offset = startOffset + length;
}
/**
 * Run-length encoding: read value with bitWidth and repeat it count times.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @param {number} bitWidth
 * @param {DecodedArray} output
 * @param {number} seen
 */
function readRle(reader, count, bitWidth, output, seen) {
  const width = (bitWidth + 7) >> 3;
  let value = 0;
  for (let i = 0; i < width; i++)
    value |= reader.view.getUint8(reader.offset++) << (i << 3);
  for (let i = 0; i < count; i++) output[seen + i] = value;
}
/**
 * Read a bit-packed run of the rle/bitpack hybrid.
 * Supports width > 8 (crossing bytes).
 *
 * @param {DataReader} reader
 * @param {number} header - bit-pack header
 * @param {number} bitWidth
 * @param {DecodedArray} output
 * @param {number} seen
 * @returns {number} total output values so far
 */
function readBitPacked(reader, header, bitWidth, output, seen) {
  let count = (header >> 1) << 3;
  const mask = (1 << bitWidth) - 1;
  let data = 0;
  if (reader.offset < reader.view.byteLength)
    data = reader.view.getUint8(reader.offset++);
  else if (mask)
    throw new Error(`parquet bitpack offset ${reader.offset} out of range`);
  let left = 8;
  let right = 0;
  while (count)
    if (right > 8) {
      right -= 8;
      left -= 8;
      data >>>= 8;
    } else if (left - right < bitWidth) {
      data |= reader.view.getUint8(reader.offset) << left;
      reader.offset++;
      left += 8;
    } else {
      if (seen < output.length) output[seen++] = (data >> right) & mask;
      count--;
      right += bitWidth;
    }
  return seen;
}
/**
 * @param {DataReader} reader
 * @param {number} count
 * @param {ParquetType} type
 * @param {number | undefined} typeLength
 * @returns {DecodedArray}
 */
function byteStreamSplit(reader, count, type, typeLength) {
  const width = byteWidth(type, typeLength);
  const bytes = new Uint8Array(count * width);
  for (let b = 0; b < width; b++)
    for (let i = 0; i < count; i++)
      bytes[i * width + b] = reader.view.getUint8(reader.offset++);
  if (type === "FLOAT") return new Float32Array(bytes.buffer);
  else if (type === "DOUBLE") return new Float64Array(bytes.buffer);
  else if (type === "INT32") return new Int32Array(bytes.buffer);
  else if (type === "INT64") return new BigInt64Array(bytes.buffer);
  else if (type === "FIXED_LEN_BYTE_ARRAY") {
    const split = new Array(count);
    for (let i = 0; i < count; i++)
      split[i] = bytes.subarray(i * width, (i + 1) * width);
    return split;
  }
  throw new Error(`parquet byte_stream_split unsupported type: ${type}`);
}
/**
 * @param {ParquetType} type
 * @param {number | undefined} typeLength
 * @returns {number}
 */
function byteWidth(type, typeLength) {
  switch (type) {
    case "INT32":
    case "FLOAT":
      return 4;
    case "INT64":
    case "DOUBLE":
      return 8;
    case "FIXED_LEN_BYTE_ARRAY":
      if (!typeLength) throw new Error("parquet byteWidth missing type_length");
      return typeLength;
    default:
      throw new Error(`parquet unsupported type: ${type}`);
  }
}
//#endregion
//#region ../../node_modules/hyparquet/src/plain.js
/**
 * Read `count` values of the given type from the reader.view.
 *
 * @param {DataReader} reader - buffer to read data from
 * @param {ParquetType} type - parquet type of the data
 * @param {number} count - number of values to read
 * @param {number | undefined} fixedLength - length of each fixed length byte array
 * @returns {DecodedArray} array of values
 */
function readPlain(reader, type, count, fixedLength) {
  if (count === 0) return [];
  if (type === "BOOLEAN") return readPlainBoolean(reader, count);
  else if (type === "INT32") return readPlainInt32(reader, count);
  else if (type === "INT64") return readPlainInt64(reader, count);
  else if (type === "INT96") return readPlainInt96(reader, count);
  else if (type === "FLOAT") return readPlainFloat(reader, count);
  else if (type === "DOUBLE") return readPlainDouble(reader, count);
  else if (type === "BYTE_ARRAY") return readPlainByteArray(reader, count);
  else if (type === "FIXED_LEN_BYTE_ARRAY") {
    if (!fixedLength) throw new Error("parquet missing fixed length");
    return readPlainByteArrayFixed(reader, count, fixedLength);
  } else throw new Error(`parquet unhandled type: ${type}`);
}
/**
 * Read `count` boolean values.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @returns {boolean[]}
 */
function readPlainBoolean(reader, count) {
  const values = new Array(count);
  for (let i = 0; i < count; i++) {
    const byteOffset = reader.offset + ((i / 8) | 0);
    const bitOffset = i % 8;
    const byte = reader.view.getUint8(byteOffset);
    values[i] = (byte & (1 << bitOffset)) !== 0;
  }
  reader.offset += Math.ceil(count / 8);
  return values;
}
/**
 * Read `count` int32 values.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @returns {Int32Array}
 */
function readPlainInt32(reader, count) {
  const values =
    (reader.view.byteOffset + reader.offset) % 4
      ? new Int32Array(
          align(
            reader.view.buffer,
            reader.view.byteOffset + reader.offset,
            count * 4,
          ),
        )
      : new Int32Array(
          reader.view.buffer,
          reader.view.byteOffset + reader.offset,
          count,
        );
  reader.offset += count * 4;
  return values;
}
/**
 * Read `count` int64 values.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @returns {BigInt64Array}
 */
function readPlainInt64(reader, count) {
  const values =
    (reader.view.byteOffset + reader.offset) % 8
      ? new BigInt64Array(
          align(
            reader.view.buffer,
            reader.view.byteOffset + reader.offset,
            count * 8,
          ),
        )
      : new BigInt64Array(
          reader.view.buffer,
          reader.view.byteOffset + reader.offset,
          count,
        );
  reader.offset += count * 8;
  return values;
}
/**
 * Read `count` int96 values.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @returns {bigint[]}
 */
function readPlainInt96(reader, count) {
  const values = new Array(count);
  for (let i = 0; i < count; i++) {
    const low = reader.view.getBigInt64(reader.offset + i * 12, true);
    const high = reader.view.getInt32(reader.offset + i * 12 + 8, true);
    values[i] = (BigInt(high) << 64n) | low;
  }
  reader.offset += count * 12;
  return values;
}
/**
 * Read `count` float values.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @returns {Float32Array}
 */
function readPlainFloat(reader, count) {
  const values =
    (reader.view.byteOffset + reader.offset) % 4
      ? new Float32Array(
          align(
            reader.view.buffer,
            reader.view.byteOffset + reader.offset,
            count * 4,
          ),
        )
      : new Float32Array(
          reader.view.buffer,
          reader.view.byteOffset + reader.offset,
          count,
        );
  reader.offset += count * 4;
  return values;
}
/**
 * Read `count` double values.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @returns {Float64Array}
 */
function readPlainDouble(reader, count) {
  const values =
    (reader.view.byteOffset + reader.offset) % 8
      ? new Float64Array(
          align(
            reader.view.buffer,
            reader.view.byteOffset + reader.offset,
            count * 8,
          ),
        )
      : new Float64Array(
          reader.view.buffer,
          reader.view.byteOffset + reader.offset,
          count,
        );
  reader.offset += count * 8;
  return values;
}
/**
 * Read `count` byte array values.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @returns {Uint8Array[]}
 */
function readPlainByteArray(reader, count) {
  const values = new Array(count);
  for (let i = 0; i < count; i++) {
    const length = reader.view.getUint32(reader.offset, true);
    reader.offset += 4;
    values[i] = new Uint8Array(
      reader.view.buffer,
      reader.view.byteOffset + reader.offset,
      length,
    );
    reader.offset += length;
  }
  return values;
}
/**
 * Read a fixed length byte array.
 *
 * @param {DataReader} reader
 * @param {number} count
 * @param {number} fixedLength
 * @returns {Uint8Array[]}
 */
function readPlainByteArrayFixed(reader, count, fixedLength) {
  const values = new Array(count);
  for (let i = 0; i < count; i++) {
    values[i] = new Uint8Array(
      reader.view.buffer,
      reader.view.byteOffset + reader.offset,
      fixedLength,
    );
    reader.offset += fixedLength;
  }
  return values;
}
/**
 * Create a new buffer with the offset and size.
 *
 * @import {DataReader, DecodedArray, ParquetType} from '../src/types.js'
 * @param {ArrayBufferLike} buffer
 * @param {number} offset
 * @param {number} size
 * @returns {ArrayBuffer}
 */
function align(buffer, offset, size) {
  const aligned = new ArrayBuffer(size);
  new Uint8Array(aligned).set(new Uint8Array(buffer, offset, size));
  return aligned;
}
//#endregion
//#region ../../node_modules/hyparquet/src/snappy.js
/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Zhipeng Jia
 * https://github.com/zhipeng-jia/snappyjs
 */
var WORD_MASK = [0, 255, 65535, 16777215, 4294967295];
/**
 * Copy bytes from one array to another
 *
 * @param {Uint8Array} fromArray source array
 * @param {number} fromPos source position
 * @param {Uint8Array} toArray destination array
 * @param {number} toPos destination position
 * @param {number} length number of bytes to copy
 */
function copyBytes(fromArray, fromPos, toArray, toPos, length) {
  for (let i = 0; i < length; i++) toArray[toPos + i] = fromArray[fromPos + i];
}
/**
 * Decompress snappy data.
 * Accepts an output buffer to avoid allocating a new buffer for each call.
 *
 * @param {Uint8Array} input compressed data
 * @param {Uint8Array} output output buffer
 */
function snappyUncompress(input, output) {
  const inputLength = input.byteLength;
  const outputLength = output.byteLength;
  let pos = 0;
  let outPos = 0;
  while (pos < inputLength) {
    const c = input[pos];
    pos++;
    if (c < 128) break;
  }
  if (outputLength && pos >= inputLength)
    throw new Error("invalid snappy length header");
  while (pos < inputLength) {
    const c = input[pos];
    let len = 0;
    pos++;
    if (pos >= inputLength) throw new Error("missing eof marker");
    if ((c & 3) === 0) {
      let len = (c >>> 2) + 1;
      if (len > 60) {
        if (pos + 3 >= inputLength)
          throw new Error("snappy error literal pos + 3 >= inputLength");
        const lengthSize = len - 60;
        len =
          input[pos] +
          (input[pos + 1] << 8) +
          (input[pos + 2] << 16) +
          (input[pos + 3] << 24);
        len = (len & WORD_MASK[lengthSize]) + 1;
        pos += lengthSize;
      }
      if (pos + len > inputLength)
        throw new Error("snappy error literal exceeds input length");
      copyBytes(input, pos, output, outPos, len);
      pos += len;
      outPos += len;
    } else {
      let offset = 0;
      switch (c & 3) {
        case 1:
          len = ((c >>> 2) & 7) + 4;
          offset = input[pos] + ((c >>> 5) << 8);
          pos++;
          break;
        case 2:
          if (inputLength <= pos + 1)
            throw new Error("snappy error end of input");
          len = (c >>> 2) + 1;
          offset = input[pos] + (input[pos + 1] << 8);
          pos += 2;
          break;
        case 3:
          if (inputLength <= pos + 3)
            throw new Error("snappy error end of input");
          len = (c >>> 2) + 1;
          offset =
            input[pos] +
            (input[pos + 1] << 8) +
            (input[pos + 2] << 16) +
            (input[pos + 3] << 24);
          pos += 4;
      }
      if (offset === 0 || isNaN(offset))
        throw new Error(
          `invalid offset ${offset} pos ${pos} inputLength ${inputLength}`,
        );
      if (offset > outPos)
        throw new Error("cannot copy from before start of buffer");
      copyBytes(output, outPos - offset, output, outPos, len);
      outPos += len;
    }
  }
  if (outPos !== outputLength) throw new Error("premature end of input");
}
//#endregion
//#region ../../node_modules/hyparquet/src/datapage.js
/**
 * @import {ColumnDecoder, CompressionCodec, Compressors, DataPage, DataPageHeader, DataPageHeaderV2, DataReader, DecodedArray, PageHeader, SchemaTree} from '../src/types.js'
 */
/**
 * Read a data page from uncompressed reader.
 *
 * @param {Uint8Array} bytes raw page data (should already be decompressed)
 * @param {DataPageHeader} daph data page header
 * @param {ColumnDecoder} columnDecoder
 * @returns {DataPage} definition levels, repetition levels, and array of values
 */
function readDataPage(bytes, daph, { type, element, schemaPath }) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const reader = {
    view,
    offset: 0,
  };
  /** @type {DecodedArray} */
  let dataPage;
  const repetitionLevels = readRepetitionLevels(reader, daph, schemaPath);
  const { definitionLevels, numNulls } = readDefinitionLevels(
    reader,
    daph,
    schemaPath,
  );
  const nValues = daph.num_values - numNulls;
  if (daph.encoding === "PLAIN")
    dataPage = readPlain(reader, type, nValues, element.type_length);
  else if (
    daph.encoding === "PLAIN_DICTIONARY" ||
    daph.encoding === "RLE_DICTIONARY" ||
    daph.encoding === "RLE"
  ) {
    const bitWidth = type === "BOOLEAN" ? 1 : view.getUint8(reader.offset++);
    if (bitWidth) {
      dataPage = new Array(nValues);
      if (type === "BOOLEAN") {
        readRleBitPackedHybrid(reader, bitWidth, dataPage);
        dataPage = dataPage.map((x) => !!x);
      } else
        readRleBitPackedHybrid(
          reader,
          bitWidth,
          dataPage,
          view.byteLength - reader.offset,
        );
    } else dataPage = new Uint8Array(nValues);
  } else if (daph.encoding === "BYTE_STREAM_SPLIT")
    dataPage = byteStreamSplit(reader, nValues, type, element.type_length);
  else if (daph.encoding === "DELTA_BINARY_PACKED") {
    dataPage =
      type === "INT32" ? new Int32Array(nValues) : new BigInt64Array(nValues);
    deltaBinaryUnpack(reader, nValues, dataPage);
  } else if (daph.encoding === "DELTA_LENGTH_BYTE_ARRAY") {
    dataPage = new Array(nValues);
    deltaLengthByteArray(reader, nValues, dataPage);
  } else throw new Error(`parquet unsupported encoding: ${daph.encoding}`);
  return {
    definitionLevels,
    repetitionLevels,
    dataPage,
  };
}
/**
 * @param {DataReader} reader data view for the page
 * @param {DataPageHeader} daph data page header
 * @param {SchemaTree[]} schemaPath
 * @returns {any[]} repetition levels and number of bytes read
 */
function readRepetitionLevels(reader, daph, schemaPath) {
  if (schemaPath.length > 1) {
    const maxRepetitionLevel = getMaxRepetitionLevel(schemaPath);
    if (maxRepetitionLevel) {
      const values = new Array(daph.num_values);
      readRleBitPackedHybrid(reader, bitWidth(maxRepetitionLevel), values);
      return values;
    }
  }
  return [];
}
/**
 * @param {DataReader} reader data view for the page
 * @param {DataPageHeader} daph data page header
 * @param {SchemaTree[]} schemaPath
 * @returns {{ definitionLevels: number[], numNulls: number }} definition levels
 */
function readDefinitionLevels(reader, daph, schemaPath) {
  const maxDefinitionLevel = getMaxDefinitionLevel(schemaPath);
  if (!maxDefinitionLevel)
    return {
      definitionLevels: [],
      numNulls: 0,
    };
  const definitionLevels = new Array(daph.num_values);
  readRleBitPackedHybrid(
    reader,
    bitWidth(maxDefinitionLevel),
    definitionLevels,
  );
  let numNulls = daph.num_values;
  for (const def of definitionLevels)
    if (def === maxDefinitionLevel) numNulls--;
  if (numNulls === 0) definitionLevels.length = 0;
  return {
    definitionLevels,
    numNulls,
  };
}
/**
 * @param {Uint8Array} compressedBytes
 * @param {number} uncompressed_page_size
 * @param {CompressionCodec} codec
 * @param {Compressors | undefined} compressors
 * @returns {Uint8Array}
 */
function decompressPage(
  compressedBytes,
  uncompressed_page_size,
  codec,
  compressors,
) {
  /** @type {Uint8Array} */
  let page;
  const customDecompressor = compressors?.[codec];
  if (codec === "UNCOMPRESSED") page = compressedBytes;
  else if (customDecompressor)
    page = customDecompressor(compressedBytes, uncompressed_page_size);
  else if (codec === "SNAPPY") {
    page = new Uint8Array(uncompressed_page_size);
    snappyUncompress(compressedBytes, page);
  } else throw new Error(`parquet unsupported compression codec: ${codec}`);
  if (page?.length !== uncompressed_page_size)
    throw new Error(
      `parquet decompressed page length ${page?.length} does not match header ${uncompressed_page_size}`,
    );
  return page;
}
/**
 * Read a data page from the given Uint8Array.
 *
 * @param {Uint8Array} compressedBytes raw page data
 * @param {PageHeader} ph page header
 * @param {ColumnDecoder} columnDecoder
 * @returns {DataPage} definition levels, repetition levels, and array of values
 */
function readDataPageV2(compressedBytes, ph, columnDecoder) {
  const reader = {
    view: new DataView(
      compressedBytes.buffer,
      compressedBytes.byteOffset,
      compressedBytes.byteLength,
    ),
    offset: 0,
  };
  const { type, element, schemaPath, codec, compressors } = columnDecoder;
  const daph2 = ph.data_page_header_v2;
  if (!daph2) throw new Error("parquet data page header v2 is undefined");
  const repetitionLevels = readRepetitionLevelsV2(reader, daph2, schemaPath);
  reader.offset = daph2.repetition_levels_byte_length;
  const definitionLevels = readDefinitionLevelsV2(reader, daph2, schemaPath);
  const uncompressedPageSize =
    ph.uncompressed_page_size -
    daph2.definition_levels_byte_length -
    daph2.repetition_levels_byte_length;
  let page = compressedBytes.subarray(reader.offset);
  if (daph2.is_compressed !== false)
    page = decompressPage(page, uncompressedPageSize, codec, compressors);
  const pageView = new DataView(page.buffer, page.byteOffset, page.byteLength);
  const pageReader = {
    view: pageView,
    offset: 0,
  };
  /** @type {DecodedArray} */
  let dataPage;
  const nValues = daph2.num_values - daph2.num_nulls;
  if (daph2.encoding === "PLAIN")
    dataPage = readPlain(pageReader, type, nValues, element.type_length);
  else if (daph2.encoding === "RLE") {
    dataPage = new Array(nValues);
    readRleBitPackedHybrid(pageReader, 1, dataPage);
    dataPage = dataPage.map((x) => !!x);
  } else if (
    daph2.encoding === "PLAIN_DICTIONARY" ||
    daph2.encoding === "RLE_DICTIONARY"
  ) {
    const bitWidth = pageView.getUint8(pageReader.offset++);
    dataPage = new Array(nValues);
    readRleBitPackedHybrid(
      pageReader,
      bitWidth,
      dataPage,
      uncompressedPageSize - 1,
    );
  } else if (daph2.encoding === "DELTA_BINARY_PACKED") {
    dataPage =
      type === "INT32" ? new Int32Array(nValues) : new BigInt64Array(nValues);
    deltaBinaryUnpack(pageReader, nValues, dataPage);
  } else if (daph2.encoding === "DELTA_LENGTH_BYTE_ARRAY") {
    dataPage = new Array(nValues);
    deltaLengthByteArray(pageReader, nValues, dataPage);
  } else if (daph2.encoding === "DELTA_BYTE_ARRAY") {
    dataPage = new Array(nValues);
    deltaByteArray(pageReader, nValues, dataPage);
  } else if (daph2.encoding === "BYTE_STREAM_SPLIT")
    dataPage = byteStreamSplit(pageReader, nValues, type, element.type_length);
  else throw new Error(`parquet unsupported encoding: ${daph2.encoding}`);
  return {
    definitionLevels,
    repetitionLevels,
    dataPage,
  };
}
/**
 * @param {DataReader} reader
 * @param {DataPageHeaderV2} daph2 data page header v2
 * @param {SchemaTree[]} schemaPath
 * @returns {any[]} repetition levels
 */
function readRepetitionLevelsV2(reader, daph2, schemaPath) {
  const maxRepetitionLevel = getMaxRepetitionLevel(schemaPath);
  if (!maxRepetitionLevel) return [];
  const values = new Array(daph2.num_values);
  readRleBitPackedHybrid(
    reader,
    bitWidth(maxRepetitionLevel),
    values,
    daph2.repetition_levels_byte_length,
  );
  return values;
}
/**
 * @param {DataReader} reader
 * @param {DataPageHeaderV2} daph2 data page header v2
 * @param {SchemaTree[]} schemaPath
 * @returns {number[] | undefined} definition levels
 */
function readDefinitionLevelsV2(reader, daph2, schemaPath) {
  const maxDefinitionLevel = getMaxDefinitionLevel(schemaPath);
  if (maxDefinitionLevel) {
    const values = new Array(daph2.num_values);
    readRleBitPackedHybrid(
      reader,
      bitWidth(maxDefinitionLevel),
      values,
      daph2.definition_levels_byte_length,
    );
    return values;
  }
}
/**
 * Minimum bits needed to store value.
 *
 * @param {number} value
 * @returns {number}
 */
function bitWidth(value) {
  return 32 - Math.clz32(value);
}
//#endregion
//#region ../../node_modules/hyparquet/src/column.js
/**
 * @import {ColumnDecoder, DataReader, DecodedArray, PageHeader, PageResult, RowGroupSelect, SubColumnData} from '../src/types.js'
 */
/**
 * Parse column data from a buffer.
 *
 * @param {DataReader} reader
 * @param {RowGroupSelect} rowGroupSelect row group selection
 * @param {ColumnDecoder} columnDecoder column decoder params
 * @param {(chunk: SubColumnData) => void} [onPage] callback for each page
 * @returns {{ data: DecodedArray[], skipped: number }}
 */
function readColumn(
  reader,
  { groupStart, selectStart, selectEnd },
  columnDecoder,
  onPage,
) {
  const { pathInSchema, schemaPath } = columnDecoder;
  const isFlat = isFlatColumn(schemaPath);
  /** @type {DecodedArray[]} */
  const chunks = [];
  /** @type {DecodedArray | undefined} */
  let dictionary = void 0;
  /** @type {DecodedArray | undefined} */
  let lastChunk = void 0;
  let rowCount = 0;
  let skipped = 0;
  const emitLastChunk =
    onPage &&
    (() => {
      lastChunk &&
        onPage({
          pathInSchema,
          columnData: lastChunk,
          rowStart: groupStart + rowCount - lastChunk.length,
          rowEnd: groupStart + rowCount,
        });
    });
  while (
    isFlat ? rowCount < selectEnd : reader.offset < reader.view.byteLength - 1
  ) {
    if (reader.offset >= reader.view.byteLength - 1) break;
    const header = parquetHeader(reader);
    if (header.type === "DICTIONARY_PAGE") {
      const { data } = readPage(
        reader,
        header,
        columnDecoder,
        dictionary,
        void 0,
        0,
      );
      if (data) dictionary = convert(data, columnDecoder);
    } else {
      const lastChunkLength = lastChunk?.length || 0;
      const result = readPage(
        reader,
        header,
        columnDecoder,
        dictionary,
        lastChunk,
        selectStart - rowCount,
      );
      if (result.skipped) {
        if (!chunks.length) skipped += result.skipped;
        rowCount += result.skipped;
      } else if (result.data && lastChunk === result.data)
        rowCount += result.data.length - lastChunkLength;
      else if (result.data && result.data.length) {
        emitLastChunk?.();
        chunks.push(result.data);
        rowCount += result.data.length;
        lastChunk = result.data;
      }
    }
  }
  emitLastChunk?.();
  return {
    data: chunks,
    skipped,
  };
}
/**
 * Read a page (data or dictionary) from a buffer.
 *
 * @param {DataReader} reader
 * @param {PageHeader} header
 * @param {ColumnDecoder} columnDecoder
 * @param {DecodedArray | undefined} dictionary
 * @param {DecodedArray | undefined} previousChunk
 * @param {number} pageStart skip this many rows in the page
 * @returns {PageResult}
 */
function readPage(
  reader,
  header,
  columnDecoder,
  dictionary,
  previousChunk,
  pageStart,
) {
  const { type, element, schemaPath, codec, compressors } = columnDecoder;
  const compressedBytes = new Uint8Array(
    reader.view.buffer,
    reader.view.byteOffset + reader.offset,
    header.compressed_page_size,
  );
  reader.offset += header.compressed_page_size;
  if (header.type === "DATA_PAGE") {
    const daph = header.data_page_header;
    if (!daph) throw new Error("parquet data page header is undefined");
    if (pageStart > daph.num_values && isFlatColumn(schemaPath))
      return { skipped: daph.num_values };
    const { definitionLevels, repetitionLevels, dataPage } = readDataPage(
      decompressPage(
        compressedBytes,
        Number(header.uncompressed_page_size),
        codec,
        compressors,
      ),
      daph,
      columnDecoder,
    );
    const values = convertWithDictionary(
      dataPage,
      dictionary,
      daph.encoding,
      columnDecoder,
    );
    return {
      skipped: 0,
      data: assembleLists(
        Array.isArray(previousChunk) ? previousChunk : [],
        definitionLevels,
        repetitionLevels,
        values,
        schemaPath,
      ),
    };
  } else if (header.type === "DATA_PAGE_V2") {
    const daph2 = header.data_page_header_v2;
    if (!daph2) throw new Error("parquet data page header v2 is undefined");
    if (pageStart > daph2.num_rows) return { skipped: daph2.num_values };
    const { definitionLevels, repetitionLevels, dataPage } = readDataPageV2(
      compressedBytes,
      header,
      columnDecoder,
    );
    const values = convertWithDictionary(
      dataPage,
      dictionary,
      daph2.encoding,
      columnDecoder,
    );
    return {
      skipped: 0,
      data: assembleLists(
        Array.isArray(previousChunk) ? previousChunk : [],
        definitionLevels,
        repetitionLevels,
        values,
        schemaPath,
      ),
    };
  } else if (header.type === "DICTIONARY_PAGE") {
    const diph = header.dictionary_page_header;
    if (!diph) throw new Error("parquet dictionary page header is undefined");
    const page = decompressPage(
      compressedBytes,
      Number(header.uncompressed_page_size),
      codec,
      compressors,
    );
    return {
      skipped: 0,
      data: readPlain(
        {
          view: new DataView(page.buffer, page.byteOffset, page.byteLength),
          offset: 0,
        },
        type,
        diph.num_values,
        element.type_length,
      ),
    };
  } else throw new Error(`parquet unsupported page type: ${header.type}`);
}
/**
 * Read parquet header from a buffer.
 *
 * @param {DataReader} reader
 * @returns {PageHeader}
 */
function parquetHeader(reader) {
  const header = deserializeTCompactProtocol(reader);
  return {
    type: PageTypes[header.field_1],
    uncompressed_page_size: header.field_2,
    compressed_page_size: header.field_3,
    crc: header.field_4,
    data_page_header: header.field_5 && {
      num_values: header.field_5.field_1,
      encoding: Encodings[header.field_5.field_2],
      definition_level_encoding: Encodings[header.field_5.field_3],
      repetition_level_encoding: Encodings[header.field_5.field_4],
      statistics: header.field_5.field_5 && {
        max: header.field_5.field_5.field_1,
        min: header.field_5.field_5.field_2,
        null_count: header.field_5.field_5.field_3,
        distinct_count: header.field_5.field_5.field_4,
        max_value: header.field_5.field_5.field_5,
        min_value: header.field_5.field_5.field_6,
      },
    },
    index_page_header: header.field_6,
    dictionary_page_header: header.field_7 && {
      num_values: header.field_7.field_1,
      encoding: Encodings[header.field_7.field_2],
      is_sorted: header.field_7.field_3,
    },
    data_page_header_v2: header.field_8 && {
      num_values: header.field_8.field_1,
      num_nulls: header.field_8.field_2,
      num_rows: header.field_8.field_3,
      encoding: Encodings[header.field_8.field_4],
      definition_levels_byte_length: header.field_8.field_5,
      repetition_levels_byte_length: header.field_8.field_6,
      is_compressed:
        header.field_8.field_7 === void 0 ? true : header.field_8.field_7,
      statistics: header.field_8.field_8,
    },
  };
}
//#endregion
//#region ../../node_modules/hyparquet/src/rowgroup.js
/**
 * @import {AsyncColumn, AsyncRowGroup, ChunkPlan, ColumnDecoder, DecodedArray, GroupPlan, PageLocation, ParquetParsers, ParquetReadOptions, QueryPlan, SchemaTree} from '../src/types.js'
 */
/**
 * Read a row group from a file-like object.
 *
 * @param {ParquetReadOptions} options
 * @param {QueryPlan} plan
 * @param {GroupPlan} groupPlan
 * @returns {AsyncRowGroup} resolves to column data
 */
function readRowGroup(options, { metadata }, groupPlan) {
  /** @type {AsyncColumn[]} */
  const asyncColumns = [];
  for (const chunk of groupPlan.chunks) {
    const { path_in_schema: pathInSchema } = chunk.columnMetadata;
    const schemaPath = getSchemaPath(metadata.schema, pathInSchema);
    const columnDecoder = {
      pathInSchema,
      element: schemaPath[schemaPath.length - 1].element,
      schemaPath,
      ...options,
      ...chunk.columnMetadata,
      parsers: {
        ...DEFAULT_PARSERS,
        ...options.parsers,
      },
    };
    const { startByte, endByte } = chunk.range;
    if ("pageLocations" in chunk)
      asyncColumns.push({
        pathInSchema,
        data: readSelectedPages(
          options,
          groupPlan,
          chunk,
          chunk.pageLocations,
          columnDecoder,
        ),
      });
    else if ("offsetIndex" in chunk)
      asyncColumns.push({
        pathInSchema,
        data: Promise.resolve(
          options.file.slice(
            chunk.offsetIndex.startByte,
            chunk.offsetIndex.endByte,
          ),
        ).then((arrayBuffer) => {
          const pages = readOffsetIndex({
            view: new DataView(arrayBuffer),
            offset: 0,
          }).page_locations;
          return readSelectedPages(
            options,
            groupPlan,
            chunk,
            pages,
            columnDecoder,
          );
        }),
      });
    else
      asyncColumns.push({
        pathInSchema,
        data: Promise.resolve(options.file.slice(startByte, endByte)).then(
          (buffer) => {
            return readColumn(
              {
                view: new DataView(buffer),
                offset: 0,
              },
              groupPlan,
              columnDecoder,
              options.onPage,
            );
          },
        ),
      });
  }
  return {
    groupStart: groupPlan.groupStart,
    groupRows: groupPlan.groupRows,
    selectStart: groupPlan.selectStart,
    selectEnd: groupPlan.selectEnd,
    asyncColumns,
  };
}
/**
 * Read only the pages of a column chunk that overlap the group plan's select
 * range [selectStart, selectEnd), using page locations from the offset index.
 *
 * @param {ParquetReadOptions} options
 * @param {GroupPlan} groupPlan
 * @param {ChunkPlan} chunk
 * @param {PageLocation[]} pages
 * @param {ColumnDecoder} columnDecoder
 * @returns {Promise<{data: DecodedArray[], skipped: number}>}
 */
async function readSelectedPages(
  options,
  groupPlan,
  chunk,
  pages,
  columnDecoder,
) {
  const { data_page_offset, dictionary_page_offset } = chunk.columnMetadata;
  const { selectStart, selectEnd } = groupPlan;
  let { startByte, endByte } = chunk.range;
  let skipped = -1;
  const hasDict = dictionary_page_offset || data_page_offset < pages[0].offset;
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageStart = Number(page.first_row_index);
    const pageEnd =
      i + 1 < pages.length
        ? Number(pages[i + 1].first_row_index)
        : groupPlan.groupRows;
    if (skipped < 0 && pageEnd > selectStart) {
      startByte = Number(page.offset);
      skipped = pageStart;
    }
    if (pageStart < selectEnd)
      endByte = Number(page.offset) + page.compressed_page_size;
  }
  if (skipped < 0) skipped = 0;
  /** @type {DataView} */
  let view;
  if (hasDict && skipped) {
    const dictLength = Number(pages[0].offset) - chunk.range.startByte;
    const [dictBuffer, dataBuffer] = await Promise.all([
      options.file.slice(chunk.range.startByte, Number(pages[0].offset)),
      options.file.slice(startByte, endByte),
    ]);
    const combined = new Uint8Array(dictLength + dataBuffer.byteLength);
    combined.set(new Uint8Array(dictBuffer, 0, dictLength));
    combined.set(new Uint8Array(dataBuffer), dictLength);
    view = new DataView(combined.buffer);
  } else if (hasDict)
    view = new DataView(
      await options.file.slice(chunk.range.startByte, endByte),
    );
  else view = new DataView(await options.file.slice(startByte, endByte));
  const { data, skipped: columnSkipped } = readColumn(
    {
      view,
      offset: 0,
    },
    skipped
      ? {
          ...groupPlan,
          groupStart: groupPlan.groupStart + skipped,
          selectStart: groupPlan.selectStart - skipped,
          selectEnd: groupPlan.selectEnd - skipped,
        }
      : groupPlan,
    columnDecoder,
    options.onPage,
  );
  return {
    data,
    skipped: skipped + columnSkipped,
  };
}
/**
 * @overload
 * @param {AsyncRowGroup} asyncGroup
 * @param {number} selectStart
 * @param {number} selectEnd
 * @param {string[] | undefined} columns
 * @param {'object'} rowFormat
 * @returns {Promise<Record<string, any>[]>} resolves to row data
 */
/**
 * @overload
 * @param {AsyncRowGroup} asyncGroup
 * @param {number} selectStart
 * @param {number} selectEnd
 * @param {string[] | undefined} columns
 * @param {'array'} [rowFormat]
 * @returns {Promise<any[][]>} resolves to row data
 */
/**
 * @param {AsyncRowGroup} asyncGroup
 * @param {number} selectStart
 * @param {number} selectEnd
 * @param {string[] | undefined} columns
 * @param {'object' | 'array'} [rowFormat]
 * @returns {Promise<Record<string, any>[] | any[][]>} resolves to row data
 */
async function asyncGroupToRows(
  { asyncColumns },
  selectStart,
  selectEnd,
  columns,
  rowFormat,
) {
  const asyncPages = await Promise.all(
    asyncColumns.map((column) =>
      column.data.then(({ skipped, data }) => ({
        skipped,
        data: flatten(data),
      })),
    ),
  );
  const selectCount = selectEnd - selectStart;
  if (rowFormat === "object") {
    /** @type {Record<string, any>[]} */
    const groupData = Array(selectCount);
    for (let selectRow = 0; selectRow < selectCount; selectRow++) {
      /** @type {Record<string, any>} */
      const rowData = {};
      for (let i = 0; i < asyncColumns.length; i++) {
        const { data, skipped } = asyncPages[i];
        rowData[asyncColumns[i].pathInSchema[0]] =
          data[selectStart + selectRow - skipped];
      }
      groupData[selectRow] = rowData;
    }
    return groupData;
  }
  const includedColumnNames = asyncColumns
    .map((child) => child.pathInSchema[0])
    .filter((name) => !columns || columns.includes(name));
  const columnOrder = columns ?? includedColumnNames;
  const columnIndexes = columnOrder.map((name) =>
    asyncColumns.findIndex((column) => column.pathInSchema[0] === name),
  );
  /** @type {any[][]} */
  const groupData = Array(selectCount);
  for (let selectRow = 0; selectRow < selectCount; selectRow++) {
    const rowData = Array(asyncColumns.length);
    for (let i = 0; i < columnOrder.length; i++) {
      const colIdx = columnIndexes[i];
      if (colIdx < 0)
        throw new Error(`parquet column not found: ${columnOrder[i]}`);
      const { data, skipped } = asyncPages[colIdx];
      rowData[i] = data[selectStart + selectRow - skipped];
    }
    groupData[selectRow] = rowData;
  }
  return groupData;
}
/**
 * Assemble physical columns into top-level columns asynchronously.
 *
 * @param {AsyncRowGroup} asyncRowGroup
 * @param {SchemaTree} schemaTree
 * @param {Partial<ParquetParsers>} [parsers]
 * @returns {AsyncRowGroup}
 */
function assembleAsync(asyncRowGroup, schemaTree, parsers) {
  const { asyncColumns } = asyncRowGroup;
  const allParsers = {
    ...DEFAULT_PARSERS,
    ...parsers,
  };
  /** @type {AsyncColumn[]} */
  const assembled = [];
  for (const child of schemaTree.children)
    if (child.children.length) {
      const childColumns = asyncColumns.filter(
        (column) => column.pathInSchema[0] === child.element.name,
      );
      if (!childColumns.length) continue;
      assembled.push({
        pathInSchema: child.path,
        data: (async () => {
          const resolved = await Promise.all(childColumns.map((c) => c.data));
          /** @type {Map<string, DecodedArray>} */
          const subcolumnData = /* @__PURE__ */ new Map();
          const flattened = resolved.map(({ data }) => flatten(data));
          const skipped = Math.max(
            asyncRowGroup.selectStart ?? 0,
            ...resolved.map((result) => result.skipped),
          );
          const end = Math.min(
            asyncRowGroup.selectEnd ?? Infinity,
            ...resolved.map(
              (result, i) => result.skipped + flattened[i].length,
            ),
          );
          for (let i = 0; i < childColumns.length; i++) {
            const start = skipped - resolved[i].skipped;
            const length = Math.max(0, end - skipped);
            subcolumnData.set(
              childColumns[i].pathInSchema.join("."),
              flattened[i].slice(start, start + length),
            );
          }
          assembleNested(subcolumnData, child, allParsers);
          const assembled = subcolumnData.get(child.element.name);
          if (!assembled) throw new Error("parquet column data not assembled");
          return {
            data: [assembled],
            skipped,
          };
        })(),
      });
    } else {
      const asyncColumn = asyncColumns.find(
        (column) => column.pathInSchema[0] === child.element.name,
      );
      if (asyncColumn) assembled.push(asyncColumn);
    }
  return {
    ...asyncRowGroup,
    asyncColumns: assembled,
  };
}
//#endregion
//#region ../../node_modules/hyparquet/src/scan.js
/**
 * @import {AsyncRowGroup, BaseParquetReadOptions, BloomFilter, DecodedArray, PageLocation, PageRanges, ParquetScan, ParquetScanOptions, QueryPlan, SchemaElement} from '../src/types.js'
 */
/**
 * @typedef {BaseParquetReadOptions & {
 *   bloomFiltersByGroup?: Record<string, BloomFilter>[],
 *   schemaElements?: Record<string, SchemaElement>,
 *   pageRangesByGroup?: (PageRanges | undefined)[],
 *   pageLocationsByGroup?: Record<string, PageLocation[]>[],
 * }} PreparedParquetReadOptions
 */
/**
 * Load optional indexes and build the canonical physical read plan.
 * Shared by row-oriented reads and lazy scans so pruning behavior cannot
 * diverge between APIs.
 *
 * @param {BaseParquetReadOptions} options
 * @returns {Promise<{options: PreparedParquetReadOptions, plan: QueryPlan}>}
 */
async function prepareParquetRead(options) {
  const prepared = await prepareParquetOptions(options);
  return {
    options: prepared,
    plan: parquetPlan(prepared),
  };
}
/**
 * Load optional indexes and validate read options without planning data reads.
 *
 * @param {BaseParquetReadOptions} options
 * @returns {Promise<PreparedParquetReadOptions>}
 */
async function prepareParquetOptions(options) {
  const metadata =
    options.metadata ?? (await parquetMetadataAsync(options.file, options));
  const schemaColumns = parquetSchema(metadata).children.map(
    (child) => child.element.name,
  );
  const missingFilterColumns = columnsNeededForFilter(options.filter).filter(
    (column) => !schemaColumns.includes(column),
  );
  if (missingFilterColumns.length)
    throw new Error(
      `parquet filter columns not found: ${missingFilterColumns.join(", ")}`,
    );
  if (options.columns) {
    const missingColumns = options.columns.filter(
      (column) => !schemaColumns.includes(column),
    );
    if (missingColumns.length)
      throw new Error(`parquet column not found: ${missingColumns[0]}`);
  }
  /** @type {PreparedParquetReadOptions} */
  let prepared = {
    ...options,
    metadata,
  };
  prepared = await withBloomFilters(prepared);
  prepared = await withPageIndexes(prepared);
  return prepared;
}
/**
 * Read all planned row groups, prefetching their coalesced byte ranges.
 *
 * @param {BaseParquetReadOptions} options
 * @param {QueryPlan} plan
 * @returns {AsyncRowGroup[]}
 */
function readParquetPlan(options, plan) {
  const readOptions = {
    ...options,
    file: prefetchAsyncBuffer(options.file, plan),
  };
  return plan.groups.map((group) => readRowGroup(readOptions, plan, group));
}
/**
 * Conditionally fetch bloom filters and attach them to planner options.
 *
 * @param {PreparedParquetReadOptions} options
 * @returns {Promise<PreparedParquetReadOptions>}
 */
async function withBloomFilters(options) {
  if (!options.useBloomFilters || !options.filter || !options.metadata)
    return options;
  const schemaTree = parquetSchema(options.metadata);
  /** @type {Record<string, SchemaElement>} */
  const schemaElements = {};
  for (const child of schemaTree.children)
    schemaElements[child.element.name] = child.element;
  const bloomFiltersByGroup = await prefetchBloomFilters({
    file: options.file,
    metadata: options.metadata,
    filter: options.filter,
    filterStrict: options.filterStrict,
  });
  return {
    ...options,
    bloomFiltersByGroup,
    schemaElements,
  };
}
/**
 * Conditionally fetch page indexes and attach candidate ranges and layouts.
 *
 * @param {PreparedParquetReadOptions} options
 * @returns {Promise<PreparedParquetReadOptions>}
 */
async function withPageIndexes(options) {
  if (!options.usePageIndex || !options.filter || !options.metadata)
    return options;
  const { pageRangesByGroup, pageLocationsByGroup } = await prefetchPageIndexes(
    {
      file: options.file,
      metadata: options.metadata,
      filter: options.filter,
      filterStrict: options.filterStrict,
      rowStart: options.rowStart,
      rowEnd: options.rowEnd,
      columns: options.columns,
      bloomFiltersByGroup: options.bloomFiltersByGroup,
      schemaElements: options.schemaElements,
      parsers: options.parsers,
    },
  );
  return {
    ...options,
    pageRangesByGroup,
    pageLocationsByGroup,
  };
}
//#endregion
//#region ../../node_modules/hyparquet/src/read.js
/**
 * @import {AsyncRowGroup, BaseParquetReadOptions, DecodedArray, ParquetReadOptions, ParquetRow} from '../src/types.js'
 */
/**
 * Symbol for the absolute, zero-based physical position of an object row.
 * @type {typeof import('../src/types.js').rowIndex}
 */
var rowIndex = Symbol("rowIndex");
/**
 * Read parquet data rows from a file-like object.
 * Reads the minimal number of row groups and columns to satisfy the request.
 *
 * Returns a void promise when complete.
 * Errors are thrown on the returned promise.
 * Data is returned in callbacks onComplete, onChunk, onPage, NOT the return promise.
 * See parquetReadObjects for a more convenient API.
 *
 * @param {ParquetReadOptions} options read options
 * @returns {Promise<void>} resolves when all requested rows and columns are parsed, all errors are thrown here
 */
async function parquetRead(options) {
  options.metadata ??= await parquetMetadataAsync(options.file, options);
  const {
    rowStart = 0,
    rowEnd,
    columns,
    onChunk,
    onComplete,
    rowFormat,
    filter,
    filterStrict = true,
  } = options;
  if (filter && rowFormat !== "object")
    throw new Error('parquet filter requires rowFormat: "object"');
  if (options.includeRowIndex && rowFormat !== "object")
    throw new Error('parquet includeRowIndex requires rowFormat: "object"');
  const filterColumns = columnsNeededForFilter(filter);
  let readColumns = columns;
  if (columns && filterColumns.length) {
    const selectedColumns = new Set(columns);
    const extraColumns = filterColumns.filter(
      (column) => !selectedColumns.has(column),
    );
    if (extraColumns.length) readColumns = [...columns, ...extraColumns];
  }
  const prepared = await prepareParquetRead(
    readColumns === columns
      ? options
      : {
          ...options,
          columns: readColumns,
        },
  );
  const preparedOptions = prepared.options;
  const requiresProjection = readColumns !== columns;
  const asyncGroups = readParquetPlan(preparedOptions, prepared.plan);
  if (!onComplete && !onChunk) {
    await awaitAllColumns(asyncGroups);
    return;
  }
  if (!preparedOptions.metadata) throw new Error("parquet requires metadata");
  const schemaTree = parquetSchema(preparedOptions.metadata);
  const assembled = asyncGroups.map((arg) =>
    assembleAsync(arg, schemaTree, options.parsers),
  );
  if (onChunk)
    for (const asyncGroup of assembled)
      for (const asyncColumn of asyncGroup.asyncColumns)
        asyncColumn.data.then(
          ({ data, skipped }) => {
            let rowStart = asyncGroup.groupStart + skipped;
            for (const columnData of data) {
              onChunk({
                columnName: asyncColumn.pathInSchema[0],
                columnData,
                rowStart,
                rowEnd: rowStart + columnData.length,
              });
              rowStart += columnData.length;
            }
          },
          () => {},
        );
  if (onComplete) {
    await awaitAllColumns(assembled);
    /** @type {any[]} */
    const rows = [];
    for (const asyncGroup of assembled) {
      const selectStart =
        asyncGroup.selectStart ?? Math.max(rowStart - asyncGroup.groupStart, 0);
      const selectEnd =
        asyncGroup.selectEnd ??
        Math.min(
          (rowEnd ?? Infinity) - asyncGroup.groupStart,
          asyncGroup.groupRows,
        );
      const groupData =
        rowFormat === "object"
          ? await asyncGroupToRows(
              asyncGroup,
              selectStart,
              selectEnd,
              readColumns,
              "object",
            )
          : await asyncGroupToRows(
              asyncGroup,
              selectStart,
              selectEnd,
              columns,
              "array",
            );
      if (options.includeRowIndex)
        for (let i = 0; i < groupData.length; i++)
          Object.defineProperty(groupData[i], rowIndex, {
            value: asyncGroup.groupStart + selectStart + i,
          });
      if (filter) {
        for (const row of groupData)
          if (matchFilter(row, filter, filterStrict)) {
            if (requiresProjection && columns) {
              for (const col of filterColumns)
                if (!columns.includes(col)) delete row[col];
            }
            rows.push(row);
          }
      } else concat(rows, groupData);
    }
    onComplete(rows);
  } else await awaitAllColumns(assembled);
}
/**
 * Await every column promise across the given row groups via Promise.allSettled
 * so no rejection escapes as an unhandledRejection. Throws the first rejection.
 *
 * @param {AsyncRowGroup[]} asyncGroups
 * @returns {Promise<void>}
 */
async function awaitAllColumns(asyncGroups) {
  const all = asyncGroups.flatMap((g) => g.asyncColumns.map((c) => c.data));
  const failed = (await Promise.allSettled(all)).find(
    (r) => r.status === "rejected",
  );
  if (failed) throw failed.reason;
}
//#endregion
//#region ../stac/src/helpers/parquet.js
/**
 * Normalizes raw GeoParquet rows into standard STAC Items.
 * Migrates non-STAC columns under `properties`, converts BigInts to numbers, and formats the bbox object as an array.
 *
 * @param {Record<string, any>[]} items - Raw rows decoded by hyparquet.
 * @returns {import("../types").STACItem[]}
 */
var adjustParquetItems = (items) => {
  return items.map((item) => {
    item = moveItemProperties(item);
    item = adjustItemsBigInts(item);
    return {
      ...item,
      properties: ((properties) => {
        for (const key of ["datetime", "start_datetime", "end_datetime"])
          if (properties[key] instanceof Date)
            properties[key] = properties[key].toISOString();
        return properties;
      })(item.properties ?? {}),
      assets: ((assets) => {
        for (const [key, value] of Object.entries(assets))
          if (!value || !value.href) delete assets[key];
        return assets;
      })(item.assets),
      bbox: ((bbox) => {
        const { xmax, xmin, ymax, ymin } = bbox;
        return [xmin, ymin, xmax, ymax].map((v) => parseFloat(v));
      })(item.bbox),
    };
  });
};
/**
 *
 * @param {Record<string, any>} item
 */
function moveItemProperties(item) {
  const stacProperties = [
    "assets",
    "links",
    "bbox",
    "geometry",
    "stac_version",
    "stac_extensions",
    "type",
    "id",
    "collection",
    "properties",
    "auth:schemes",
    "eodash:merge_assets",
  ];
  for (const key in item)
    if (!stacProperties.includes(key)) {
      if (!item.properties) item.properties = {};
      item.properties[key] = item[key];
      delete item[key];
    }
  return item;
}
/**
 *
 * @param {Record<string, any>} item
 */
function adjustItemsBigInts(item) {
  /** @param {*} obj */
  const adjustBigInt = (obj) => {
    for (const key in obj ?? {})
      if (typeof obj[key] === "bigint")
        obj[key] = parseFloat(obj[key].toString());
      else if (typeof obj[key] === "object" && obj[key] !== null)
        adjustBigInt(obj[key]);
  };
  adjustBigInt(item.links);
  adjustBigInt(item.properties);
  adjustBigInt(item.assets);
  adjustBigInt(item.bbox);
  adjustBigInt(item.geometry);
  return item;
}
//#endregion
//#region ../stac/src/collections/parquet.js
var FOOTER_BYTES = 32768;
/**
 * @typedef {{ row: number; time: number }} DatetimeEntry
 */
/**
 * Creates a STAC collection reader backed by a GeoParquet mirror asset.
 *
 * @param {object} context
 * @param {string} context.url - Collection URL
 * @param {import("../types").STACCollection} context.stac - Collection metadata
 * @param {import("../http.js").HttpClient} context.http - HTTP client instance
 * @param {string} [context.color] - Collection layer tint color
 * @param {string} [context.viewProjection] - Map view projection
 * @param {import("../types").BuildContext} [context.rasterOptions] - Raster rendering options
 */
var createParquetCollection = ({
  url,
  stac,
  http,
  color,
  viewProjection,
  rasterOptions,
}) => {
  const mirror = findParquetMirror(stac);
  const href = mirror ? toAbsolute(mirror.href, url) : void 0;
  /** The mirror's footer, or nothing when the collection has no mirror. */
  const openMirror = cachedRead(async () => {
    if (!href) return;
    const file = await asyncBufferFromUrl({
      url: href,
      byteLength: mirror?.["file:size"] ?? (await fetchByteLength(href)),
    });
    return {
      file,
      metadata: await parquetMetadataAsync(file, {
        initialFetchSize: FOOTER_BYTES,
      }),
    };
  });
  /**
   * @param {object} [selection]
   * @param {string[]} [selection.columns] every column when omitted
   * @returns {Promise<Record<string, any>[]>}
   */
  const readParquet = async ({ columns } = {}) => {
    const source = await openMirror();
    if (!source) return [];
    /** @type {Record<string, any>[]} */
    const rows = [];
    await parquetRead({
      ...source,
      columns,
      rowFormat: "object",
      utf8: false,
      /** @param {Record<string, any>[]} data */
      onComplete: (data) => rows.push(...data),
    });
    return rows;
  };
  /**
   * The datetime column carrying values, read from the footer. An item
   * describing a range leaves `datetime` null, so its column holds no values.
   *
   * @returns {Promise<string | undefined>}
   */
  const datetimeColumn = async () => {
    const columns = ((await openMirror())?.metadata.row_groups ?? []).flatMap(
      (group) => group.columns,
    );
    return ["datetime", "start_datetime", "end_datetime"].find((name) =>
      columns.some(
        ({ meta_data: column }) =>
          column?.path_in_schema.join(".") === name &&
          Number(column.statistics?.null_count ?? 0) <
            Number(column.num_values),
      ),
    );
  };
  /**
   * Every item's datetime with its row, oldest first. Transfers that column
   * alone.
   *
   * @returns {Promise<DatetimeEntry[]>}
   */
  const readDatetimes = cachedRead(async () => {
    const column = await datetimeColumn();
    if (!column) return [];
    return (await readParquet({ columns: [column] }))
      .map((entry, row) => ({
        row,
        time: new Date(entry[column] ?? NaN).getTime(),
      }))
      .sort((a, b) => a.time - b.time);
  });
  /**
   * Every item, in row order. A mirror is one row group, so reading one item
   * costs as much as reading all of them.
   *
   * @returns {Promise<import("../types").STACItem[]>}
   */
  const readItems = cachedRead(async () =>
    adjustParquetItems(await readParquet()),
  );
  /**
   * The items the mirror holds, oldest first. Transfers every column, so
   * prefer `getDates` where it answers.
   *
   * @returns {Promise<import("../types").STACItem[]>}
   */
  const getItems = async () => {
    const items = await readItems();
    const dates = await readDatetimes();
    const rows = new Set(dates.map(({ row }) => row));
    return [
      ...dates.map(({ row }) => items[row]),
      ...items.filter((_, row) => !rows.has(row)),
    ];
  };
  /**
   * Every datetime the collection has an item for, oldest first.
   *
   * @returns {Promise<Date[]>}
   */
  const getDates = async () =>
    (await readDatetimes()).map(({ time }) => new Date(time));
  /**
   * The item closest to `datetime`, or the most recent one when omitted.
   * Equidistant items resolve to the earlier.
   *
   * @param {import("../types").Datetime} [datetime]
   * @returns {Promise<import("../types").STACItem | undefined>}
   */
  const getItem = async (datetime) => {
    const entries = await readDatetimes();
    const closest =
      entries[
        findClosestIndex(
          entries.map(({ time }) => time),
          datetime,
        )
      ] ?? entries.at(-1);
    if (!closest) return;
    return (await readItems())[closest.row];
  };
  return Object.assign(
    createCollectionBase({
      stac,
      http,
      getDates,
      getItem,
      color,
      viewProjection,
      rasterOptions,
    }),
    {
      /** @type {"parquet"} */
      kind: "parquet",
      getItems,
      getDates,
      getItem,
    },
  );
};
/**
 * The mirror's size, for a collection that does not state `file:size`. A
 * compressing host answers with the encoded length, which lands the footer
 * mid-file, so ask three ways, cheapest first.
 *
 * @param {string} href
 * @returns {Promise<number | undefined>} nothing when the length is unreadable
 */
async function fetchByteLength(href) {
  const head = await fetch(href, {
    method: "HEAD",
    headers: { Range: "bytes=0-0" },
  });
  const negotiated =
    head.status === 200 && !head.headers.get("content-encoding");
  const headLength = Number(head.headers.get("content-length"));
  if (negotiated && headLength) return headLength;
  const probe = await fetch(href, { headers: { Range: "bytes=0-0" } });
  const declared = Number(
    probe.headers.get("content-range")?.split("/").at(-1),
  );
  await probe.body?.cancel();
  if (declared) return declared;
  const response = await fetch(href, { headers: { Range: "bytes=0-" } });
  if (response.status !== 206)
    return (await response.arrayBuffer()).byteLength || void 0;
  const total = Number(response.headers.get("content-length"));
  await response.body?.cancel();
  return total ? total : void 0;
}
/**
 * Remembers what a read resolved to, so it happens once. Failures are not
 * remembered, or one transient error would disable the reader for good.
 *
 * @template T
 * @param {() => Promise<T>} read
 * @returns {() => Promise<T>}
 */
function cachedRead(read) {
  /** @type {Promise<T> | undefined} */
  let pending;
  return () =>
    (pending ??= read().catch((error) => {
      pending = void 0;
      throw error;
    }));
}
//#endregion
//#region ../stac/src/collections/static.js
/**
 * Creates a static STAC collection reader discovering items through STAC links.
 *
 * @param {object} context
 * @param {string} context.url - Collection URL
 * @param {import("../types").STACCollection} context.stac - Collection metadata
 * @param {import("../http.js").HttpClient} context.http - HTTP client instance
 * @param {string} [context.color] - Collection layer tint color
 * @param {string} [context.viewProjection] - Map view projection
 * @param {import("../types").BuildContext} [context.rasterOptions] - Raster rendering options
 */
var createStaticCollection = ({
  url,
  stac,
  http,
  color,
  viewProjection,
  rasterOptions,
}) => {
  /**
   * Retrieves item links sorted chronologically.
   *
   * @returns {Promise<import("../types").ItemLink[]>}
   */
  const getItems = async () => {
    const items = stac.links.filter(isItemLink);
    const datetimeProperty = getDatetimeProperty(stac.links);
    if (!datetimeProperty) return items;
    return items.sort((a, b) =>
      (a[datetimeProperty] ?? "") < (b[datetimeProperty] ?? "") ? -1 : 1,
    );
  };
  /**
   * Every datetime the collection has an item for, oldest first
   *
   * @returns {Promise<Date[]>}
   */
  const getDates = async () => {
    const items = await getItems();
    const datetimeProperty = getDatetimeProperty(items);
    if (!datetimeProperty) return [];
    return items
      .map((item) => new Date(item[datetimeProperty] ?? ""))
      .filter((date) => !isNaN(date.getTime()));
  };
  /**
   * The item closest to `datetime`, or the most recent one when omitted.
   * Equidistant items resolve to the earlier.
   *
   * @param {import("../types").Datetime} [datetime]
   * @returns {Promise<import("../types").STACItem | undefined>}
   */
  const getItem = async (datetime) => {
    const items = await getItems();
    const closest = findItem(items, datetime) ?? items.at(-1);
    if (!closest) return;
    return http.get(toAbsolute(closest.href, url));
  };
  return Object.assign(
    createCollectionBase({
      stac,
      http,
      getDates,
      getItem,
      color,
      viewProjection,
      rasterOptions,
    }),
    {
      /** @type {"static"} */
      kind: "static",
      getItems,
      getDates,
      getItem,
    },
  );
};
/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").ItemLink}
 */
function isItemLink(link) {
  return link.rel === "item";
}
/**
 * @param {import("../types").ItemLink[]} items oldest first
 * @param {import("../types").Datetime} [datetime]
 */
function findItem(items, datetime) {
  const property = getDatetimeProperty(items);
  if (!property) return;
  return items[
    findClosestIndex(
      items.map((item) => new Date(item[property] ?? "").getTime()),
      datetime,
    )
  ];
}
//#endregion
//#region ../stac/src/helpers/bbox.js
/**
 * Calculates the center coordinates and zoom level for an EPSG:4326 bounding box.
 *
 * @param {number[]} bbox - `[minX, minY, maxX, maxY]` in EPSG:4326
 * @param {number[]} [size] - Viewport dimensions `[width, height]` in pixels
 * @returns {{ center: number[]; zoom: number }}
 */
var bboxToCenterZoom = ([minX, minY, maxX, maxY], size = [800, 600]) => {
  const WORLD = 256;
  /** @param {number} lat */
  const latRad = (lat) => {
    const sin = Math.sin((lat * Math.PI) / 180);
    const rad = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(rad, Math.PI), -Math.PI) / 2;
  };
  const latFraction = Math.max((latRad(maxY) - latRad(minY)) / Math.PI, 1e-9);
  const lngDiff = maxX - minX;
  const width = lngDiff < 0 ? lngDiff + 360 : lngDiff;
  const lngFraction = Math.max(width / 360, 1e-9);
  const zoom = Math.min(
    Math.log2(size[1] / WORLD / latFraction),
    Math.log2(size[0] / WORLD / lngFraction),
    20,
  );
  return {
    center: [((minX + width / 2 + 180) % 360) - 180, (minY + maxY) / 2],
    zoom: Math.max(0, Math.floor(zoom)),
  };
};
/**
 * Normalizes bounding box coordinates within standard longitude (-180 to 180) and latitude (-90 to 90) limits.
 *
 * @param {number[]} bbox
 * @returns {number[]}
 */
var sanitizeBbox = (bbox) => {
  if (!bbox || !bbox.length || bbox.length !== 4) return [0, 0, 0, 0];
  let [minX, minY, maxX, maxY] = bbox;
  minX = Math.max(((minX + 180) % 360) - 180, -180);
  maxX = Math.min(((maxX - 180) % 360) + 180, 180);
  minY = Math.max(((minY + 90) % 180) - 90, -90);
  maxY = Math.min(((maxY - 90) % 180) + 90, 90);
  return [minX, minY, maxX, maxY];
};
//#endregion
//#region ../stac/src/collections/indicator.js
/**
 * Deduplicates projections by name / code.
 * @param {import("../types").Projection[]} projList
 */
var deduplicateProjections = (projList) => {
  const map = /* @__PURE__ */ new Map();
  for (const p of projList) {
    const key = typeof p === "object" && p !== null ? p.name : p;
    if (key && !map.has(key)) map.set(key, p);
  }
  return Array.from(map.values());
};
/**
 * Builds data layers, observation points, and projections across multiple collection readers.
 *
 * @param {object} params
 * @param {import("../types").Reader[]} params.readers - STAC readers for layer generation
 * @param {import("../types").STACCollection} [params.stac] - STAC indicator collection
 * @param {string | import("../types").STACItem | Date} [params.timeOrItem] - Datetime or STAC item
 * @param {import("../types").BuildContext} [params.context] - Build context configuration
 * @param {import("../types").ObservationPointsThemes} [params.themes] - Observation points styling
 * @param {import("@eox/map").EoxLayer[]} [params.currentLayers] - Current map layers to preserve interactions
 * @returns {Promise<{ layers: import("@eox/map").EoxLayer[]; projections: import("../types").Projection[]; items: import("../types").STACItem[] }>}
 */
var buildIndicatorDataLayers = async ({
  readers,
  stac,
  timeOrItem,
  context = {},
  themes,
  currentLayers = [],
}) => {
  const isItem =
    typeof timeOrItem === "object" &&
    timeOrItem !== null &&
    !(timeOrItem instanceof Date);
  const itemCollection = isItem ? timeOrItem.collection : void 0;
  const itemDate = isItem
    ? timeOrItem.properties?.datetime ||
      timeOrItem.properties?.start_datetime ||
      void 0
    : void 0;
  const readerResults = await Promise.all(
    readers.map((reader) => {
      const isTargetReader =
        !itemCollection ||
        reader.stac?.id === itemCollection ||
        readers.length === 1;
      return (
        isItem
          ? isTargetReader
            ? reader.buildLayers(timeOrItem, context)
            : reader.getLayers(itemDate, context)
          : reader.getLayers(timeOrItem, context)
      ).then((built) => {
        built.layers.forEach((layer) => {
          if (!layer.properties?.layerControlExclusive) {
            layer.properties.layerControlExpand = true;
            layer.properties.layerControlToolsExpand = true;
          }
        });
        return built;
      });
    }),
  );
  /** @type {import("@eox/map").EoxLayer[]} */
  const layers = [];
  /** @type {import("../types").Projection[]} */
  const projections = [];
  /** @type {import("../types").STACItem[]} */
  const items = [];
  for (const built of readerResults) {
    layers.push(...built.layers);
    projections.push(...built.projections);
    if (built.item) items.push(built.item);
  }
  applyVisibilityRoles(stac, layers);
  const observationPoints = getObservationPointsLayer(
    readers.map((reader) => reader.stac),
    {
      themes,
      currentLayers,
    },
  );
  if (observationPoints) layers.push(observationPoints);
  return {
    layers,
    projections: deduplicateProjections(projections),
    items,
  };
};
/**
 * Default color palette assigned across STAC collections (Bank-Wong palette from templates/baseConfig.js).
 * @type {string[]}
 */
var DEFAULT_COLLECTIONS_PALETTE = [
  "#009E73",
  "#E69F00",
  "#56B4E9",
  "#009E73",
  "#F0E442",
  "#0072B2",
  "#D55E00",
  "#CC79A7",
  "#994F00",
];
/**
 * Creates an indicator reader that coordinates multiple STAC collections,
 * combines base layers, data layers, observation points, and overlays,
 * and can produce complete EOxMap configurations.
 *
 * @param {string} url - Indicator collection URL or STAC API endpoint
 * @param {object} [options]
 * @param {boolean} [options.api] - Whether the collections use STAC API endpoints (autoinferred if omitted)
 * @param {string} [options.viewProjection] - Map view projection (autoinferred from stac if omitted, default "EPSG:3857")
 * @param {string[]} [options.colors] - Colors assigned across child collections
 * @param {import("../http.js").AxiosInstance} [options.client] - Custom HTTP client
 * @param {import("../types").STACCollection} [options.stac] - Pre-fetched STAC collection/indicator document
 * @param {string} [options.rasterEndpoint] - Base URL for raster tile rendering
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [options.upscalingEndpoints] - Tile endpoints for high-res rendering
 * @param {Record<string, any> | null} [options.tileMatrixSets] - TileMatrixSet configurations
 * @param {Record<string, Record<string, import("../types").Render>>} [options.renders] - Render configurations
 * @param {import("../types").ObservationPointsThemes} [options.themes] - Marker styling for observation points
 * @returns {Promise<import("../types").IndicatorReader>}
 */
var createEodashIndicator = async (url, options = {}) => {
  const {
    client,
    colors = DEFAULT_COLLECTIONS_PALETTE,
    rasterEndpoint,
    upscalingEndpoints,
    tileMatrixSets,
    renders,
    themes,
  } = options;
  const http = createHTTPInstance({ client });
  /** @type {import("../types").STACCollection} */
  const stac = options.stac ?? (await http.get(url));
  const viewProjection =
    options.viewProjection ||
    getProjectionCode(getProjection(stac)) ||
    "EPSG:3857";
  const isApi =
    options.api !== void 0
      ? options.api
      : url
        ? !url.split("?")[0].endsWith(".json")
        : false;
  const collectionUrls = extractCollectionUrls(stac, url);
  const palette =
    Array.isArray(colors) && colors.length
      ? colors
      : DEFAULT_COLLECTIONS_PALETTE;
  const readers = await Promise.all(
    collectionUrls.map((cu, idx) =>
      createEodashCollection(cu, {
        api: isApi,
        client,
        color: palette[idx % palette.length],
        viewProjection,
        ...(cu === url && { stac }),
        rasterEndpoint,
        upscalingEndpoints,
        tileMatrixSets,
        renders,
      }),
    ),
  );
  /**
   * Helper to build layers for a given datetime or item
   * @param {import("../types").Datetime | undefined} targetDatetime
   * @param {import("../types").STACItem | undefined} targetItem
   * @param {import("../types").BuildContext} [context]
   * @param {Date[][]} [prefetchedDates]
   */
  const buildLayersInternal = async (
    targetDatetime,
    targetItem,
    context = {},
    prefetchedDates = void 0,
  ) => {
    let resolvedDate = targetDatetime;
    if (!targetItem && !resolvedDate) {
      const allDates = (
        prefetchedDates ?? (await Promise.all(readers.map((r) => r.getDates())))
      )
        .flat()
        .map((d) => d.getTime())
        .sort((a, b) => a - b);
      if (allDates.length > 0) {
        const lastDate = allDates[allDates.length - 1];
        if (lastDate !== void 0)
          resolvedDate = new Date(lastDate).toISOString();
      }
    }
    const { layers: indicatorLayers, projections: indicatorProjections } =
      await getIndicatorLayers(stac, {
        client,
        viewProjection,
        tileMatrixSets,
        upscalingEndpoints,
      });
    const baseLayers = normalizeBaseLayers(
      indicatorLayers.filter((l) => l.properties?.group === "baselayer"),
    );
    const overLayers = indicatorLayers.filter(
      (l) => l.properties?.group === "overlay",
    );
    const dataResult = await buildIndicatorDataLayers({
      readers,
      stac,
      timeOrItem: targetItem ?? resolvedDate,
      context: {
        ...context,
        viewProjection,
      },
      themes,
    });
    return {
      layers: [...baseLayers, ...dataResult.layers, ...overLayers],
      projections: deduplicateProjections([
        ...indicatorProjections,
        ...dataResult.projections,
      ]),
      items: targetItem ? [targetItem] : dataResult.items,
      item: targetItem ?? dataResult.items[0],
      datetime: targetItem
        ? (targetItem.properties?.datetime ??
          targetItem.properties?.start_datetime ??
          void 0)
        : typeof resolvedDate === "string"
          ? resolvedDate
          : resolvedDate instanceof Date
            ? resolvedDate.toISOString()
            : void 0,
    };
  };
  return {
    id: stac.id,
    stac,
    projection: viewProjection,
    readers,
    /**
     * Aggregates and sorts all unique dates across all collections.
     *
     * @param {import("../types").Datetime} [datetime]
     * @param {import("../types").BBox} [bbox]
     * @returns {Promise<Date[]>}
     */
    getDates: async (datetime, bbox) => {
      const datesArrays = await Promise.all(
        readers.map((r) => r.getDates(datetime, bbox)),
      );
      const timeMap = /* @__PURE__ */ new Map();
      for (const dates of datesArrays)
        for (const d of dates) timeMap.set(d.getTime(), d);
      return Array.from(timeMap.keys())
        .sort((a, b) => a - b)
        .map((t) => timeMap.get(t));
    },
    /**
     * Builds base layers, data layers from each reader, and overlays for the given datetime.
     *
     * @param {import("../types").Datetime} [datetime]
     * @param {import("../types").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers & { items: import("../types").STACItem[] }>}
     */
    getLayers: async (datetime, context = {}) => {
      return buildLayersInternal(datetime, void 0, context);
    },
    /**
     * Builds layers from a specific STAC item.
     *
     * @param {import("../types").STACItem} item
     * @param {import("../types").BuildContext} [context]
     * @returns {Promise<import("../types").BuiltLayers & { items: import("../types").STACItem[] }>}
     */
    buildLayers: async (item, context = {}) => {
      return buildLayersInternal(void 0, item, context);
    },
    /**
     * Builds complete EOxMap configuration including layers, center, zoom, and projections.
     *
     * @param {object} [configOptions]
     * @param {import("../types").Datetime} [configOptions.datetime]
     * @param {import("../types").STACItem} [configOptions.item]
     * @param {import("../types").BBox} [configOptions.bbox]
     * @param {import("../types").BuildContext} [configOptions.context]
     * @returns {Promise<import("../types").MapConfig & { timeControl?: { availableDates: string[], minDate?: string, maxDate?: string } }>}
     */
    getMapConfig: async (configOptions = {}) => {
      const { datetime, item, bbox, context } = configOptions;
      /** @type {Date[][] | undefined} */
      let prefetchedDates = void 0;
      /** @type {{ availableDates: string[], minDate?: string, maxDate?: string } | undefined} */
      let timeControl = void 0;
      try {
        prefetchedDates = await Promise.all(readers.map((r) => r.getDates()));
        const allTimestamps = prefetchedDates
          .flat()
          .map((d) => d.getTime())
          .filter((t) => !Number.isNaN(t))
          .sort((a, b) => a - b);
        const uniqueTimestamps = Array.from(new Set(allTimestamps));
        if (uniqueTimestamps.length > 0) {
          const availableDates = uniqueTimestamps.map((t) =>
            new Date(t).toISOString(),
          );
          timeControl = {
            availableDates,
            minDate: availableDates[0],
            maxDate: availableDates[availableDates.length - 1],
          };
        }
      } catch {}
      const buildResult = await buildLayersInternal(
        datetime,
        item,
        context,
        prefetchedDates,
      );
      const targetBbox = sanitizeBbox(
        bbox || item?.bbox || stac?.extent?.spatial?.bbox?.[0],
      );
      const { center, zoom } = targetBbox
        ? bboxToCenterZoom(targetBbox)
        : {
            center: [0, 0],
            zoom: 2,
          };
      const resolvedDatetime =
        ((typeof datetime === "string"
          ? datetime
          : datetime instanceof Date
            ? datetime.toISOString()
            : void 0) ??
          buildResult.datetime ??
          buildResult.item?.properties?.datetime ??
          buildResult.item?.properties?.start_datetime) ||
        void 0;
      return {
        layers: buildResult.layers,
        center,
        zoom,
        projection: viewProjection,
        projections: buildResult.projections,
        datetime: resolvedDatetime,
        item: buildResult.item,
        ...(timeControl ? { timeControl } : {}),
      };
    },
  };
};
//#endregion
//#region ../stac/src/index.js
/**
 * Creates a collection reader for querying dates and generating map layers.
 * Selects an API, GeoParquet, or static collection reader based on the options and collection metadata.
 *
 * @param {string} url - Collection URL or API search endpoint
 * @param {object} [options]
 * @param {boolean} [options.api=false] - Whether the collection uses a STAC API endpoint
 * @param {number} [options.maxItems] - Maximum items to retrieve per search query
 * @param {import("./http.js").AxiosInstance} [options.client] - Custom HTTP client instance
 * @param {string} [options.color] - Color assigned to layers generated from this collection
 * @param {string} [options.viewProjection] - Map view projection code used to namespace layer identifiers
 * @param {string} [options.rasterEndpoint] - Base URL for raster tile rendering
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [options.upscalingEndpoints] - Tile endpoints for high-resolution rendering
 * @param {Record<string, any> | null} [options.tileMatrixSets] - TileMatrixSet configurations keyed by projection
 * @param {Record<string, Record<string, import("./types").Render>>} [options.renders] - Render configurations mapped by collection ID
 * @param {import("./types").STACCollection} [options.stac] - The collection document, for a caller that has already read it
 * @returns {Promise<import("./types").Reader>}
 */
var createEodashCollection = async (url, options = {}) => {
  const {
    api = false,
    maxItems,
    client,
    color,
    viewProjection,
    rasterEndpoint,
    upscalingEndpoints,
    tileMatrixSets,
    renders,
  } = options;
  const http = createHTTPInstance({ client });
  /** @type {import("./types").STACCollection} */
  const stac = options.stac ?? (await http.get(url));
  const context = {
    url,
    stac,
    http,
    color,
    viewProjection,
    rasterOptions: {
      rasterEndpoint,
      upscalingEndpoints,
      tileMatrixSets,
      renders,
    },
  };
  if (api)
    return createAPICollection({
      ...context,
      maxItems,
    });
  if (findParquetMirror(stac)) return createParquetCollection(context);
  return createStaticCollection(context);
};
//#endregion
//#region ../stac/src/helpers/catalog.js
/**
 * Checks whether a STAC object represents a Catalog (rather than Collection or Item).
 *
 * @param {Record<string, any>} [doc]
 * @returns {doc is import("../types").STACCatalog}
 */
function isSTACCatalog(doc) {
  if (!doc || typeof doc !== "object") return false;
  if (doc.type === "Catalog") return true;
  if (!doc.extent && !doc.geometry && Array.isArray(doc.links)) {
    if (
      doc.links.some(
        (l) => l.rel === "child" && (l.type ? l.type.includes("json") : true),
      ) &&
      doc.type !== "Collection" &&
      doc.type !== "Feature"
    )
      return true;
  }
  return false;
}
//#endregion
//#region generators/stac-map.js
/**
 * Builds complete EOxMap layer configuration and view parameters from a STAC catalog, collection/indicator URL, pre-fetched collection, or STAC API.
 *
 * @param {object} params
 * @param {string} [params.url] - STAC catalog/collection/indicator URL or STAC API endpoint
 * @param {Record<string, any>} [params.stac_object] - Pre-fetched STAC document (Catalog, Collection, Indicator, or Item)
 * @param {string} [params.query] - Free-text search query to select an indicator from a catalog
 * @param {string} [params.collection_id] - Specific collection ID to select from a catalog
 * @param {string} [params.datetime] - Target ISO datetime string
 * @param {number[]} [params.bbox] - Bounding box [minX, minY, maxX, maxY]
 * @param {string} [params.viewProjection] - Desired map view projection (e.g. 'EPSG:4326', 'EPSG:3035')
 * @param {string} [params.rasterEndpoint] - Base URL for TiTiler / raster tile rendering
 * @param {boolean} [params.api] - Explicitly specify whether endpoint is STAC API (true) or static (false)
 * @param {object} [options]
 * @param {import("@eodash/stac").HttpClient | import("@eodash/stac/http").AxiosInstance} [options.client] - Optional HTTP client (for hermetic testing)
 * @returns {Promise<import("@eodash/stac").MapConfig & { indicator?: { id?: string, title?: string, href?: string } }>}
 */
async function buildStacMap(
  {
    url,
    stac_object,
    query,
    collection_id,
    datetime,
    bbox,
    viewProjection,
    rasterEndpoint,
    api,
  },
  { client } = {},
) {
  const inputObject = stac_object;
  if (!url && !inputObject)
    throw new Error(
      "At least one of 'url' or 'stac_object' must be provided to build STAC map configuration.",
    );
  if (inputObject && hasCircularReference(inputObject))
    throw new Error("Invalid STAC object: circular references detected.");
  const httpClient = client || createSafeHttpClient();
  const maxDepth = parseInt(
    process.env.EODASH_MAX_TRAVERSAL_DEPTH || String(5),
    10,
  );
  const maxCollections = parseInt(
    process.env.EODASH_MAX_COLLECTIONS || String(100),
    10,
  );
  let resolvedCollection = void 0;
  let resolvedItem = void 0;
  let currentUrl = url || "";
  /** @type {{ id?: string, title?: string, href?: string } | undefined} */
  let matchedIndicatorInfo = void 0;
  if (inputObject) {
    if (isSTACItem(inputObject)) resolvedItem = inputObject;
    else resolvedCollection = inputObject;
  }
  const visitedUrls = /* @__PURE__ */ new Set();
  if (currentUrl) visitedUrls.add(currentUrl);
  let depth = 0;
  while (depth < maxDepth) {
    depth += 1;
    if (currentUrl && !resolvedCollection && !resolvedItem) {
      const res = await httpClient.get(currentUrl).catch(() => null);
      const fetchedDoc = res?.data || res;
      if (fetchedDoc) {
        if (isSTACItem(fetchedDoc)) resolvedItem = fetchedDoc;
        else if (isSTACCatalog(fetchedDoc)) resolvedCollection = fetchedDoc;
      }
    }
    if (resolvedCollection && isSTACCatalog(resolvedCollection)) {
      const collectionsLink = resolvedCollection.links?.find(
        (l) =>
          l.rel === "data" ||
          l.rel === "collections" ||
          l.href?.endsWith("/collections"),
      );
      if (
        collectionsLink &&
        !resolvedCollection.links?.some((l) => l.rel === "child")
      ) {
        const parentHref =
          currentUrl ||
          resolvedCollection.links?.find((l) => l.rel === "self")?.href ||
          "";
        const absCollectionsUrl = toAbsolute(collectionsLink.href, parentHref);
        const res = await httpClient.get(absCollectionsUrl).catch(() => null);
        const collectionsDoc = res?.data || res;
        if (collectionsDoc?.collections)
          resolvedCollection.links = [
            ...(resolvedCollection.links || []),
            ...collectionsDoc.collections
              .slice(0, maxCollections)
              .map((col) => ({
                rel: "child",
                type: "application/json",
                id: col.id,
                title: col.title || col.id,
                description: sanitizeText(col.description || "", 1e3),
                href:
                  col.links?.find((l) => l.rel === "self")?.href ||
                  `${absCollectionsUrl.replace(/\/collections$/, "")}/collections/${col.id}`,
              })),
          ];
      }
      const selectedLink = selectCatalogIndicator(resolvedCollection, {
        collection_id,
        query,
      });
      const parentHref =
        currentUrl ||
        resolvedCollection.links?.find((l) => l.rel === "self")?.href ||
        "";
      const nextUrl = toAbsolute(selectedLink.href, parentHref);
      if (visitedUrls.has(nextUrl))
        throw new Error(
          `Circular reference detected in STAC catalog links at "${nextUrl}".`,
        );
      visitedUrls.add(nextUrl);
      currentUrl = nextUrl;
      matchedIndicatorInfo = {
        id: selectedLink.id,
        title: sanitizeText(selectedLink.title || "", 200),
        description: sanitizeText(
          selectedLink.subtitle || selectedLink.description || "",
          1e3,
        ),
        href: currentUrl,
      };
      resolvedCollection = void 0;
      continue;
    }
    break;
  }
  const targetUrl =
    currentUrl ||
    resolvedCollection?.links?.find((l) => l.rel === "self")?.href ||
    resolvedItem?.links?.find((l) => l.rel === "collection")?.href ||
    resolvedItem?.links?.find((l) => l.rel === "self")?.href ||
    "";
  if (resolvedItem && !resolvedCollection && !targetUrl)
    resolvedCollection = createDummyCollectionForItem(resolvedItem, targetUrl);
  const candidateGeometry = inputObject?.geometry || resolvedItem?.geometry;
  if (candidateGeometry && countGeoJsonVertices(candidateGeometry) > 1e4)
    throw new Error(
      `Invalid STAC document: geometry exceeds maximum allowed vertex limit (${MAX_GEOJSON_VERTICES}).`,
    );
  const mapConfig = await (
    await createEodashIndicator(targetUrl, {
      stac: resolvedCollection,
      client: httpClient,
      viewProjection,
      rasterEndpoint,
      ...(api !== void 0 && { api }),
    })
  ).getMapConfig({
    datetime,
    item: resolvedItem,
    bbox,
  });
  if (matchedIndicatorInfo) mapConfig.indicator = matchedIndicatorInfo;
  const legendLayers = mapConfig.layers?.filter(
    (l) =>
      l.properties?.layerLegend ||
      l.properties?.layerConfig?.legend ||
      l.properties?.description?.includes("<img"),
  );
  if (legendLayers && legendLayers.length > 0)
    mapConfig.legends = legendLayers.map(
      (l) =>
        l.properties.layerLegend ||
        l.properties.layerConfig?.legend || { html: l.properties.description },
    );
  if (mapConfig.indicator) {
    if (mapConfig.indicator.title)
      mapConfig.indicator.title = sanitizeText(mapConfig.indicator.title, 200);
    if (mapConfig.indicator.description)
      mapConfig.indicator.description = sanitizeText(
        mapConfig.indicator.description,
        1e3,
      );
  }
  if (mapConfig.layers) {
    for (const layer of mapConfig.layers)
      if (layer.properties?.description)
        layer.properties.description = sanitizeText(
          layer.properties.description,
          1e3,
        );
  }
  return mapConfig;
}
//#endregion
//#region tools/stac.js
/**
 * Register STAC mapping tools
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 */
function registerStacTools(server) {
  server.registerTool(
    "generate_map_from_stac",
    {
      description:
        "Build complete EOxMap layer configuration and map view parameters (layers, center, zoom, projection, projections, item, datetime, timeControl, legends) from a STAC catalog, indicator, collection URL, STAC API endpoint, or in-memory STAC object.\n\nCAPABILITIES:\n- Auto-infers document hierarchy: STAC Catalog, Indicator Collection, Data Collection, or STAC Item.\n- When given a STAC Catalog: filters child indicators using fuzzy search (`query`) or exact ID (`collection_id`).\n- Reads GeoParquet mirrors (items.parquet), TiTiler COGs, WMS, WMTS, and XYZ endpoints.\n- Extracts styling legends from STAC metadata (eox:colorlegend, rasterform, style legend).\n- Aggregates date ranges into `timeControl` (availableDates, minDate, maxDate) for time-slider widgets.\n\nLIMITATIONS:\n- NO IMAGE RENDERING: Outputs OpenLayers/EOxMap JSON layer configuration; does NOT download tiles or return image pixels.\n- AMBIGUITY: If a catalog query matches multiple indicators closely, returns error with structured `candidates` array; retry with `collection_id`.",
      inputSchema: z
        .object({
          url: z
            .string()
            .optional()
            .describe(
              "STAC catalog URL, collection URL, indicator URL, or STAC API endpoint. Either 'url' or 'stac_object' must be provided. The tool will auto-infer catalog/indicator/collection types and handle child links.",
            ),
          stac_object: z
            .record(z.any())
            .optional()
            .describe(
              "Pre-fetched STAC JSON document (Catalog, Collection, Indicator, or Item). Either 'url' or 'stac_object' must be provided. Use this when the STAC content is already loaded in memory.",
            ),
          query: z
            .string()
            .optional()
            .describe(
              "Search term (name, title, tags, themes, description) to select an indicator from a STAC catalog (e.g. 'Carbon Dioxide', 'CO2', 'NO2'). If ambiguous, tool returns candidate list.",
            ),
          collection_id: z
            .string()
            .optional()
            .describe(
              "Specific collection ID or code to select from a STAC catalog (e.g. 'N2_CO2_mean')",
            ),
          datetime: z
            .string()
            .optional()
            .describe(
              "ISO 8601 date or datetime string (e.g. '2024-06-01T00:00:00Z'). If omitted, resolves the latest date from the collection.",
            ),
          bbox: z
            .array(z.number())
            .length(4)
            .optional()
            .describe(
              "Bounding box [minX, minY, maxX, maxY] in EPSG:4326 (WGS84 degrees)",
            ),
          viewProjection: z
            .string()
            .optional()
            .describe(
              "Desired map view projection (e.g. 'EPSG:4326', 'EPSG:3035'). Defaults to STAC metadata projection or 'EPSG:3857'.",
            ),
          rasterEndpoint: z
            .string()
            .optional()
            .describe("Base URL for TiTiler raster tile rendering endpoint"),
          api: z
            .boolean()
            .optional()
            .describe(
              "Explicitly specify whether the STAC endpoint is a dynamic STAC API (true) or static catalog (false). Defaults to auto-inferred from URL (.json -> static).",
            ),
        })
        .refine((data) => Boolean(data.url || data.stac_object), {
          message: "Either 'url' or 'stac_object' must be provided.",
          path: ["url"],
        }),
    },
    instrumentTool("generate_map_from_stac", async (params) => {
      try {
        const result = await buildStacMap(params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        if (err?.candidates)
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: "Ambiguous query",
                    message: err.message,
                    candidates: err.candidates,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to build STAC map configuration: ${err?.message || String(err)}`,
            },
          ],
        };
      }
    }),
  );
}
//#endregion
//#region index.js
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var pkgPath = fs.existsSync(path.join(__dirname, "package.json"))
  ? path.join(__dirname, "package.json")
  : path.join(__dirname, "../package.json");
var pkg = fs.existsSync(pkgPath)
  ? JSON.parse(fs.readFileSync(pkgPath, "utf8"))
  : {
      name: "@eodash/mcp-server",
      version: "1.0.0",
    };
/**
 * Creates and registers tools on an McpServer instance
 */
function createMcpServer() {
  const { widgetsData, architectureData } = getMetadata();
  const server = new McpServer(
    {
      name: pkg.name || "@eodash/mcp-server",
      version: pkg.version || "1.0.0",
    },
    {
      instructions:
        "Inspect, configure, and scaffold @eodash/eodash instances, widgets, layouts, styles, and STAC integrations. NOTE: MCP generation tools return code/files in-memory and do NOT write directly to disk; use file writing tools to write returned files.",
    },
  );
  registerWidgetTools(server, widgetsData);
  registerArchitectureTools(server, architectureData);
  registerDiscoveryTools(server);
  registerStacTools(server);
  return server;
}
function createExpressApp() {
  return createExpressApp$1(createMcpServer);
}
async function startServer() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
eodash MCP Server

Usage:
  eodash-mcp-server [options]

Options:
  --stdio, -s       Run server with STDIO transport (for MCP desktop clients & local integration)
  --port <port>     Port for SSE/HTTP server (default: 3001)
  --host <host>     Host for SSE/HTTP server (default: 127.0.0.1)
  --help, -h        Show help
`);
    process.exit(0);
  }
  try {
    await getValidators();
  } catch (err) {
    logger.fatal({
      event: "startup_schema_preload_failed",
      error: err.message,
    });
    process.exit(1);
  }
  if (process.argv.includes("--stdio") || process.argv.includes("-s")) {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info({
      event: "server_started",
      transport: "stdio",
    });
    return;
  }
  const app = createExpressApp();
  let port = parseInt(process.env.PORT || "3001", 10);
  let host = process.env.HOST || "127.0.0.1";
  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex > -1 && process.argv[portArgIndex + 1])
    port = parseInt(process.argv[portArgIndex + 1], 10);
  const hostArgIndex = process.argv.indexOf("--host");
  if (hostArgIndex > -1 && process.argv[hostArgIndex + 1])
    host = process.argv[hostArgIndex + 1];
  app.listen(port, host, () => {
    logger.info({
      event: "server_started",
      transport: "http",
      host,
      port,
      url: `http://${host}:${port}`,
      node_version: process.version,
    });
  });
}
function isDirectExecution() {
  if (!process.argv[1]) return false;
  try {
    return (
      fs.realpathSync(path.resolve(process.argv[1])) ===
      fs.realpathSync(__filename)
    );
  } catch {
    return path.resolve(process.argv[1]) === path.resolve(__filename);
  }
}
if (isDirectExecution())
  startServer().catch((err) => {
    logger.fatal({
      event: "server_start_failed",
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
//#endregion
export { createExpressApp, createMcpServer, getMetadata };
