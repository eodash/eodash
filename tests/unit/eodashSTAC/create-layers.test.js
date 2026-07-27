import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { EodashCollection } from "@/eodashSTAC/EodashCollection";
import { mapEl } from "@/store/states";
import { useSTAcStore } from "@/store/stac";
import {
  provideEodash,
  serveUrls,
  stacCollection,
} from "../../support/fixtures";

// Per-type layer shapes built by EodashCollection.buildJsonArray. Item
// resolution lives in EodashCollection.test.js, grouping in
// create-layers-config.test.js, legend in the template rendered-state test.

const COLLECTION_URL = "https://cat/collections/coll";
const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

// createLayerFromRender reads useEodash().
provideEodash();

/**
 * Serve the collection JSON plus extra url -> data pairs (tilejson, geojson).
 * @param {Record<string, any>} [extras]
 * @param {Record<string, any>} [colOver]
 */
const serve = (extras = {}, colOver = {}) =>
  serveUrls(axiosMock, {
    [COLLECTION_URL]: stacCollection(colOver),
    ...extras,
  });

/** @param {Record<string, any>} [over] */
const makeItem = (over = {}) => ({
  id: "item",
  properties: {},
  links: [],
  assets: {},
  ...over,
});

/**
 * @param {Record<string, any>} item
 * @param {{ extras?: Record<string,any>, colOver?: Record<string,any>, rasterEndpoint?: string, color?: string, itemDatetime?: string }} [opts]
 * @returns {Promise<any[]>}
 */
const build = async (item, opts = {}) => {
  serve(opts.extras, opts.colOver);
  const ec = new EodashCollection(COLLECTION_URL, false, opts.rasterEndpoint);
  await ec.fetchCollection();
  if (opts.color) ec.color = opts.color;
  return ec.buildJsonArray(
    /** @type {any} */ (item),
    "T",
    false,
    opts.itemDatetime,
  );
};

/**
 * Link layer id: coll;:;item;:;linkId;:;proj.
 * @param {string} id
 */
const linkId = (id) => `coll;:;item;:;${id};:;EPSG:3857`;

/**
 * Only "data"-role assets become layers.
 * @param {Record<string, any>} asset
 */
const dataAsset = (asset) => ({
  roles: ["data"],
  ...asset,
});

