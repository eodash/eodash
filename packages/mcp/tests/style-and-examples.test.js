import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../index.js";
import { findExamples, getExamples } from "../generators/examples.js";
import { generateLandingPage } from "../helpers.js";

async function createTestClientServer() {
  const server = createMcpServer();
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} },
  );
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return { server, client };
}

describe("eodash HTML Landing Page Generator", () => {
  it("renders landing page with custom tool descriptions and templates", () => {
    const tools = [
      { name: "tool_a", description: "Alpha tool" },
      { name: "tool_b", description: "Beta tool" },
    ];
    const html = generateLandingPage(
      { EodashMap: { name: "EodashMap" } },
      {},
      { tools, templates: ["lite", "explore"], examplesCount: 15 },
    );

    expect(html).toContain("Supported MCP Tools (2)");
    expect(html).toContain("tool_a");
    expect(html).toContain("Alpha tool");
    expect(html).toContain("tool_b");
    expect(html).toContain("lite, explore");
  });

  it("renders default tool cards when no tools provided in options", () => {
    const html = generateLandingPage({ EodashMap: { name: "EodashMap" } }, {});
    expect(html).toContain("find_examples");
    expect(html).toContain("list_widgets");
  });
});

describe("eodash Examples Discovery - findExamples", () => {
  it("loads examples database cleanly", () => {
    const examples = getExamples();
    expect(examples.length).toBeGreaterThanOrEqual(10);
  });

  it("searches examples by free-text keywords", () => {
    const res = findExamples({ query: "titiler rescale" });
    expect(res.totalFound).toBeGreaterThan(0);
    expect(res.results[0].category).toBe("rasterform");
  });

  it("filters examples by category", () => {
    const res = findExamples({ category: "collection" });
    expect(res.totalFound).toBeGreaterThan(0);
    for (const ex of res.results) {
      expect(ex.category).toBe("collection");
    }
  });

  it("filters examples by tags (e.g. cog, vector, wmts)", () => {
    const cogRes = findExamples({ query: "cog" });
    expect(cogRes.totalFound).toBeGreaterThan(0);
    expect(cogRes.results.every((r) => r.tags.includes("cog"))).toBe(true);

    const vecRes = findExamples({ query: "vector" });
    expect(vecRes.totalFound).toBeGreaterThan(0);
    expect(vecRes.results.every((r) => r.tags.includes("vector"))).toBe(true);
  });

  it("filters examples by capability tag", () => {
    const res = findExamples({ query: "bounding-box" });
    expect(res.totalFound).toBeGreaterThan(0);
    expect(res.results.some((ex) => ex.tags.includes("bounding-box"))).toBe(
      true,
    );
  });

  it("respects limit parameter and clamps maximum to 20", () => {
    const limitedRes = findExamples({ limit: 2 });
    expect(limitedRes.results.length).toBe(2);

    const clampedRes = findExamples({ limit: 50 });
    expect(clampedRes.results.length).toBeLessThanOrEqual(20);
  });

  it("handles non-matching query cleanly", () => {
    const res = findExamples({
      query: "non_existent_random_search_term_12345",
    });
    expect(res.totalFound).toBe(0);
    expect(res.results).toEqual([]);
  });

  it("find_examples correctly enforces text query filtering and accurate totalFound", () => {
    const noMatch = findExamples({
      category: "vector-style",
      query: "nonexistentkeywordxyz123",
    });
    expect(noMatch.results.length).toBe(0);
    expect(noMatch.totalFound).toBe(0);

    const match = findExamples({
      limit: 1,
    });
    expect(match.results.length).toBe(1);
    expect(match.totalFound).toBeGreaterThan(1);
  });

  it("finds Vega chart examples in find_examples catalog", () => {
    const res = findExamples({
      category: "chart-vega",
    });

    expect(res.results.length).toBeGreaterThanOrEqual(2);
    const ids = res.results.map((r) => r.id);
    expect(ids).toContain("chart-vega-timeseries-uncertainty");
    expect(ids).toContain("chart-vega-scenario-grouped-bar");

    for (const item of res.results) {
      expect(item.category).toBe("chart-vega");
      expect(typeof item.code).toBe("object");
      expect(item.code.$schema).toBeDefined();
    }
  });

  it("finds process POST body examples in find_examples catalog", () => {
    const res = findExamples({
      category: "process-body",
    });

    expect(res.results.length).toBe(2);
    const ids = res.results.map((r) => r.id);
    expect(ids).toContain("process-body-polarwarp-bbox-date");
    expect(ids).toContain("process-body-structureicing-daterange-model");

    for (const item of res.results) {
      expect(item.category).toBe("process-body");
      expect(item.code.inputs).toBeDefined();
    }
  });
});

