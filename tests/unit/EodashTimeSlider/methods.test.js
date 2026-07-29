import { beforeEach, describe, expect, test, vi } from "vitest";
import { ref } from "vue";
import {
  anonimizeLayersCORS,
  createAnimationLayers,
  getHiddenLayers,
  restoreLayersVisibility,
} from "^/EodashTimeSlider/methods";
import { createLayersConfig } from "^/EodashMap/methods/create-layers-config";
import { mapEl } from "@/store/states";
import { eodashCollections } from "@/utils/states";

// Behavior seams in the transitive layer-helpers chain, not runner workarounds.
vi.mock("@eox/layercontrol", () => ({
  updateVectorLayerStyle: (/** @type {Record<string, unknown>} */ s) => s,
}));
vi.mock("webfontloader", () => ({ default: { load: () => {} } }));

// createLayersConfig owns layer content; here we isolate createAnimationLayers' own orchestration via a fixed-shape mock.
vi.mock("^/EodashMap/methods/create-layers-config", () => ({
  createLayersConfig: vi.fn(),
}));

// Real axios never runs; the API branch drives this spy.
const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

/** @param {(HTMLElement & Record<string, any>) | null} value */
const setMap = (value) => {
  mapEl.value = /** @type {any} */ (value);
};

describe("anonimizeLayersCORS", () => {
  test("sets crossOrigin on a flat layer with a source", () => {
    const layers = [{ type: "Tile", source: { url: "u" } }];
    anonimizeLayersCORS(layers);
    expect(layers[0].source.crossOrigin).toBe("anonymous");
  });

  test("recurses into group layers", () => {
    const layers = [
      {
        type: "Group",
        layers: [{ type: "Tile", source: { url: "u" } }],
      },
    ];
    anonimizeLayersCORS(layers);
    expect(layers[0].layers[0].source.crossOrigin).toBe("anonymous");
  });

  test("leaves a layer without a source untouched", () => {
    const layers = [{ type: "Vector", properties: { id: "x" } }];
    expect(() => anonimizeLayersCORS(layers)).not.toThrow();
    expect(layers[0]).not.toHaveProperty("source");
  });
});

describe("restoreLayersVisibility", () => {
  test("flips visible:false to true", () => {
    const layers = [{ properties: { id: "a", visible: false } }];
    restoreLayersVisibility(layers);
    expect(layers[0].properties.visible).toBe(true);
  });

  test("leaves visible:true and unset visibility untouched", () => {
    const layers = [
      { properties: { id: "a", visible: true } },
      { properties: { id: "b" } },
    ];
    restoreLayersVisibility(layers);
    expect(layers[0].properties.visible).toBe(true);
    expect(layers[1].properties).not.toHaveProperty("visible");
  });

  test("recurses into group layers", () => {
    const layers = [
      {
        type: "Group",
        properties: { id: "g" },
        layers: [{ properties: { id: "child", visible: false } }],
      },
    ];
    restoreLayersVisibility(layers);
    expect(layers[0].layers[0].properties.visible).toBe(true);
  });
});

describe("getHiddenLayers", () => {
  beforeEach(() => setMap(null));

  /** @param {Record<string, boolean>} visibilityById */
  const mapWith = (visibilityById) =>
    setMap({
      getLayerById: (/** @type {string} */ id) =>
        id in visibilityById ? { getVisible: () => visibilityById[id] } : null,
    });

  test("returns empty lists when nothing is hidden", () => {
    mapWith({ "coll;:;item;:;3857": true });
    const layers = [{ properties: { id: "coll;:;item;:;3857" } }];
    expect(getHiddenLayers(layers)).toEqual({ collections: [], layers: [] });
  });

  test("classifies a hidden collection layer by its id prefix", () => {
    mapWith({ "collA;:;item;:;3857": false });
    const layers = [{ properties: { id: "collA;:;item;:;3857" } }];
    expect(getHiddenLayers(layers)).toEqual({
      collections: ["collA"],
      layers: [],
    });
  });

  test("classifies a hidden two-part id as a base layer", () => {
    mapWith({ "base;:;3857": false });
    const layers = [{ properties: { id: "base;:;3857" } }];
    expect(getHiddenLayers(layers)).toEqual({
      collections: [],
      layers: ["base;:;3857"],
    });
  });

  test("classifies a hidden separator-less id as a plain layer", () => {
    mapWith({ osm: false });
    const layers = [{ properties: { id: "osm" } }];
    expect(getHiddenLayers(layers)).toEqual({
      collections: [],
      layers: ["osm"],
    });
  });

  test("skips layers with no matching map layer", () => {
    mapWith({});
    const layers = [{ properties: { id: "ghost" } }];
    expect(getHiddenLayers(layers)).toEqual({ collections: [], layers: [] });
  });

  test("recurses into groups and dedups results", () => {
    mapWith({ "collA;:;item;:;3857": false, osm: false });
    const layers = [
      {
        type: "Group",
        properties: { id: "grp" },
        layers: [
          { properties: { id: "collA;:;item;:;3857" } },
          { properties: { id: "osm" } },
        ],
      },
      { properties: { id: "osm" } },
    ];
    expect(getHiddenLayers(layers)).toEqual({
      collections: ["collA"],
      layers: ["osm"],
    });
  });
});

