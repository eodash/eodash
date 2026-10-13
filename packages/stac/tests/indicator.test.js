import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createEodashIndicator,
  DEFAULT_COLLECTIONS_PALETTE,
} from "../src/index.js";
import {
  serveUrls,
  stacCollection,
  stacItem,
} from "../../../tests/support/stac.js";

const client = { get: vi.fn() };

const INDICATOR_URL = "https://cat/indicators/ind1/collection.json";
const CHILD_1_URL = "https://cat/collections/child1/collection.json";
const CHILD_2_URL = "https://cat/collections/child2/collection.json";

const CHILD_1_ITEMS = [
  {
    rel: "item",
    href: "https://cat/items/c1_i1.json",
    id: "c1_i1",
    datetime: "2023-01-01T00:00:00Z",
  },
  {
    rel: "item",
    href: "https://cat/items/c1_i2.json",
    id: "c1_i2",
    datetime: "2023-01-10T00:00:00Z",
  },
];

const CHILD_2_ITEMS = [
  {
    rel: "item",
    href: "https://cat/items/c2_i1.json",
    id: "c2_i1",
    datetime: "2023-01-05T00:00:00Z",
  },
  {
    rel: "item",
    href: "https://cat/items/c2_i2.json",
    id: "c2_i2",
    datetime: "2023-01-15T00:00:00Z",
  },
];

const makeIndicator = () =>
  stacCollection({
    id: "ind1",
    title: "Indicator 1",
    "eodash:mapProjection": "EPSG:3857",
    extent: {
      spatial: { bbox: [[10, 40, 20, 50]] },
      temporal: {
        interval: [["2023-01-01T00:00:00Z", "2023-01-15T00:00:00Z"]],
      },
    },
    links: [
      { rel: "child", href: CHILD_1_URL, type: "application/json" },
      { rel: "child", href: CHILD_2_URL, type: "application/json" },
      {
        rel: "xyz",
        href: "https://tiles.example.com/{z}/{x}/{y}.png",
        roles: ["baselayer", "visible"],
        title: "Base OSM",
      },
    ],
  });

const makeChild1 = () =>
  stacCollection({
    id: "child1",
    title: "Child Collection 1",
    links: CHILD_1_ITEMS,
  });

const makeChild2 = () =>
  stacCollection({
    id: "child2",
    title: "Child Collection 2",
    links: CHILD_2_ITEMS,
  });

const serveMockData = () => {
  serveUrls(client, {
    [INDICATOR_URL]: makeIndicator(),
    [CHILD_1_URL]: makeChild1(),
    [CHILD_2_URL]: makeChild2(),
    "https://cat/items/c1_i1.json": stacItem({
      id: "c1_i1",
      properties: { datetime: "2023-01-01T00:00:00Z" },
      bbox: [10, 40, 15, 45],
      links: [
        {
          rel: "xyz",
          href: "https://c1.example.com/{z}/{x}/{y}.png",
          title: "Child 1 Tile",
        },
      ],
    }),
    "https://cat/items/c1_i2.json": stacItem({
      id: "c1_i2",
      properties: { datetime: "2023-01-10T00:00:00Z" },
      bbox: [10, 40, 15, 45],
      links: [
        {
          rel: "xyz",
          href: "https://c1.example.com/{z}/{x}/{y}.png",
          title: "Child 1 Tile",
        },
      ],
    }),
    "https://cat/items/c2_i1.json": stacItem({
      id: "c2_i1",
      properties: { datetime: "2023-01-05T00:00:00Z" },
      bbox: [15, 45, 20, 50],
      links: [
        {
          rel: "xyz",
          href: "https://c2.example.com/{z}/{x}/{y}.png",
          title: "Child 2 Tile",
        },
      ],
    }),
    "https://cat/items/c2_i2.json": stacItem({
      id: "c2_i2",
      properties: { datetime: "2023-01-15T00:00:00Z" },
      bbox: [15, 45, 20, 50],
      links: [
        {
          rel: "xyz",
          href: "https://c2.example.com/{z}/{x}/{y}.png",
          title: "Child 2 Tile",
        },
      ],
    }),
  });
};

