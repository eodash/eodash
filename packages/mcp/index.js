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
        "This MCP server provides tools to inspect, configure, and scaffold @eodash/eodash instances, widgets, layouts, styles, and STAC integrations. " +
        "NOTE: MCP generation tools (scaffold_dashboard, generate_eodash_config, generate_layer_style) generate code and file maps in-memory and do NOT write directly to the user's filesystem. When the user asks to create or scaffold a project or file, you MUST write the returned files/code to disk using your file-writing tools before presenting completion.",
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
        "List all built-in eodash widgets with their category, capability tags, summary, background capability, and prop count. Optionally filter by category, capability tag, or search query.",
      inputSchema: z.object({
        category: z
          .string()
          .optional()
          .describe(
            "Optional category filter: 'Visualization & Map', 'Catalog & Discovery', 'Filtering & Selection', 'Temporal Navigation', 'Analysis & Processing', 'Layout & Orchestration', 'Branding & Metadata'",
          ),
        tag: z
          .string()
          .optional()
          .describe(
            "Optional capability tag filter: 'map', 'time', 'filter', 'catalog', 'layer', 'chart', 'process', 'stac', etc.",
          ),
        search: z
          .string()
          .optional()
          .describe(
            "Optional free-text search across widget names, summaries, and capability tags.",
          ),
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
        "Get details for a specific eodash widget: full TypeScript props (types, schemas, defaults, descriptions), store interactions, supported STAC extensions, copy-pasteable example config, and markdown guide.",
      inputSchema: z.object({
        widgetName: z
          .string()
          .optional()
          .describe(
            "The name of the widget (e.g. 'EodashMap', 'EodashItemCatalog', 'EodashItemFilter', 'EodashLayerControl', 'EodashTimeSlider', 'EodashProcess', 'EodashChart', 'EodashStacInfo', 'EodashTools', 'EodashDatePicker', 'EodashLayoutSwitcher').",
          ),
        name: z.string().optional().describe("Alias for widgetName."),
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
          .describe(
            "Specific custom widget type guide to retrieve ('web-component', 'functional', 'iframe', 'eox-elements', or 'all').",
          ),
        widgetType: z
          .enum([
            "web-component",
            "functional",
            "iframe",
            "eox-elements",
            "all",
          ])
          .optional()
          .describe("Alias for type."),
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
        "Get architecture documentation of @eodash/eodash: grid system (12-column, breakpoints 'x/y/w/h'), built-in templates ('lite', 'explore', 'expert', 'compare'), reactive Pinia store states, and deployment modes (SPA vs <eo-dash> web component).",
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
        "Scaffold complete project boilerplate for an eodash dashboard: standalone SPA, VitePress narrative documentation, or embedded web component. Returns ready-to-write in-memory file dictionary (filePath -> fileContent). NOTE: This tool does NOT write to disk itself; you MUST use your local file writing tool to write each file in the returned 'files' map to disk under the project folder.",
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
          .default("lite")
          .describe(
            `Default eodash layout template (${availableTemplates.join(", ")}). Use 'lite' (default) for static STAC Catalogs, or 'explore' for dynamic STAC APIs.`,
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

  // generate_eodash_config
  server.registerTool(
    "generate_eodash_config",
    {
      description:
        "Generate a complete, type-safe eodash configuration (eodash.config.js / baseConfig.js) with STAC endpoint, brand styling, template selection (lite/explore/expert/compare), custom widget placements, and runtime options. Returns configuration code string (does not write to disk directly).",
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
          .default("lite")
          .describe(
            `Template layout preset (${availableTemplates.join(", ")}) or 'custom'. Use 'lite' (default) for static STAC Catalogs, or 'explore' for dynamic STAC APIs.`,
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

  // generate_layer_style
  server.registerTool(
    "generate_layer_style",
    {
      description:
        "Generate complete OpenLayers layer styles and visualization controls (vector flatstyles for GeoJSON/FlatGeobuf/MVT, raster flatstyles with 'color' expressions for COG/GeoTIFF single files, and dynamic raster forms). Always outputs and maintains complete style JSON definitions including 'color', 'variables', 'legend', and 'jsonform'.",
      inputSchema: z.object({
        styleType: z
          .enum([
            "vector-flatstyle",
            "raster-flatstyle",
            "raster-webgl-flatstyle",
            "raster-cog",
            "rasterform",
          ])
          .describe(
            "Style generator target type: 'vector-flatstyle' (OpenLayers Vector FlatStyle for vector & vector tile layers), 'raster-flatstyle' / 'raster-cog' (OpenLayers FlatStyle for COG/GeoTIFF client-side single file rendering), or 'rasterform' (eodash:rasterform for TiTiler/WMS/XYZ).",
          ),
        vectorConfig: z
          .object({
            geometryType: z
              .enum(["point", "polygon", "line"])
              .optional()
              .default("polygon")
              .describe("Geometry symbolizer type."),
            mode: z
              .enum(["single", "categorical", "graduated"])
              .optional()
              .default("single")
              .describe(
                "Coloring mode: 'single' (uniform color), 'categorical' (match expression by attribute), or 'graduated' (continuous linear interpolation).",
              ),
            attribute: z
              .string()
              .optional()
              .default("value")
              .describe("Feature property name for data-driven styling."),
            colormap: z
              .string()
              .optional()
              .default("viridis")
              .describe(
                "Colormap preset name (e.g. 'viridis', 'magma', 'plasma', 'spectral') for graduated styling.",
              ),
            colors: z
              .array(z.string())
              .optional()
              .describe(
                "Explicit color hex array for graduated styling (overrides colormap preset).",
              ),
            categories: z
              .array(
                z.object({
                  value: z.union([z.string(), z.number()]),
                  label: z.string().optional(),
                  color: z.string(),
                }),
              )
              .optional()
              .describe("Category value-to-color mapping objects."),
            range: z
              .array(z.number())
              .optional()
              .describe(
                "Min and max values [min, max] or [vmin, vmax] for graduated styling domain.",
              ),
            min: z
              .number()
              .optional()
              .describe("Minimum value for graduated styling domain."),
            max: z
              .number()
              .optional()
              .describe("Maximum value for graduated styling domain."),
            vmin: z
              .number()
              .optional()
              .describe("Minimum value (alias for min)."),
            vmax: z
              .number()
              .optional()
              .describe("Maximum value (alias for max)."),
            fillColor: z
              .string()
              .optional()
              .describe("Fill color for single mode polygons/points."),
            strokeColor: z
              .string()
              .optional()
              .describe(
                "Stroke color for lines, polygon borders, or point circle borders.",
              ),
            strokeWidth: z
              .number()
              .optional()
              .describe("Stroke width in pixels."),
            pointRadius: z
              .number()
              .optional()
              .describe("Point circle radius in pixels."),
            tooltipFields: z
              .array(
                z.object({
                  id: z.string().describe("Feature property ID to display."),
                  title: z.string().optional().describe("Tooltip label title."),
                  appendix: z
                    .string()
                    .optional()
                    .describe("Suffix unit (e.g. ' µg/m³', ' %')."),
                  decimals: z
                    .number()
                    .optional()
                    .describe("Decimal rounding precision."),
                }),
              )
              .optional()
              .describe("Interactive tooltip configuration fields."),
            interactiveSliders: z
              .boolean()
              .optional()
              .default(false)
              .describe(
                "If true, generates dynamic style variables and jsonform sliders for strokeWidth in layer control.",
              ),
          })
          .optional()
          .describe("Options for 'vector-flatstyle' generation."),
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
              .describe(
                "Raster rendering mode: 'single-band-normalized' / 'single-band' (normalized float band with colormap), 'rgb-composite' / 'rgb' (3-band true color / false color composite), or 'band-ratio-index' (normalized difference index math).",
              ),
            bands: z
              .array(z.number())
              .optional()
              .default([1])
              .describe(
                "1-based band index array (e.g. [1] for single band, [4,3,2] for RGB, [8,4] for NDVI).",
              ),
            bandIndex: z
              .number()
              .optional()
              .describe("Single band index (1-based, default: 1)."),
            redBand: z
              .number()
              .optional()
              .describe("Red channel band index (1-based, default: 4)."),
            greenBand: z
              .number()
              .optional()
              .describe("Green channel band index (1-based, default: 3)."),
            blueBand: z
              .number()
              .optional()
              .describe("Blue channel band index (1-based, default: 2)."),
            range: z
              .array(z.number())
              .optional()
              .describe("Min and max data range [vmin, vmax] or [min, max]."),
            vmin: z
              .number()
              .optional()
              .describe("Initial/default minimum data value (default: 0)."),
            vmax: z
              .number()
              .optional()
              .describe("Initial/default maximum data value (default: 250)."),
            min: z
              .number()
              .optional()
              .describe("Minimum data value (alias for vmin)."),
            max: z
              .number()
              .optional()
              .describe("Maximum data value (alias for vmax)."),
            defaultMin: z
              .number()
              .optional()
              .describe("Explicit default minimum value."),
            defaultMax: z
              .number()
              .optional()
              .describe("Explicit default maximum value."),
            sliderMin: z
              .number()
              .optional()
              .describe(
                "Explicit slider track lower bound. If omitted, computed dynamically (0 or ~1.5x of negative defaultMin).",
              ),
            sliderMax: z
              .number()
              .optional()
              .describe(
                "Explicit slider track upper bound. If omitted, computed dynamically as ~1.5x headroom over defaultMax (e.g. 250 -> 375).",
              ),
            colorMap: z
              .string()
              .optional()
              .describe(
                "Colormap preset name (supports viridis, magma, plasma, inferno, cividis, spectral, turbo, rainbow, etc. from eurodatacube colormaps).",
              ),
            colormap: z
              .string()
              .optional()
              .describe("Colormap preset name (alias for colorMap)."),
            customColors: z
              .array(z.string())
              .optional()
              .describe("Custom color ramp array overriding preset colormap."),
            interactiveMinMax: z
              .boolean()
              .optional()
              .default(true)
              .describe(
                "If true, generates variables { vmin, vmax }, jsonform minmax slider, and domainProperties legend binding.",
              ),
          })
          .optional()
          .describe(
            "Options for raster flatstyle (COG / single GeoTIFF) generation.",
          ),
        rasterWebglConfig: z
          .any()
          .optional()
          .describe("Alias for rasterConfig."),
        rasterformConfig: z
          .object({
            serviceType: z
              .enum(["titiler", "wms", "custom-xyz"])
              .optional()
              .default("titiler")
              .describe("Raster service backend type."),
            colormaps: z
              .array(z.string())
              .optional()
              .describe("List of supported colormaps in the dropdown."),
            colormapOptions: z
              .array(z.string())
              .optional()
              .describe(
                "List of supported colormaps in the dropdown (alias for colormaps).",
              ),
            defaultColormap: z
              .string()
              .optional()
              .default("viridis")
              .describe("Default active colormap."),
            vmin: z
              .number()
              .optional()
              .describe("Default minimum value for rescale slider."),
            vmax: z
              .number()
              .optional()
              .describe("Default maximum value for rescale slider."),
            min: z
              .number()
              .optional()
              .describe("Minimum value (alias for vmin)."),
            max: z
              .number()
              .optional()
              .describe("Maximum value (alias for vmax)."),
            defaultMin: z
              .number()
              .optional()
              .describe("Default minimum slider value."),
            defaultMax: z
              .number()
              .optional()
              .describe("Default maximum slider value."),
            sliderMin: z
              .number()
              .optional()
              .describe(
                "Explicit slider track lower bound. If omitted, computed dynamically (0 or ~1.5x of negative defaultMin).",
              ),
            sliderMax: z
              .number()
              .optional()
              .describe(
                "Explicit slider track upper bound. If omitted, computed dynamically as ~1.5x headroom over defaultMax (e.g. 250 -> 375).",
              ),
            hasRescale: z
              .boolean()
              .optional()
              .default(true)
              .describe(
                "If true, generates rescale template parameter with removeProperties: ['vminmax'].",
              ),
            hasMultiAssetBranching: z
              .boolean()
              .optional()
              .default(false)
              .describe(
                "If true, generates multi-asset oneOf branching form with 'keep_oneof_values': false.",
              ),
            assets: z
              .array(
                z.object({
                  id: z.string(),
                  title: z.string(),
                  defaultVmin: z.number().optional(),
                  defaultVmax: z.number().optional(),
                }),
              )
              .optional()
              .describe("Asset options for multi-asset branching oneOf forms."),
          })
          .optional()
          .describe("Options for 'rasterform' (TiTiler/WMS/XYZ) generation."),
        rasterFormConfig: z
          .any()
          .optional()
          .describe("Alias for rasterformConfig."),
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
        "Search and discover working eodash dashboard examples, layer styles, and catalog configurations.",
      inputSchema: z.object({
        query: z
          .string()
          .optional()
          .describe(
            "Free-text search terms (e.g. 'titiler rescale', 'cmems wmts', 'ice charts match', 'bounding-box drawtools', 'in situ air quality points', 'ndvi band math').",
          ),
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
          .describe("Filter snippets by specific configuration category."),
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
          .describe("Filter snippets by geospatial data type."),
        feature: z
          .string()
          .optional()
          .describe(
            "Filter by specific feature capability (e.g. 'legend', 'tooltip', 'drawtools', 'branching-oneof', 'threshold-filter', 'time-series', 'roles').",
          ),
        limit: z
          .number()
          .optional()
          .default(5)
          .describe(
            "Maximum number of examples to return (default 5, max 20).",
          ),
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
        "Validate EODash catalog configurations (collection or indicator JSON files) against official eodash schemas and custom business rules (e.g., verifying 'Style' is a URL string, catching invalid 'Resources[].Flatstyle', checking JSON-Editor rasterform branching options).",
      inputSchema: z.object({
        config: z
          .union([z.string(), z.record(z.any())])
          .describe(
            "Collection or indicator configuration as a JSON string or parsed JSON object.",
          ),
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
          .describe(
            "Target schema type: 'auto' (auto-detects between collection and indicator), 'collection' / 'catalog-collection' (EODash collection config with Name, Title, Description, Resources), or 'indicator' / 'catalog-indicator' (EODash indicator config with Name, Title, Indicators/Collections).",
          ),
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
