import { beforeEach, describe, expect, test, vi } from "vitest";
import { createLayersConfig } from "^/EodashMap/methods/create-layers-config";

// Mock the collection class so no real STAC/network runs; collections are stubs.
const EodashCollectionMock = vi.hoisted(() => ({
  getIndicatorLayers: vi.fn(),
  getObservationPointsLayer: vi.fn(),
}));
vi.mock("@/eodashSTAC/EodashCollection", () => ({
  EodashCollection: EodashCollectionMock,
}));

/** @param {string} id @param {any[]} layers */
const stubCollection = (id, layers) => ({
  collectionStac: { id },
  createLayersJson: vi.fn().mockResolvedValue(layers),
});

/** @param {any[]} result */
const group = (result, id) =>
  result.find((/** @type {any} */ g) => g.properties.id === id);

describe("createLayersConfig", () => {
  beforeEach(() => {
    EodashCollectionMock.getIndicatorLayers.mockReset().mockResolvedValue([]);
    EodashCollectionMock.getObservationPointsLayer
      .mockReset()
      .mockReturnValue(null);
  });

  test("wraps a collection's layers into the data group with expand flags", async () => {
    const ec = stubCollection("collA", [
      { properties: { id: "collA;:;item;:;3857" } },
    ]);

    const result = await createLayersConfig(null, [ec], undefined);

    const analysis = group(result, "AnalysisGroup");
    expect(analysis.layers).toHaveLength(1);
    expect(analysis.layers[0].properties.layerControlExpand).toBe(true);
    expect(analysis.layers[0].properties.layerControlToolsExpand).toBe(true);
    expect(ec.createLayersJson).toHaveBeenCalledWith(undefined);
  });

  test("aggregates layers from multiple collections", async () => {
    const result = await createLayersConfig(
      null,
      [
        stubCollection("a", [{ properties: { id: "a" } }]),
        stubCollection("b", [
          { properties: { id: "b1" } },
          { properties: { id: "b2" } },
        ]),
      ],
      undefined,
    );

    expect(
      group(result, "AnalysisGroup").layers.map(
        (/** @type {any} */ l) => l.properties.id,
      ),
    ).toEqual(["a", "b1", "b2"]);
  });

  test("disables a layer targeted by a 'disable' indicator link", async () => {
    const ec = stubCollection("collA", [
      { properties: { id: "collA;:;item;:;3857" } },
    ]);

    const result = await createLayersConfig(
      /** @type {any} */ ({ links: [{ id: "collA", roles: ["disable"] }] }),
      [ec],
      undefined,
    );

    const layer = group(result, "AnalysisGroup").layers[0];
    expect(layer.properties.visible).toBe(false);
    expect(layer.properties.layerControlExpand).toBe(false);
  });

  test("hides a layer targeted by a 'hidden' indicator link", async () => {
    const ec = stubCollection("collA", [
      { properties: { id: "collA;:;item;:;3857" } },
    ]);

    const result = await createLayersConfig(
      /** @type {any} */ ({ links: [{ id: "collA", roles: ["hidden"] }] }),
      [ec],
      undefined,
    );

    expect(
      group(result, "AnalysisGroup").layers[0].properties.layerControlHide,
    ).toBe(true);
  });

  test("builds an exclusive base group with exactly one visible baselayer", async () => {
    EodashCollectionMock.getIndicatorLayers.mockResolvedValue([
      { properties: { id: "bl1", group: "baselayer" } },
      { properties: { id: "bl2", group: "baselayer" } },
    ]);

    const result = await createLayersConfig(
      null,
      [stubCollection("a", [{ properties: { id: "a" } }])],
      undefined,
    );

    const base = group(result, "BaseLayersGroup");
    expect(base).toBeTruthy();
    expect(
      base.layers.every(
        (/** @type {any} */ l) => l.properties.layerControlExclusive,
      ),
    ).toBe(true);
    expect(
      base.layers.filter((/** @type {any} */ l) => l.properties.visible).length,
    ).toBe(1);
    expect(base.layers[0].properties.visible).toBe(true);
  });

  test("falls back to the default base layers when the indicator has none", async () => {
    const result = await createLayersConfig(
      null,
      [stubCollection("a", [{ properties: { id: "a" } }])],
      undefined,
      [{ type: "Tile", properties: { id: "osm" } }],
    );

    expect(
      group(result, "BaseLayersGroup").layers.map(
        (/** @type {any} */ l) => l.properties.id,
      ),
    ).toEqual(["osm"]);
  });

  test("appends the observation points layer to the data group", async () => {
    EodashCollectionMock.getObservationPointsLayer.mockReturnValue({
      properties: { id: "obs" },
    });

    const result = await createLayersConfig(
      null,
      [stubCollection("a", [{ properties: { id: "a" } }])],
      undefined,
    );

    expect(
      group(result, "AnalysisGroup").layers.map(
        (/** @type {any} */ l) => l.properties.id,
      ),
    ).toContain("obs");
  });

  test("appends indicator overlay layers as an overlay group", async () => {
    EodashCollectionMock.getIndicatorLayers.mockResolvedValue([
      { properties: { id: "ov", group: "overlay" } },
    ]);

    const result = await createLayersConfig(
      null,
      [stubCollection("a", [{ properties: { id: "a" } }])],
      undefined,
    );

    expect(
      group(result, "OverlayGroup").layers.map(
        (/** @type {any} */ l) => l.properties.id,
      ),
    ).toEqual(["ov"]);
  });

  test("passes a range string through, and dates/items as-is, to createLayersJson", async () => {
    const range = stubCollection("a", [{ properties: { id: "a" } }]);
    await createLayersConfig(null, [range], "2023-01-01/2023-12-31");
    expect(range.createLayersJson).toHaveBeenCalledWith(
      "2023-01-01/2023-12-31",
    );

    const dated = stubCollection("a", [{ properties: { id: "a" } }]);
    await createLayersConfig(null, [dated], "2023-06-15");
    expect(dated.createLayersJson).toHaveBeenCalledWith(expect.any(Date));

    const item = stubCollection("a", [{ properties: { id: "a" } }]);
    const stacItem = /** @type {any} */ ({ id: "item-1", type: "Feature" });
    await createLayersConfig(null, [item], stacItem);
    expect(item.createLayersJson).toHaveBeenCalledWith(stacItem);
  });
});