describe("createEodashIndicator", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  test("initializes reader and discovers child collections", async () => {
    serveMockData();
    const indicator = await createEodashIndicator(INDICATOR_URL, { client });

    expect(indicator.id).toBe("ind1");
    expect(indicator.projection).toBe("EPSG:3857");
    expect(indicator.readers.length).toBe(2);
    expect(indicator.readers[0].id).toBe("child1");
    expect(indicator.readers[1].id).toBe("child2");
  });

  test("getDates aggregates and sorts dates across all child collections", async () => {
    serveMockData();
    const indicator = await createEodashIndicator(INDICATOR_URL, { client });

    const dates = await indicator.getDates();
    expect(dates.length).toBe(4);
    expect(dates.map((d) => d.toISOString())).toEqual([
      "2023-01-01T00:00:00.000Z",
      "2023-01-05T00:00:00.000Z",
      "2023-01-10T00:00:00.000Z",
      "2023-01-15T00:00:00.000Z",
    ]);
  });

  test("getLayers builds indicator base layers and data layers for target datetime", async () => {
    serveMockData();
    const indicator = await createEodashIndicator(INDICATOR_URL, { client });

    const result = await indicator.getLayers("2023-01-10T00:00:00Z");
    expect(result.layers.length).toBeGreaterThanOrEqual(2);

    const baseLayer = result.layers.find(
      (l) => l.properties?.group === "baselayer",
    );
    expect(baseLayer).toBeDefined();

    const dataLayer = result.layers.find((l) =>
      l.properties?.id?.includes("child1"),
    );
    expect(dataLayer).toBeDefined();
  });

  test("getMapConfig builds complete map configuration with center and zoom", async () => {
    serveMockData();
    const indicator = await createEodashIndicator(INDICATOR_URL, { client });

    const mapConfig = await indicator.getMapConfig();
    expect(mapConfig.projection).toBe("EPSG:3857");
    expect(Array.isArray(mapConfig.layers)).toBe(true);
    expect(mapConfig.layers.length).toBeGreaterThanOrEqual(2);
    expect(mapConfig.center).toBeDefined();
    expect(mapConfig.center.length).toBe(2);
    expect(typeof mapConfig.zoom).toBe("number");
    expect(mapConfig.datetime).toContain("2023-01-15T00:00:00");
  });

  test("handles single flat collection without child links", async () => {
    serveUrls(client, {
      [CHILD_1_URL]: makeChild1(),
      "https://cat/items/c1_i1.json": stacItem({
        id: "c1_i1",
        properties: { datetime: "2023-01-01T00:00:00Z" },
        links: [{ rel: "xyz", href: "https://c1/{z}/{x}/{y}.png" }],
      }),
      "https://cat/items/c1_i2.json": stacItem({
        id: "c1_i2",
        properties: { datetime: "2023-01-10T00:00:00Z" },
        links: [{ rel: "xyz", href: "https://c1/{z}/{x}/{y}.png" }],
      }),
    });

    const indicator = await createEodashIndicator(CHILD_1_URL, { client });
    expect(indicator.readers.length).toBe(1);

    const mapConfig = await indicator.getMapConfig();
    // 1 fallback OSM baselayer + 1 data layer
    expect(mapConfig.layers.length).toBe(2);
    expect(mapConfig.layers.some((l) => l.properties?.id === "osm")).toBe(true);
    expect(mapConfig.datetime).toContain("2023-01-10T00:00:00");
  });

  test("renders the selected item for its own collection and the item nearest its date for every other collection", async () => {
    serveMockData();
    const indicator = await createEodashIndicator(INDICATOR_URL, { client });

    const specificItem = stacItem({
      id: "c1_i1",
      collection: "child1",
      properties: { datetime: "2023-01-01T00:00:00Z" },
      links: [
        {
          rel: "xyz",
          href: "https://c1.example.com/{z}/{x}/{y}.png",
          title: "Child 1 Tile",
        },
      ],
    });

    const res = await indicator.buildLayers(specificItem);
    expect(res.item).toBe(specificItem);
    // Renders selected item for child1 AND renders nearest date item for child2
    expect(res.layers.some((l) => l.properties?.id?.includes("child1"))).toBe(
      true,
    );
    expect(res.layers.some((l) => l.properties?.id?.includes("child2"))).toBe(
      true,
    );
  });

  test("fetches dates once per reader in getMapConfig", async () => {
    serveMockData();
    const indicator = await createEodashIndicator(INDICATOR_URL, { client });
    const spies = indicator.readers.map((r) => vi.spyOn(r, "getDates"));

    await indicator.getMapConfig();

    for (const spy of spies) {
      expect(spy).toHaveBeenCalledTimes(1);
    }
  });

  test("assigns colors from DEFAULT_COLLECTIONS_PALETTE to child collections by default", async () => {
    serveMockData();
    const indicator = await createEodashIndicator(INDICATOR_URL, { client });

    const res = await indicator.getLayers("2023-01-10T00:00:00Z");
    const child1Layer = res.layers.find((l) =>
      l.properties?.id?.includes("child1"),
    );
    expect(child1Layer?.properties?.color).toBe(DEFAULT_COLLECTIONS_PALETTE[0]);
  });

  test("uses custom colors array when provided", async () => {
    serveMockData();
    const customColors = ["#ff0000", "#00ff00"];
    const indicator = await createEodashIndicator(INDICATOR_URL, {
      client,
      colors: customColors,
    });

    const res = await indicator.getLayers("2023-01-10T00:00:00Z");
    const child1Layer = res.layers.find((l) =>
      l.properties?.id?.includes("child1"),
    );
    expect(child1Layer?.properties?.color).toBe("#ff0000");
  });
});
