import { beforeEach, describe, expect, test, vi } from "vitest";
import { ref } from "vue";
import {
  anonimizeLayersCORS,
  createAnimationLayers,
  getHiddenLayers,
  restoreLayersVisibility,
} from "^/EodashTimeSlider/methods";
import { ANALYSIS_GROUP, buildIndicatorLayers } from "@/eodashSTAC/layers";
import { mapEl } from "@/store/states";
import { eodashCollections } from "@/store/stac";

// Behavior seams in the transitive layer-helpers chain, not runner workarounds.
vi.mock("@eox/layercontrol", () => ({
  updateVectorLayerStyle: (/** @type {Record<string, unknown>} */ s) => s,
}));
vi.mock("webfontloader", () => ({ default: { load: () => {} } }));

vi.mock("@/eodashSTAC/layers", () => ({
  buildIndicatorLayers: vi.fn(),
  updateIndicatorLayers: vi.fn(),
  assignDataLayers: vi.fn(),
  assignGroupLayers: vi.fn(),
  BASE_LAYERS_GROUP: "BaseLayersGroup",
  CATALOG_GROUP: "CatalogGroup",
  ANALYSIS_GROUP: "AnalysisGroup",
  PROCESS_GROUP: "ProcessGroup",
  OVERLAY_GROUP: "OverlayGroup",
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
    vi.mocked(buildIndicatorLayers).mockReset();
    axiosMock.get.mockReset();
  });

  test("emits one entry per selected item, with restored visibility and anonymized CORS", async () => {
    eodashCollections.push(
      /** @type {any} */ ({ kind: "static", stac: { id: "collA" } }),
    );
    vi.mocked(buildIndicatorLayers).mockImplementation(async () => ({
      layers: [
        {
          type: "Group",
          properties: { id: ANALYSIS_GROUP },
          layers: [
            {
              type: "Tile",
              properties: { id: "data", visible: false },
              source: {},
            },
          ],
        },
      ],
      items: [],
    }));
    const selectedStac = ref(/** @type {any} */ ({ id: "ind" }));

    const result = await createAnimationLayers(
      ["a", "b"],
      { grp: [{ originalDate: "2023-06-14" }, { originalDate: "2023-06-15" }] },
      selectedStac,
      {},
    );

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.date)).toEqual(["2023-06-14", "2023-06-15"]);
    const data = result[0].layers[0].layers[0];
    expect(data.properties.visible).toBe(true);
    expect(data.source.crossOrigin).toBe("anonymous");
    expect(buildIndicatorLayers).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        stac: { id: "ind" },
        timeOrItem: "2023-06-14",
        context: { stateful: false },
      }),
    );
  });

  test("excludes hidden collections from the build input", async () => {
    setMap({
      layers: [{ properties: { id: "collB;:;item;:;3857" } }],
      getLayerById: () => ({ getVisible: () => false }),
    });
    eodashCollections.push(
      /** @type {any} */ ({ kind: "static", stac: { id: "collA" } }),
      /** @type {any} */ ({ kind: "static", stac: { id: "collB" } }),
    );
    vi.mocked(buildIndicatorLayers).mockResolvedValue({
      layers: [],
      items: [],
    });

    await createAnimationLayers(
      ["a", "b"],
      { grp: [{ originalDate: "2023-06-14" }] },
      ref(/** @type {any} */ ({ id: "ind" })),
      {},
    );

    const [, options] = vi.mocked(buildIndicatorLayers).mock.calls[0];
    expect(options.readers).toHaveLength(1);
    expect(options.readers[0].stac.id).toBe("collA");
  });

  test("strips hidden layers from the built layers", async () => {
    setMap({
      layers: [{ properties: { id: "base;:;3857" } }],
      getLayerById: () => ({ getVisible: () => false }),
    });
    eodashCollections.push(
      /** @type {any} */ ({ kind: "static", stac: { id: "collA" } }),
    );
    vi.mocked(buildIndicatorLayers).mockImplementation(async () => ({
      layers: [
        {
          type: "Group",
          properties: { id: ANALYSIS_GROUP },
          layers: [
            { properties: { id: "base;:;3857" } },
            { properties: { id: "keep" } },
          ],
        },
      ],
      items: [],
    }));

    const result = await createAnimationLayers(
      ["a", "b"],
      { grp: [{ originalDate: "2023-06-14" }] },
      ref(/** @type {any} */ ({ id: "ind" })),
      {},
    );

    expect(result[0].layers[0].layers.map((l) => l.properties.id)).toEqual([
      "keep",
    ]);
  });
});

describe("createAnimationLayers (API catalog)", () => {
  /** @type {import("vitest").Mock} */
  let search;

  /** An api reader whose `search` is the seam; it owns the endpoint itself. */
  const apiReader = (features = []) => {
    search = vi.fn().mockResolvedValue({ features });
    eodashCollections.push(
      /** @type {any} */ ({ kind: "api", stac: { id: "collA" }, search }),
    );
  };

  beforeEach(() => {
    eodashCollections.splice(0);
    setMap(null);
    vi.mocked(buildIndicatorLayers).mockReset();
    axiosMock.get.mockReset();
  });

  test("searches with datetime, bbox and CQL filter, then maps items to dated layers", async () => {
    apiReader([{ id: "i1", properties: { datetime: "2023-06-15T10:00:00Z" } }]);
    setMap({ lonLatExtent: [-10, -5, 20, 15], getLayerById: () => null });
    vi.mocked(buildIndicatorLayers).mockResolvedValue({
      layers: [
        {
          type: "Group",
          properties: { id: ANALYSIS_GROUP },
          layers: [{ type: "Tile", properties: { id: "data" }, source: {} }],
        },
      ],
      items: [],
    });
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
      ["2023-06-15T00:00:00.000Z", "2023-06-16T00:00:00.000Z"],
      {},
      ref(/** @type {any} */ ({ id: "sat-collection" })),
      filters,
    );

    // the reader injects `collections` and resolves the url from its own
    expect(search).toHaveBeenCalledWith({
      limit: 100,
      datetime: "2023-06-15T00:00:00.000Z/2023-06-16T00:00:00.000Z",
      bbox: "-10,-5,20,15",
      filter: '"eo:cloud_cover" <= 20',
    });

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2023-06-15T10:00:00Z");
    expect(result[0].layers[0].layers[0].source.crossOrigin).toBe("anonymous");
  });

  test("returns an empty list without a map extent", async () => {
    apiReader();
    setMap({ getLayerById: () => null });

    const result = await createAnimationLayers(
      ["2023-06-15T00:00:00.000Z", "2023-06-16T00:00:00.000Z"],
      {},
      ref(/** @type {any} */ ({ id: "sat-collection" })),
      {},
    );

    expect(result).toEqual([]);
    expect(search).not.toHaveBeenCalled();
  });

  test("warns and returns an empty list when no items match", async () => {
    apiReader([]);
    setMap({ lonLatExtent: [-10, -5, 20, 15], getLayerById: () => null });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await createAnimationLayers(
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
