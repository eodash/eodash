#!/usr/bin/env node
import { z } from "zod";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { scaffoldDashboard } from "./generators/dashboard.js";
import { generateEodashConfig } from "./generators/config.js";
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
      instructions:
        "This MCP server provides tools to inspect, configure, and scaffold @eodash/eodash instances, widgets, layouts, and STAC integrations.",
    },
    {
      capabilities: {
        tools: {
          call: {},
        },
      },
    },
  );

  // Tool 1: list_widgets
  server.registerTool(
    "list_widgets",
    {
      description:
        "List all built-in eodash widgets with their category, summary, background capability, and prop count. Optionally filter by category.",
      inputSchema: z.object({
        category: z
          .string()
          .optional()
          .describe(
            "Optional category filter: 'Visualization & Map', 'Catalog & Discovery', 'Filtering & Selection', 'Temporal Navigation', 'Analysis & Processing', 'Layout & Orchestration', 'Branding & Metadata'",
          ),
      }),
    },
    async ({ category }) => {
      let list = Object.values(widgetsData);
      if (category) {
        const catLower = category.toLowerCase();
        list = list.filter((w) => w.category?.toLowerCase().includes(catLower));
      }

      const summaryList = list.map((w) => ({
        name: w.name,
        category: w.category,
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

  // Tool 2: get_widget_details
  server.registerTool(
    "get_widget_details",
    {
      description:
        "Get details for a specific eodash widget: full TypeScript props (types, defaults, descriptions), store interactions, supported STAC extensions, copy-pasteable example config, and markdown guide.",
      inputSchema: z.object({
        widgetName: z
          .string()
          .describe(
            "The name of the widget (e.g. 'EodashMap', 'EodashItemCatalog', 'EodashItemFilter', 'EodashLayerControl', 'EodashTimeSlider', 'EodashProcess', 'EodashChart', 'EodashStacInfo', 'EodashTools', 'EodashDatePicker', 'EodashLayoutSwitcher').",
          ),
      }),
    },
    async ({ widgetName }) => {
      const widget = widgetsData[widgetName];
      if (!widget) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Widget '${widgetName}' not found in eodash widgets registry. Available widgets: ${Object.keys(widgetsData).join(", ")}`,
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

  // Tool 3: get_custom_widget_guide
  server.registerTool(
    "get_custom_widget_guide",
    {
      description:
        "Get guide and code templates for creating and plugging custom widgets into eodash (web-component widgets, functional widgets, iframe widgets, reactive store integration, and EOxElements playground workflow).",
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
          .describe(
            "Specific custom widget type guide to retrieve ('web-component', 'functional', 'iframe', 'eox-elements', or 'all').",
          ),
      }),
    },
    async ({ type }) => {
      const guides = CUSTOM_WIDGET_GUIDES;
      const selectedContent =
        type === "all" ? guides : { [type]: guides[type] };

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

  // Tool 4: get_eodash_architecture
  server.registerTool(
    "get_eodash_architecture",
    {
      description:
        "Get architecture documentation of @eodash/eodash: grid system (12-column, breakpoints 'x/y/w/h'), built-in templates ('lite', 'explore', 'expert', 'compare'), reactive Pinia store states, and deployment modes (SPA vs <eo-dash> web component).",
      inputSchema: z.object({
        topic: z
          .enum([
            "overview",
            "grid-layout",
            "templates",
            "reactive-store",
            "all",
          ])
          .optional()
          .default("all")
          .describe("Specific architecture topic to query."),
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

  // Tool 5: scaffold_dashboard
  server.registerTool(
    "scaffold_dashboard",
    {
      description:
        "Scaffold complete project boilerplate for an eodash dashboard: standalone SPA, VitePress narrative documentation, or embedded web component. Returns ready-to-write file dictionary including package.json, eodash.config.js, index.html, Dockerfile, and README.",
      inputSchema: z.object({
        name: z
          .string()
          .optional()
          .default("my-eo-dashboard")
          .describe("Project folder / package name."),
        projectType: z
          .enum(["standalone-spa", "vitepress-narratives", "web-component"])
          .optional()
          .default("standalone-spa")
          .describe(
            "Project architecture type: 'standalone-spa' (Vite + eodash SPA), 'vitepress-narratives' (VitePress docs with <eo-dash> stories), or 'web-component' (minimal custom element integration).",
          ),
        stacEndpoint: z
          .string()
          .optional()
          .default(DEFAULT_STAC_ENDPOINT)
          .describe("Default STAC catalog or STAC API endpoint URL."),
        template: templateEnum
          .optional()
          .default("explore")
          .describe(
            `Default eodash layout template (${availableTemplates.join(", ")}).`,
          ),
        brandName: z
          .string()
          .optional()
          .default(DEFAULT_BRAND_NAME)
          .describe("Brand title / display header."),
        brandColor: z
          .string()
          .optional()
          .default("#002742")
          .describe("Primary brand theme color hex code."),
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

  // Tool 6: generate_eodash_config
  server.registerTool(
    "generate_eodash_config",
    {
      description:
        "Generate a complete, type-safe eodash configuration (eodash.config.js / baseConfig.js) with STAC endpoint, brand styling, template selection (explore/lite/expert/compare), custom widget placements, and runtime options.",
      inputSchema: z.object({
        id: z
          .string()
          .optional()
          .default("demo-dashboard")
          .describe("Unique dashboard identifier."),
        stacEndpoint: z
          .union([z.string(), z.record(z.any())])
          .optional()
          .default(DEFAULT_STAC_ENDPOINT)
          .describe(
            "STAC endpoint URL string or structured endpoint configuration object.",
          ),
        template: configTemplateEnum
          .optional()
          .default("explore")
          .describe(
            `Template layout preset (${availableTemplates.join(", ")}) or 'custom'.`,
          ),
        brand: z
          .object({
            name: z.string().optional(),
            footerText: z.string().optional(),
            font: z
              .object({
                headers: z
                  .object({
                    family: z.string(),
                    link: z.string(),
                  })
                  .optional(),
                body: z
                  .object({
                    family: z.string(),
                    link: z.string(),
                  })
                  .optional(),
              })
              .optional(),
            theme: z
              .object({
                colors: z
                  .object({
                    primary: z.string().optional(),
                    secondary: z.string().optional(),
                    surface: z.string().optional(),
                  })
                  .optional(),
                variables: z.record(z.any()).optional(),
                collectionsPalette: z.array(z.string()).optional(),
              })
              .optional(),
          })
          .optional()
          .describe("Brand metadata, web fonts, and color palettes."),
        customWidgets: z
          .array(z.record(z.any()))
          .optional()
          .default([])
          .describe(
            "Array of custom widget definitions with layout coordinates and properties.",
          ),
        options: z
          .record(z.any())
          .optional()
          .default({})
          .describe("Runtime options (e.g. useSubCode)."),
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

  return server;
}

export function createExpressApp() {
  const app = express();

  app.use(
    cors({
      origin: "*",
      exposedHeaders: ["mcp-session-id", "Mcp-Session-Id"],
    }),
  );
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ message: "eodash MCP Server is running" });
  });

  const transports = {};

  app.post("/", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    let transport = transports[sessionId];

    if (!transport) {
      if (isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            transports[newSessionId] = transport;
            transport.onclose = () => {
              delete transports[newSessionId];
            };
          },
        });
        const server = createMcpServer();
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        res.status(400).json({ error: "No session found" });
        return;
      }
    }
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    const transport = transports[sessionId];
    if (!transport) {
      const accept = req.headers.accept || "";
      if (accept.includes("text/event-stream")) {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write(": welcome\n\n");
        res.end();
        return;
      }

      const { widgetsData, architectureData } = getMetadata();
      res.setHeader("Content-Type", "text/html");
      res.send(generateLandingPage(widgetsData, architectureData));
      return;
    }
    await transport.handleRequest(req, res);
  });

  app.delete("/", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    const transport = transports[sessionId];
    if (!transport) {
      res.status(400).send("No session found");
      return;
    }
    await transport.handleRequest(req, res);
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

// Auto start if executed directly
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename)
) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
