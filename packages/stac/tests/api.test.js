import { beforeEach, describe, expect, test, vi } from "vitest";
import { createEodashCollection } from "../src/index.js";
import { stacCollection, stacItem } from "../../../tests/support/stac.js";

/** Stands in for the app's axios instance, which the reader reads through. */
const client = { get: vi.fn() };

const COLLECTION_URL = "https://cat/collections/coll";
/** `/search` sits at the api root: the collection url without `collections/<id>`. */
const SEARCH_URL = "https://cat/search";
const AGGREGATION_URL = "https://cat/agg.json";

const PRE_AGGREGATION_LINK = {
  rel: "pre-aggregation",
  "aggregation:interval": "daily",
  href: AGGREGATION_URL,
};

/**
 * Serves the collection, and routes `/search` through `onSearch` so a test can
 * answer the two sides of a `getItem` differently.
 *
 * @param {object} [options]
 * @param {Record<string, any>[]} [options.links]
 * @param {any} [options.aggregation]
 * @param {(params: Record<string, any>) => any} [options.onSearch]
 */
const serve = ({ links = [], aggregation, onSearch = () => ({}) } = {}) => {
  client.get.mockImplementation((/** @type {string} */ url, config) => {
    if (url === COLLECTION_URL) {
      return Promise.resolve({ data: stacCollection({ links }) });
    }
    if (url === AGGREGATION_URL) {
      return aggregation
        ? Promise.resolve({ data: aggregation })
        : Promise.reject(new Error("aggregation not served"));
    }
    if (url === SEARCH_URL) {
      return Promise.resolve({ data: onSearch(config?.params ?? {}) });
    }
    return Promise.reject(new Error(`unmocked url ${url}`));
  });
};

const apiCollection = () =>
  createEodashCollection(COLLECTION_URL, { api: true, client });

/** The params of every `/search` call made so far. */
const searchCalls = () =>
  client.get.mock.calls
    .filter(([url]) => url === SEARCH_URL)
    .map(([, config]) => config?.params ?? {});

