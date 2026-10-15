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
 * @returns {import("../src/types").STACItem}
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
 * @param {import("../src/types").STACItem} item
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

  test("builds a GeoZarr layer from the misspelled vnd+zarr media type", async () => {
    const [layer] = await build(
      makeItem({
        assets: {
          data: dataAsset({
            type: "application/vnd+zarr; version=2; profile=multiscales",
            href: "https://x.zarr/measurements/reflectance",
            bands: [{ name: "b04" }],
          }),
        },
      }),
    );

    expect(layer.source.type).toBe("GeoZarr");
  });

  test("starts a GeoZarr layer with the bands its style's bands field defaults to", async () => {
    const [layer] = await build(
      makeItem({
        links: [
          {
            rel: "style",
            href: "https://styles/zarr.json",
            "asset:keys": ["data"],
          },
        ],
        assets: {
          data: dataAsset({
            type: "application/vnd.zarr; version=3",
            href: "https://x.zarr/measurements",
            bands: [{ name: "Oa08" }],
          }),
        },
      }),
      {
        "https://styles/zarr.json": {
          jsonform: {
            type: "object",
            properties: {
              bands: {
                type: "array",
                format: "bands",
                default: ["oa08_radiance", "oa06_radiance", "oa04_radiance"],
              },
            },
          },
        },
      },
    );

    expect(layer.source.bands).toEqual([
      "oa08_radiance",
      "oa06_radiance",
      "oa04_radiance",
    ]);
  });

  test("builds a WebGLTile/GeoZarr layer starting with its first band", async () => {
    const [layer] = await build(
      makeItem({
        assets: {
          data: dataAsset({
            type: "application/vnd.zarr; version=3; profile=multiscales",
            href: "https://x.zarr",
            bands: [{ name: "vv" }, { name: "vh" }],
          }),
        },
      }),
    );

    expect(layer.type).toBe("WebGLTile");
    expect(layer.source.type).toBe("GeoZarr");
    expect(layer.source.url).toBe("https://x.zarr");
    expect(layer.source.bands).toEqual(["vv"]);
  });

  test("starts a GeoZarr layer with the red, green and blue bands by common name", async () => {
    const [layer] = await build(
      makeItem({
        assets: {
          data: dataAsset({
            type: "application/vnd.zarr; version=3; profile=multiscales",
            href: "https://x.zarr",
            bands: [
              { name: "b01", "eo:common_name": "coastal" },
              { name: "b02", "eo:common_name": "blue" },
              { name: "b03", "eo:common_name": "green" },
              { name: "b04", "eo:common_name": "red" },
            ],
          }),
        },
      }),
    );

    expect(layer.source.bands).toEqual(["b04", "b03", "b02"]);
  });

  test("builds no layer from a zarr asset with the data-mask role", async () => {
    const layers = await build(
      makeItem({
        assets: {
          mask: dataAsset({
            type: "application/vnd.zarr; version=3",
            href: "https://x.zarr/descending",
            roles: ["data", "data-mask"],
            bands: [{ name: "border_mask" }],
          }),
        },
      }),
    );

    expect(layers.some((layer) => layer.source?.type === "GeoZarr")).toBe(
      false,
    );
  });

  test("builds no layer from a zarr asset whose bands the datacube declares auxiliary", async () => {
    const zarr = {
      type: "application/vnd.zarr; version=3",
      href: "https://x.zarr/descending",
    };
    const layers = await build(
      makeItem({
        type: "Feature",
        properties: {
          // EOPF writes `variable_type`, the spec `type`
          "cube:variables": {
            vv: { type: "data" },
            border_mask: { variable_type: "auxiliary" },
          },
        },
        assets: {
          mask: dataAsset({ ...zarr, bands: [{ name: "border_mask" }] }),
          gamma0: dataAsset({ ...zarr, bands: [{ name: "vv" }] }),
        },
      }),
    );

    expect(
      layers
        .filter((layer) => layer.source?.type === "GeoZarr")
        .map((layer) => layer.source.bands),
    ).toEqual([["vv"]]);
  });

  test("builds no layer from a zarr asset inside another zarr asset's group, unless that is the store root", async () => {
    const zarr = { type: "application/vnd.zarr; version=3" };
    const layers = await build(
      makeItem({
        links: [{ rel: "store", href: "https://x.zarr" }],
        assets: {
          // S2: an auxiliary asset at the store root, the real group below it
          aot: dataAsset({
            ...zarr,
            href: "https://x.zarr/",
            bands: [{ name: "aot" }],
          }),
          // S3: a group, plus one of its arrays as an asset of its own
          radiance: dataAsset({
            ...zarr,
            href: "https://x.zarr/measurements",
            bands: [{ name: "oa01" }],
          }),
          oa01: dataAsset({
            ...zarr,
            href: "https://x.zarr/measurements/r0/oa01",
            bands: [{ name: "oa01" }],
          }),
        },
      }),
    );

    expect(
      layers
        .filter((layer) => layer.source?.type === "GeoZarr")
        .map((layer) => layer.source.url),
    ).toEqual(["https://x.zarr/", "https://x.zarr/measurements"]);
  });

  describe("GeoZarr time", () => {
    // two dated items, so the build has time values to hand out
    const datedCollection = {
      [COLLECTION_URL]: stacCollection({
        links: ["2024-01-01T00:00:00.000Z", "2025-01-01T00:00:00.000Z"].map(
          (datetime, i) => ({
            rel: "item",
            href: `https://cat/items/i${i}.json`,
            id: `i${i}`,
            datetime,
          }),
        ),
      }),
    };

    /** @param {Record<string, any>} [properties] */
    const zarrItem = (properties = {}) =>
      makeItem({
        type: "Feature",
        properties: { datetime: "2024-01-01T00:00:00.000Z", ...properties },
        assets: {
          data: dataAsset({
            type: "application/vnd.zarr; version=3",
            href: "https://x.zarr/descending",
            bands: [{ name: "vv" }],
          }),
        },
      });

    test("a cube leaves layerDatetime to eox-map and keeps the item's time control values", async () => {
      const [layer] = await build(
        zarrItem({
          "cube:dimensions": {
            x: { type: "spatial" },
            y: { type: "spatial" },
            time: { type: "temporal" },
          },
        }),
        datedCollection,
      );

      expect(layer.properties.layerDatetime).toBeUndefined();
      expect(layer.properties.timeControlValues).toEqual([
        { date: "2024-01-01T00:00:00.000Z" },
        { date: "2025-01-01T00:00:00.000Z" },
      ]);
    });

    test("a zarr item without a temporal dimension keeps its layerDatetime", async () => {
      const [layer] = await build(zarrItem(), datedCollection);

      expect(layer.properties.layerDatetime.currentStep).toBe(
        "2024-01-01T00:00:00.000Z",
      );
    });
  });

  test("builds no layer from a zarr asset without bands", async () => {
    const layers = await build(
      makeItem({
        assets: {
          data: dataAsset({
            type: "application/vnd.zarr; version=3",
            href: "https://x.zarr",
          }),
        },
      }),
    );

    expect(layers.some((layer) => layer.source?.type === "GeoZarr")).toBe(
      false,
    );
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
      decodeURIComponent(
        layers[0].source.url.replace(
          "data:application/json;charset=utf-8,",
          "",
        ),
      ),
    );
    // eox-map draws one geometry per feature, and geodb answers with the rows
    expect(geojson.features.map((/** @type {any} */ f) => f.geometry)).toEqual([
      { type: "Point", coordinates: [0, 0] },
      { type: "Point", coordinates: [1, 1] },
    ]);
    expect(geojson.features[0].properties).toEqual({ name: "x" });
  });

  test("a geodb response it cannot read does not shift the assets after it", async () => {
    const layers = await build(
      makeItem({
        assets: {
          db: dataAsset({ type: "application/geodb+json", href: "https://db" }),
          gj: dataAsset({
            type: "application/geo+json",
            href: "https://gj.geojson",
          }),
        },
      }),
      {
        "https://db": { rows: [] },
        "https://gj.geojson": { type: "FeatureCollection", features: [] },
      },
    );

    // the surviving layer is gj's, so it carries gj's index and not db's
    expect(layers).toHaveLength(1);
    expect(layers[0].properties.id).toBe("coll;:;item;:;1");
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
