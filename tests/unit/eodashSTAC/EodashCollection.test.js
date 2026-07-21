import { beforeEach, describe, expect, test, vi } from "vitest";
import { EodashCollection } from "@/eodashSTAC/EodashCollection";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const COLLECTION_URL = "https://cat/collections/coll";

// Unsorted on purpose: getItems must sort ascending by datetime.
const ITEM_LINKS = [
  {
    rel: "item",
    href: "https://cat/items/i1.json",
    id: "i1",
    datetime: "2023-01-01T00:00:00Z",
  },
  {
    rel: "item",
    href: "https://cat/items/i3.json",
    id: "i3",
    datetime: "2023-01-20T00:00:00Z",
  },
  {
    rel: "item",
    href: "https://cat/items/i2.json",
    id: "i2",
    datetime: "2023-01-10T00:00:00Z",
  },
];

/** @param {Record<string, any>[]} links */
const collectionJson = (links) => ({
  type: "Collection",
  stac_version: "1.0.0",
  id: "coll",
  title: "Coll",
  description: "d",
  license: "proprietary",
  extent: {
    spatial: { bbox: [[0, 0, 1, 1]] },
    temporal: { interval: [["2023-01-01T00:00:00Z", "2023-01-20T00:00:00Z"]] },
  },
  links,
});

const ITEM_JSON = {
  type: "Feature",
  stac_version: "1.0.0",
  id: "i2",
  geometry: null,
  properties: { datetime: "2023-01-10T00:00:00Z" },
  links: [],
  assets: {},
};

const NEW_LAYER = {
  type: "Vector",
  properties: { id: "coll;:;i2;:;3857" },
};

/** Serve the collection plus any extra url -> data pairs through axios. */
const serveUrls = (/** @type {Record<string, any>} */ extra = {}) => {
  axiosMock.get.mockImplementation((/** @type {string} */ url) => {
    if (url === COLLECTION_URL)
      return Promise.resolve({ data: collectionJson(ITEM_LINKS) });
    if (url in extra) return Promise.resolve({ data: extra[url] });
    return Promise.reject(new Error(`unmocked url ${url}`));
  });
};

