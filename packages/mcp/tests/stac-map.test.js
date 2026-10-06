import { describe, it, expect, beforeEach, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../index.js";
import { buildStacMap } from "../generators/stac-map.js";
import {
  serveUrls,
  stacCollection,
  stacItem,
} from "../../../tests/support/stac.js";

const client = { get: vi.fn() };

const INDICATOR_URL = "https://cat/indicators/ind1/collection.json";
const CHILD_1_URL = "https://cat/collections/child1/collection.json";

const makeIndicator = () =>
  stacCollection({
    id: "ind1",
    title: "Indicator 1",
    "eodash:mapProjection": "EPSG:3857",
    extent: {
      spatial: { bbox: [[10, 40, 20, 50]] },
      temporal: {
        interval: [["2023-01-01T00:00:00Z", "2023-01-10T00:00:00Z"]],
      },
    },
    links: [
      {
        rel: "self",
        href: INDICATOR_URL,
        type: "application/json",
      },
      { rel: "child", href: CHILD_1_URL, type: "application/json" },
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
    links: [
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
    ],
  });

const serveMockData = () => {
  serveUrls(client, {
    [INDICATOR_URL]: makeIndicator(),
    [CHILD_1_URL]: makeChild1(),
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
  });
};

async function createTestClientServer() {
  const server = createMcpServer();
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const testClient = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} },
  );
  await Promise.all([
    server.connect(serverTransport),
    testClient.connect(clientTransport),
  ]);
  return { server, client: testClient };
}

