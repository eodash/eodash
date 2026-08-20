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
import { buildMetadata } from "./generate-metadata.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);

/**
 * Load or dynamically generate metadata on the fly
 */
export function getMetadata() {
  const widgetsFile = path.join(__dirname, "data/widgets-metadata.json");
  const archFile = path.join(__dirname, "data/architecture-metadata.json");

  if (fs.existsSync(widgetsFile) && fs.existsSync(archFile)) {
    try {
      const widgetsData = JSON.parse(fs.readFileSync(widgetsFile, "utf8"));
      const architectureData = JSON.parse(fs.readFileSync(archFile, "utf8"));
      return { widgetsData, architectureData };
    } catch (err) {
      console.warn("Could not read cached metadata, rebuilding:", err.message);
    }
  }

  // Dynamic on-the-fly generation fallback
  const { widgetsMetadata, architectureMetadata } = buildMetadata(REPO_ROOT);
  return {
    widgetsData: widgetsMetadata,
    architectureData: architectureMetadata,
  };
}

/**
 * Creates and registers tools on an McpServer instance
 */
export function createMcpServer() {
  const { widgetsData, architectureData } = getMetadata();

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
        isBackground: w.isBackground,
        propCount: w.props?.length || 0,
        summary: w.summary,
        storeReads: w.storeInteractions?.reads || [],
        storeWrites: w.storeInteractions?.writes || [],
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
        "Get comprehensive details for a specific eodash widget: full TypeScript props (types, defaults, descriptions), store interactions, supported STAC extensions, copy-pasteable example config, and markdown guide.",
      inputSchema: z.object({
        widgetName: z
          .string()
          .describe(
            "The name of the widget (e.g. 'EodashMap', 'EodashItemCatalog', 'EodashItemFilter', 'EodashLayerControl', 'EodashTimeSlider', 'EodashProcess', 'EodashChart', 'EodashStacInfo', 'EodashTools', 'EodashDatePicker', 'EodashLayoutSwitcher', 'WidgetsContainer').",
          ),
      }),
    },
    async ({ widgetName }) => {
      const widget = widgetsData[widgetName];
      if (!widget) {
        const available = Object.keys(widgetsData).join(", ");
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Widget '${widgetName}' not found. Available widgets: ${available}`,
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
        "Get comprehensive guide and code templates for creating and plugging custom widgets into eodash (web-component widgets, functional widgets, iframe widgets, reactive store integration, and EOxElements playground workflow).",
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
      const guides = {
        "web-component": {
          title: "Web Component Widgets in eodash",
          description:
            "Custom web components can be loaded either from an npm package (bundled at build time) or from an external CDN URL (runtime).",
          lifecycleHooks: {
            onMounted:
              "(el: HTMLElement, store: EodashStore) => void - called when widget mounts. Gives direct DOM element handle and STAC Pinia store.",
            onUnmounted:
              "(el: HTMLElement, store: EodashStore) => void - called before widget unmounts for cleanup.",
          },
          packageImportExample: `
// Bundled Web Component via package import
import { createEodash, store } from "@eodash/eodash";

export default createEodash({
  id: "custom-dashboard",
  stacEndpoint: "https://example.com/catalog.json",
  template: {
    widgets: [
      {
        id: "custom-info",
        title: "Custom Info",
        type: "web-component",
        layout: { x: 9, y: 0, w: 3, h: 6 },
        widget: {
          link: () => import("@eox/stacinfo"),
          tagName: "eox-stacinfo",
          properties: {
            for: store.states.currentUrl,
            allowHtml: "true",
            properties: '["description"]',
          },
          onMounted: (el, store) => {
            console.log("Custom element mounted:", el);
          },
          onUnmounted: (el, store) => {
            console.log("Custom element unmounted");
          }
        },
      },
    ],
  },
});
`,
          inlineCustomElementExample: `
// Registering a bespoke custom element inside the project
// src/elements/my-metric-badge.js
export class MyMetricBadge extends HTMLElement {
  connectedCallback() {
    this.innerHTML = \`
      <div style="padding: 1rem; background: var(--v-theme-surface, #fff); border-radius: 8px;">
        <h3>Live Sensor Health</h3>
        <p>Status: <span style="color: green; font-weight: bold;">Operational</span></p>
      </div>
    \`;
  }
}
customElements.define("my-metric-badge", MyMetricBadge);

// In src/main.js:
import "./elements/my-metric-badge.js";

export default createEodash({
  // ...
  template: {
    widgets: [
      {
        id: "sensor-health",
        title: "Health",
        type: "web-component",
        layout: { x: 0, y: 10, w: 3, h: 2 },
        widget: {
          tagName: "my-metric-badge",
          properties: {},
        },
      },
    ],
  },
});
`,
        },
        functional: {
          title: "Functional / Dynamic Widgets in eodash",
          description:
            "Functional widgets use defineWidget: (selectedSTAC) => Widget | null to conditionally render widgets depending on the active STAC collection or indicator metadata.",
          example: `
import { getBaseConfig } from "@eodash/eodash/templates";

export default getBaseConfig({
  template: {
    widgets: [
      {
        defineWidget: (selectedSTAC) => {
          // Check if active indicator provides a custom process
          const hasProcess = selectedSTAC?.links?.some((l) => l.rel === "service");
          if (!hasProcess) return null; // Don't render widget if indicator has no process

          return {
            id: "dynamic-process-panel",
            title: "Analysis",
            type: "internal",
            layout: { x: 9, y: 0, w: 3, h: 8 },
            widget: {
              name: "EodashProcess",
              properties: {
                vegaEmbedOptions: { actions: true },
              },
            },
          };
        },
      },
    ],
  },
});
`,
        },
        iframe: {
          title: "IFrame Widgets in eodash",
          description:
            "Embed external websites, dashboards, Jupyter notebook outputs, or web applications inside eodash grid slots.",
          example: `
export default createEodash({
  template: {
    widgets: [
      {
        id: "external-notebook",
        title: "Live Analysis Notebook",
        type: "iframe",
        layout: { x: 6, y: 0, w: 6, h: 12 },
        widget: {
          src: "https://example.com/embedded-notebook.html",
        },
      },
    ],
  },
});
`,
        },
        "eox-elements": {
          title: "Integrating EOxElements & EOxElements Playground",
          description:
            "EOxElements (@eox/*) are the primary web component library powering eodash internal and custom widgets. You can prototype custom widgets inside the EOxElements playground and plug them directly into eodash.",
          availableElements: [
            "@eox/map: OpenLayers map component with layer management, drawtools, and projection support.",
            "@eox/layercontrol: Layer tree, styling, rasterform sliders, datetime, and legend integration.",
            "@eox/itemfilter: Faceted search and multi-property filtering for STAC catalogs.",
            "@eox/jsonform: Schema-driven JSON forms with dynamic template expressions and drawtools injection.",
            "@eox/chart: Vega-Lite wrapper for rendering interactive charts and stats.",
            "@eox/timecontrol: Interactive time slider and time range scrubber.",
            "@eox/stacinfo: Formatted rendering of STAC collection and item metadata.",
            "@eox/drawtools: Vector drawing geometries (bbox, point, polygon) on map.",
            "@eox/geosearch: Location and address geocoding search control.",
            "@eox/feedback: User feedback popup and issue submission.",
          ],
          storeAccessPattern: `
// Accessing eodashStore inside custom components:
const store = window.eodashStore;
if (store) {
  // Read states
  console.log("Current STAC collection:", store.states.currentUrl.value);
  console.log("Active OpenLayers map instance:", store.states.mapEl.value);

  // Hook into tooltip property formatting
  store.states.tooltipAdapter.value = ({ key, value }, mapId) => {
    if (key === "temperature") return { key: "Temp (°C)", value: \`\${value} °C\` };
    return { key, value };
  };
}
`,
        },
      };

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
        "Get comprehensive architecture documentation of @eodash/eodash: grid system (12-column, breakpoints 'x/y/w/h'), built-in templates ('lite', 'explore', 'expert', 'compare'), reactive Pinia store states, and deployment modes (SPA vs <eo-dash> web component).",
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

  return server;
}

function generateLandingPage(widgets, _arch) {
  const totalWidgets = Object.keys(widgets).length;
  const widgetCards = Object.values(widgets)
    .map(
      (w) => `
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-slate-900 text-base font-mono">${w.name}</h3>
        <span class="text-xs px-2.5 py-0.5 rounded-full font-medium ${w.isBackground ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}">
          ${w.isBackground ? "Background Widget" : w.category || "Widget"}
        </span>
      </div>
      <p class="text-xs text-slate-600 mb-4 leading-relaxed">${w.summary || "Built-in widget"}</p>
      <div class="text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded border border-slate-100">
        <div><strong>Props:</strong> ${w.props?.length || 0} configurable</div>
        <div><strong>Reads:</strong> ${(w.storeInteractions?.reads || []).join(", ") || "none"}</div>
        <div><strong>Writes:</strong> ${(w.storeInteractions?.writes || []).join(", ") || "none"}</div>
      </div>
    </div>
  `,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-50">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@eodash/eodash MCP Server</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-full flex flex-col font-sans text-slate-800 antialiased">
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="bg-blue-600 text-white font-bold px-2.5 py-1 rounded">eo</div>
        <span class="font-bold text-slate-900 text-lg">eodash MCP Server</span>
        <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">v${pkg.version || "1.0.0"}</span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span class="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Active
        </span>
      </div>
    </div>
  </header>

  <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-950 mb-3">About this Server</h2>
          <p class="text-sm text-slate-600 leading-relaxed mb-4">
            This server implements the <a href="https://modelcontextprotocol.io" target="_blank" class="text-blue-600 hover:underline font-medium">Model Context Protocol (MCP)</a> for <strong>@eodash/eodash</strong>.
          </p>
          <p class="text-sm text-slate-600 leading-relaxed">
            Coding agents and LLMs can query rich metadata, TypeScript props, reactive store flows, layout grids, and full usage snippets for all eodash built-in widgets and custom widget extensions.
          </p>
        </div>
        <div class="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
          <a href="https://github.com/eodash/eodash" target="_blank" class="inline-flex items-center text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-md transition-colors">
            GitHub Repository
          </a>
          <a href="https://eodash.github.io/eodash/" target="_blank" class="inline-flex items-center text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-md transition-colors">
            Official Documentation
          </a>
        </div>
      </div>

      <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between">
        <h2 class="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Dashboard Overview</h2>
        <div class="grid grid-cols-2 gap-4 my-auto">
          <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div class="text-2xl font-bold text-blue-400">${totalWidgets}</div>
            <div class="text-xs text-slate-400 mt-1">Built-in Widgets</div>
          </div>
          <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div class="text-2xl font-bold text-teal-400">4</div>
            <div class="text-xs text-slate-400 mt-1">Templates (Lite, Explore, Expert, Compare)</div>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-700/40 text-xs text-slate-400 flex justify-between items-center">
          <span>Grid System:</span>
          <span class="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded">12-Column Responsive</span>
        </div>
      </div>
    </div>

    <!-- Supported Tools -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-950 mb-4">Supported MCP Tools</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="border border-slate-100 bg-slate-50/50 rounded-lg p-4">
          <span class="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">list_widgets</span>
          <p class="text-xs text-slate-600 mt-2">List all built-in eodash widgets with category and store interactions.</p>
        </div>
        <div class="border border-slate-100 bg-slate-50/50 rounded-lg p-4">
          <span class="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">get_widget_details</span>
          <p class="text-xs text-slate-600 mt-2">Get full TypeScript props, defaults, store bindings, STAC extensions, and examples.</p>
        </div>
        <div class="border border-slate-100 bg-slate-50/50 rounded-lg p-4">
          <span class="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">get_custom_widget_guide</span>
          <p class="text-xs text-slate-600 mt-2">Guides and boilerplate for Web Component, Functional, and IFrame widgets.</p>
        </div>
        <div class="border border-slate-100 bg-slate-50/50 rounded-lg p-4">
          <span class="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">get_eodash_architecture</span>
          <p class="text-xs text-slate-600 mt-2">Comprehensive architecture docs: layout grid, templates, store states, and deployment.</p>
        </div>
      </div>
    </div>

    <!-- Available Widgets -->
    <div>
      <h2 class="text-lg font-semibold text-slate-950 mb-4">Available Widgets (${totalWidgets})</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${widgetCards}
      </div>
    </div>
  </main>

  <footer class="bg-slate-100 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p>&copy; ${new Date().getFullYear()} EOX IT Services GmbH & eodash contributors. Released under the MIT License.</p>
    </div>
  </footer>
</body>
</html>`;
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
