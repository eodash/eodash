import { z } from "zod";
import { scaffoldDashboard } from "../../generators/dashboard.js";
import {
  DEFAULT_STAC_ENDPOINT,
  getAvailableTemplates,
} from "../../helpers.js";

/**
 * Register scaffold_dashboard tool
 */
export function registerDashboardScaffoldTool(server) {
  const availableTemplates = getAvailableTemplates();
  const templateEnum =
    availableTemplates.length >= 2 ? z.enum(availableTemplates) : z.string();

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
}
