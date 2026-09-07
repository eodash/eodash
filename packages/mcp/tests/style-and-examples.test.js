import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../index.js";
import {
  generateVectorFlatStyle,
  generateRasterWebglStyle,
  generateRasterForm,
  generateLayerStyle,
  fetchColormaps,
  getColormapRamp,
} from "../generators/style.js";
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

describe("eodash Style Generator - Colormaps Fetching", () => {
  it("fetches or falls back to valid colormaps dictionary", async () => {
    const colormaps = await fetchColormaps();
    expect(colormaps).toBeDefined();
    expect(typeof colormaps).toBe("object");
    expect(colormaps.viridis).toBeDefined();
    expect(Array.isArray(colormaps.viridis)).toBe(true);
  });

  it("retrieves specific colormap ramp", async () => {
    const ramp = await getColormapRamp("magma");
    expect(ramp).toBeDefined();
    expect(ramp.length).toBeGreaterThan(0);
    expect(ramp[0].startsWith("#")).toBe(true);
  });

  it("falls back gracefully for unknown colormap name", async () => {
    const ramp = await getColormapRamp("non_existent_colormap_xyz");
    expect(ramp).toBeDefined();
    expect(ramp.length).toBeGreaterThan(0);
    expect(ramp[0].startsWith("#")).toBe(true);
  });
});

describe("eodash Style Generator - generateVectorFlatStyle", () => {
  it("generates single mode polygon flatstyle with tooltips", () => {
    const res = generateVectorFlatStyle({
      geometryType: "polygon",
      mode: "single",
      fillColor: "rgba(0, 113, 194, 0.5)",
      strokeColor: "#000000",
      strokeWidth: 2,
      tooltipFields: [
        { id: "name", title: "Country Name" },
        { id: "pop", title: "Population", decimals: 0, appendix: " people" },
      ],
    });

    expect(res["fill-color"]).toBe("rgba(0, 113, 194, 0.5)");
    expect(res["stroke-color"]).toBe("#000000");
    expect(res["stroke-width"]).toBe(2);
    expect(res.legend.scaleType).toBe("categorical");
    expect(res.tooltip).toHaveLength(2);
    expect(res.tooltip[0].id).toBe("name");
    expect(res.tooltip[1].appendix).toBe(" people");
    expect(res.tooltip[1].decimals).toBe(0);
  });

  it("generates line geometry single mode flatstyle", () => {
    const res = generateVectorFlatStyle({
      geometryType: "line",
      mode: "single",
      strokeColor: "#ff5500",
      strokeWidth: 3,
    });

    expect(res["stroke-color"]).toBe("#ff5500");
    expect(res["stroke-width"]).toBe(3);
    expect(res["fill-color"]).toBeUndefined();
    expect(res.legend.scaleType).toBe("categorical");
  });

  it("generates categorical mode point flatstyle with match expression and legend", () => {
    const res = generateVectorFlatStyle({
      geometryType: "point",
      mode: "categorical",
      attribute: "status",
      categories: [
        { value: "active", label: "Active", color: "#00ff00" },
        { value: "inactive", label: "Inactive", color: "#ff0000" },
      ],
      pointRadius: 8,
    });

    expect(res["circle-radius"]).toBe(8);
    expect(res["circle-fill-color"]).toEqual([
      "match",
      ["get", "status"],
      "active",
      "#00ff00",
      "inactive",
      "#ff0000",
      "rgba(128, 128, 128, 0.5)",
    ]);
    expect(res.legend.domain).toEqual(["Active", "Inactive"]);
    expect(res.legend.range).toEqual(["#00ff00", "#ff0000"]);
  });

  it("generates categorical mode with default categories if none provided", () => {
    const res = generateVectorFlatStyle({
      geometryType: "line",
      mode: "categorical",
      attribute: "highway",
    });

    expect(res["stroke-color"][0]).toBe("match");
    expect(res["stroke-color"][1]).toEqual(["get", "highway"]);
    expect(res.legend.domain).toContain("Category A");
  });

  it("generates graduated mode polygon flatstyle with linear interpolate expression", () => {
    const res = generateVectorFlatStyle({
      geometryType: "polygon",
      mode: "graduated",
      attribute: "pm25",
      colors: ["#00ff00", "#ffff00", "#ff0000"],
      range: [0, 100],
    });

    expect(res["fill-color"][0]).toBe("interpolate");
    expect(res["fill-color"][1]).toEqual(["linear"]);
    expect(res["fill-color"][2]).toEqual(["get", "pm25"]);
    expect(res.legend.type).toBeUndefined();
    expect(res.legend.scaleType).toBe("continuous");
    expect(res.legend.domain).toEqual([0, 100]);
  });

  it("generates graduated mode with colormap name without explicit colors", () => {
    const res = generateVectorFlatStyle({
      geometryType: "polygon",
      mode: "graduated",
      attribute: "pm25",
      colormap: "magma",
      range: [0, 100],
    });

    expect(res["fill-color"][0]).toBe("interpolate");
    expect(res.legend.range.length).toBeGreaterThanOrEqual(8);
  });

  it("generates graduated mode point flatstyle", () => {
    const res = generateVectorFlatStyle({
      geometryType: "point",
      mode: "graduated",
      attribute: "temperature",
      range: [-10, 40],
      pointRadius: 5,
    });

    expect(res["circle-radius"]).toBe(5);
    expect(res["circle-fill-color"][0]).toBe("interpolate");
    expect(res.legend.scaleType).toBe("continuous");
    expect(res.legend.domain).toEqual([-10, 40]);
  });

  it("generates interactive sliders jsonform for strokeWidth and excludes opacity (eodash covers opacity automatically)", () => {
    const res = generateVectorFlatStyle({
      geometryType: "line",
      mode: "single",
      strokeColor: "#ff0000",
      interactiveSliders: true,
    });

    expect(res.variables.strokeWidth).toBeDefined();
    expect(res.variables.opacity).toBeUndefined();
    expect(res["stroke-width"]).toEqual(["var", "strokeWidth"]);
    expect(res.jsonform.properties.strokeWidth.format).toBe("range");
    expect(res.jsonform.properties.opacity).toBeUndefined();
  });
});

