import { z } from "zod";
import { findExamples } from "../generators/examples.js";
import { validateCatalogConfig } from "../generators/validator.js";

/**
 * Register search, example discovery, and config validation tools
 */
export function registerDiscoveryTools(server) {
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
}
