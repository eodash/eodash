import fs from "node:fs";
import path from "node:path";
import { inferReactiveStoreMetadata } from "./store-parser.js";

const KNOWN_TEMPLATE_DESCRIPTIONS = {
  lite: "Streamlined layout for static STAC Catalogs & public dissemination with minimal controls (Map, Header Tools, Layers, StacInfo, DatePicker). Recommended default for static catalogs.",
  explore:
    "Discovery layout for dynamic STAC APIs featuring an interactive background Map, LayerControl, and an ItemCatalog explorer drawer.",
  expert:
    "Power-user dashboard with comprehensive layer manipulation and full analysis tooling.",
  compare:
    "Dual-map side-by-side or split comparison mode with synchronized or independent layer sets and charts.",
};

export function buildArchitectureMetadata(repoRoot) {
  const inferredReactiveStore = inferReactiveStoreMetadata(repoRoot);
  const templatesDir = path.join(repoRoot, "templates");
  const discoveredTemplateFiles = fs.existsSync(templatesDir)
    ? fs
        .readdirSync(templatesDir)
        .filter(
          (f) => f.endsWith(".js") && f !== "index.js" && f !== "baseConfig.js",
        )
        .map((f) => path.basename(f, ".js"))
    : ["lite", "explore", "expert", "compare"];

  return {
    overview:
      "eodash is a modular earth observation dashboard builder designed to visualize STAC catalogs, time-series data, vector/raster layers, and OGC API Processes. It can run as a standalone Single Page App (SPA) or be embedded as a Web Component (<eo-dash>).",
    gridSystem: {
      columns: 12,
      notation:
        "x is 0-indexed column (0–11), y is 0-indexed unbounded row, w is column span (1–12), h is row span. Coordinates and spans accept numbers or responsive breakpoint strings 'mobile/tablet/desktop' (e.g. '12/9/10').",
      examples: [
        { label: "Full width sidebar", layout: { x: 0, y: 0, w: 3, h: 12 } },
        {
          label: "Responsive drawer",
          layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 12 },
        },
        { label: "Bottom time slider", layout: { x: 3, y: 10, w: 6, h: 2 } },
      ],
    },
    templateSystem: {
      description: `Templates compose dashboard layouts. eodash provides standard built-in templates: ${discoveredTemplateFiles.map((t) => `'${t}'`).join(", ")}. Custom templates can define static widgets, background widgets, loading animations, and dynamic functional widgets.`,
      builtInTemplates: discoveredTemplateFiles.map((name) => ({
        name,
        description:
          KNOWN_TEMPLATE_DESCRIPTIONS[name] ||
          `${name} dashboard template layout.`,
      })),
    },
    customWidgetSystem: {
      description:
        "eodash supports 3 types of widgets: 'internal' (built-in eodash widgets), 'web-component' (custom elements via dynamic import or CDN URL), and 'iframe' (embedded external web app / notebook). In addition, 'functional' is a dynamic wrapper (defineWidget: (selectedSTAC) => Widget | null) executed reactively when selected STAC indicator changes.",
      types: [
        {
          type: "web-component",
          description:
            "Loads standard Custom Element via ESM dynamic import function or CDN URL. Provides lifecycle hooks onMounted(el, store) and onUnmounted(el, store).",
        },
        {
          type: "internal",
          description: "Built-in eodash widget component registered by name.",
        },
        {
          type: "iframe",
          description:
            "Embeds external web application or notebook in sandboxed iframe.",
        },
      ],
    },
    reactiveStore: inferredReactiveStore,
  };
}
