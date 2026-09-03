import { beforeEach, describe, expect, test, vi } from "vitest";
import { createEodashCollection } from "../src/index.js";
import {
  serveUrls,
  stacCollection,
  stacItem,
} from "../../../tests/support/stac.js";

/** Stands in for the app's axios instance, which the reader reads through. */
const client = { get: vi.fn() };

const COLLECTION_URL = "https://cat/collections/coll";
const FORM_URL = "https://forms/raster.json";
const OWN_FORM_URL = "https://forms/own.json";

/** @param {Record<string, any>} [over] */
const rasterForm = (over = {}) => ({
  jsonform: {
    type: "object",
    properties: { LAYERS: { type: "string", default: "default" } },
    ...over,
  },
});

const ITEM_LINKS = [
  {
    rel: "item",
    href: "https://cat/items/i1.json",
    id: "i1",
    datetime: "2023-01-01T00:00:00Z",
  },
  {
    rel: "item",
    href: "https://cat/items/i2.json",
    id: "i2",
    datetime: "2023-01-10T00:00:00Z",
  },
];

/** @param {Record<string, any>} [over] */
const wmsLink = (over = {}) => ({
  rel: "wms",
  href: "https://wms/service",
  "wms:layers": "default",
  ...over,
});

/**
 * @param {object} [setup]
 * @param {Record<string, any>[]} [setup.links] the collection's own links
 * @param {Record<string, any>[]} [setup.itemLinks] the links every served item carries
 * @param {Record<string, any>} [setup.collection] merged onto the collection last, so a test can drop `eodash:rasterform`
 * @param {Record<string, any>} [setup.forms] extra form url -> document
 */
const serve = ({
  links = ITEM_LINKS,
  itemLinks = [wmsLink()],
  collection = {},
  forms = {},
} = {}) =>
  serveUrls(client, {
    [COLLECTION_URL]: stacCollection({
      links,
      "eodash:rasterform": FORM_URL,
      ...collection,
    }),
    [FORM_URL]: rasterForm(),
    ...forms,
    ...Object.fromEntries(
      links
        .filter((link) => link.rel === "item")
        .map((link) => [
          link.href,
          stacItem({
            id: link.id,
            properties: { datetime: link.datetime },
            links: itemLinks,
          }),
        ]),
    ),
  });

const reader = () => createEodashCollection(COLLECTION_URL, { client });

/**
 * Builds from an item the caller already holds, which is how the app rebuilds
 * on a datetime change. Call `serve` first.
 *
 * @param {Record<string, any>} item
 * @param {import("../src/layers/index.js").BuildContext} [context]
 * @returns {Promise<any[]>}
 */
const buildFrom = async (item, context = {}) => {
  const col = await reader();
  return (await col.buildLayers(/** @type {any} */ (item), context)).layers;
};

/** @param {Record<string, any>} [over] */
const xyzItem = (over = {}) => ({
  id: "item",
  properties: {},
  assets: {},
  links: [{ rel: "xyz", href: "https://xyz/{z}/{x}/{y}", title: "XYZ" }],
  ...over,
});

/** How many times a form document was actually read. */
const readsOf = (/** @type {string} */ url) =>
  client.get.mock.calls.filter(([called]) => called === url).length;

