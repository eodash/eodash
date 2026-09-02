import { beforeEach, describe, expect, test, vi } from "vitest";
import { ref } from "vue";
import { createAnimationLayers } from "^/EodashTimeSlider/methods";
import { mapEl } from "@/store/states";
import { eodashCollections } from "@/store/stac";
import { defaultBaseLayers } from "@/utils/states";

// Behavior seams in the transitive layer-helpers chain, not runner workarounds.
vi.mock("@eox/layercontrol", () => ({
  updateVectorLayerStyle: (/** @type {Record<string, unknown>} */ s) => s,
}));
vi.mock("webfontloader", () => ({ default: { load: () => {} } }));

// The package is stubbed so nothing fetches; the build itself runs for real,
// which is what these cases are about. `@eodash/stac/helpers` stays real.
const stacMock = vi.hoisted(() => ({
  getIndicatorLayers: vi.fn(),
  getObservationPointsLayer: vi.fn(),
  createEodashCollection: vi.fn(),
  getTooltipProperties: vi.fn(),
}));
vi.mock("@eodash/stac", () => stacMock);

/** @param {string} id @param {any[]} layers */
const stubReader = (id, layers) => ({
  kind: "static",
  stac: { id },
  getLayers: vi.fn().mockResolvedValue({ layers, projections: [] }),
  buildLayers: vi.fn().mockResolvedValue({ layers, projections: [] }),
});

/** @param {...any} readers */
const useReaders = (...readers) => eodashCollections.push(...readers);

/** @param {any} layers */
const useDefaultBaseLayers = (layers) => {
  defaultBaseLayers.value = layers;
};

/** @param {any} map */
const setMap = (map) => {
  mapEl.value = map;
};

/**
 * One frame for one date, from the collections currently registered.
 * @param {any} [stac] the indicator, whose links carry the visibility roles
 */
const renderFrame = async (stac = { id: "ind" }) => {
  const [frame] = await createAnimationLayers(
    ["a", "b"],
    { grp: [{ originalDate: "2023-06-14" }] },
    ref(stac),
    {},
  );
  return frame;
};

/** @param {{layers: any[]}} frame @param {string} id */
const group = (frame, id) =>
  frame.layers.find((layer) => layer.properties.id === id);

/** @param {{layers: any[]}} layerGroup */
const ids = (layerGroup) =>
  layerGroup.layers.map((layer) => layer.properties.id);