describe("STAC Map Generator - buildStacMap", () => {
  beforeEach(() => {
    client.get.mockReset();
  });

  it("builds map config from indicator URL resolving latest date", async () => {
    serveMockData();
    const config = await buildStacMap(
      {
        url: INDICATOR_URL,
      },
      { client },
    );

    expect(config.projection).toBe("EPSG:3857");
    expect(config.layers).toBeDefined();
    expect(config.layers.length).toBeGreaterThanOrEqual(2);
    expect(config.center).toBeDefined();
    expect(config.center.length).toBe(2);
    expect(typeof config.zoom).toBe("number");
    expect(config.datetime).toContain("2023-01-10T00:00:00");
    expect(config.item).toBeDefined();
    expect(config.item?.id).toBe("c1_i2");
  });

  it("builds map config for specific datetime", async () => {
    serveMockData();
    const config = await buildStacMap(
      {
        url: INDICATOR_URL,
        datetime: "2023-01-01T00:00:00Z",
      },
      { client },
    );

    expect(config.datetime).toContain("2023-01-01T00:00:00");
    expect(config.item?.id).toBe("c1_i1");
  });

  it("builds map config with custom bbox", async () => {
    serveMockData();
    const config = await buildStacMap(
      {
        url: INDICATOR_URL,
        bbox: [12, 41, 13, 42],
      },
      { client },
    );

    expect(config.center).toBeDefined();
    expect(config.center[0]).toBeCloseTo(12.5, 1);
    expect(config.center[1]).toBeCloseTo(41.5, 1);
  });

  it("builds map config directly from STAC item", async () => {
    serveMockData();
    const customItem = stacItem({
      id: "direct_item",
      properties: { datetime: "2023-05-20T00:00:00Z" },
      bbox: [5, 45, 10, 50],
      links: [
        {
          rel: "xyz",
          href: "https://direct.example.com/{z}/{x}/{y}.png",
          title: "Direct Tile",
        },
      ],
    });

    const config = await buildStacMap(
      {
        url: INDICATOR_URL,
        stac_object: customItem,
      },
      { client },
    );

    expect(config.item?.id).toBe("direct_item");
    expect(config.layers.length).toBeGreaterThanOrEqual(1);
    expect(config.datetime).toBe("2023-05-20T00:00:00Z");
  });

  it("builds map config from standalone self-contained STAC item without collection", async () => {
    const customItem = stacItem({
      id: "item_no_collection",
      properties: { datetime: "2023-09-01T00:00:00Z" },
      bbox: [10, 45, 12, 47],
      links: [
        {
          rel: "xyz",
          href: "https://standalone.example.com/{z}/{x}/{y}.png",
          title: "Standalone Tile",
        },
      ],
    });

    const config = await buildStacMap({ stac_object: customItem });
    expect(config.item?.id).toBe("item_no_collection");
    expect(config.projection).toBe("EPSG:3857");
    expect(config.layers.some((l) => l.properties?.id === "osm")).toBe(true);
    expect(config.layers.length).toBeGreaterThanOrEqual(2);
  });

  it("throws error when neither url nor stac_object is provided", async () => {
    await expect(buildStacMap({})).rejects.toThrow(
      "At least one of 'url' or 'stac_object' must be provided",
    );
  });

  describe("STAC Catalog handling with Fuse.js indicator search", () => {
    const makeCatalog = () => ({
      type: "Catalog",
      id: "trilateral",
      title: "Earth Observing Dashboard",
      links: [
        {
          rel: "child",
          href: "https://cat/car_containers/collection.json",
          type: "application/json",
          title: "Car containers",
          subtitle: "Change in the number of new cars at automobile factory",
          id: "car_containers",
          themes: ["economy"],
          tags: ["Mobility", "Automotive"],
        },
        {
          rel: "child",
          href: "https://cat/NO2_daily/collection.json",
          type: "application/json",
          title: "Air Quality (tropospheric NO2 concetrations)",
          subtitle: "Daily Nitrogen Dioxide",
          id: "NO2_daily",
          themes: ["atmosphere"],
          tags: ["Air quality", "NO2"],
        },
        {
          rel: "child",
          href: CHILD_1_URL, // reuse CHILD_1_URL which is served
          type: "application/json",
          title: "Carbon Dioxide from OMI (daily)",
          subtitle: "Mean daily Carbon Dioxide [ppm]",
          id: "N2_CO2_mean",
          themes: ["atmosphere"],
          tags: ["Air quality", "CO2", "Greenhouse gases"],
        },
      ],
    });

    it("throws informative error when STAC catalog is passed without query or collection_id", async () => {
      const catalog = makeCatalog();
      await expect(
        buildStacMap({ stac_object: catalog }, { client }),
      ).rejects.toThrow(/STAC Catalog containing 3 indicator collections/);
    });

    it("fuzzy matches indicator by query 'Carbon Dioxide' using Fuse.js and builds map", async () => {
      serveMockData();
      const catalog = makeCatalog();

      const config = await buildStacMap(
        {
          stac_object: catalog,
          query: "Carbon Dioxide",
        },
        { client },
      );

      expect(config.layers).toBeDefined();
      expect(config.layers.length).toBeGreaterThanOrEqual(2);
      expect(config.datetime).toContain("2023-01-10T00:00:00");
      expect(config.indicator).toBeDefined();
      expect(config.indicator?.id).toBe("N2_CO2_mean");
      expect(config.indicator?.title).toBe("Carbon Dioxide from OMI (daily)");
    });

    it("matches indicator via exact acronym/tag shortcut (CO2)", async () => {
      serveMockData();
      const catalog = makeCatalog();

      const config = await buildStacMap(
        {
          stac_object: catalog,
          query: "CO2",
        },
        { client },
      );

      expect(config.indicator?.id).toBe("N2_CO2_mean");
    });

    it("returns timeControl with availableDates, minDate, and maxDate", async () => {
      serveMockData();
      const config = await buildStacMap({ url: INDICATOR_URL }, { client });

      expect(config.timeControl).toBeDefined();
      expect(config.timeControl?.availableDates.length).toBeGreaterThanOrEqual(
        1,
      );
      expect(config.timeControl?.minDate).toBeDefined();
      expect(config.timeControl?.maxDate).toBeDefined();
    });

    it("extracts legend when defined in collection or links", async () => {
      serveMockData();
      const customCollection = {
        ...makeChild1(),
        "eox:colorlegend": {
          type: "continuous",
          domain: [0, 100],
          range: ["#0000ff", "#ff0000"],
          title: "Carbon Unit (ppm)",
        },
      };

      const config = await buildStacMap(
        {
          stac_object: customCollection,
        },
        { client },
      );

      expect(config.legends).toBeDefined();
      expect(Array.isArray(config.legends)).toBe(true);
      expect(config.legends[0]?.type).toBe("continuous");
      expect(config.legends[0]?.title).toBe("Carbon Unit (ppm)");
    });

    it("provides structured ambiguity feedback when multiple catalog indicators have close scores", async () => {
      const ambiguousCatalog = {
        type: "Catalog",
        id: "ambiguous_cat",
        links: [
          {
            rel: "child",
            href: "https://cat/co2_omi/collection.json",
            type: "application/json",
            title: "Carbon Dioxide OMI",
            subtitle: "Daily mean CO2 from OMI",
            id: "N2_CO2_OMI",
            tags: ["CO2", "Atmosphere"],
          },
          {
            rel: "child",
            href: "https://cat/co2_gosat/collection.json",
            type: "application/json",
            title: "Carbon Dioxide GOSAT",
            subtitle: "Monthly CO2 from GOSAT",
            id: "N2_CO2_GOSAT",
            tags: ["CO2", "Atmosphere"],
          },
        ],
      };

      await expect(
        buildStacMap(
          {
            stac_object: ambiguousCatalog,
            query: "Carbon Dioxide",
          },
          { client },
        ),
      ).rejects.toThrow(/Multiple close indicator matches found/);
    });

    it("matches indicator directly by collection_id", async () => {
      serveMockData();
      const catalog = makeCatalog();

      const config = await buildStacMap(
        {
          stac_object: catalog,
          collection_id: "N2_CO2_mean",
        },
        { client },
      );

      expect(config.layers).toBeDefined();
      expect(config.layers.length).toBeGreaterThanOrEqual(2);
    });

    it("throws helpful error when query has no match in catalog", async () => {
      const catalog = makeCatalog();
      await expect(
        buildStacMap(
          {
            stac_object: catalog,
            query: "completely-unknown-parameter-xyz",
          },
          { client },
        ),
      ).rejects.toThrow(/No indicator in catalog matched query/);
    });

    it("handles STAC API root catalogs with /collections endpoint", async () => {
      const apiRoot = {
        type: "Catalog",
        id: "api_root",
        links: [
          {
            rel: "data",
            href: "https://api.example.com/collections",
            type: "application/json",
          },
        ],
      };
      const mockClient = {
        get: async (url) => {
          if (url === "https://api.example.com/collections") {
            return {
              data: {
                collections: [
                  {
                    id: "api_col_1",
                    title: "API Collection 1",
                    description: "First collection",
                    links: [
                      {
                        rel: "self",
                        href: "https://api.example.com/collections/api_col_1",
                      },
                    ],
                  },
                ],
              },
            };
          }
          if (url === "https://api.example.com/collections/api_col_1") {
            return {
              data: {
                type: "Collection",
                id: "api_col_1",
                title: "API Collection 1",
                links: [
                  {
                    rel: "self",
                    href: "https://api.example.com/collections/api_col_1",
                  },
                ],
                summaries: { datetime: ["2023-01-01T00:00:00Z"] },
                extent: {
                  spatial: { bbox: [[-180, -90, 180, 90]] },
                  temporal: { interval: [["2023-01-01T00:00:00Z", null]] },
                },
              },
            };
          }
          if (url.endsWith("/search")) {
            return {
              data: {
                features: [
                  stacItem({
                    id: "item_api_1",
                    properties: { datetime: "2023-01-01T00:00:00Z" },
                    links: [
                      {
                        rel: "xyz",
                        href: "https://api.example.com/tiles/{z}/{x}/{y}.png",
                      },
                    ],
                  }),
                ],
                numberMatched: 1,
              },
            };
          }
        },
      };

      const config = await buildStacMap(
        {
          stac_object: apiRoot,
          collection_id: "api_col_1",
        },
        { client: mockClient },
      );

      expect(config.indicator?.id).toBe("api_col_1");
      expect(config.layers).toBeDefined();
    });
  });
});

