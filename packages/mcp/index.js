#!/usr/bin/env node
import { z } from "zod";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { scaffoldDashboard } from "./generators/dashboard.js";
import { generateEodashConfig } from "./generators/config.js";
import { generateLayerStyle } from "./generators/style.js";
import { findExamples } from "./generators/examples.js";
import { validateCatalogConfig } from "./generators/validator.js";
import {
  getMetadata,
  generateLandingPage,
  CUSTOM_WIDGET_GUIDES,
  DEFAULT_STAC_ENDPOINT,
  DEFAULT_BRAND_NAME,
  getAvailableTemplates,
} from "./helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);

export { getMetadata };

/**
 * Creates and registers tools on an McpServer instance
 */
export function createMcpServer() {
  const { widgetsData, architectureData } = getMetadata();
  const availableTemplates = getAvailableTemplates();
  const templateEnum =
    availableTemplates.length >= 2 ? z.enum(availableTemplates) : z.string();
  const configTemplateEnum =
    availableTemplates.length >= 1
      ? z.enum([...availableTemplates, "custom"])
      : z.string();

  const server = new McpServer(
    {
      name: pkg.name || "@eodash/mcp-server",
      version: pkg.version || "1.0.0",
    },
    {
      instructions:
        "Inspect, configure, and scaffold eodash instances, widgets, layouts, styles, and STAC integrations. " +
        "NOTE: MCP generation tools return code/files in-memory and do NOT write directly to disk; use file writing tools to write returned files.",
      capabilities: {
        tools: {
          call: {},
        },
      },
    },
  );

  // list_widgets
  server.registerTool(
    "list_widgets",
    {
      description:
        "List built-in eodash widgets with capability tags, summaries, prop counts, and store interactions.",
      inputSchema: z.object({
        category: z.string().optional().describe("Filter by category"),
        tag: z
          .string()
          .optional()
          .describe(
            "Filter by tag (map, time, filter, catalog, layer, chart, process, stac)",
          ),
        search: z.string().optional().describe("Free-text search query"),
      }),
    },
    async ({ category, tag, search }) => {
      let list = Object.values(widgetsData);
      if (category) {
        const catLower = category.toLowerCase();
        list = list.filter((w) => w.category?.toLowerCase().includes(catLower));
      }
      if (tag) {
        const tagLower = tag.toLowerCase();
        list = list.filter(
          (w) =>
            w.tags?.some((t) => t.toLowerCase().includes(tagLower)) ||
            w.category?.toLowerCase().includes(tagLower) ||
            w.name?.toLowerCase().includes(tagLower) ||
            w.summary?.toLowerCase().includes(tagLower),
        );
      }
      if (search) {
        const sLower = search.toLowerCase();
        list = list.filter(
          (w) =>
            w.name?.toLowerCase().includes(sLower) ||
            w.summary?.toLowerCase().includes(sLower) ||
            w.tags?.some((t) => t.toLowerCase().includes(sLower)) ||
            w.category?.toLowerCase().includes(sLower),
        );
      }

      const summaryList = list.map((w) => ({
        name: w.name,
        category: w.category,
        tags: w.tags || [],
        summary: w.summary,
        isBackground: w.isBackground,
        propCount: w.props?.length || 0,
        storeInteractions: {
          reads: w.storeInteractions?.reads || [],
          writes: w.storeInteractions?.writes || [],
        },
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(summaryList, null, 2),
          },
        ],
      };
    },
  );

  // get_widget_details
  server.registerTool(
    "get_widget_details",
    {
      description:
        "Get details for a specific eodash widget: props, store interactions, STAC extensions, config example, and guide.",
      inputSchema: z.object({
        widgetName: z
          .string()
          .optional()
          .describe("Widget name (e.g. EodashMap, EodashItemCatalog)"),
        name: z.string().optional().describe("Alias for widgetName"),
      }),
    },
    async ({ widgetName, name }) => {
      const targetName = widgetName || name;
      const widget = targetName ? widgetsData[targetName] : null;
      if (!widget) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Widget '${targetName || "undefined"}' not found in eodash widgets registry. Available widgets: ${Object.keys(widgetsData).join(", ")}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(widget, null, 2),
          },
        ],
      };
    },
  );

  // get_custom_widget_guide
  server.registerTool(
    "get_custom_widget_guide",
    {
      description:
        "Get guide and code templates for creating custom eodash widgets.",
      inputSchema: z.object({
        type: z
          .enum([
            "web-component",
            "functional",
            "iframe",
            "eox-elements",
            "all",
          ])
          .optional()
          .default("all")
          .describe("Custom widget type"),
        widgetType: z
          .enum([
            "web-component",
            "functional",
            "iframe",
            "eox-elements",
            "all",
          ])
          .optional()
          .describe("Alias for type"),
      }),
    },
    async ({ type, widgetType }) => {
      const selectedType = type || widgetType || "all";
      const guides = CUSTOM_WIDGET_GUIDES;
      const selectedContent =
        selectedType === "all"
          ? guides
          : { [selectedType]: guides[selectedType] };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(selectedContent, null, 2),
          },
        ],
      };
    },
  );

  // get_eodash_architecture
  server.registerTool(
    "get_eodash_architecture",
    {
      description:
        "Get eodash architecture docs: grid layout, templates, Pinia store, deployment modes.",
      inputSchema: z.object({
        topic: z
          .enum([
            "overview",
            "grid-layout",
            "templates",
            "custom-widgets",
            "reactive-store",
            "all",
          ])
          .optional()
          .default("all")
          .describe("Architecture topic"),
      }),
    },
    async ({ topic }) => {
      let result;
      if (topic === "all") {
        result = architectureData;
      } else if (topic === "overview") {
        result = { overview: architectureData.overview };
      } else if (topic === "grid-layout") {
        result = { gridSystem: architectureData.gridSystem };
      } else if (topic === "templates") {
        result = { templateSystem: architectureData.templateSystem };
      } else if (topic === "custom-widgets") {
        result = { customWidgetSystem: architectureData.customWidgetSystem };
      } else if (topic === "reactive-store") {
        result = { reactiveStore: architectureData.reactiveStore };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result || architectureData, null, 2),
          },
        ],
      };
    },
  );

  // scaffold_dashboard
  server.registerTool(
    "scaffold_dashboard",
    {
      description:
        "Scaffold project boilerplate for an eodash dashboard (returns file map in-memory).",
      inputSchema: z.object({
        name: z
          .string()
          .optional()
          .default("my-eo-dashboard")
          .describe("Project folder / package name"),
        projectType: z
          .enum(["standalone-spa", "vitepress-narratives", "web-component"])
          .optional()
          .default("standalone-spa")
          .describe("Architecture type"),
        stacEndpoint: z
          .string()
          .optional()
          .default(DEFAULT_STAC_ENDPOINT)
          .describe("STAC catalog or API URL"),
        template: templateEnum
          .optional()
          .default("lite")
          .describe("Layout template preset"),
      }),
    },
    async (params) => {
      const scaffold = scaffoldDashboard(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(scaffold, null, 2),
          },
        ],
      };
    },
  );

  // generate_eodash_config
  server.registerTool(
    "generate_eodash_config",
    {
      description:
        "Generate eodash configuration code (eodash.config.js) with STAC endpoint, template, and widgets.",
      inputSchema: z.object({
        id: z
          .string()
          .optional()
          .default("demo-dashboard")
          .describe("Dashboard ID"),
        stacEndpoint: z
          .union([z.string(), z.record(z.any())])
          .optional()
          .default(DEFAULT_STAC_ENDPOINT)
          .describe("STAC endpoint URL or config object"),
        template: configTemplateEnum
          .optional()
          .default("lite")
          .describe("Template preset or 'custom'"),
        customWidgets: z
          .array(z.record(z.any()))
          .optional()
          .default([])
          .describe("Custom widget definitions array"),
        options: z
          .record(z.any())
          .optional()
          .default({})
          .describe("Runtime options"),
      }),
    },
    async (params) => {
      const generated = generateEodashConfig(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(generated, null, 2),
          },
        ],
      };
    },
  );

  // generate_layer_style
  server.registerTool(
    "generate_layer_style",
    {
      description:
        "Generate OpenLayers FlatStyles (vector/raster COG) or eodash:rasterform definitions with legend and jsonform.",
      inputSchema: z.object({
        styleType: z
          .enum([
            "vector-flatstyle",
            "raster-flatstyle",
            "raster-webgl-flatstyle",
            "raster-cog",
            "rasterform",
          ])
          .describe("Target style type"),
        vectorConfig: z
          .object({
            geometryType: z
              .enum(["point", "polygon", "line"])
              .optional()
              .default("polygon")
              .describe("Geometry symbolizer type"),
            mode: z
              .enum(["single", "categorical", "continuous", "graduated"])
              .optional()
              .default("single")
              .describe("Coloring mode (single, categorical, continuous)"),
            attribute: z
              .string()
              .optional()
              .default("value")
              .describe("Feature property for data-driven styling"),
            colormap: z
              .string()
              .optional()
              .default("viridis")
              .describe("Colormap preset name"),
            colors: z
              .array(z.string())
              .optional()
              .describe("Color hex array"),
            categories: z
              .array(z.record(z.any()))
              .optional()
              .describe("Category mappings [{value, color, label?}]"),
            range: z
              .array(z.number())
              .optional()
              .describe("[min, max] data range"),
            fillColor: z.string().optional().describe("Fill color hex/rgba"),
            strokeColor: z
              .string()
              .optional()
              .describe("Stroke color hex/rgba"),
            strokeWidth: z.number().optional().describe("Stroke width (px)"),
            pointRadius: z.number().optional().describe("Point radius (px)"),
            tooltipFields: z
              .array(z.record(z.any()))
              .optional()
              .describe(
                "Tooltip fields [{id, title?, appendix?, decimals?}]",
              ),
            interactiveSliders: z
              .boolean()
              .optional()
              .default(false)
              .describe("Generate stroke width slider"),
          })
          .optional()
          .describe("Vector flatstyle options"),
        rasterConfig: z
          .object({
            mode: z
              .enum([
                "single-band-normalized",
                "single-band",
                "single",
                "rgb-composite",
                "rgb",
                "band-ratio-index",
              ])
              .optional()
              .default("single-band-normalized")
              .describe("Raster rendering mode"),
            bands: z
              .array(z.number())
              .optional()
              .default([1])
              .describe("1-based band indices (e.g. [1] or [4,3,2])"),
            bandIndex: z
              .number()
              .optional()
              .describe("Band index (1-based)"),
            redBand: z.number().optional().describe("Red band index"),
            greenBand: z.number().optional().describe("Green band index"),
            blueBand: z.number().optional().describe("Blue band index"),
            range: z
              .array(z.number())
              .optional()
              .describe("[min, max] data range"),
            vmin: z.number().optional().describe("Min data value"),
            vmax: z.number().optional().describe("Max data value"),
            sliderMin: z
              .number()
              .optional()
              .describe("Slider track min bound"),
            sliderMax: z
              .number()
              .optional()
              .describe("Slider track max bound"),
            colormap: z
              .string()
              .optional()
              .describe("Colormap preset name"),
            customColors: z
              .array(z.string())
              .optional()
              .describe("Custom color ramp array"),
            interactiveMinMax: z
              .boolean()
              .optional()
              .default(true)
              .describe("Generate interactive min/max slider"),
          })
          .optional()
          .describe("Raster COG flatstyle options"),
        rasterWebglConfig: z
          .any()
          .optional()
          .describe("Alias for rasterConfig"),
        rasterformConfig: z
          .object({
            serviceType: z
              .enum(["titiler", "wms", "custom-xyz"])
              .optional()
              .default("titiler")
              .describe("Raster backend type"),
            colormaps: z
              .array(z.string())
              .optional()
              .describe("Colormap dropdown options"),
            defaultColormap: z
              .string()
              .optional()
              .default("viridis")
              .describe("Default active colormap"),
            vmin: z.number().optional().describe("Default min rescale value"),
            vmax: z.number().optional().describe("Default max rescale value"),
            sliderMin: z
              .number()
              .optional()
              .describe("Slider track min bound"),
            sliderMax: z
              .number()
              .optional()
              .describe("Slider track max bound"),
            hasRescale: z
              .boolean()
              .optional()
              .default(true)
              .describe("Include rescale slider"),
            hasMultiAssetBranching: z
              .boolean()
              .optional()
              .default(false)
              .describe("Include multi-asset branching form"),
            assets: z
              .array(z.record(z.any()))
              .optional()
              .describe(
                "Branching assets [{id, title, defaultVmin?, defaultVmax?}]",
              ),
          })
          .optional()
          .describe("Rasterform options for TiTiler/WMS/XYZ"),
        rasterFormConfig: z
          .any()
          .optional()
          .describe("Alias for rasterformConfig"),
      }),
    },
    async (params) => {
      const generated = await generateLayerStyle(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(generated, null, 2),
          },
        ],
      };
    },
  );

  // find_examples
  server.registerTool(
    "find_examples",
    {
      description:
        "Search and discover working eodash examples, layer styles, and catalog configs.",
      inputSchema: z.object({
        query: z.string().optional().describe("Search keywords"),
        category: z
          .enum([
            "all",
            "vector-flatstyle",
            "raster-flatstyle",
            "raster-webgl-flatstyle",
            "rasterform",
            "jsonform",
            "catalog-collection",
            "catalog-indicator",
            "stac-item",
          ])
          .optional()
          .default("all")
          .describe("Config category filter"),
        dataType: z
          .enum([
            "all",
            "vector",
            "cog",
            "xyz",
            "wmts",
            "point",
            "polygon",
            "timeseries",
          ])
          .optional()
          .default("all")
          .describe("Geospatial data type filter"),
        feature: z
          .string()
          .optional()
          .describe("Feature tag filter (e.g. legend, tooltip, drawtools)"),
        limit: z
          .number()
          .optional()
          .default(5)
          .describe("Max results (1-20)"),
      }),
    },
    async (params) => {
      const results = findExamples(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  );

  // validate_catalog_config
  server.registerTool(
    "validate_catalog_config",
    {
      description:
        "Validate eodash collection or indicator JSON configuration against schemas and rules.",
      inputSchema: z.object({
        config: z
          .union([z.string(), z.record(z.any())])
          .describe("Collection or indicator JSON string or object"),
        configType: z
          .enum([
            "auto",
            "collection",
            "indicator",
            "catalog-collection",
            "catalog-indicator",
          ])
          .optional()
          .default("auto")
          .describe("Target schema type"),
      }),
    },
    async (params) => {
      const results = await validateCatalogConfig(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  );

  return server;
}

export function createExpressApp() {
  const app = express();

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  // Handle malformed JSON body errors in standard JSON-RPC format
  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error: malformed JSON",
        },
        id: null,
      });
    }
    next(err);
  });

  app.get("/health", (_req, res) => {
    res.json({ message: "eodash MCP Server is running" });
  });

  app.get("/ui", (_req, res) => {
    const { widgetsData, architectureData } = getMetadata();
    const serverInstance = createMcpServer();
    const tools = Object.entries(serverInstance._registeredTools || {}).map(
      ([name, def]) => ({
        name,
        description: def.description,
      }),
    );
    res.setHeader("Content-Type", "text/html");
    res.send(generateLandingPage(widgetsData, architectureData, { tools }));
  });

  app.get("/", (_req, res) => {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32600,
        message:
          "Method Not Allowed: MCP endpoint requires POST requests. Access UI landing page at /ui.",
      },
      id: null,
    });
  });

  app.post("/", async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      const server = createMcpServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("Error handling MCP request:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Internal server error" });
      }
    }
  });

  app.delete("/", (_req, res) => {
    res.status(200).json({ message: "Stateless session closed" });
  });

  return app;
}

async function startServer() {
  const app = createExpressApp();
  let port = 3001;

  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex > -1 && process.argv[portArgIndex + 1]) {
    port = parseInt(process.argv[portArgIndex + 1], 10);
  }

  app.listen(port, () => {
    console.log(`eodash MCP Server running at http://localhost:${port}`);
  });
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  try {
    const realArgv1 = fs.realpathSync(path.resolve(process.argv[1]));
    const realFilename = fs.realpathSync(__filename);
    return realArgv1 === realFilename;
  } catch {
    return path.resolve(process.argv[1]) === path.resolve(__filename);
  }
}

// Auto start if executed directly
if (isDirectExecution()) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