describe("EodashCollection.buildJsonArray", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useSTAcStore().supportedUpscalingEndpoints = [];
    axiosMock.get.mockReset();
    mapEl.value = null;
  });

  describe("layers from links", () => {
    test("builds a TileWMS layer from a wms link", async () => {
      const [layer] = await build(
        makeItem({
          links: [
            {
              rel: "wms",
              href: "https://wms",
              title: "WMS",
              "wms:layers": "L",
            },
          ],
        }),
      );

      expect(layer.type).toBe("Tile");
      expect(layer.source.type).toBe("TileWMS");
      expect(layer.source.url).toBe("https://wms");
      expect(layer.source.params).toMatchObject({ LAYERS: "L", TILED: true });
      expect(layer.properties.id).toBe(linkId("WMS"));
    });

    test("builds a WMTSCapabilities layer from a wmts link", async () => {
      const [layer] = await build(
        makeItem({
          links: [{ rel: "wmts", href: "https://wmts", "wmts:layer": "lyr" }],
        }),
      );

      expect(layer.type).toBe("Tile");
      expect(layer.source.type).toBe("WMTSCapabilities");
      expect(layer.source.layer).toBe("lyr");
      expect(layer.source.style).toBe("default");
    });

    test("builds an XYZ layer from an xyz link", async () => {
      const [layer] = await build(
        makeItem({
          links: [
            { rel: "xyz", href: "https://xyz/{z}/{x}/{y}.png", title: "XYZ" },
          ],
        }),
      );

      expect(layer.type).toBe("Tile");
      expect(layer.source.type).toBe("XYZ");
      expect(layer.source.url).toBe("https://xyz/{z}/{x}/{y}.png");
      expect(layer.properties.id).toBe(linkId("XYZ"));
    });

    test("builds an XYZ layer from a tilejson link's tiles[0]", async () => {
      const [layer] = await build(
        makeItem({ links: [{ rel: "tilejson", href: "https://tj.json" }] }),
        {
          extras: {
            "https://tj.json": {
              tiles: ["https://t/{z}/{x}/{y}.png"],
              minzoom: 2,
              maxzoom: 10,
            },
          },
        },
      );

      expect(layer.type).toBe("Tile");
      expect(layer.source.type).toBe("XYZ");
      expect(layer.source.url).toBe("https://t/{z}/{x}/{y}.png");
      expect(layer.minZoom).toBe(2);
      expect(layer.maxZoom).toBe(10);
    });

    test("skips a vector tilejson", async () => {
      const layers = await build(
        makeItem({ links: [{ rel: "tilejson", href: "https://tj.json" }] }),
        {
          extras: {
            "https://tj.json": {
              tiles: ["https://t/{z}/{x}/{y}"],
              vector_layers: [{}],
            },
          },
        },
      );

      expect(layers).toEqual([]);
    });

    test("prefers an xyz link over a tilejson link", async () => {
      const layers = await build(
        makeItem({
          links: [
            { rel: "xyz", href: "https://xyz/{z}/{x}/{y}", title: "XYZ" },
            { rel: "tilejson", href: "https://tj.json" },
          ],
        }),
      );

      expect(layers).toHaveLength(1);
      expect(layers[0].source.type).toBe("XYZ");
    });

    test("builds a VectorTile (MVT) layer from a vector-tile link", async () => {
      const [layer] = await build(
        makeItem({
          links: [
            { rel: "vector-tile", href: "https://vt/{z}/{x}/{y}", title: "VT" },
          ],
        }),
      );

      expect(layer.type).toBe("VectorTile");
      expect(layer.declutter).toBe(true);
      expect(layer.source.type).toBe("VectorTile");
      expect(layer.source.format.type).toBe("MVT");
      expect(layer.source.url).toBe("https://vt/{z}/{x}/{y}");
    });

    test("builds a MapboxStyle layer from a mapbox-style-document link", async () => {
      const [layer] = await build(
        makeItem({
          links: [
            {
              rel: "mapbox-style-document",
              href: "https://style.json",
              title: "MB",
            },
          ],
        }),
      );

      expect(layer.type).toBe("MapboxStyle");
      expect(layer.properties.mapboxStyle).toBe("https://style.json");
    });
  });

  describe("layers from assets", () => {
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
          extras: {
            "https://a.geojson": { type: "FeatureCollection", features: [] },
            "https://b.geojson": { type: "FeatureCollection", features: [] },
          },
        },
      );

      expect(layers).toHaveLength(1);
      expect(layers[0].source.type).toBe("Vector");
      expect(layers[0].source.url).toContain("data:application/json");
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

    test("ignores assets without a data role", async () => {
      const layers = await build(
        makeItem({
          assets: {
            thumb: {
              type: "image/png",
              href: "https://x.png",
              roles: ["thumbnail"],
            },
          },
        }),
      );

      // No data asset, no supported link -> STAC fallback.
      expect(layers).toHaveLength(1);
      expect(layers[0].type).toBe("STAC");
    });
  });

  describe("render extension", () => {
    const colWithRenders = {
      renders: { ndvi: { assets: ["b04"], rescale: [0, 100] } },
    };

    test("builds an XYZ/TiTiler layer from the render extension", async () => {
      // renders is gated behind a supported link/asset, so include a raster asset.
      const layers = await build(
        makeItem({
          assets: {
            data: dataAsset({ type: "image/tiff", href: "https://x.tif" }),
          },
        }),
        { colOver: colWithRenders, rasterEndpoint: "https://raster" },
      );

      const renderLayer = layers.find((l) =>
        l.source?.url?.includes("/tiles/WebMercatorQuad/"),
      );
      expect(renderLayer).toBeTruthy();
      expect(renderLayer.type).toBe("Tile");
      expect(renderLayer.source.type).toBe("XYZ");
      expect(renderLayer.source.url).toContain(
        "/collections/coll/items/item/tiles/WebMercatorQuad/{z}/{x}/{y}?",
      );
    });
  });

  describe("datetime and time controls", () => {
    /**
     * Item links carry the dates getDates reads.
     * @param {string[]} isoDates
     */
    const datedCollection = (isoDates) => ({
      links: isoDates.map((d, i) => ({
        rel: "item",
        href: `https://cat/items/i${i}.json`,
        id: `i${i}`,
        datetime: d,
      })),
    });

    /** @param {string} datetime */
    const xyzItem = (datetime) =>
      makeItem({
        properties: { datetime },
        links: [{ rel: "xyz", href: "https://xyz/{z}/{x}/{y}", title: "XYZ" }],
      });

    test("snaps layerDatetime.currentStep to the closest available date", async () => {
      const [layer] = await build(xyzItem("2024-03-01T00:00:00.000Z"), {
        colOver: datedCollection([
          "2024-01-01T00:00:00.000Z",
          "2025-01-01T00:00:00.000Z",
        ]),
      });

      expect(layer.properties.layerDatetime.currentStep).toBe(
        "2024-01-01T00:00:00.000Z",
      );
      expect(layer.properties.layerDatetime.controlValues).toEqual([
        "2024-01-01T00:00:00.000Z",
        "2025-01-01T00:00:00.000Z",
      ]);
      expect(layer.properties.timeControlProperty).toBe("TIME");
    });

    test("resolves an equidistant datetime to the earlier date", async () => {
      const [layer] = await build(xyzItem("2024-01-02T00:00:00.000Z"), {
        colOver: datedCollection([
          "2024-01-01T00:00:00.000Z",
          "2024-01-03T00:00:00.000Z",
        ]),
      });

      expect(layer.properties.layerDatetime.currentStep).toBe(
        "2024-01-01T00:00:00.000Z",
      );
    });

    test("omits layerDatetime when only one date is available", async () => {
      const [layer] = await build(xyzItem("2024-01-01T00:00:00.000Z"), {
        colOver: datedCollection(["2024-01-01T00:00:00.000Z"]),
      });

      expect(layer.properties.layerDatetime).toBeUndefined();
    });
  });

  describe("shared extra properties", () => {
    const xyzItem = makeItem({
      links: [{ rel: "xyz", href: "https://xyz/{z}/{x}/{y}", title: "XYZ" }],
    });

    test("propagates the collection color onto the layer", async () => {
      const [layer] = await build(xyzItem, { color: "#abcdef" });

      expect(layer.properties.color).toBe("#abcdef");
    });

    test("marks layers exclusive when the collection sets eodash:layerExclusive", async () => {
      const [layer] = await build(xyzItem, {
        colOver: { "eodash:layerExclusive": true },
      });

      expect(layer.properties.layerControlExclusive).toBe(true);
      expect(layer.properties.layerControlExpand).toBe(false);
    });
  });

  describe("STAC fallback", () => {
    test("falls back to a STAC layer when nothing is supported", async () => {
      const item = makeItem({ links: [{ rel: "self", href: "https://self" }] });
      const [layer] = await build(item);

      expect(layer.type).toBe("STAC");
      expect(layer.data).toBe(item);
      expect(layer.displayWebMapLink).toBe(true);
    });
  });
});
