import { z } from "zod";

/**
 * Register widget discovery and inspection tools
 */
export function registerWidgetTools(server, widgetsData) {
  // list_widgets
  server.registerTool(
    "list_widgets",
    {
      description:
        "List built-in eodash widgets with capability tags, summaries, prop counts, and store interactions.",
      inputSchema: z.object({
        category: z.string().optional().describe("Filter by category"),
        tag: z
          .string()
          .optional()
          .describe(
            "Filter by tag (map, time, filter, catalog, layer, chart, process, stac)",
          ),
        search: z.string().optional().describe("Free-text search query"),
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
        "Get details for a specific eodash widget: props, store interactions, STAC extensions, config example, and guide.",
      inputSchema: z.object({
        widgetName: z
          .string()
          .optional()
          .describe("Widget name (e.g. EodashMap, EodashItemCatalog)"),
        name: z.string().optional().describe("Alias for widgetName"),
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
}
