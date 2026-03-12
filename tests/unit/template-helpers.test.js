import { describe, it, expect } from "vitest";
import {
  renderJsonBodyTemplate,
  renderTemplateNode,
  resolveTemplatePath,
  getMultiQueryMatches,
  getScalarMultiQueryValues,
  getPostMultiQueryValues,
  getGeoJsonMultiQueryValues,
  dedupeMultiQueryValues,
  createMultiQueryContext,
  aggregateInlineResponses,
} from "../../widgets/EodashProcess/methods/template-helpers.js";

// ---- renderJsonBodyTemplate ----

describe("renderJsonBodyTemplate", () => {
  it("renders scalar Mustache placeholders in valid JSON template", () => {
    const template = JSON.stringify({ metric: "{{metric}}", bbox: "{{bbox}}" });
    const result = renderJsonBodyTemplate(template, {
      metric: "temperature",
      bbox: "1,2,3,4",
    });
    expect(result).toEqual({ metric: "temperature", bbox: "1,2,3,4" });
  });

  it("preserves object values for exact placeholders", () => {
    const geom = { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] };
    const template = JSON.stringify({ geometry: "{{geometry}}" });
    const result = renderJsonBodyTemplate(template, { geometry: geom });
    expect(result.geometry).toEqual(geom);
    expect(typeof result.geometry).toBe("object");
  });

  it("preserves nested object via dot-path placeholder", () => {
    const feature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [1, 2] },
      properties: { name: "test" },
    };
    const template = JSON.stringify({ geom: "{{feature.geometry}}" });
    const result = renderJsonBodyTemplate(template, { feature });
    expect(result.geom).toEqual({ type: "Point", coordinates: [1, 2] });
  });

  it("deep-clones objects to prevent mutation", () => {
    const geom = { type: "Point", coordinates: [1, 2] };
    const template = JSON.stringify({ geometry: "{{geometry}}" });
    const result = renderJsonBodyTemplate(template, { geometry: geom });
    result.geometry.coordinates[0] = 999;
    expect(geom.coordinates[0]).toBe(1);
  });

  it("renders nested objects and arrays recursively", () => {
    const template = JSON.stringify({
      outer: { inner: "{{val}}" },
      list: ["{{a}}", "{{b}}"],
    });
    const result = renderJsonBodyTemplate(template, { val: "x", a: "1", b: "2" });
    expect(result).toEqual({ outer: { inner: "x" }, list: ["1", "2"] });
  });

  it("passes through numbers and booleans unchanged", () => {
    const template = JSON.stringify({ count: 42, active: true, label: "{{label}}" });
    const result = renderJsonBodyTemplate(template, { label: "test" });
    expect(result).toEqual({ count: 42, active: true, label: "test" });
  });

  it("falls back to Mustache string rendering for non-JSON template", () => {
    const template = '{"metric": "{{metric}}"}';
    const result = renderJsonBodyTemplate(template, { metric: "temp" });
    expect(result).toEqual({ metric: "temp" });
  });

  it("throws when fallback rendering also fails", () => {
    expect(() => renderJsonBodyTemplate("not valid {{", {})).toThrow(
      "[eodash] Failed to render POST body template:",
    );
  });

  it("handles triple-brace syntax for exact placeholders", () => {
    const geom = { type: "Point", coordinates: [1, 2] };
    const template = JSON.stringify({ geometry: "{{{geometry}}}" });
    const result = renderJsonBodyTemplate(template, { geometry: geom });
    expect(result.geometry).toEqual(geom);
  });
});

// ---- renderTemplateNode ----

describe("renderTemplateNode", () => {
  it("renders string with Mustache when not an exact placeholder", () => {
    const result = renderTemplateNode("prefix_{{val}}_suffix", { val: "x" });
    expect(result).toBe("prefix_x_suffix");
  });

  it("returns raw value for exact placeholder", () => {
    const obj = { a: 1 };
    const result = renderTemplateNode("{{obj}}", { obj });
    expect(result).toEqual({ a: 1 });
  });

  it("recursively processes arrays", () => {
    const result = renderTemplateNode(["{{a}}", "{{b}}"], { a: "1", b: "2" });
    expect(result).toEqual(["1", "2"]);
  });

  it("passes through non-string primitives", () => {
    expect(renderTemplateNode(42, {})).toBe(42);
    expect(renderTemplateNode(true, {})).toBe(true);
    expect(renderTemplateNode(null, {})).toBe(null);
  });
});

// ---- resolveTemplatePath ----

describe("resolveTemplatePath", () => {
  it("resolves simple key", () => {
    expect(resolveTemplatePath({ foo: "bar" }, "foo")).toBe("bar");
  });

  it("resolves dot-notation path", () => {
    expect(resolveTemplatePath({ a: { b: { c: 3 } } }, "a.b.c")).toBe(3);
  });

  it("resolves bracket-notation path", () => {
    expect(resolveTemplatePath({ list: ["x", "y"] }, "list[1]")).toBe("y");
  });

  it("resolves mixed dot and bracket notation", () => {
    const ctx = { features: [{ properties: { name: "test" } }] };
    expect(resolveTemplatePath(ctx, "features[0].properties.name")).toBe("test");
  });

  it("returns undefined for missing paths", () => {
    expect(resolveTemplatePath({ a: 1 }, "b")).toBeUndefined();
    expect(resolveTemplatePath({ a: null }, "a.b")).toBeUndefined();
  });
});

// ---- getMultiQueryMatches ----

