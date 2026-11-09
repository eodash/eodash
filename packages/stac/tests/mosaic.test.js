import { beforeEach, describe, expect, test, vi } from "vitest";
import { createEodashCollection } from "../src/index.js";
import { findReaderByLayerId } from "../src/helpers/layers.js";
import { stacCollection } from "../../../tests/support/stac.js";

// The mosaic layer a reader builds from its collection's first render preset,
// through the raster endpoint's collection TileJSON.

/** Stands in for the app's axios instance, which the reader reads through. */
const client = { get: vi.fn() };

const COLLECTION_URL = "https://cat/collections/coll";
const RASTER_ENDPOINT = "https://raster";
const FORM_URL = "https://forms/raster.json";
const TILES = "https://tiles/{z}/{x}/{y}?assets=b04";

const RENDERS = {
  first: { assets: ["b04"], rescale: [0, 100], tilesize: 256 },
  second: { assets: ["b08"] },
};

const CUSTOM_TMS = {
  CustomTMS: {
    id: "CustomTMS",
    crs: "http://www.opengis.net/def/crs/EPSG/0/3035",
    tileMatrices: [
      {
        id: "0",
        cellSize: 100,
        pointOfOrigin: [0, 0],
        matrixWidth: 1,
        matrixHeight: 1,
        tileWidth: 512,
        tileHeight: 512,
      },
    ],
  },
};

/**
 * Serves the collection, its raster form and the TileJSON, then reads it.
 *
 * @param {object} [options]
 * @param {Record<string, any>} [options.collection]
 * @param {Record<string, any> | Error} [options.tilejson] - an Error makes the request fail
 * @param {Record<string, any>} [options.reader] - reader options next to `client`
 */
const reader = ({
  collection = { renders: RENDERS },
  tilejson = { tiles: [TILES] },
  reader = { rasterEndpoint: RASTER_ENDPOINT },
} = {}) => {
  client.get.mockImplementation((/** @type {string} */ url) => {
    if (url === COLLECTION_URL) {
      return Promise.resolve({ data: stacCollection(collection) });
    }
    if (url === FORM_URL) {
      return Promise.resolve({
        data: {
          jsonform: {
            type: "object",
            properties: { rescale: { type: "string", default: "0,100" } },
          },
        },
      });
    }
    if (url.includes("/tilejson.json")) {
      return tilejson instanceof Error
        ? Promise.reject(tilejson)
        : Promise.resolve({ data: tilejson });
    }
    return Promise.reject(new Error(`unmocked url ${url}`));
  });
  return createEodashCollection(COLLECTION_URL, { client, ...reader });
};

/** @returns {URL} The TileJSON url the reader requested last. */
const requestedTileJson = () =>
  new URL(
    client.get.mock.calls
      .map(([url]) => url)
      .findLast((url) => url.includes("/tilejson.json")),
  );

describe("the mosaic layer of a collection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    client.get.mockReset();
  });

  test("is only offered with a raster endpoint and a render preset", async () => {
    expect((await reader({ reader: {} })).buildMosaicLayer).toBeUndefined();
    expect(
      (await reader({ collection: {} })).buildMosaicLayer,
    ).toBeUndefined();
    expect((await reader()).buildMosaicLayer).toBeTypeOf("function");
  });

  test("renders the first render preset only", async () => {
    const col = await reader();

    const { layer, projection } = (await col.buildMosaicLayer?.(null)) ?? {};

    const url = requestedTileJson();
    expect(url.pathname).toBe("/collections/coll/WebMercatorQuad/tilejson.json");
    expect(url.searchParams.get("assets")).toBe("b04");
    expect(url.searchParams.get("tilesize")).toBe("256");
    expect([...url.searchParams.values()]).not.toContain("b08");
    expect(layer?.source?.url).toBe(TILES);
    expect(layer?.properties?.id).toBe("coll;:;mosaic");
    expect(projection).toBe("EPSG:3857");
  });

  test("sends the query along and keys the layer id by it: the same query is the same layer, another query another one", async () => {
    const col = await reader();
    /** @param {Record<string, string>} query */
    const idOf = async (query) =>
      (await col.buildMosaicLayer?.(query))?.layer?.properties?.id;

    const june = await idOf({ datetime: "2023-06-15" });

    expect(requestedTileJson().searchParams.get("datetime")).toBe(
      "2023-06-15",
    );
    expect(june).toBe("coll;:;mosaic;:;datetime=2023-06-15");
    expect(await idOf({ datetime: "2023-06-15" })).toBe(june);
    expect(await idOf({ datetime: "2023-07-15" })).not.toBe(june);
  });

  test("keeps a cql2 filter in the id parseable, so the layer still leads back to its collection", async () => {
    const col = await reader();

    const { layer } =
      (await col.buildMosaicLayer?.({
        filter: `"eo:cloud_cover" <= 20 AND "x" = 'a;:;b'`,
        "filter-lang": "cql2-text",
      })) ?? {};

    const id = layer?.properties?.id ?? "";
    expect(id.split(";:;")).toHaveLength(3);
    expect(findReaderByLayerId([col], id)).toBe(col);
    expect(requestedTileJson().searchParams.get("filter")).toBe(
      `"eo:cloud_cover" <= 20 AND "x" = 'a;:;b'`,
    );
  });

  test("an expression replaces the assets, which TiTiler treats as exclusive", async () => {
    const col = await reader({
      collection: {
        renders: { first: { assets: ["b04"], expression: "b04/b08" } },
      },
    });

    await col.buildMosaicLayer?.(null);

    const params = requestedTileJson().searchParams;
    expect(params.get("expression")).toBe("b04/b08");
    expect(params.has("assets")).toBe(false);
  });

  test("takes the matrix set and tile grid matching the preset's projection", async () => {
    const col = await reader({
      collection: {
        renders: { first: { ...RENDERS.first, projection: "EPSG:3035" } },
      },
      reader: { rasterEndpoint: RASTER_ENDPOINT, tileMatrixSets: CUSTOM_TMS },
    });

    const { layer } = (await col.buildMosaicLayer?.(null)) ?? {};

    expect(requestedTileJson().pathname).toBe(
      "/collections/coll/CustomTMS/tilejson.json",
    );
    expect(layer?.source).toMatchObject({
      projection: "EPSG:3035",
      tileGrid: { matrixIds: ["0"] },
    });
  });

  test.each([
    ["has no tile url", {}],
    ["request fails", new Error("502")],
  ])("builds nothing, without throwing, when the TileJSON %s", async (_, tilejson) => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const col = await reader({ tilejson });

    await expect(col.buildMosaicLayer?.(null)).resolves.toEqual({
      layer: undefined,
      projection: undefined,
    });
  });

  test("carries no layer config without a raster form", async () => {
    const col = await reader();

    const { layer } = (await col.buildMosaicLayer?.(null)) ?? {};

    expect(layer?.properties).not.toHaveProperty("layerConfig");
  });

  test("carries the collection's raster form and re-applies the saved values on a rebuild", async () => {
    const col = await reader({
      collection: { renders: RENDERS, "eodash:rasterform": FORM_URL },
    });
    const { layer } = (await col.buildMosaicLayer?.(null)) ?? {};
    const layerConfig = layer?.properties?.layerConfig;
    expect(layerConfig?.type).toBe("tileUrl");

    col.persistLayerConfig(layerConfig, { rescale: "0,1" });
    const rebuilt = await col.buildMosaicLayer?.({ datetime: "2023-06-16" });

    expect(
      new URL(rebuilt?.layer?.source?.url ?? "").searchParams.get("rescale"),
    ).toBe("0,1");
  });
});