describe("eodash Style Generator - generateRasterWebglStyle", () => {
  it("generates single-band normalized COG shader with minmax sliders", async () => {
    const res = await generateRasterWebglStyle({
      mode: "single-band-normalized",
      bands: [1],
      vmin: 0,
      vmax: 500,
      colorMap: "magma",
      interactiveMinMax: true,
    });

    expect(res.variables.vmin).toBe(0);
    expect(res.variables.vmax).toBe(500);
    expect(res.color[0]).toBe("case");
    expect(res.legend.domainProperties).toEqual(["vmin", "vmax"]);
    expect(res.legend.range.length).toBeGreaterThanOrEqual(8);
    expect(res.legend.range[0].startsWith("#")).toBe(true);
    expect(res.jsonform.properties.vminmax.format).toBe("minmax");
  });

  it("generates static single-band normalized COG shader without interactive sliders", async () => {
    const res = await generateRasterWebglStyle({
      mode: "single-band-normalized",
      bands: [2],
      vmin: 100,
      vmax: 2000,
      interactiveMinMax: false,
    });

    expect(res.variables).toBeUndefined();
    expect(res.jsonform).toBeUndefined();
    expect(res.legend.domain).toEqual([100, 2000]);
  });

  it("generates RGB composite COG shader with band divisor variable", async () => {
    const res = await generateRasterWebglStyle({
      mode: "rgb-composite",
      bands: [4, 3, 2],
      vmax: 4000,
    });

    expect(res.variables.bandDivisor).toBe(4000);
    expect(res.color[0]).toBe("case");
    expect(res.color[3][0]).toBe("array");
    expect(res.jsonform.properties.bandDivisor.default).toBe(4000);
  });

  it("generates normalized difference index COG shader", async () => {
    const res = await generateRasterWebglStyle({
      mode: "band-ratio-index",
      bands: [8, 4],
      colorMap: "algae",
    });

    expect(res.color[0]).toBe("case");
    expect(res.legend.domain).toEqual([-1, 1]);
    expect(res.legend.range.length).toBeGreaterThanOrEqual(8);
    expect(res.legend.range[0].startsWith("#")).toBe(true);
  });

  it("supports custom color array overriding preset colormap", async () => {
    const customColors = ["#000000", "#112233", "#ffffff"];
    const res = await generateRasterWebglStyle({
      mode: "single-band-normalized",
      customColors,
      interactiveMinMax: false,
    });

    expect(res.legend.range).toEqual(customColors);
  });
});