describe("createAnimationLayers - rendered layers", () => {
  beforeEach(() => {
    eodashCollections.splice(0);
    useDefaultBaseLayers([]);
    // nothing hidden, so no layer is dropped from the frame
    setMap({ layers: [], getLayerById: () => null });
    stacMock.getIndicatorLayers
      .mockReset()
      .mockResolvedValue({ layers: [], projections: [] });
    stacMock.getObservationPointsLayer.mockReset().mockReturnValue(null);
  });

  test("wraps a collection's layers into the data group with expand flags", async () => {
    useReaders(
      stubReader("collA", [{ properties: { id: "collA;:;i;:;3857" } }]),
    );

    const data = group(await renderFrame(), "AnalysisGroup");

    expect(data.layers).toHaveLength(1);
    expect(data.layers[0].properties.layerControlExpand).toBe(true);
    expect(data.layers[0].properties.layerControlToolsExpand).toBe(true);
  });

  test("aggregates layers from every collection, in order", async () => {
    useReaders(
      stubReader("a", [{ properties: { id: "a" } }]),
      stubReader("b", [
        { properties: { id: "b1" } },
        { properties: { id: "b2" } },
      ]),
    );

    expect(ids(group(await renderFrame(), "AnalysisGroup"))).toEqual([
      "a",
      "b1",
      "b2",
    ]);
  });

  test("builds the frame's date as a throwaway, so it is not the reader's item", async () => {
    const reader = stubReader("collA", [{ properties: { id: "a" } }]);
    useReaders(reader);

    await renderFrame();

    expect(reader.getLayers).toHaveBeenCalledWith("2023-06-14", {
      stateful: false,
    });
  });

  test("collapses a layer the collection marks 'disable'", async () => {
    useReaders(
      stubReader("collA", [{ properties: { id: "collA;:;i;:;3857" } }]),
    );

    const frame = await renderFrame({
      id: "ind",
      links: [{ id: "collA", roles: ["disable"] }],
    });

    const layer = group(frame, "AnalysisGroup").layers[0];
    expect(layer.properties.layerControlExpand).toBe(false);
    // an exported frame shows every layer, so the role's `visible: false` is
    // deliberately restored on the way out
    expect(layer.properties.visible).toBe(true);
  });

  test("hides a layer the collection marks 'hidden' from the layer control", async () => {
    useReaders(
      stubReader("collA", [{ properties: { id: "collA;:;i;:;3857" } }]),
    );

    const frame = await renderFrame({
      id: "ind",
      links: [{ id: "collA", roles: ["hidden"] }],
    });

    expect(
      group(frame, "AnalysisGroup").layers[0].properties.layerControlHide,
    ).toBe(true);
  });

  test("marks the collection's base layers exclusive", async () => {
    stacMock.getIndicatorLayers.mockResolvedValue({
      layers: [
        { properties: { id: "bl1", group: "baselayer" } },
        { properties: { id: "bl2", group: "baselayer" } },
      ],
      projections: [],
    });
    useReaders(stubReader("a", [{ properties: { id: "a" } }]));

    const base = group(await renderFrame(), "BaseLayersGroup");

    expect(ids(base)).toEqual(["bl1", "bl2"]);
    expect(
      base.layers.every((layer) => layer.properties.layerControlExclusive),
    ).toBe(true);
  });

  test("falls back to the configured base layers when the collection has none", async () => {
    useDefaultBaseLayers([{ type: "Tile", properties: { id: "osm" } }]);
    useReaders(stubReader("a", [{ properties: { id: "a" } }]));

    expect(ids(group(await renderFrame(), "BaseLayersGroup"))).toEqual(["osm"]);
  });

  test("appends the observation points layer to the data group", async () => {
    stacMock.getObservationPointsLayer.mockReturnValue({
      properties: { id: "obs" },
    });
    useReaders(stubReader("a", [{ properties: { id: "a" } }]));

    expect(ids(group(await renderFrame(), "AnalysisGroup"))).toContain("obs");
  });

  test("puts the collection's overlays in the overlay group", async () => {
    stacMock.getIndicatorLayers.mockResolvedValue({
      layers: [{ properties: { id: "ov", group: "overlay" } }],
      projections: [],
    });
    useReaders(stubReader("a", [{ properties: { id: "a" } }]));

    expect(ids(group(await renderFrame(), "OverlayGroup"))).toEqual(["ov"]);
  });

  test("leaves out the overlay group when the collection has none", async () => {
    useReaders(stubReader("a", [{ properties: { id: "a" } }]));

    expect(ids(await renderFrame())).not.toContain("OverlayGroup");
  });

  test("orders the groups base, data, overlay", async () => {
    stacMock.getIndicatorLayers.mockResolvedValue({
      layers: [
        { properties: { id: "bl", group: "baselayer" } },
        { properties: { id: "ov", group: "overlay" } },
      ],
      projections: [],
    });
    useReaders(stubReader("a", [{ properties: { id: "a" } }]));

    expect(ids(await renderFrame())).toEqual([
      "BaseLayersGroup",
      "AnalysisGroup",
      "OverlayGroup",
    ]);
  });

  test("leaves out a group the map owns but the export does not render", async () => {
    setMap({
      layers: [
        {
          type: "Group",
          properties: { id: "CatalogGroup" },
          layers: [{ properties: { id: "footprint" } }],
        },
      ],
      getLayerById: () => null,
    });
    useReaders(stubReader("a", [{ properties: { id: "a" } }]));

    expect(ids(await renderFrame())).toEqual([
      "BaseLayersGroup",
      "AnalysisGroup",
    ]);
  });

  test("does not mutate the shared base layers it fell back to", async () => {
    const configured = [
      { type: "Tile", properties: { id: "osm", visible: false }, source: {} },
    ];
    useDefaultBaseLayers(configured);
    useReaders(stubReader("a", [{ properties: { id: "a" } }]));

    const base = group(await renderFrame(), "BaseLayersGroup");

    // the frame is anonymized and made visible; the app's copy is not
    expect(base.layers[0].source.crossOrigin).toBe("anonymous");
    expect(configured[0].properties.visible).toBe(false);
    expect(configured[0].source).toEqual({});
  });
});
