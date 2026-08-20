import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMetadata } from "./generate-metadata.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const rootPkg = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"),
);

export const DEFAULT_STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
export const DEFAULT_BRAND_NAME = "EOxHub Demo Dashboard";

/**
 * Gets the current @eodash/eodash version from the root package.json
 */
export function getEodashVersion() {
  return `^${rootPkg.version}`;
}

/**
 * Loads cached metadata or rebuilds on-the-fly
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
 * Curated custom widget boilerplate and guides
 */
export const CUSTOM_WIDGET_GUIDES = {
  "web-component": {
    title: "Web Component Custom Widgets in eodash",
    description:
      "Wrap any Custom Element (e.g. from @eox/*, Leaflet, or vanilla Web Components) into an eodash widget slot.",
    lifecycleHooks: {
      onMounted: "(el, store) => void",
      onUnmounted: "(el, store) => void",
    },
    example: `
// In your custom widget definition or eodash.config.js
export default createEodash({
  template: {
    widgets: [
      {
        id: "my-custom-chart",
        title: "Custom Time Series",
        type: "web-component",
        layout: { x: 0, y: 6, w: 6, h: 6 },
        widget: {
          name: "my-custom-chart",
          // ESM import function or direct CDN bundle URL:
          import: () => import("./src/widgets/MyCustomChart.js"),
          properties: {
            theme: "dark",
            unit: "celsius",
          },
          onMounted: (el, store) => {
            console.log("Custom widget mounted:", el);
            // Listen to reactive store state
            el.addEventListener("range-changed", (e) => {
              store.states.currentUrl.value = e.detail.stacUrl;
            });
          },
          onUnmounted: (el, store) => {
            console.log("Cleaned up widget:", el);
          },
        },
      },
    ],
  },
});
`,
  },
  functional: {
    title: "Functional (Dynamic STAC-Driven) Widgets",
    description:
      "Define widgets dynamically as functions executed whenever the user selects a different STAC indicator or collection.",
    signature:
      "defineWidget: (selectedSTAC: STACCollection | null) => Widget | null",
    example: `
export default createEodash({
  template: {
    widgets: [
      {
        id: "dynamic-panel",
        layout: { x: 9, y: 0, w: 3, h: 8 },
        defineWidget: (selectedSTAC) => {
          if (!selectedSTAC) return null;

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

/**
 * Generates the HTML landing page for the MCP server Express dashboard
 */
export function generateLandingPage(widgets, _arch) {
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
        <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">v${rootPkg.version}</span>
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
      <h2 class="text-lg font-semibold text-slate-950 mb-4">Supported MCP Tools (6)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div class="border border-slate-100 bg-slate-50/50 rounded-lg p-4">
          <span class="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">scaffold_dashboard</span>
          <p class="text-xs text-slate-600 mt-2">Bootstrap complete SPA, VitePress narrative docs, or Web Component boilerplate.</p>
        </div>
        <div class="border border-slate-100 bg-slate-50/50 rounded-lg p-4">
          <span class="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">generate_eodash_config</span>
          <p class="text-xs text-slate-600 mt-2">Create valid, type-safe eodash configuration files with brand theme and templates.</p>
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