describe("building layers", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  describe("getLayers", () => {
    test("warns and builds nothing when the collection has no items", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      serve({ links: [] });
      const col = await reader();

      expect(await col.getLayers()).toEqual({ layers: [], projections: [] });
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("no item to build layers from"),
      );
    });

    test("resolves a datetime to the closest item and builds that item's links", async () => {
      serve();
      const col = await reader();

      const { layers } = await col.getLayers("2023-01-09T00:00:00Z");

      expect(layers).toHaveLength(1);
      expect(layers[0].properties?.id).toMatch(/^coll;:;i2;:;/);
    });

    test("returns the projections its links referenced, for the caller to register", async () => {
      serve({ itemLinks: [wmsLink({ "proj:epsg": 3035 })] });
      const col = await reader();

      expect((await col.getLayers()).projections).toEqual([3035]);
    });
  });

  describe("updateLayers", () => {
    const LAYER_ID = "coll;:;i1;:;EPSG:3857";

    /** The tree as the app holds it: this collection's layer in a group, plus a basemap. */
    const currentTree = () => {
      const old = { type: "Tile", properties: { id: LAYER_ID } };
      const osm = { type: "Tile", properties: { id: "osm" } };
      return {
        old,
        osm,
        layers: /** @type {any} */ ([
          { type: "Group", properties: { id: "AnalysisGroup" }, layers: [old] },
          osm,
        ]),
      };
    };

    test("swaps this collection's layers for the new item's, keeping the group", async () => {
      serve();
      const col = await reader();
      const { old, osm, layers } = currentTree();

      const updated = await col.updateLayers(
        "2023-01-10T00:00:00Z",
        LAYER_ID,
        layers,
      );

      const group = /** @type {any} */ (updated?.layers[0]);
      expect(group.properties.id).toBe("AnalysisGroup");
      expect(
        group.layers.map((/** @type {any} */ layer) => layer.properties.id),
      ).toEqual([expect.stringMatching(/^coll;:;i2;:;/)]);
      // what did not change is the layer eox-map already holds, not a copy of it
      expect(updated?.layers[1]).toBe(osm);
      expect(updated?.layers).not.toBe(layers);
      // and the tree it was handed still holds the old layer
      expect(layers[0].layers).toEqual([old]);
    });

    test("returns the new layers' projections, for the caller to register", async () => {
      serve({ itemLinks: [wmsLink({ "proj:epsg": 3035 })] });
      const col = await reader();

      const updated = await col.updateLayers(
        "2023-01-10T00:00:00Z",
        LAYER_ID,
        currentTree().layers,
      );

      expect(updated?.projections).toEqual([3035]);
    });

    test("warns and updates nothing when the tree holds no layer of this collection", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      serve();
      const col = await reader();
      const { osm } = currentTree();

      // the collection's layer has since been removed from the tree
      const updated = await col.updateLayers("2023-01-10T00:00:00Z", LAYER_ID, [
        osm,
      ]);

      expect(updated).toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("no layer of this collection"),
        LAYER_ID,
      );
    });

    test("warns and updates nothing when the collection has no item at that datetime", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      serve({ links: [] });
      const col = await reader();

      const updated = await col.updateLayers(
        "2023-01-10T00:00:00Z",
        LAYER_ID,
        currentTree().layers,
      );

      expect(updated).toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("no item at"),
        "2023-01-10T00:00:00Z",
      );
    });
  });

  describe("layer config form values", () => {
    test("a datetime change keeps what the editor held", async () => {
      serve();
      const col = await reader();
      const { layers } = await col.getLayers("2023-01-01T00:00:00Z");
      expect(layers[0].source?.params.LAYERS).toBe("default");

      col.persistLayerConfig(layers[0].properties?.layerConfig, {
        LAYERS: "edited",
      });
      const rebuilt = await col.getLayers("2023-01-10T00:00:00Z");

      expect(rebuilt.layers[0].source?.params.LAYERS).toBe("edited");
    });

    test("seeds the remembered value back into the rebuilt schema", async () => {
      serve();
      const col = await reader();
      const { layers } = await col.getLayers();

      col.persistLayerConfig(layers[0].properties?.layerConfig, {
        LAYERS: "edited",
      });
      const rebuilt = await col.getLayers();

      expect(
        rebuilt.layers[0].properties?.layerConfig?.schema.properties.LAYERS
          .default,
      ).toBe("edited");
    });

    test("a second reader of the same collection starts empty", async () => {
      serve();
      const col = await reader();
      const { layers } = await col.getLayers();
      col.persistLayerConfig(layers[0].properties?.layerConfig, {
        LAYERS: "edited",
      });

      const fresh = await reader();

      expect((await fresh.getLayers()).layers[0].source?.params.LAYERS).toBe(
        "default",
      );
      // the reader that was edited still holds it
      expect((await col.getLayers()).layers[0].source?.params.LAYERS).toBe(
        "edited",
      );
    });

    test("a form that opts out of persistence is never remembered", async () => {
      serve({
        forms: {
          [FORM_URL]: rasterForm({ options: { persist_state: false } }),
        },
      });
      const col = await reader();
      const { layers } = await col.getLayers();

      col.persistLayerConfig(layers[0].properties?.layerConfig, {
        LAYERS: "edited",
      });

      expect((await col.getLayers()).layers[0].source?.params.LAYERS).toBe(
        "default",
      );
    });
  });

  describe("raster form reads", () => {
    test("links falling back to the collection's form share one read", async () => {
      serve({
        itemLinks: [
          wmsLink({ href: "https://wms/a" }),
          wmsLink({ href: "https://wms/b" }),
        ],
      });
      const col = await reader();

      const { layers } = await col.getLayers();

      expect(layers).toHaveLength(2);
      expect(readsOf(FORM_URL)).toBe(1);
    });

    test("a link's own form wins over the collection's", async () => {
      serve({
        itemLinks: [
          wmsLink({ href: "https://wms/a", "eodash:rasterform": OWN_FORM_URL }),
          wmsLink({ href: "https://wms/b" }),
        ],
        forms: {
          [OWN_FORM_URL]: rasterForm({
            properties: { LAYERS: { type: "string", default: "own" } },
          }),
        },
      });
      const col = await reader();

      const { layers } = await col.getLayers();

      expect(
        layers[0].properties?.layerConfig?.schema.properties.LAYERS.default,
      ).toBe("own");
      expect(
        layers[1].properties?.layerConfig?.schema.properties.LAYERS.default,
      ).toBe("default");
      expect(readsOf(OWN_FORM_URL)).toBe(1);
      expect(readsOf(FORM_URL)).toBe(1);
    });

    test("a base layer is built without a config, so no form is read", async () => {
      serve({ itemLinks: [wmsLink({ roles: ["baselayer"] })] });
      const col = await reader();

      const { layers } = await col.getLayers();

      expect(layers[0].properties?.layerConfig).toBeUndefined();
      expect(readsOf(FORM_URL)).toBe(0);
    });
  });

  describe("datetime and time controls", () => {
    /**
     * The dates a build reads are the collection's, not the item's.
     * @param {string[]} isoDates
     */
    const datedLinks = (isoDates) =>
      isoDates.map((datetime, i) => ({
        rel: "item",
        href: `https://cat/items/i${i}.json`,
        id: `i${i}`,
        datetime,
      }));

    test("snaps layerDatetime.currentStep to the closest available date", async () => {
      serve({
        links: datedLinks([
          "2024-01-01T00:00:00.000Z",
          "2025-01-01T00:00:00.000Z",
        ]),
      });

      const [layer] = await buildFrom(
        xyzItem({ properties: { datetime: "2024-03-01T00:00:00.000Z" } }),
      );

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
      serve({
        links: datedLinks([
          "2024-01-01T00:00:00.000Z",
          "2024-01-03T00:00:00.000Z",
        ]),
      });

      const [layer] = await buildFrom(
        xyzItem({ properties: { datetime: "2024-01-02T00:00:00.000Z" } }),
      );

      expect(layer.properties.layerDatetime.currentStep).toBe(
        "2024-01-01T00:00:00.000Z",
      );
    });

    test("omits layerDatetime when only one date is available", async () => {
      serve({ links: datedLinks(["2024-01-01T00:00:00.000Z"]) });

      const [layer] = await buildFrom(
        xyzItem({ properties: { datetime: "2024-01-01T00:00:00.000Z" } }),
      );

      expect(layer.properties.layerDatetime).toBeUndefined();
    });
  });

  describe("properties every layer of a build shares", () => {
    test("propagates the collection color onto the layer", async () => {
      serve({ links: [] });

      const [layer] = await buildFrom(xyzItem(), { color: "#abcdef" });

      expect(layer.properties.color).toBe("#abcdef");
    });

    test("puts the collection's legend image into the layer description", async () => {
      serve({
        links: [],
        collection: { assets: { legend: { href: "https://legend.png" } } },
      });

      const [layer] = await buildFrom(xyzItem());

      expect(layer.properties.description).toContain("https://legend.png");
    });

    test("marks layers exclusive when the collection sets eodash:layerExclusive", async () => {
      serve({ links: [], collection: { "eodash:layerExclusive": true } });

      const [layer] = await buildFrom(xyzItem());

      expect(layer.properties.layerControlExclusive).toBe(true);
      expect(layer.properties.layerControlExpand).toBe(false);
    });
  });

  describe("the STAC fallback", () => {
    test("hands an item nothing else renders to eox-map as a STAC layer", async () => {
      serve({ links: [] });
      const item = { id: "item", properties: {}, assets: {}, links: [] };

      const [layer] = await buildFrom(item);

      expect(layer.type).toBe("STAC");
      expect(layer.data).toBe(item);
      expect(layer.displayWebMapLink).toBe(true);
    });

    test("falls back for an asset that carries no data role", async () => {
      serve({ links: [] });

      const layers = await buildFrom({
        id: "item",
        properties: {},
        links: [],
        assets: {
          thumb: {
            type: "image/png",
            href: "https://x.png",
            roles: ["thumbnail"],
          },
        },
      });

      expect(layers).toHaveLength(1);
      expect(layers[0].type).toBe("STAC");
    });
  });
});
