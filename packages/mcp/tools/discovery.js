import { z } from "zod";
import { findExamples } from "../generators/examples.js";
import { validateCatalogConfig } from "../generators/validator.js";
import { instrumentTool } from "../helpers/logger.js";

/**
 * Register search, example discovery, and config validation tools
 */
export function registerDiscoveryTools(server) {
  // find_examples
  server.registerTool(
    "find_examples",
    {
      description:
        "SHOULD USE: Query verified working examples before authoring or modifying Vega-Lite charts, vector/raster layer styles (OpenLayers flatstyles), JSONForm/rasterform schemas, STAC collections/indicators, or processing request bodies. Provides snippets with exact eodash conventions, preventing invalid properties, broken legends, and style syntax errors.",
      inputSchema: z.object({
        category: z
          .enum([
            "all",
            "chart-vega",
            "vector-style",
            "raster-style",
            "rasterform",
            "jsonform",
            "process-body",
            "collection",
            "indicator",
            "stac-item",
            "dashboard-scaffold",
            "dashboard-config",
          ])
          .optional()
          .default("all")
          .describe(
            "Config category filter: 'chart-vega' (Vega-Lite), 'vector-style' (OpenLayers flatstyles & dynamic legends), 'raster-style' (colormaps, band math), 'rasterform' / 'jsonform' (UI forms), 'process-body' (geoprocessing payloads), 'collection' / 'indicator' / 'stac-item' (STAC catalog configs), 'dashboard-scaffold' / 'dashboard-config'.",
          ),
        query: z
          .string()
          .optional()
          .describe(
            "Search keywords, visual types, or mechanics. E.g., 'grouped-bar dropdown', 'dynamic legend boundTo', 'raster colormap', 'sentinel-2 band math'. Leave empty to list category highlights.",
          ),
        limit: z.number().optional().default(5).describe("Max results (1-20)"),
      }),
    },
    instrumentTool("find_examples", async (params) => {
      const results = findExamples(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }),
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
          .enum(["auto", "collection", "indicator"])
          .optional()
          .default("auto")
          .describe("Target schema type"),
      }),
    },
    instrumentTool("validate_catalog_config", async (params) => {
      const results = await validateCatalogConfig(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }),
  );
}
