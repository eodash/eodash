import { z } from "zod";
import { CUSTOM_WIDGET_GUIDES } from "../helpers.js";

/**
 * Register architecture documentation tools
 */
export function registerArchitectureTools(server, architectureData) {
  // get_custom_widget_guide
  server.registerTool(
    "get_custom_widget_guide",
    {
      description:
        "Get guide and code templates for creating custom eodash widgets.",
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
          .describe("Custom widget type"),
        widgetType: z
          .enum([
            "web-component",
            "functional",
            "iframe",
            "eox-elements",
            "all",
          ])
          .optional()
          .describe("Alias for type"),
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
        "Get eodash architecture docs: grid layout, templates, Pinia store, deployment modes.",
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
          .describe("Architecture topic"),
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
}