describe("EodashCollection", () => {
  /** @type {import("vitest").MockInstance} */
  let buildSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    axiosMock.get.mockReset();
    // The layer-building chain (createLayers) is its own surface; stub it so
    // these tests pin item resolution, not layer shapes.
    buildSpy = vi
      .spyOn(EodashCollection.prototype, "buildJsonArray")
      .mockResolvedValue([NEW_LAYER]);
  });

  describe("getItem (static catalog)", () => {
    /** @returns {Promise<EodashCollection>} */
    const staticCollection = async () => {
      serveUrls();
      const col = new EodashCollection(COLLECTION_URL, false);
      await col.fetchCollection();
      return col;
    };

    test("returns the latest item when no date is given", async () => {
      const col = await staticCollection();
      expect((await col.getItem())?.id).toBe("i3");
    });

    test("picks the truly nearest item, even one after the target date", async () => {
      const col = await staticCollection();
      // 2023-01-18 is 8 days after i2 but only 2 days before i3.
      expect((await col.getItem(new Date("2023-01-18T00:00:00Z")))?.id).toBe(
        "i3",
      );
    });

    test("resolves an exact-distance tie to the earlier item", async () => {
      const col = await staticCollection();
      // Equidistant (4.5 days) between i1 and i2.
      expect((await col.getItem(new Date("2023-01-05T12:00:00Z")))?.id).toBe(
        "i1",
      );
    });
  });

  describe("getItem (API)", () => {
    test("searches at-or-before the date only — a nearer later item is never returned", async () => {
      // Characterization of the API-branch quirk (`datetime: ../date`,
      // sortby -datetime): unlike the static branch, an item shortly AFTER
      // the requested date is ignored. Regression marker if ever "fixed".
      serveUrls({
        "https://cat/search": { features: [{ id: "before-item" }] },
      });
      const col = new EodashCollection(COLLECTION_URL, true);
      await col.fetchCollection();

      const item = await col.getItem(new Date("2023-01-18T00:00:00Z"));

      expect(item?.id).toBe("before-item");
      expect(axiosMock.get).toHaveBeenCalledWith("https://cat/search", {
        params: {
          collections: "coll",
          datetime: "../2023-01-18T00:00:00.000Z",
          limit: 1,
          sortby: "-datetime",
        },
      });
    });
  });

  describe("getDates", () => {
    test("uses the daily pre-aggregation buckets when available", async () => {
      const aggLink = {
        rel: "pre-aggregation",
        "aggregation:interval": "daily",
        href: "https://cat/agg.json",
      };
      axiosMock.get.mockImplementation((/** @type {string} */ url) =>
        Promise.resolve({
          data:
            url === COLLECTION_URL
              ? collectionJson([...ITEM_LINKS, aggLink])
              : {
                  aggregations: [
                    {
                      key: "datetime_frequency",
                      buckets: [
                        { key: "2023-02-01" },
                        { key: "not-a-date" },
                        { key: "2023-02-02" },
                      ],
                    },
                  ],
                },
        }),
      );
      const col = new EodashCollection(COLLECTION_URL, false);

      const dates = await col.getDates();

      expect(dates).toEqual([new Date("2023-02-01"), new Date("2023-02-02")]);
    });

    test("falls back to the item links, dropping invalid datetimes", async () => {
      axiosMock.get.mockResolvedValue({
        data: collectionJson([
          ...ITEM_LINKS,
          {
            rel: "item",
            href: "https://cat/items/bad.json",
            id: "bad",
            datetime: "oops",
          },
        ]),
      });
      const col = new EodashCollection(COLLECTION_URL, false);

      const dates = await col.getDates();

      expect(dates).toEqual([
        new Date("2023-01-01T00:00:00Z"),
        new Date("2023-01-10T00:00:00Z"),
        new Date("2023-01-20T00:00:00Z"),
      ]);
    });
  });

  describe("createLayersJson", () => {
    test("warns and returns an empty list when the collection has no items", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      axiosMock.get.mockResolvedValue({ data: collectionJson([]) });
      const col = new EodashCollection(COLLECTION_URL, false);

      expect(await col.createLayersJson()).toEqual([]);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("does not include any items"),
      );
    });

    test("resolves a Date to the closest item and builds its layers", async () => {
      serveUrls({ "https://cat/items/i2.json": ITEM_JSON });
      const col = new EodashCollection(COLLECTION_URL, false);

      const layers = await col.createLayersJson(
        new Date("2023-01-09T00:00:00Z"),
      );

      expect(layers).toEqual([NEW_LAYER]);
      expect(buildSpy.mock.calls[0][0].id).toBe("i2");
    });

    test("fetches blob-link items through native fetch", async () => {
      serveUrls();
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          /** @type {any} */ ({ json: async () => ITEM_JSON }),
        );
      const col = new EodashCollection(COLLECTION_URL, false);

      const layers = await col.createLayersJson(
        /** @type {any} */ ({ rel: "item", href: "blob:test" }),
      );

      expect(fetchSpy).toHaveBeenCalledWith("blob:test");
      expect(layers).toEqual([NEW_LAYER]);
    });
  });

  describe("updateLayerJson", () => {
    test("replaces the prefix-matched layers with the new item's layers", async () => {
      serveUrls({ "https://cat/items/i2.json": ITEM_JSON });
      const col = new EodashCollection(COLLECTION_URL, false);
      const oldLayer = { type: "Tile", properties: { id: "coll;:;i1;:;3857" } };
      const osm = { type: "Tile", properties: { id: "osm" } };
      const currentLayers = /** @type {any} */ ([
        {
          type: "Group",
          properties: { id: "AnalysisGroup" },
          layers: [oldLayer],
        },
        osm,
      ]);

      const updated = await col.updateLayerJson(
        "2023-01-10T00:00:00Z",
        "coll;:;i1;:;3857",
        currentLayers,
      );

      expect(updated?.[0].properties?.id).toBe("AnalysisGroup");
      expect(updated?.[0].layers).toEqual([NEW_LAYER]);
      expect(updated?.[1]).toBe(osm);
      // Immutable: the input tree still holds the old layer.
      expect(currentLayers[0].layers).toEqual([oldLayer]);
    });

    test("warns and bails when the collection has no datetime property", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      axiosMock.get.mockResolvedValue({
        data: collectionJson([
          { rel: "item", href: "https://cat/items/x.json", id: "x" },
        ]),
      });
      const col = new EodashCollection(COLLECTION_URL, false);

      const updated = await col.updateLayerJson(
        "2023-01-10T00:00:00Z",
        "x",
        [],
      );

      expect(updated).toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("no datetime property"),
      );
    });
  });
});
