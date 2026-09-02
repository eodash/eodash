import { describe, expect, test, vi } from "vitest";
import { updateGeoZarrBands, updateLayerUrl } from "@/eodashSTAC/helpers";
import { mockOlLayer, VT_SCHEMA, vtDefinition } from "../../support/fixtures";

describe("updateLayerUrl", () => {
  test("injects the url_key values as query params and updates the source", () => {
    const jsonDefinition = vtDefinition("https://vt/{z}/{x}/{y}");
    const source = { setUrl: vi.fn() };
    const layer = mockOlLayer({ jsonDefinition, source });

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
    const layer = mockOlLayer({
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
    const layer = mockOlLayer({
      jsonDefinition: vtDefinition("https://vt/tiles"),
      source,
    });

    updateLayerUrl(/** @type {any} */ (layer), { flood: 30 });
    const updated = updateLayerUrl(/** @type {any} */ (layer), { flood: 30 });

    expect(updated).toBe(false);
    expect(source.setUrl).toHaveBeenCalledTimes(1);
  });

  test("ignores non-VectorTile layers, keyless schemas and missing urls", () => {
    const nonVt = mockOlLayer({
      jsonDefinition: { type: "Vector", source: { url: "https://x" } },
    });
    expect(updateLayerUrl(/** @type {any} */ (nonVt), { flood: 1 })).toBe(
      false,
    );

    const noKeys = mockOlLayer({
      jsonDefinition: vtDefinition("https://x", {}),
    });
    expect(updateLayerUrl(/** @type {any} */ (noKeys), { flood: 1 })).toBe(
      false,
    );

    const noUrl = mockOlLayer({
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
    const layer = mockOlLayer({
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
  /** @param {string[]} bands */
  const gzDefinition = (bands) => ({
    type: "WebGLTile",
    properties: { id: "gz" },
    source: { type: "GeoZarr", url: "https://z", bands },
  });

  /**
   * A map holding one layer, standing in for eox-map: `assignLayers` only ever
   * writes `.layers`, and eox-map rebuilds the source off what it is given.
   * @param {Record<string, any>} definition
   */
  const mapWith = (definition) => ({ layers: [definition] });

  test("assigns a tree carrying the new bands", () => {
    const jsonDefinition = gzDefinition(["b04", "b03", "b02"]);
    const layer = mockOlLayer({ id: "gz", jsonDefinition });
    const map = mapWith(jsonDefinition);
    const bands = ["b08", "b04", "b03"];

    updateGeoZarrBands(
      /** @type {any} */ (layer),
      { bands },
      /** @type {any} */ (map),
    );

    expect(map.layers[0].source.bands).toEqual(bands);
    expect(layer.setSource).not.toHaveBeenCalled();
    // The definition eox-map still holds keeps the old bands on purpose: its
    // own `serialize(source)` diff is what triggers the source rebuild.
    expect(jsonDefinition.source.bands).toEqual(["b04", "b03", "b02"]);
    // Copied, not aliased — a later mutation of the form value must not make
    // the next comparison a false equality (the bands-switching bug).
    expect(map.layers[0].source.bands).not.toBe(bands);
  });

  test("skips JSON-equal bands without assigning", () => {
    const jsonDefinition = gzDefinition(["b04", "b03"]);
    const layer = mockOlLayer({ id: "gz", jsonDefinition });
    const map = mapWith(jsonDefinition);
    const before = map.layers;

    updateGeoZarrBands(
      /** @type {any} */ (layer),
      { bands: ["b04", "b03"] },
      /** @type {any} */ (map),
    );

    expect(map.layers).toBe(before);
  });

  // The old implementation built the source itself from
  // `window.eoxMapAdvancedOlSources.GeoZarr` and threw when the map widget had
  // not loaded it; eox-map now builds it from the assigned definition.
  test("assigns without the advanced-sources global", () => {
    const jsonDefinition = gzDefinition(["b04"]);
    const layer = mockOlLayer({ id: "gz", jsonDefinition });
    const map = mapWith(jsonDefinition);

    expect(() =>
      updateGeoZarrBands(
        /** @type {any} */ (layer),
        { bands: ["b08"] },
        /** @type {any} */ (map),
      ),
    ).not.toThrow();
    expect(map.layers[0].source.bands).toEqual(["b08"]);
  });

  test("ignores non-GeoZarr layers and missing bands", () => {
    const xyz = { type: "WebGLTile", source: { type: "XYZ" } };
    const xyzMap = mapWith(xyz);
    updateGeoZarrBands(
      /** @type {any} */ (mockOlLayer({ id: "gz", jsonDefinition: xyz })),
      { bands: ["b"] },
      /** @type {any} */ (xyzMap),
    );

    const gzDef = gzDefinition(["b04"]);
    const gzMap = mapWith(gzDef);
    updateGeoZarrBands(
      /** @type {any} */ (mockOlLayer({ id: "gz", jsonDefinition: gzDef })),
      {},
      /** @type {any} */ (gzMap),
    );

    expect(xyzMap.layers[0]).toBe(xyz);
    expect(gzMap.layers[0]).toBe(gzDef);
  });
});
