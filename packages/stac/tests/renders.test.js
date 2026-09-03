import { beforeEach, describe, expect, test, vi } from "vitest";
import { createEodashCollection } from "../src/index.js";
import { applyTitilerUpscaling } from "../src/helpers/renders.js";
import { serveUrls, stacCollection } from "../../../tests/support/stac.js";

// The layer the render extension is turned into, which only a raster endpoint
// the app states can be built at all.

/** Stands in for the app's axios instance, which the reader reads through. */
const client = { get: vi.fn() };

const COLLECTION_URL = "https://cat/collections/coll";
const RASTER_ENDPOINT = "https://raster";

/** renders is gated behind a supported link or asset, so carry a raster one. */
const RASTER_ITEM = /** @type {any} */ ({
  id: "item",
  properties: {},
  links: [],
  assets: {
    data: { roles: ["data"], type: "image/tiff", href: "https://x.tif" },
  },
});

/**
 * @param {Record<string, any>} collection
 * @param {import("../src/layers/index.js").BuildContext} [context]
 * @param {any} [item]
 * @returns {Promise<any[]>}
 */
const build = async (collection, context = {}, item = RASTER_ITEM) => {
  serveUrls(client, { [COLLECTION_URL]: stacCollection(collection) });
  const col = await createEodashCollection(COLLECTION_URL, { client });
  return (
    await col.buildLayers(item, {
      rasterEndpoint: RASTER_ENDPOINT,
      ...context,
    })
  ).layers;
};

/** @param {any[]} layers */
const renderLayer = (layers) =>
  layers.find((layer) => layer.source?.url?.includes("/tiles/"));

describe("layers from the render extension", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  test("builds an XYZ/TiTiler layer per render key", async () => {
    const layers = await build({
      renders: { ndvi: { assets: ["b04"], rescale: [0, 100] } },
    });

    const layer = renderLayer(layers);
    expect(layer).toBeTruthy();
    expect(layer.type).toBe("Tile");
    expect(layer.source.type).toBe("XYZ");
    expect(layer.source.url).toContain(
      "/collections/coll/items/item/tiles/WebMercatorQuad/{z}/{x}/{y}?",
    );
    // what the render actually asks TiTiler for, which is the point of the layer
    expect(layer.source.url.split("?")[1]).toBe("assets=b04&rescale=0,100&");
  });

  test("takes the raster endpoint from the reader", async () => {
    serveUrls(client, {
      [COLLECTION_URL]: stacCollection({
        renders: { ndvi: { assets: ["b04"] } },
      }),
    });
    const col = await createEodashCollection(COLLECTION_URL, {
      client,
      rasterEndpoint: RASTER_ENDPOINT,
    });

    const { layers } = await col.buildLayers(RASTER_ITEM);

    expect(renderLayer(layers).source.url).toContain(RASTER_ENDPOINT);
  });

  test("gives each render key its own layer id, so two renders on one item do not collide", async () => {
    const layers = await build({
      renders: {
        ndvi: { assets: ["b04"] },
        ndwi: { assets: ["b03"] },
      },
    });

    const ids = layers
      .filter((layer) => layer.source?.url?.includes("/tiles/"))
      .map((layer) => layer.properties.id);

    expect(ids).toEqual([
      "coll;:;item;:;ndvi;:;EPSG:3857",
      "coll;:;item;:;ndwi;:;EPSG:3857",
    ]);
  });

  test("an expression replaces the assets, which TiTiler treats as exclusive", async () => {
    const layers = await build({
      renders: { ndvi: { assets: ["b04", "b08"], expression: "b08-b04" } },
    });

    const { url } = renderLayer(layers).source;
    expect(url).toContain("expression=b08-b04");
    expect(url).not.toContain("assets=");
  });

  test("yields to an xyz link already pointing at the raster endpoint", async () => {
    const layers = await build(
      { renders: { ndvi: { assets: ["b04"] } } },
      {},
      {
        ...RASTER_ITEM,
        links: [
          {
            rel: "xyz",
            href: `${RASTER_ENDPOINT}/collections/coll/tiles/{z}/{x}/{y}`,
            title: "XYZ",
          },
        ],
      },
    );

    // the producer already baked the render params into that link
    expect(
      layers.filter((layer) =>
        layer.source?.url?.includes("/tiles/WebMercatorQuad/"),
      ),
    ).toHaveLength(0);
    expect(layers.map((layer) => layer.properties.id)).toContain(
      "coll;:;item;:;XYZ;:;EPSG:3857",
    );
  });

  test("takes the tile grid and the url's matrix set from the matching set", async () => {
    const layers = await build(
      { renders: { ndvi: { assets: ["b04"] } } },
      {
        tileMatrixSets: {
          CustomTMS: {
            id: "CustomTMS",
            crs: "http://www.opengis.net/def/crs/EPSG/0/3857",
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
        },
      },
    );

    const layer = renderLayer(layers);
    expect(layer.source.url).toContain("/tiles/CustomTMS/");
    expect(layer.source.tileGrid).toBeDefined();
    expect(layer.source.tileGrid.matrixIds).toEqual(["0"]);
  });
});

describe("applyTitilerUpscaling", () => {
  const url = "https://api.example.com/tiles/{z}/{x}/{y}?assets=data";

  test("returns null if no endpoint matches", () => {
    const upscalingEndpoints = ["https://other-api.com"];
    expect(applyTitilerUpscaling(url, upscalingEndpoints)).toBeNull();
  });

  test("applies v1 upscaling (default)", () => {
    const upscalingEndpoints = ["https://api.example.com"];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    expect(result.url).toBe(
      "https://api.example.com/tiles/{z}/{x}/{y}@2x?assets=data",
    );
    expect(result.tileSize).toEqual([512, 512]);
  });

  test("applies v1 upscaling with scaleFactor", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 1, scaleFactor: 3 },
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    expect(result.url).toBe(
      "https://api.example.com/tiles/{z}/{x}/{y}@3x?assets=data",
    );
  });

  test("applies v1 upscaling guard (max 4)", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 1, scaleFactor: 10 },
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    expect(result.url).toBe(
      "https://api.example.com/tiles/{z}/{x}/{y}@4x?assets=data",
    );
  });

  test("applies v2 upscaling", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 2 },
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    expect(result.url).toBe(
      "https://api.example.com/tiles/{z}/{x}/{y}?assets=data&tilesize=512",
    );
    expect(result.tileSize).toEqual([512, 512]);
  });

  test("applies v2 upscaling with scaleFactor (no limit)", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 2, scaleFactor: 8 },
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    // 256 * 8 = 2048
    expect(result.url).toBe(
      "https://api.example.com/tiles/{z}/{x}/{y}?assets=data&tilesize=2048",
    );
  });

  test("applies v1 upscaling with decimal scaleFactor (rounded)", () => {
    const upscalingEndpoints = [
      { url: "https://api.example.com", titilerVersion: 1, scaleFactor: 3.4 },
    ];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    // scaleFactor 3.4 -> exponent = Math.round(3.4) = 3
    expect(result.url).toBe(
      "https://api.example.com/tiles/{z}/{x}/{y}@3x?assets=data",
    );
  });

  test("handles plain string as v1 with scaleFactor 1", () => {
    const upscalingEndpoints = ["https://api.example.com"];
    const result = applyTitilerUpscaling(url, upscalingEndpoints);
    expect(result.url).toContain("@2x");
  });
});