describe("MCP Protocol Tool - generate_map_from_stac", () => {
  it("registers generate_map_from_stac tool with schema", async () => {
    const { client: mcpClient } = await createTestClientServer();
    const tools = await mcpClient.listTools();
    const tool = tools.tools.find((t) => t.name === "generate_map_from_stac");

    expect(tool).toBeDefined();
    expect(tool?.description).toContain("EOxMap");
    expect(tool?.inputSchema?.properties?.url).toBeDefined();
    expect(tool?.inputSchema?.properties?.stac_object).toBeDefined();
    expect(tool?.inputSchema?.properties?.query).toBeDefined();
    expect(tool?.inputSchema?.properties?.collection_id).toBeDefined();
    expect(tool?.inputSchema?.properties?.datetime).toBeDefined();
    expect(tool?.inputSchema?.properties?.bbox).toBeDefined();
    expect(tool?.inputSchema?.properties?.viewProjection).toBeDefined();
    expect(tool?.inputSchema?.properties?.rasterEndpoint).toBeDefined();
  });

  it("calls generate_map_from_stac tool via MCP protocol and returns structured JSON", async () => {
    const { client: mcpClient } = await createTestClientServer();

    const customItem = stacItem({
      id: "mcp_direct_item",
      properties: { datetime: "2023-08-15T00:00:00Z" },
      bbox: [0, 10, 20, 30],
      links: [
        {
          rel: "xyz",
          href: "https://mcp.example.com/{z}/{x}/{y}.png",
          title: "MCP Tile",
        },
      ],
    });

    const res = await mcpClient.callTool({
      name: "generate_map_from_stac",
      arguments: {
        stac_object: customItem,
      },
    });

    expect(res.isError).toBeFalsy();
    const mapConfig = JSON.parse(res.content[0].text);
    expect(mapConfig.layers).toBeDefined();
    expect(Array.isArray(mapConfig.layers)).toBe(true);
    expect(mapConfig.projection).toBe("EPSG:3857");
    expect(mapConfig.center).toBeDefined();
    expect(mapConfig.zoom).toBeDefined();
    expect(mapConfig.item.id).toBe("mcp_direct_item");
  });

  it("calls generate_map_from_stac tool with fetch mock via vi.spyOn", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => makeIndicator(),
    });

    try {
      const { client: mcpClient } = await createTestClientServer();
      const res = await mcpClient.callTool({
        name: "generate_map_from_stac",
        arguments: {
          url: INDICATOR_URL,
        },
      });

      expect(res).toBeDefined();
      expect(fetchSpy).toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("calls generate_map_from_stac tool with STAC catalog and query across MCP protocol", async () => {
    const catalogData = {
      type: "Catalog",
      id: "root_cat",
      title: "Root Catalog",
      links: [
        {
          rel: "child",
          href: "https://cat/other/collection.json",
          type: "application/json",
          title: "Other Collection",
          id: "other",
        },
        {
          rel: "child",
          href: "https://cat/co2/collection.json",
          type: "application/json",
          title: "Carbon Dioxide from OMI (daily)",
          id: "N2_CO2_mean",
          tags: ["CO2"],
        },
      ],
    };

    const indicatorData = makeIndicator();

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (reqUrl) => {
        const urlStr = String(reqUrl);
        if (urlStr.includes("catalog")) {
          return {
            ok: true,
            status: 200,
            json: async () => catalogData,
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => indicatorData,
        };
      });

    try {
      const { client: mcpClient } = await createTestClientServer();
      const res = await mcpClient.callTool({
        name: "generate_map_from_stac",
        arguments: {
          url: "https://example.com/stac/catalog.json",
          query: "Carbon Dioxide",
          datetime: "2023-01-01T00:00:00Z",
        },
      });

      expect(res.isError).toBeFalsy();
      const mapConfig = JSON.parse(res.content[0].text);
      expect(mapConfig.indicator).toBeDefined();
      expect(mapConfig.indicator.id).toBe("N2_CO2_mean");
      expect(mapConfig.layers).toBeDefined();
      expect(mapConfig.layers.length).toBeGreaterThanOrEqual(1);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("treats a STAC API URL without a .json suffix as an API and static when api is passed", async () => {
    const apiIndicator = {
      type: "Collection",
      id: "api_col",
      links: [
        {
          rel: "items",
          href: "https://api.example.com/collections/api_col/items",
        },
      ],
    };

    const mockClient = {
      get: vi.fn().mockImplementation(async (url) => {
        if (url.includes("/search") || url.includes("/items")) {
          return {
            data: {
              type: "FeatureCollection",
              features: [
                stacItem({
                  id: "item1",
                  properties: { datetime: "2023-01-01T00:00:00Z" },
                  links: [
                    { rel: "xyz", href: "https://tiles/{z}/{x}/{y}.png" },
                  ],
                }),
              ],
            },
          };
        }
        return { data: apiIndicator };
      }),
    };

    // 1. Without .json suffix and without explicit api param -> treated as API
    const resApi = await buildStacMap(
      {
        url: "https://api.example.com/collections/api_col",
        datetime: "2023-01-01T00:00:00Z",
      },
      { client: mockClient },
    );
    expect(resApi.layers).toBeDefined();

    // 2. Without .json suffix but with api: false -> treated as static
    const staticCol = makeIndicator();
    const staticClient = {
      get: vi.fn().mockResolvedValue({ data: staticCol }),
    };
    const resStatic = await buildStacMap(
      {
        url: "https://static.example.com/catalog/indicator",
        api: false,
        datetime: "2023-01-01T00:00:00Z",
      },
      { client: staticClient },
    );
    expect(resStatic.layers).toBeDefined();
  });

  it("builds the same map with an axios-style client returning { data }", async () => {
    const indicatorData = makeIndicator();
    const axiosClient = {
      get: vi.fn().mockResolvedValue({
        data: indicatorData,
      }),
    };

    const mapConfig = await buildStacMap(
      {
        url: "https://example.com/indicator.json",
        datetime: "2023-01-01T00:00:00Z",
      },
      { client: axiosClient },
    );

    expect(mapConfig).toBeDefined();
    expect(mapConfig.layers).toBeDefined();
    expect(mapConfig.layers.length).toBeGreaterThanOrEqual(1);
  });
});
