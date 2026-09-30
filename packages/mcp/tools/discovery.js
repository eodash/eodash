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
        "Search and discover working eodash examples, layer styles, charts, and collection configs.",
      inputSchema: z.object({
        query: z
          .string()
          .optional()
          .describe("Search keywords matching title, tags, or description"),
        category: z
          .enum([
            "all",
            "chart-vega",
            "vector-flatstyle",
            "raster-flatstyle",
            "rasterform",
            "jsonform",
            "collection",
            "indicator",
            "stac-item",
            "dashboard-scaffold",
            "dashboard-config",
          ])
          .optional()
          .default("all")
          .describe("Config category filter"),
        limit: z.number().optional().default(5).describe("Max results (1-20)"),
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
          .enum(["auto", "collection", "indicator"])
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
