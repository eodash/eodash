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

/** @param {Record<string, any>[]} [links] */
const serve = (links = ITEM_LINKS) =>
  serveUrls(client, {
    [COLLECTION_URL]: stacCollection({ links }),
    ...Object.fromEntries(
      links
        .filter((link) => link.rel === "item")
        .map((link) => [link.href, stacItem({ id: link.id })]),
    ),
  });

const staticCollection = () =>
  createEodashCollection(COLLECTION_URL, { client });

describe("static collection", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  describe("getItems", () => {
    test("returns the item links oldest first", async () => {
      serve();
      const col = await staticCollection();

      expect(col.kind).toBe("static");
      expect((await col.getItems()).map((item) => item.id)).toEqual([
        "i1",
        "i2",
        "i3",
      ]);
    });
  });

  describe("getItem", () => {
    test("returns the latest item when no date is given", async () => {
      serve();
      const col = await staticCollection();

      expect((await col.getItem())?.id).toBe("i3");
    });

    test("picks the truly nearest item, even one after the target date", async () => {
      serve();
      const col = await staticCollection();

      // 2023-01-18 is 8 days after i2 but only 2 days before i3.
      expect((await col.getItem(new Date("2023-01-18T00:00:00Z")))?.id).toBe(
        "i3",
      );
    });

    test("resolves an exact-distance tie to the earlier item", async () => {
      serve();
      const col = await staticCollection();

      // Equidistant (4.5 days) between i1 and i2.
      expect((await col.getItem(new Date("2023-01-05T12:00:00Z")))?.id).toBe(
        "i1",
      );
    });
  });

  describe("getDates", () => {
    test("reads the item links, dropping invalid datetimes", async () => {
      serve([
        ...ITEM_LINKS,
        {
          rel: "item",
          href: "https://cat/items/bad.json",
          id: "bad",
          datetime: "oops",
        },
      ]);
      const col = await staticCollection();

      expect(await col.getDates()).toEqual([
        new Date("2023-01-01T00:00:00Z"),
        new Date("2023-01-10T00:00:00Z"),
        new Date("2023-01-20T00:00:00Z"),
      ]);
    });

    test("ignores a pre-aggregation link, which only an api reader consumes", async () => {
      serve([
        ...ITEM_LINKS,
        {
          rel: "pre-aggregation",
          "aggregation:interval": "daily",
          href: "https://cat/agg.json",
        },
      ]);
      const col = await staticCollection();

      // the agg url is not served, so reaching for it would reject
      expect(await col.getDates()).toHaveLength(3);
    });
  });

  describe("getTemporalExtent", () => {
    test("fills an open end from the items", async () => {
      serveUrls(client, {
        [COLLECTION_URL]: stacCollection({
          links: ITEM_LINKS,
          extent: {
            spatial: { bbox: [[0, 0, 1, 1]] },
            temporal: { interval: [["2022-06-01T00:00:00Z", null]] },
          },
        }),
      });
      const col = await staticCollection();

      expect(await col.getTemporalExtent()).toEqual({
        start: new Date("2022-06-01T00:00:00Z"),
        end: new Date("2023-01-20T00:00:00Z"),
      });
    });
  });
});
