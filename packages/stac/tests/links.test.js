import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createEodashCollection } from "../src/index.js";
import { serveUrls, stacCollection } from "../../../tests/support/stac.js";

// The layer shape each link rel is built into. Orchestration (datetime, shared
// extra properties, the STAC fallback) is in layers.test.js, and so is which
// form a link's config editor is read from.

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
 * @param {import("../src/types").EodashItem} item
 * @param {{ extras?: Record<string, any>, collection?: Record<string, any> } & import("../src/layers/index.js").BuildContext} [options]
 * @returns {Promise<any[]>}
 */
const buildAll = async (
  item,
  { extras = {}, collection = {}, ...context } = {},
) => {
  serveUrls(client, {
    [COLLECTION_URL]: stacCollection(collection),
    ...extras,
  });
  const col = await createEodashCollection(COLLECTION_URL, { client });
  return col.buildLayers(item, context);
};

/**
 * @param {import("../src/types").EodashItem} item
 * @param {Parameters<typeof buildAll>[1]} [options]
 * @returns {Promise<any[]>}
 */
const build = async (item, options) => (await buildAll(item, options)).layers;

/**
 * Link layer id: coll;:;item;:;linkId;:;proj.
 * @param {string} id
 */
const linkId = (id) => `coll;:;item;:;${id};:;EPSG:3857`;