describe("eodash Style Generator - generateRasterForm", () => {
  it("generates single asset TiTiler rasterform with rescale template and removeProperties", () => {
    const res = generateRasterForm({
      _serviceType: "titiler",
      defaultColormap: "spectral",
      vmin: 0,
      vmax: 2000,
      hasRescale: true,
    });

    expect(res.legend.rangeProperty).toBe("colormap_name");
    expect(res.legend.domainProperties).toEqual(["vmin", "vmax"]);
    expect(res.jsonform.options.removeProperties).toEqual(["vminmax"]);
    expect(res.jsonform.properties.colormap_name.default).toBe("spectral");
    expect(res.jsonform.properties.rescale.template).toBe(
      "{{vminmax.vmin}},{{vminmax.vmax}}",
    );
    // Dynamic 1.5x slider bounds check
    expect(res.jsonform.properties.vminmax.properties.vmin.default).toBe(0);
    expect(res.jsonform.properties.vminmax.properties.vmax.default).toBe(2000);
    expect(res.jsonform.properties.vminmax.properties.vmin.maximum).toBe(3000);
    expect(res.jsonform.properties.vminmax.properties.vmax.maximum).toBe(3000);
  });

  it("calculates dynamic 1.5x headroom for rasterform slider track (0 to 250 -> maximum 375)", () => {
    const res = generateRasterForm({
      vmin: 0,
      vmax: 250,
      hasRescale: true,
    });

    expect(res.jsonform.properties.vminmax.properties.vmin.default).toBe(0);
    expect(res.jsonform.properties.vminmax.properties.vmax.default).toBe(250);
    expect(res.jsonform.properties.vminmax.properties.vmin.minimum).toBe(0);
    expect(res.jsonform.properties.vminmax.properties.vmax.maximum).toBe(375);
  });

  it("generates minimal rasterform without rescale slider", () => {
    const res = generateRasterForm({
      _serviceType: "wms",
      colormaps: ["viridis", "turbo"],
      hasRescale: false,
    });

    expect(res.jsonform.properties.rescale).toBeUndefined();
    expect(res.jsonform.properties.vminmax).toBeUndefined();
    expect(res.jsonform.properties.colormap_name.enum).toEqual([
      "viridis",
      "turbo",
    ]);
  });

  it("enforces keep_oneof_values: false for multi-asset branching rasterforms", () => {
    const res = generateRasterForm({
      _serviceType: "titiler",
      hasMultiAssetBranching: true,
      assets: [
        { id: "visual", title: "RGB True Color" },
        {
          id: "ndvi",
          title: "NDVI Index",
          defaultVmin: -0.2,
          defaultVmax: 0.8,
        },
      ],
    });

    expect(res.jsonform.options.keep_oneof_values).toBe(false);
    expect(res.jsonform.options.removeProperties).toEqual(["vminmax"]);
    expect(res.jsonform.oneOf).toHaveLength(2);
    expect(res.jsonform.oneOf[0].title).toBe("RGB True Color");
    expect(res.jsonform.oneOf[1].title).toBe("NDVI Index");
    expect(
      res.jsonform.oneOf[1].properties.vminmax.properties.vmin.default,
    ).toBe(-0.2);
    expect(
      res.jsonform.oneOf[1].properties.vminmax.properties.vmax.default,
    ).toBe(0.8);
  });
});

describe("eodash Style Generator - generateLayerStyle Router & Docs URLs", () => {
  it("routes vector-flatstyle and generates full snippets with OpenLayers doc links", async () => {
    const res = await generateLayerStyle({
      styleType: "vector-flatstyle",
      vectorConfig: {
        geometryType: "polygon",
        mode: "single",
        fillColor: "rgba(255, 0, 0, 0.5)",
      },
    });

    expect(res.styleType).toBe("vector-flatstyle");
    expect(res.style["fill-color"]).toBe("rgba(255, 0, 0, 0.5)");
    expect(res.stacItemSnippet["eox:flatstyle"]).toBeDefined();
    expect(res.catalogCollectionSnippet.Style).toBeDefined();
    expect(res.rulesAndBestPractices.length).toBeGreaterThan(0);
    expect(
      res.rulesAndBestPractices.some((r) =>
        r.includes(
          "https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html",
        ),
      ),
    ).toBe(true);
  });

  it("routes raster-flatstyle (and raster-webgl-flatstyle) with OpenLayers doc links", async () => {
    const res = await generateLayerStyle({
      styleType: "raster-flatstyle",
      rasterConfig: {
        mode: "single-band-normalized",
        vmin: 10,
        vmax: 90,
      },
    });

    expect(res.styleType).toBe("raster-flatstyle");
    expect(res.style.variables.vmin).toBe(10);
    expect(res.stacItemSnippet["eox:flatstyle"]).toBeDefined();
    expect(res.catalogCollectionSnippet.Resources[0].Style).toBeDefined();
    expect(
      res.rulesAndBestPractices.some((r) =>
        r.includes(
          "https://openlayers.org/en/latest/apidoc/module-ol_style_expressions.html",
        ),
      ),
    ).toBe(true);
  });

  it("routes rasterform and generates full snippets with rules", async () => {
    const res = await generateLayerStyle({
      styleType: "rasterform",
      rasterformConfig: {
        serviceType: "titiler",
        vmin: 0,
        vmax: 500,
      },
    });

    expect(res.styleType).toBe("rasterform");
    expect(res.style.jsonform.properties.vminmax).toBeDefined();
    expect(res.stacItemSnippet["eodash:rasterform"]).toBeDefined();
    expect(res.catalogCollectionSnippet.Resources[0].EndPoint).toContain(
      "rescale",
    );
    expect(
      res.rulesAndBestPractices.some((r) =>
        r.includes("https://github.com/json-editor/json-editor"),
      ),
    ).toBe(true);
  });
});

