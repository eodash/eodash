/**
 * Shared EodashProcess test fixtures (see .agents/testing/process.md).
 * Clone before mutating in a test.
 */

/** @param {string} type @param {string} id @param {string} href @param {Record<string,any>} [extra] */
export const serviceLink = (type, id, href, extra = {}) => ({
  rel: "service",
  type,
  id,
  href,
  ...extra,
});

export const S_SCALAR = {
  type: "object",
  properties: { metric: { type: "string", enum: ["temperature", "ndvi"] } },
};

/** @param {string} [layerId] @param {Record<string,any>} [drawtools] */
export const S_DRAWTOOLS = (
  layerId = "collA;:;item;:;3857",
  drawtools = {},
) => ({
  type: "object",
  properties: {
    aoi: { type: "geojson", options: { drawtools: { layerId, ...drawtools } } },
  },
});

export const S_DRAWTOOLS_MULTI = {
  type: "object",
  properties: {
    first: { options: { drawtools: { layerId: "missing;:;a;:;b" } } },
    second: { options: { drawtools: { layerId: "collB;:;item;:;3857" } } },
  },
};

export const S_GEOJSON = {
  type: "object",
  properties: { aoi: { type: "geojson", format: "feature" } },
};

export const S_MULTIQUERY = {
  type: "object",
  options: { multiQuery: ["aoi"] },
  properties: { aoi: { type: "geojson" } },
};

export const S_LARGE = {
  type: "object",
  options: { multiQuery: ["samples"] },
  properties: {
    metric: { type: "string" },
    threshold: { type: "number" },
    samples: { type: "array", items: { type: "number" } },
    bbox: { format: "bounding-box" },
    aoi: {
      type: "geojson",
      options: { drawtools: { layerId: "collA;:;item;:;3857" } },
    },
    nested: {
      type: "object",
      properties: { a: { type: "string" }, b: { type: "number" } },
    },
  },
};

export const L_CHART_JSON_GET = [
  serviceLink("application/json", "series", "https://x/data.json", {
    method: "GET",
  }),
];

export const L_CHART_JSON_POST = [
  serviceLink("application/json", "series", "https://x/data.json", {
    method: "POST",
    body: "https://x/body-template.json",
  }),
];

export const L_CHART_CSV = [
  serviceLink("text/csv", "series", "https://x/data.csv"),
];

export const L_LAYERS_MIXED = [
  serviceLink("application/geo+json", "vec", "https://x/vec.json"),
  serviceLink("image/png", "img", "https://x/img.png"),
  serviceLink("image/tiff", "tif", "https://x/tif.tif"),
];

export const L_CUSTOM_LAYERS = [
  serviceLink("service", "eoxhub", "https://x/process", {
    endpoint: "eoxhub_workspaces",
    body: "https://x/process-body.json",
  }),
];