describe("layers from links", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  test("builds a TileWMS layer from a wms link", async () => {
    const [layer] = await build(
      makeItem({
        links: [
          { rel: "wms", href: "https://wms", title: "WMS", "wms:layers": "L" },
        ],
      }),
    );

    expect(layer.type).toBe("Tile");
    expect(layer.source.type).toBe("TileWMS");
    expect(layer.source.url).toBe("https://wms");
    expect(layer.source.params).toMatchObject({ LAYERS: "L", TILED: true });
    expect(layer.properties.id).toBe(linkId("WMS"));
  });

  test("expands the rest of a wms link's fields into the request", async () => {
    const [layer] = await build(
      makeItem({
        links: [
          {
            rel: "wms",
            href: "https://wms",
            title: "WMS",
            "wms:layers": "L",
            "wms:version": "1.3.0",
            "wms:styles": "raster",
            "wms:tilesize": 256,
            "wms:dimensions": { TIME: "2023-01-01" },
          },
        ],
      }),
    );

    expect(layer.source.params).toEqual({
      LAYERS: "L",
      TILED: true,
      VERSION: "1.3.0",
      STYLES: "raster",
      TIME: "2023-01-01",
    });
    expect(layer.source.tileGrid.tileSize).toEqual([256, 256]);
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

  test("keeps every tilejson tile url, and the document's own attribution", async () => {
    const [layer] = await build(
      makeItem({ links: [{ rel: "tilejson", href: "https://tj.json" }] }),
      {
        extras: {
          "https://tj.json": {
            tiles: ["https://a/{z}/{x}/{y}.png", "https://b/{z}/{x}/{y}.png"],
            attribution: "© tilejson",
          },
        },
      },
    );

    expect(layer.source.urls).toEqual([
      "https://a/{z}/{x}/{y}.png",
      "https://b/{z}/{x}/{y}.png",
    ]);
    expect(layer.source.url).toBeUndefined();
    // the link may state its own, and then that one wins
    expect(layer.source.attributions).toBe("© tilejson");
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

  test("a link's own legend wins over the collection's", async () => {
    const [layer] = await build(
      makeItem({
        links: [
          {
            rel: "xyz",
            href: "https://xyz/{z}/{x}/{y}",
            title: "XYZ",
            "eox:colorlegend": { type: "continuous", title: "link" },
          },
        ],
      }),
      {
        collection: {
          "eox:colorlegend": { type: "continuous", title: "collection" },
        },
      },
    );

    expect(layer.properties.layerLegend).toEqual({
      type: "continuous",
      title: "link",
    });
  });

  describe("projections", () => {
    /** @param {Record<string, any>} over */
    const wmsWith = (over) =>
      makeItem({
        links: [
          {
            rel: "wms",
            href: "https://wms",
            title: "WMS",
            "wms:layers": "L",
            ...over,
          },
        ],
      });

    test("a wms link that states none falls back to EPSG:4326", async () => {
      const [layer] = await build(wmsWith({}));

      expect(layer.source.projection).toBe("EPSG:4326");
    });

    test("a wmts link that states none falls back to EPSG:3857", async () => {
      const [layer] = await build(
        makeItem({ links: [{ rel: "wmts", href: "https://wmts" }] }),
      );

      expect(layer.source.projection).toBe("EPSG:3857");
    });

    test("reads the projection extension's proj:code", async () => {
      const { layers, projections } = await buildAll(
        wmsWith({ "proj:code": "EPSG:3035" }),
      );

      expect(layers[0].source.projection).toBe("EPSG:3035");
      expect(projections).toContain("EPSG:3035");
    });

    test("still reads the deprecated proj:epsg, as a code", async () => {
      const { layers, projections } = await buildAll(
        wmsWith({ "proj:epsg": 3035 }),
      );

      expect(layers[0].source.projection).toBe("EPSG:3035");
      expect(projections).toContain(3035);
    });

    test("proj:code wins over proj:epsg", async () => {
      const [layer] = await build(
        wmsWith({ "proj:code": "EPSG:3035", "proj:epsg": 4326 }),
      );

      expect(layer.source.projection).toBe("EPSG:3035");
    });

    test("a proj4 definition names the code and comes back to be registered", async () => {
      const def = { name: "EPSG:27700", def: "+proj=tmerc +lat_0=49" };

      const { layers, projections } = await buildAll(
        wmsWith({ "eodash:proj4_def": def }),
      );

      expect(layers[0].source.projection).toBe("EPSG:27700");
      expect(projections).toContainEqual(def);
    });

    test.each([
      [{ rel: "xyz", href: "https://xyz/{z}/{x}/{y}.png" }, true],
      [{ rel: "wmts", href: "https://wmts", "wmts:layer": "l" }, true],
      [{ rel: "tilejson", href: "https://tilejson.json" }, true],
      [{ rel: "vector-tile", href: "https://vt/{z}/{x}/{y}.pbf" }, true],
      // a mapbox style states its own projection, so only the registration matters
      [{ rel: "mapbox-style-document", href: "https://mb/style.json" }, false],
    ])("a $rel link takes the projection it states", async (link, onSource) => {
      const { layers, projections } = await buildAll(
        makeItem({ links: [{ ...link, "proj:code": "EPSG:3035" }] }),
        {
          extras: {
            "https://tilejson.json": { tiles: ["https://tj/{z}/{x}/{y}.png"] },
          },
        },
      );

      expect(projections).toContain("EPSG:3035");
      if (onSource) {
        expect(layers[0].source.projection).toBe("EPSG:3035");
      }
    });

    test("the item's own projection comes back to be registered", async () => {
      const { projections } = await buildAll(
        makeItem({
          "proj:code": "EPSG:3035",
          links: [{ rel: "wms", href: "https://wms", "wms:layers": "L" }],
        }),
      );

      expect(projections[0]).toBe("EPSG:3035");
    });
  });

  describe("authenticated links", () => {
    // the api key is read straight off `process.env`, so it has to be put back
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    /** @param {Record<string, any>} link */
    const authItem = (link) =>
      makeItem({
        "auth:schemes": {
          key: { type: "apiKey", in: "query", name: "token" },
        },
        links: [{ ...link, "auth:refs": ["key"] }],
      });

    test("puts the key the scheme names into a vector-tile url", async () => {
      vi.stubEnv("EODASH_token", "secret");

      const [layer] = await build(
        authItem({
          rel: "vector-tile",
          href: "https://vt/{z}/{x}/{y}",
          title: "VT",
        }),
      );

      expect(layer.source.url).toBe("https://vt/{z}/{x}/{y}?token=secret");
    });

    test("hands a mapbox style the key as an apply option instead of a url", async () => {
      vi.stubEnv("EODASH_token", "secret");

      const [layer] = await build(
        authItem({
          rel: "mapbox-style-document",
          href: "https://style.json",
          title: "MB",
          applyOptions: {},
        }),
      );

      // ol-mapbox-style takes it as an option, so the url is left alone
      expect(layer.properties.applyOptions).toEqual({ apiKey: "secret" });
      expect(layer.properties.mapboxStyle).toBe("https://style.json");
    });

    test("reports the missing env variable and leaves the url unsigned", async () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      const [layer] = await build(
        authItem({
          rel: "vector-tile",
          href: "https://vt/{z}/{x}/{y}",
          title: "VT",
        }),
      );

      expect(layer.source.url).toBe("https://vt/{z}/{x}/{y}");
      expect(error).toHaveBeenCalledWith(
        expect.stringContaining("EODASH_token"),
      );
    });
  });

  describe("xyz urls the app cannot state", () => {
    /** @param {Record<string, any>} [over] */
    const titilerItem = (over = {}) =>
      makeItem({
        links: [
          {
            rel: "xyz",
            href: "https://titiler/tiles/{z}/{x}/{y}.png",
            title: "XYZ",
            ...over,
          },
        ],
      });

    test("asks a titiler v1 endpoint for retina tiles", async () => {
      const [layer] = await build(titilerItem(), {
        upscalingEndpoints: ["https://titiler"],
      });

      expect(layer.source.url).toBe("https://titiler/tiles/{z}/{x}/{y}@2x.png");
      expect(layer.source.tileGrid.tileSize).toEqual([512, 512]);
    });

    test("asks a titiler v2 endpoint for them by tilesize, which replaced @2x", async () => {
      const [layer] = await build(titilerItem(), {
        upscalingEndpoints: [{ url: "https://titiler", titilerVersion: 2 }],
      });

      expect(layer.source.url).toBe(
        "https://titiler/tiles/{z}/{x}/{y}.png?tilesize=512",
      );
      expect(layer.source.tileGrid.tileSize).toEqual([512, 512]);
    });

    test("leaves an unlisted endpoint at 256px tiles", async () => {
      const [layer] = await build(titilerItem(), {
        upscalingEndpoints: ["https://other"],
      });

      expect(layer.source.url).toBe("https://titiler/tiles/{z}/{x}/{y}.png");
      expect(layer.source.tileGrid.tileSize).toEqual([256, 256]);
    });

    test("shards an s2maps url across its subdomains", async () => {
      const [layer] = await build(
        makeItem({
          links: [
            {
              rel: "xyz",
              href: "https://s2maps-tiles.eu/wmts/{z}/{x}/{y}.jpg",
              title: "S2",
            },
          ],
        }),
      );

      expect(layer.source.url).toBe(
        "https://{a-e}.s2maps-tiles.eu/wmts/{z}/{x}/{y}.jpg",
      );
    });
  });

  describe("tile matrix sets", () => {
    const CUSTOM_TMS = {
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
    };

    test("an xyz layer takes its tile grid from the matching set", async () => {
      const [layer] = await build(
        makeItem({
          links: [
            { rel: "xyz", href: "https://xyz/{z}/{x}/{y}", title: "XYZ" },
          ],
        }),
        { tileMatrixSets: CUSTOM_TMS },
      );

      expect(layer.source.tileGrid).toBeDefined();
      expect(layer.source.tileGrid.matrixIds).toEqual(["0"]);
    });
  });

  describe("base layers and overlays", () => {
    const rasterform = { jsonform: { type: "object", properties: {} } };

    // one link per tileUrl loop, each carrying a rasterform so that a
    // layerConfig would be built if the layer was not a base layer / overlay
    const RASTER_FORM_LINKS = {
      wms: { rel: "wms", href: "https://wms", title: "WMS", "wms:layers": "L" },
      wmts: {
        rel: "wmts",
        href: "https://wmts",
        title: "WMTS",
        "wmts:layer": "lyr",
      },
      xyz: { rel: "xyz", href: "https://xyz/{z}/{x}/{y}", title: "XYZ" },
      tilejson: { rel: "tilejson", href: "https://tj.json", title: "TJ" },
    };
    const rels = Object.keys(RASTER_FORM_LINKS);

    /**
     * @param {string} rel
     * @param {Record<string, any>} [over]
     */
    const buildLink = (rel, over = {}) =>
      build(
        makeItem({
          links: [
            {
              .../** @type {Record<string, any>} */ (RASTER_FORM_LINKS)[rel],
              "eodash:rasterform": rasterform,
              ...over,
            },
          ],
        }),
        { extras: { "https://tj.json": { tiles: ["https://t/{z}/{x}/{y}"] } } },
      );

    test.each(rels)("attaches a layerConfig to a data %s link", async (rel) => {
      const [layer] = await buildLink(rel);

      expect(layer.properties.layerConfig).toBeDefined();
    });

    test.each(rels)(
      "omits the layerConfig of a %s baselayer link",
      async (rel) => {
        const [layer] = await buildLink(rel, { roles: ["baselayer"] });

        expect(layer.properties.group).toBe("baselayer");
        expect(layer.properties).not.toHaveProperty("layerConfig");
      },
    );

    test("omits the layerConfig of an overlay link", async () => {
      const [layer] = await buildLink("xyz", { roles: ["overlay"] });

      expect(layer.properties.group).toBe("overlay");
      expect(layer.properties).not.toHaveProperty("layerConfig");
    });

    test.each(["wms", "xyz"])("preloads a %s baselayer", async (rel) => {
      const [layer] = await buildLink(rel, { roles: ["baselayer"] });

      expect(layer.preload).toBe(Infinity);
    });

    test("skips the rasterform request of a baselayer link", async () => {
      const [layer] = await build(
        makeItem({
          links: [
            {
              ...RASTER_FORM_LINKS.xyz,
              roles: ["baselayer"],
              "eodash:rasterform": "https://form.json",
            },
          ],
        }),
        { extras: { "https://form.json": rasterform } },
      );

      expect(layer.properties).not.toHaveProperty("layerConfig");
      expect(
        client.get.mock.calls.filter(([url]) => url === "https://form.json"),
      ).toHaveLength(0);
    });
  });
});
