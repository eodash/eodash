import { z } from "zod";
import { generateEodashConfig } from "../../generators/config.js";
import {
  DEFAULT_STAC_ENDPOINT,
  getAvailableTemplates,
} from "../../helpers.js";

/**
 * Register generate_eodash_config tool
 */
export function registerConfigGeneratorTool(server) {
  const availableTemplates = getAvailableTemplates();
  const configTemplateEnum =
    availableTemplates.length >= 1
      ? z.enum([...availableTemplates, "custom"])
      : z.string();

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
}
