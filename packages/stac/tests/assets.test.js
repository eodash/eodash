import { beforeEach, describe, expect, test, vi } from "vitest";
import { createEodashCollection } from "../src/index.js";
import { serveUrls, stacCollection } from "../../../tests/support/stac.js";

// The layer shape each data asset type is built into. Which assets qualify at
// all is orchestration, so it is pinned in layers.test.js.

/** Stands in for the app's axios instance, which the reader reads through. */
const client = { get: vi.fn() };

const COLLECTION_URL = "https://cat/collections/coll";

/**
 * A bare item, since what is under test is only what a test puts on it.
 * @param {Record<string, any>} [over]
 * @returns {import("../src/types").EodashItem}
 */
const makeItem = (over = {}) =>
  /** @type {any} */ ({
    id: "item",
    properties: {},
    links: [],
    assets: {},
    ...over,
  });

/**
 * Only "data"-role assets become layers.
 * @param {Record<string, any>} asset
 */
const dataAsset = (asset) => ({ roles: ["data"], ...asset });

/**
 * @param {import("../src/types").EodashItem} item
 * @param {Record<string, any>} [extras] url -> data the build reads (geojson bodies)
 * @returns {Promise<any[]>}
 */
const build = async (item, extras = {}) => {
  serveUrls(client, { [COLLECTION_URL]: stacCollection(), ...extras });
  const col = await createEodashCollection(COLLECTION_URL, { client });
  return (await col.buildLayers(item)).layers;
};

describe("layers from assets", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  test("builds a WebGLTile/GeoTIFF layer from an image/tiff data asset", async () => {
    const [layer] = await build(
      makeItem({
        assets: {
          data: dataAsset({ type: "image/tiff", href: "https://x.tif" }),
        },
      }),
    );

    expect(layer.type).toBe("WebGLTile");
    expect(layer.source.type).toBe("GeoTIFF");
    expect(layer.source.sources).toEqual([{ url: "https://x.tif" }]);
    expect(layer.properties.id).toBe("coll;:;item;:;0");
  });

  test("merges image/tiff data assets into one layer, one source each", async () => {
    const layers = await build(
      makeItem({
        assets: {
          a: dataAsset({ type: "image/tiff", href: "https://a.tif" }),
          b: dataAsset({ type: "image/tiff", href: "https://b.tif" }),
        },
      }),
    );

    expect(layers).toHaveLength(1);
    expect(layers[0].source.sources).toEqual([
      { url: "https://a.tif" },
      { url: "https://b.tif" },
    ]);
  });

  test("keeps a baselayer asset under its own name, so a date change cannot drop it", async () => {
    const [layer] = await build(
      makeItem({
        assets: {
          base: dataAsset({
            type: "image/tiff",
            href: "https://base.tif",
            roles: ["data", "baselayer"],
          }),
        },
      }),
    );

    // an id without the item in it survives the layer removal a rebuild does
    expect(layer.properties.id).toBe("base");
    expect(layer.properties.group).toBe("baselayer");
    expect(layer.properties.layerConfig).toBeUndefined();
  });

  test("builds a WebGLTile/GeoZarr layer with default bands", async () => {
    const [layer] = await build(
      makeItem({
        assets: {
          data: dataAsset({
            type: "application/vnd.zarr; version=3; profile=multiscales",
            href: "https://x.zarr",
          }),
        },
      }),
    );

    expect(layer.type).toBe("WebGLTile");
    expect(layer.source.type).toBe("GeoZarr");
    expect(layer.source.url).toBe("https://x.zarr");
    expect(layer.source.bands).toEqual(["b04", "b03", "b02"]);
  });

  test("builds a Vector/GeoJSON layer from a single geo+json data asset", async () => {
    const [layer] = await build(
      makeItem({
        "eodash:merge_assets": false,
        assets: {
          data: dataAsset({
            type: "application/geo+json",
            href: "https://x.geojson",
          }),
        },
      }),
    );

    expect(layer.type).toBe("Vector");
    expect(layer.source.type).toBe("Vector");
    expect(layer.source.url).toBe("https://x.geojson");
    expect(layer.source.format.type).toBe("GeoJSON");
  });

  test("an asset's projection comes back for the app to register", async () => {
    serveUrls(client, { [COLLECTION_URL]: stacCollection() });
    const col = await createEodashCollection(COLLECTION_URL, { client });

    const { projections } = await col.buildLayers(
      makeItem({
        "eodash:merge_assets": false,
        assets: {
          data: dataAsset({
            type: "application/geo+json",
            href: "https://x.geojson",
            "proj:code": "EPSG:3035",
          }),
        },
      }),
    );

    expect(projections).toContain("EPSG:3035");
  });

  test("a style with a tooltip adds a select interaction keyed to the layer", async () => {
    const [layer] = await build(
      makeItem({
        "eodash:merge_assets": false,
        links: [
          {
            rel: "style",
            href: "https://styles/x.json",
            "asset:keys": ["data"],
          },
        ],
        assets: {
          data: dataAsset({
            type: "application/geo+json",
            href: "https://x.geojson",
          }),
        },
      }),
      { "https://styles/x.json": { tooltip: [{ id: "name" }] } },
    );

    // a rebuild has to land on the same id, or eox-map strands the old one
    expect(layer.interactions).toEqual([
      {
        type: "select",
        options: {
          id: `${layer.properties.id}_selectInteraction`,
          // undefined would switch the tooltip off on eox-map's update path
          active: true,
          condition: "pointermove",
          style: { "stroke-color": "#335267", "stroke-width": 4 },
        },
      },
    ]);
  });

  test("merges multiple geo+json data assets into a single layer", async () => {
    const layers = await build(
      makeItem({
        assets: {
          a: dataAsset({
            type: "application/geo+json",
            href: "https://a.geojson",
          }),
          b: dataAsset({
            type: "application/geo+json",
            href: "https://b.geojson",
          }),
        },
      }),
      {
        "https://a.geojson": { type: "FeatureCollection", features: [] },
        "https://b.geojson": { type: "FeatureCollection", features: [] },
      },
    );

    expect(layers).toHaveLength(1);
    expect(layers[0].source.type).toBe("Vector");
    expect(layers[0].source.url).toContain("data:application/json");
  });

  test("expands a geodb response's multi-geometries into one feature each", async () => {
    const layers = await build(
      makeItem({
        assets: {
          db: dataAsset({
            type: "application/geodb+json",
            href: "https://db",
          }),
        },
      }),
      {
        "https://db": [
          {
            geometry: {
              type: "MultiPoint",
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
            name: "x",
          },
        ],
      },
    );

    const geojson = JSON.parse(
      decodeURI(layers[0].source.url).replace(
        "data:application/json;charset=utf-8,",
        "",
      ),
    );
    // eox-map draws one geometry per feature, and geodb answers with the rows
    expect(geojson.features.map((/** @type {any} */ f) => f.geometry)).toEqual([
      { type: "Point", coordinates: [0, 0] },
      { type: "Point", coordinates: [1, 1] },
    ]);
    expect(geojson.features[0].properties).toEqual({ name: "x" });
  });

  test("builds a Vector/FlatGeoBuf layer from a flatgeobuf data asset", async () => {
    const [layer] = await build(
      makeItem({
        "eodash:merge_assets": false,
        assets: {
          data: dataAsset({
            type: "application/vnd.flatgeobuf",
            href: "https://x.fgb",
          }),
        },
      }),
    );

    expect(layer.type).toBe("Vector");
    expect(layer.source.type).toBe("FlatGeoBuf");
    expect(layer.source.url).toBe("https://x.fgb");
  });
});