describe("getMultiQueryMatches", () => {
  it("matches single string multiQuery", () => {
    const schema = { options: { multiQuery: "feature" } };
    const value = { feature: "x", other: "y" };
    expect(getMultiQueryMatches(value, schema)).toEqual(["feature"]);
  });

  it("matches array multiQuery", () => {
    const schema = { options: { multiQuery: ["a", "b"] } };
    const value = { a: 1, b: 2, c: 3 };
    expect(getMultiQueryMatches(value, schema)).toEqual(["a", "b"]);
  });

  it("returns empty when no multiQuery config", () => {
    expect(getMultiQueryMatches({ a: 1 }, {})).toEqual([]);
    expect(getMultiQueryMatches({ a: 1 }, { options: {} })).toEqual([]);
  });

  it("returns empty for undefined form values", () => {
    const schema = { options: { multiQuery: "feature" } };
    expect(getMultiQueryMatches(undefined, schema)).toEqual([]);
  });
});

// ---- getScalarMultiQueryValues ----

describe("getScalarMultiQueryValues", () => {
  it("returns array values as-is", () => {
    expect(getScalarMultiQueryValues("k", { k: [1, 2, 3] })).toEqual([1, 2, 3]);
  });

  it("wraps single value in array", () => {
    expect(getScalarMultiQueryValues("k", { k: "v" })).toEqual(["v"]);
  });

  it("returns empty for undefined", () => {
    expect(getScalarMultiQueryValues("k", {})).toEqual([]);
  });
});

// ---- getGeoJsonMultiQueryValues ----

describe("getGeoJsonMultiQueryValues", () => {
  const feature1 = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [0, 0] },
    properties: { id: 1 },
  };
  const feature2 = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [1, 1] },
    properties: { id: 2 },
  };

  it("extracts features from FeatureCollection", () => {
    const fc = { type: "FeatureCollection", features: [feature1, feature2] };
    expect(getGeoJsonMultiQueryValues(fc)).toEqual([feature1, feature2]);
  });

  it("wraps single Feature in array", () => {
    expect(getGeoJsonMultiQueryValues(feature1)).toEqual([feature1]);
  });

  it("handles array of Features", () => {
    expect(getGeoJsonMultiQueryValues([feature1, feature2])).toEqual([
      feature1,
      feature2,
    ]);
  });

  it("filters out features without geometry", () => {
    const noGeom = { type: "Feature", properties: {} };
    const fc = { type: "FeatureCollection", features: [feature1, noGeom] };
    expect(getGeoJsonMultiQueryValues(fc)).toEqual([feature1]);
  });

  it("deduplicates identical features", () => {
    const dup = structuredClone(feature1);
    const fc = { type: "FeatureCollection", features: [feature1, dup] };
    expect(getGeoJsonMultiQueryValues(fc)).toEqual([feature1]);
  });

  it("returns empty for undefined/null", () => {
    expect(getGeoJsonMultiQueryValues(undefined)).toEqual([]);
    expect(getGeoJsonMultiQueryValues(null)).toEqual([]);
  });
});

// ---- getPostMultiQueryValues ----

describe("getPostMultiQueryValues", () => {
  it("delegates to GeoJSON handler for geojson-typed fields", () => {
    const feature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] },
    };
    const fc = { type: "FeatureCollection", features: [feature] };
    const schema = { properties: { aoi: { type: "geojson" } } };
    const result = getPostMultiQueryValues("aoi", {}, { aoi: fc }, schema);
    expect(result).toEqual([feature]);
  });

  it("delegates to scalar handler for non-geojson fields", () => {
    const schema = { properties: { metric: { type: "string" } } };
    const result = getPostMultiQueryValues(
      "metric",
      { metric: ["a", "b"] },
      {},
      schema,
    );
    expect(result).toEqual(["a", "b"]);
  });
});

// ---- dedupeMultiQueryValues ----

describe("dedupeMultiQueryValues", () => {
  it("removes duplicate objects by JSON key", () => {
    const a = { x: 1 };
    const b = { x: 1 };
    expect(dedupeMultiQueryValues([a, b])).toEqual([{ x: 1 }]);
  });

  it("removes duplicate scalars", () => {
    expect(dedupeMultiQueryValues(["a", "b", "a"])).toEqual(["a", "b"]);
  });

  it("handles empty/null input", () => {
    expect(dedupeMultiQueryValues([])).toEqual([]);
    expect(dedupeMultiQueryValues(null)).toEqual([]);
  });
});

// ---- createMultiQueryContext ----

describe("createMultiQueryContext", () => {
  it("spreads form value and overrides matched field", () => {
    const ctx = createMultiQueryContext({ a: 1, b: 2 }, "b", "new", 0);
    expect(ctx).toEqual({ a: 1, b: "new", multiQueryIndex: 1 });
  });

  it("uses 1-based index", () => {
    const ctx = createMultiQueryContext({}, "k", "v", 4);
    expect(ctx.multiQueryIndex).toBe(5);
  });
});

// ---- aggregateInlineResponses ----

describe("aggregateInlineResponses", () => {
  it("flattens nested arrays", () => {
    expect(aggregateInlineResponses([[1, 2], [3]])).toEqual([1, 2, 3]);
  });

  it("wraps scalar responses", () => {
    expect(aggregateInlineResponses([{ a: 1 }, { b: 2 }])).toEqual([
      { a: 1 },
      { b: 2 },
    ]);
  });

  it("handles mixed arrays and scalars", () => {
    expect(aggregateInlineResponses([[1], 2, [3, 4]])).toEqual([1, 2, 3, 4]);
  });
});