describe("eodash MCP Tools via Client - Discovery & Introspection", () => {
  it("calls find_examples via MCP client with keyword and category", async () => {
    const { client } = await createTestClientServer();
    const result = await client.callTool({
      name: "find_examples",
      arguments: {
        query: "ice charts match",
        category: "vector-style",
      },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalFound).toBeGreaterThan(0);
    expect(parsed.results[0].id).toBe("vector-style-ice-charts-categorical");
  });

  it("calls find_examples via MCP client with keyword query", async () => {
    const { client } = await createTestClientServer();
    const result = await client.callTool({
      name: "find_examples",
      arguments: {
        query: "cog",
      },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalFound).toBeGreaterThan(0);
    expect(parsed.results[0].tags).toContain("cog");
  });

  it("handles fuzzy search queries with typos and variations via Fuse.js", async () => {
    const { client } = await createTestClientServer();

    // Typo in "uncertainty" and "timeseries"
    const resultTypo = await client.callTool({
      name: "find_examples",
      arguments: {
        query: "timeseries uncerainty",
        category: "chart-vega",
      },
    });
    const parsedTypo = JSON.parse(resultTypo.content[0].text);
    expect(parsedTypo.totalFound).toBeGreaterThan(0);
    expect(parsedTypo.results[0].id).toBe("chart-vega-timeseries-uncertainty");

    // Typo in "titiler"
    const resultTitiler = await client.callTool({
      name: "find_examples",
      arguments: {
        query: "titler",
      },
    });
    const parsedTitiler = JSON.parse(resultTitiler.content[0].text);
    expect(parsedTitiler.totalFound).toBeGreaterThan(0);
    expect(parsedTitiler.results.some((r) => r.tags.includes("titiler"))).toBe(
      true,
    );

    // Unrelated query returns empty
    const resultEmpty = await client.callTool({
      name: "find_examples",
      arguments: {
        query: "zzxxqqnonexistentterm12345",
      },
    });
    const parsedEmpty = JSON.parse(resultEmpty.content[0].text);
    expect(parsedEmpty.totalFound).toBe(0);
    expect(parsedEmpty.results).toEqual([]);
  });

  it("calls list_widgets with tag and search filter", async () => {
    const { client } = await createTestClientServer();
    const tagRes = await client.callTool({
      name: "list_widgets",
      arguments: {
        tag: "time",
      },
    });
    const tagList = JSON.parse(tagRes.content[0].text);
    expect(tagList.some((w) => w.name === "EodashTimeSlider")).toBe(true);

    const searchRes = await client.callTool({
      name: "list_widgets",
      arguments: {
        search: "temporal",
      },
    });
    const searchList = JSON.parse(searchRes.content[0].text);
    expect(searchList.some((w) => w.name === "EodashDatePicker")).toBe(true);
  });

  it("calls get_widget_details with name alias and verifies structured schema for btns", async () => {
    const { client } = await createTestClientServer();
    const res = await client.callTool({
      name: "get_widget_details",
      arguments: {
        name: "EodashMap",
      },
    });
    const widget = JSON.parse(res.content[0].text);
    expect(widget.name).toBe("EodashMap");
    const btnsProp = widget.props.find((p) => p.name === "btns");
    expect(btnsProp).toBeDefined();
    expect(btnsProp.schema).toBeDefined();
    expect(btnsProp.schema.type).toBe("object");
    if (btnsProp.schema.properties) {
      expect(btnsProp.schema.properties.enableExportMap).toBeDefined();
    }
  });
});
