import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  extractUrlKeys,
  updateGeoZarrBands,
  updateLayerUrl,
} from "@/eodashSTAC/helpers";
import { fakeOlLayer, VT_SCHEMA, vtDefinition } from "../../fixtures/ol";

describe("extractUrlKeys", () => {
  test("collects url_key through nested properties and combinators", () => {
    const keys = extractUrlKeys({
      properties: {
        a: { url_key: "ka", properties: { b: { url_key: "kb" } } },
        noKey: {},
      },
      oneOf: [{ properties: { c: { url_key: "kc" } } }],
      allOf: [{ properties: { d: { url_key: "kd" } } }],
      anyOf: [{ properties: { e: { url_key: "ke" } } }],
    });

    expect(keys).toEqual({ a: "ka", b: "kb", c: "kc", d: "kd", e: "ke" });
  });

  test("returns an empty map for non-object schemas", () => {
    expect(extractUrlKeys(null)).toEqual({});
    expect(extractUrlKeys(/** @type {any} */ ("nope"))).toEqual({});
  });
});

describe("updateLayerUrl", () => {
  test("injects the url_key values as query params and updates the source", () => {
    const jsonDefinition = vtDefinition("https://vt/{z}/{x}/{y}");
    const source = { setUrl: vi.fn() };
    const layer = fakeOlLayer({ jsonDefinition, source });

    const updated = updateLayerUrl(/** @type {any} */ (layer), { flood: 30 });

    expect(updated).toBe(true);
    const newUrl = "https://vt/{z}/{x}/{y}?flood_percent=30";
    expect(source.setUrl).toHaveBeenCalledWith(newUrl);
    expect(jsonDefinition.source.url).toBe(newUrl);
    expect(layer.get("originalUrl")).toBe("https://vt/{z}/{x}/{y}");
    expect(layer.get("injectedUrl")).toBe(newUrl);
  });

  test("rebuilds from the cached originalUrl — params never compound", () => {
    const source = { setUrl: vi.fn() };
    const layer = fakeOlLayer({
      jsonDefinition: vtDefinition("https://vt/tiles"),
      source,
    });

    updateLayerUrl(/** @type {any} */ (layer), { flood: 30 });
    updateLayerUrl(/** @type {any} */ (layer), { flood: 50 });

    const lastUrl = source.setUrl.mock.calls.at(-1)?.[0];
    expect(lastUrl).toBe("https://vt/tiles?flood_percent=50");
    expect(lastUrl.match(/flood_percent/g)).toHaveLength(1);
  });

  test("is a no-op when the injected url is unchanged", () => {
    const source = { setUrl: vi.fn() };
    const layer = fakeOlLayer({
      jsonDefinition: vtDefinition("https://vt/tiles"),
      source,
    });

    updateLayerUrl(/** @type {any} */ (layer), { flood: 30 });
    const updated = updateLayerUrl(/** @type {any} */ (layer), { flood: 30 });

    expect(updated).toBe(false);
    expect(source.setUrl).toHaveBeenCalledTimes(1);
  });

  test("ignores non-VectorTile layers, keyless schemas and missing urls", () => {
    const nonVt = fakeOlLayer({
      jsonDefinition: { type: "Vector", source: { url: "https://x" } },
    });
    expect(updateLayerUrl(/** @type {any} */ (nonVt), { flood: 1 })).toBe(
      false,
    );

    const noKeys = fakeOlLayer({
      jsonDefinition: vtDefinition("https://x", {}),
    });
    expect(updateLayerUrl(/** @type {any} */ (noKeys), { flood: 1 })).toBe(
      false,
    );

    const noUrl = fakeOlLayer({
      jsonDefinition: {
        type: "VectorTile",
        properties: { layerConfig: { schema: VT_SCHEMA } },
        source: {},
      },
    });
    expect(updateLayerUrl(/** @type {any} */ (noUrl), { flood: 1 })).toBe(
      false,
    );
  });

  test("falls back to setUrls when the source has no setUrl", () => {
    const source = { setUrls: vi.fn() };
    const layer = fakeOlLayer({
      jsonDefinition: vtDefinition("https://vt/tiles"),
      source,
    });

    const updated = updateLayerUrl(/** @type {any} */ (layer), { flood: 30 });

    expect(updated).toBe(true);
    expect(source.setUrls).toHaveBeenCalledWith([
      "https://vt/tiles?flood_percent=30",
    ]);
  });
});

describe("updateGeoZarrBands", () => {
  class GeoZarrStub {
    /** @param {Record<string, any>} source */
    constructor(source) {
      this.source = source;
    }
  }

  /** @param {string[]} bands */
  const gzDefinition = (bands) => ({
    type: "WebGLTile",
    source: { type: "GeoZarr", url: "https://z", bands },
  });

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  test("rebuilds the source when the bands change", () => {
    vi.stubGlobal("eoxMapAdvancedOlSources", { GeoZarr: GeoZarrStub });
    const jsonDefinition = gzDefinition(["b04", "b03", "b02"]);
    const layer = fakeOlLayer({ jsonDefinition });
    const bands = ["b08", "b04", "b03"];

    const updated = updateGeoZarrBands(/** @type {any} */ (layer), { bands });

    expect(updated).toBe(true);
    expect(layer.setSource).toHaveBeenCalledWith(expect.any(GeoZarrStub));
    expect(jsonDefinition.source.bands).toEqual(bands);
    // Copied, not aliased — a later mutation of the form value must not make
    // the next comparison a false equality (the bands-switching bug).
    expect(jsonDefinition.source.bands).not.toBe(bands);
  });

  test("skips JSON-equal bands without touching the source", () => {
    vi.stubGlobal("eoxMapAdvancedOlSources", { GeoZarr: GeoZarrStub });
    const layer = fakeOlLayer({ jsonDefinition: gzDefinition(["b04", "b03"]) });

    const updated = updateGeoZarrBands(/** @type {any} */ (layer), {
      bands: ["b04", "b03"],
    });

    expect(updated).toBe(false);
    expect(layer.setSource).not.toHaveBeenCalled();
  });

  test("ignores non-GeoZarr layers and missing bands", () => {
    const xyz = fakeOlLayer({
      jsonDefinition: { type: "WebGLTile", source: { type: "XYZ" } },
    });
    expect(updateGeoZarrBands(/** @type {any} */ (xyz), { bands: ["b"] })).toBe(
      false,
    );

    const gz = fakeOlLayer({ jsonDefinition: gzDefinition(["b04"]) });
    expect(updateGeoZarrBands(/** @type {any} */ (gz), {})).toBe(false);
  });

  test("currently throws when the advanced-sources global is missing", () => {
    // Characterization (layercontrol.md): no guard around
    // window.eoxMapAdvancedOlSources — decide fix vs keep before refactor.
    const layer = fakeOlLayer({ jsonDefinition: gzDefinition(["b04"]) });

    expect(() =>
      updateGeoZarrBands(/** @type {any} */ (layer), { bands: ["b08"] }),
    ).toThrow();
  });
});