describe("api collection", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  describe("search", () => {
    test("passes the caller's params through, defaulting collections", async () => {
      serve({ onSearch: () => ({ features: [stacItem({ id: "a" })] }) });
      const col = await apiCollection();

      expect(col.kind).toBe("api");
      const { features } = await col.search({
        filter: "eo:cloud_cover < 10",
        "filter-lang": "cql2-text",
        limit: 5,
      });

      expect(features.map((item) => item.id)).toEqual(["a"]);
      expect(searchCalls()[0]).toEqual({
        collections: "coll",
        filter: "eo:cloud_cover < 10",
        "filter-lang": "cql2-text",
        limit: 5,
      });
    });

    test("lets the caller search across other collections", async () => {
      serve({ onSearch: () => ({ features: [] }) });
      const col = await apiCollection();

      await col.search({ collections: "other,coll" });

      expect(searchCalls()[0].collections).toBe("other,coll");
    });
  });

  test("derives /search from a collection url that ends in a slash", async () => {
    client.get.mockImplementation((/** @type {string} */ url) => {
      if (url === `${COLLECTION_URL}/`) {
        return Promise.resolve({ data: stacCollection() });
      }
      if (url === SEARCH_URL) {
        return Promise.resolve({ data: { features: [] } });
      }
      // a trailing slash counted as a segment lands on /collections/search
      return Promise.reject(new Error(`unmocked url ${url}`));
    });
    const col = await createEodashCollection(`${COLLECTION_URL}/`, {
      api: true,
      client,
    });

    await col.getItems();

    expect(searchCalls()).toHaveLength(1);
  });

  describe("getItems", () => {
    test("sends the bbox comma separated, since the repeated form is ignored", async () => {
      serve({ onSearch: () => ({ features: [], numberMatched: 0 }) });
      const col = await apiCollection();

      await col.getItems([10, 46, 11, 47]);

      expect(searchCalls()[0]).toMatchObject({
        collections: "coll",
        bbox: "10,46,11,47",
        sortby: "datetime",
      });
    });

    test("warns when more items match than it will read", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      serve({
        onSearch: () => ({ features: [stacItem()], numberMatched: 5000 }),
      });
      const col = await apiCollection();

      await col.getItems();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining("5000"));
    });
  });

  describe("getDates", () => {
    test("uses the daily pre-aggregation buckets when available", async () => {
      serve({
        links: [PRE_AGGREGATION_LINK],
        aggregation: {
          type: "AggregationCollection",
          aggregations: [
            {
              key: "datetime_daily",
              interval: "daily",
              buckets: [
                { key: "2023-02-01", value: 1 },
                { key: "not-a-date", value: 1 },
                { key: "2023-02-02", value: 1 },
              ],
            },
          ],
        },
      });
      const col = await apiCollection();

      expect(await col.getDates()).toEqual([
        new Date("2023-02-01"),
        new Date("2023-02-02"),
      ]);
      expect(searchCalls()).toHaveLength(0);
    });

    test("enumerates instead when a bbox is given, since buckets span the archive", async () => {
      serve({
        links: [PRE_AGGREGATION_LINK],
        onSearch: () => ({
          features: [
            stacItem({ properties: { datetime: "2023-03-01T00:00:00Z" } }),
          ],
        }),
      });
      const col = await apiCollection();

      const dates = await col.getDates(undefined, [10, 46, 11, 47]);

      expect(dates).toEqual([new Date("2023-03-01T00:00:00Z")]);
      expect(searchCalls()[0]).toMatchObject({ bbox: "10,46,11,47" });
    });

    test("falls through to the items when the aggregation carries no buckets", async () => {
      serve({
        links: [PRE_AGGREGATION_LINK],
        // matched on `interval` alone, so a reader that assumes `buckets` throws
        aggregation: {
          type: "AggregationCollection",
          aggregations: [{ interval: "daily" }],
        },
        onSearch: () => ({
          features: [
            stacItem({ properties: { datetime: "2023-04-01T00:00:00Z" } }),
          ],
        }),
      });
      const col = await apiCollection();

      expect(await col.getDates()).toEqual([new Date("2023-04-01T00:00:00Z")]);
    });

    test("centres the window on the datetime when more match than it can read", async () => {
      // Without this the oldest maxItems come back, and the time control ends
      // up decades away from the date actually being shown.
      serve({
        onSearch: ({ datetime, sortby }) => {
          if (!datetime) {
            return { features: [], numberMatched: 188646 };
          }
          const day = sortby === "-datetime" ? "2020-06-14" : "2020-06-16";
          return {
            features: [
              stacItem({
                id: day,
                properties: { datetime: `${day}T00:00:00Z` },
              }),
            ],
          };
        },
      });
      const col = await apiCollection();

      const dates = await col.getDates(new Date("2020-06-15T00:00:00Z"));

      expect(dates).toEqual([
        new Date("2020-06-14T00:00:00Z"),
        new Date("2020-06-16T00:00:00Z"),
      ]);
      expect(searchCalls().map(({ datetime }) => datetime)).toEqual([
        undefined,
        "../2020-06-15T00:00:00.000Z",
        "2020-06-15T00:00:00.000Z/..",
      ]);
    });

    test("warns and keeps the oldest when it has no datetime to centre on", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      serve({
        onSearch: () => ({
          features: [
            stacItem({ properties: { datetime: "2015-01-01T00:00:00Z" } }),
          ],
          numberMatched: 188646,
        }),
      });
      const col = await apiCollection();

      const dates = await col.getDates();

      expect(dates).toEqual([new Date("2015-01-01T00:00:00Z")]);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("188646"));
      expect(searchCalls()).toHaveLength(1);
    });

    test("counts an item answering both sides of the window once", async () => {
      serve({
        onSearch: ({ datetime }) =>
          datetime
            ? {
                features: [
                  stacItem({
                    id: "on-the-instant",
                    properties: { datetime: "2020-06-15T00:00:00Z" },
                  }),
                ],
              }
            : { features: [], numberMatched: 188646 },
      });
      const col = await apiCollection();

      const dates = await col.getDates(new Date("2020-06-15T00:00:00Z"));

      expect(dates).toEqual([new Date("2020-06-15T00:00:00Z")]);
    });

    test("skips a keyless aggregation entry rather than aborting the lookup", async () => {
      serve({
        links: [PRE_AGGREGATION_LINK],
        aggregation: {
          type: "AggregationCollection",
          aggregations: [
            { buckets: [{ key: "2023-05-01", value: 1 }] },
            {
              key: "datetime_daily",
              buckets: [{ key: "2023-06-01", value: 1 }],
            },
          ],
        },
      });
      const col = await apiCollection();

      expect(await col.getDates()).toEqual([new Date("2023-06-01")]);
    });
  });

  describe("getItem", () => {
    test("asks both sides of the datetime and keeps the nearer item", async () => {
      // A pre-aggregation date names a day, whose items sit hours past midnight,
      // so searching at-or-before alone lands on the previous available day.
      // These are the real answers EOPF gives for this target.
      serve({
        onSearch: ({ datetime }) =>
          datetime?.startsWith("../")
            ? {
                features: [
                  stacItem({
                    id: "three-days-before",
                    properties: { datetime: "2022-07-19T10:50:41Z" },
                  }),
                ],
              }
            : {
                features: [
                  stacItem({
                    id: "same-day",
                    properties: { datetime: "2022-07-22T10:56:31Z" },
                  }),
                ],
              },
      });
      const col = await apiCollection();

      const item = await col.getItem(new Date("2022-07-22T00:00:00Z"));

      expect(item?.id).toBe("same-day");
      expect(searchCalls().map(({ datetime }) => datetime)).toEqual([
        "../2022-07-22T00:00:00.000Z",
        "2022-07-22T00:00:00.000Z/..",
      ]);
    });

    test("returns the most recent item when no datetime is given", async () => {
      serve({ onSearch: () => ({ features: [stacItem({ id: "latest" })] }) });
      const col = await apiCollection();

      expect((await col.getItem())?.id).toBe("latest");
      expect(searchCalls()).toEqual([
        { collections: "coll", limit: 1, sortby: "-datetime" },
      ]);
    });

    test("carries the bbox into both searches", async () => {
      serve({ onSearch: () => ({ features: [stacItem()] }) });
      const col = await apiCollection();

      await col.getItem(new Date("2022-07-22T00:00:00Z"), [10, 46, 11, 47]);

      expect(searchCalls()).toHaveLength(2);
      for (const params of searchCalls()) {
        expect(params.bbox).toBe("10,46,11,47");
      }
    });
  });
});