describe("createAnimationLayers (static catalog)", () => {
  beforeEach(() => {
    eodashCollections.splice(0);
    setMap(null);
    vi.mocked(createLayersConfig).mockReset();
    axiosMock.get.mockReset();
  });

  test("emits one entry per selected item, with restored visibility and anonymized CORS", async () => {
    eodashCollections.push(
      /** @type {any} */ ({ isAPI: false, collectionStac: { id: "collA" } }),
    );
    vi.mocked(createLayersConfig).mockImplementation(async () => [
      { type: "Tile", properties: { id: "data", visible: false }, source: {} },
    ]);
    const selectedStac = ref(/** @type {any} */ ({ id: "ind" }));

    const result = await createAnimationLayers(
      "https://stac",
      ["a", "b"],
      { grp: [{ originalDate: "2023-06-14" }, { originalDate: "2023-06-15" }] },
      selectedStac,
      {},
    );

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.date)).toEqual(["2023-06-14", "2023-06-15"]);
    expect(result[0].layers[0].properties.visible).toBe(true);
    expect(result[0].layers[0].source.crossOrigin).toBe("anonymous");
    expect(createLayersConfig).toHaveBeenCalledWith(
      { id: "ind" },
      expect.any(Array),
      "2023-06-14",
    );
  });

  test("excludes hidden collections from the config input", async () => {
    setMap({
      layers: [{ properties: { id: "collB;:;item;:;3857" } }],
      getLayerById: () => ({ getVisible: () => false }),
    });
    eodashCollections.push(
      /** @type {any} */ ({ isAPI: false, collectionStac: { id: "collA" } }),
      /** @type {any} */ ({ isAPI: false, collectionStac: { id: "collB" } }),
    );
    vi.mocked(createLayersConfig).mockResolvedValue([]);

    await createAnimationLayers(
      "https://stac",
      ["a", "b"],
      { grp: [{ originalDate: "2023-06-14" }] },
      ref(/** @type {any} */ ({ id: "ind" })),
      {},
    );

    const [, passedCollections] = vi.mocked(createLayersConfig).mock.calls[0];
    expect(passedCollections).toHaveLength(1);
    expect(passedCollections[0].collectionStac.id).toBe("collA");
  });

  test("strips hidden layers from the produced config", async () => {
    setMap({
      layers: [{ properties: { id: "base;:;3857" } }],
      getLayerById: () => ({ getVisible: () => false }),
    });
    eodashCollections.push(
      /** @type {any} */ ({ isAPI: false, collectionStac: { id: "collA" } }),
    );
    vi.mocked(createLayersConfig).mockImplementation(async () => [
      { properties: { id: "base;:;3857" } },
      { properties: { id: "keep" } },
    ]);

    const result = await createAnimationLayers(
      "https://stac",
      ["a", "b"],
      { grp: [{ originalDate: "2023-06-14" }] },
      ref(/** @type {any} */ ({ id: "ind" })),
      {},
    );

    expect(result[0].layers.map((l) => l.properties.id)).toEqual(["keep"]);
  });
});

describe("createAnimationLayers (API catalog)", () => {
  beforeEach(() => {
    eodashCollections.splice(0);
    setMap(null);
    vi.mocked(createLayersConfig).mockReset();
    axiosMock.get.mockReset();
  });

  test("queries /search with datetime, bbox and CQL filter, then maps items to dated layers", async () => {
    eodashCollections.push(
      /** @type {any} */ ({ isAPI: true, collectionStac: { id: "collA" } }),
    );
    setMap({ lonLatExtent: [-10, -5, 20, 15], getLayerById: () => null });
    axiosMock.get.mockResolvedValue({
      data: {
        features: [
          { id: "i1", properties: { datetime: "2023-06-15T10:00:00Z" } },
        ],
      },
    });
    vi.mocked(createLayersConfig).mockResolvedValue([
      { type: "Tile", properties: { id: "data" }, source: {} },
    ]);
    const filters = /** @type {any} */ ({
      cloud: {
        key: "eo:cloud_cover",
        type: "range",
        state: { max: 20 },
        min: 0,
        max: 100,
      },
    });

    const result = await createAnimationLayers(
      "https://api",
      ["2023-06-15T00:00:00.000Z", "2023-06-16T00:00:00.000Z"],
      {},
      ref(/** @type {any} */ ({ id: "sat-collection" })),
      filters,
    );

    const url = new URL(axiosMock.get.mock.calls[0][0]);
    const params = url.searchParams;
    expect(url.origin + url.pathname).toBe("https://api/search");
    expect(params.get("limit")).toBe("100");
    expect(params.get("collections")).toBe("sat-collection");
    expect(params.get("datetime")).toBe(
      "2023-06-15T00:00:00.000Z/2023-06-16T00:00:00.000Z",
    );
    expect(params.get("bbox")).toBe("-10,-5,20,15");
    expect(params.get("filter")).toBe('"eo:cloud_cover" <= 20');

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2023-06-15T10:00:00Z");
    expect(result[0].layers[0].source.crossOrigin).toBe("anonymous");
  });

  test("returns an empty list without a map extent", async () => {
    eodashCollections.push(
      /** @type {any} */ ({ isAPI: true, collectionStac: { id: "collA" } }),
    );
    setMap({ getLayerById: () => null });

    const result = await createAnimationLayers(
      "https://api",
      ["2023-06-15T00:00:00.000Z", "2023-06-16T00:00:00.000Z"],
      {},
      ref(/** @type {any} */ ({ id: "sat-collection" })),
      {},
    );

    expect(result).toEqual([]);
    expect(axiosMock.get).not.toHaveBeenCalled();
  });

  test("warns and returns an empty list when no items match", async () => {
    eodashCollections.push(
      /** @type {any} */ ({ isAPI: true, collectionStac: { id: "collA" } }),
    );
    setMap({ lonLatExtent: [-10, -5, 20, 15], getLayerById: () => null });
    axiosMock.get.mockResolvedValue({ data: { features: [] } });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await createAnimationLayers(
      "https://api",
      ["2023-06-15T00:00:00.000Z", "2023-06-16T00:00:00.000Z"],
      {},
      ref(/** @type {any} */ ({ id: "sat-collection" })),
      {},
    );

    expect(result).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