describe("eodash Landing Page HTML Generator", () => {
  it("renders landing page with dynamic tools list and statistics", () => {
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
    expect(html).toContain("generate_layer_style");
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
    const res = findExamples({ category: "catalog-collection" });
    expect(res.totalFound).toBeGreaterThan(0);
    for (const ex of res.results) {
      expect(ex.category).toBe("catalog-collection");
    }
  });

  it("filters examples by dataType (e.g. cog, vector, wmts)", () => {
    const cogRes = findExamples({ dataType: "cog" });
    expect(cogRes.totalFound).toBeGreaterThan(0);
    expect(cogRes.results.every((r) => r.dataType === "cog")).toBe(true);

    const vecRes = findExamples({ dataType: "vector" });
    expect(vecRes.totalFound).toBeGreaterThan(0);
    expect(vecRes.results.every((r) => r.dataType === "vector")).toBe(true);
  });

  it("filters examples by feature tag", () => {
    const res = findExamples({ feature: "bounding-box" });
    expect(res.totalFound).toBeGreaterThan(0);
    expect(res.results.some((ex) => ex.features.includes("bounding-box"))).toBe(
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
});

describe("eodash MCP Tools via Client - generate_layer_style & find_examples", () => {
  it("calls generate_layer_style via MCP client for vector-flatstyle", async () => {
    const { client } = await createTestClientServer();
    const result = await client.callTool({
      name: "generate_layer_style",
      arguments: {
        styleType: "vector-flatstyle",
        vectorConfig: {
          geometryType: "polygon",
          mode: "categorical",
          attribute: "risk_level",
          categories: [
            { value: "low", label: "Low Risk", color: "#00ff00" },
            { value: "high", label: "High Risk", color: "#ff0000" },
          ],
        },
      },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.styleType).toBe("vector-flatstyle");
    expect(parsed.style["fill-color"]).toBeDefined();
    expect(parsed.stacItemSnippet["eox:flatstyle"]).toBeDefined();
    expect(parsed.catalogCollectionSnippet.Style).toBeDefined();
    expect(parsed.rulesAndBestPractices).toBeInstanceOf(Array);
  });

  it("calls generate_layer_style via MCP client for raster-webgl-flatstyle", async () => {
    const { client } = await createTestClientServer();
    const result = await client.callTool({
      name: "generate_layer_style",
      arguments: {
        styleType: "raster-webgl-flatstyle",
        rasterWebglConfig: {
          mode: "single-band-normalized",
          bands: [1],
          vmin: 0,
          vmax: 1000,
        },
      },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.styleType).toBe("raster-webgl-flatstyle");
    expect(parsed.style.color).toBeDefined();
    expect(parsed.stacItemSnippet["eox:flatstyle"]).toBeDefined();
  });

  it("calls generate_layer_style via MCP client for rasterform", async () => {
    const { client } = await createTestClientServer();
    const result = await client.callTool({
      name: "generate_layer_style",
      arguments: {
        styleType: "rasterform",
        rasterformConfig: {
          serviceType: "titiler",
          vmin: 10,
          vmax: 200,
        },
      },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.styleType).toBe("rasterform");
    expect(parsed.style.jsonform).toBeDefined();
    expect(parsed.stacItemSnippet["eodash:rasterform"]).toBeDefined();
  });

  it("calls find_examples via MCP client with keyword and category", async () => {
    const { client } = await createTestClientServer();
    const result = await client.callTool({
      name: "find_examples",
      arguments: {
        query: "ice charts match",
        category: "vector-flatstyle",
      },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalFound).toBeGreaterThan(0);
    expect(parsed.results[0].id).toBe(
      "vector-flatstyle-ice-charts-categorical",
    );
  });

  it("calls find_examples via MCP client with dataType filter", async () => {
    const { client } = await createTestClientServer();
    const result = await client.callTool({
      name: "find_examples",
      arguments: {
        dataType: "cog",
      },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalFound).toBeGreaterThan(0);
    expect(parsed.results[0].dataType).toBe("cog");
  });

  it("calls generate_layer_style with parameter aliases (rasterConfig & colormap)", async () => {
    const { client } = await createTestClientServer();
    const result = await client.callTool({
      name: "generate_layer_style",
      arguments: {
        styleType: "raster-webgl-flatstyle",
        rasterConfig: {
          mode: "single-band",
          bandIndex: 1,
          range: [-2, 35],
          colormap: "magma",
        },
      },
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.styleType).toBe("raster-webgl-flatstyle");
    expect(parsed.style.variables.vmin).toBe(-2);
    expect(parsed.style.variables.vmax).toBe(35);
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
    expect(btnsProp.schema.properties.enableExportMap).toBeDefined();
  });
});
