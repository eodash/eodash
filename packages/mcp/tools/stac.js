import { z } from "zod";
import { buildStacMap } from "../generators/stac-map.js";

/**
 * Register STAC mapping tools
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 */
export function registerStacTools(server) {
  server.registerTool(
    "generate_map_from_stac",
    {
      description:
        "Build complete EOxMap layer configuration and map view parameters (layers, center, zoom, projection, projections, item, datetime, timeControl, legends) from a STAC catalog, indicator, collection URL, STAC API endpoint, or in-memory STAC object.\n\n" +
        "CAPABILITIES:\n" +
        "- Auto-infers document hierarchy: STAC Catalog, Indicator Collection, Data Collection, or STAC Item.\n" +
        "- When given a STAC Catalog: filters child indicators using fuzzy search (`query`) or exact ID (`collection_id`).\n" +
        "- Reads GeoParquet mirrors (items.parquet), TiTiler COGs, WMS, WMTS, and XYZ endpoints.\n" +
        "- Extracts styling legends from STAC metadata (eox:colorlegend, rasterform, style legend).\n" +
        "- Aggregates date ranges into `timeControl` (availableDates, minDate, maxDate) for time-slider widgets.\n\n" +
        "LIMITATIONS:\n" +
        "- NO IMAGE RENDERING: Outputs OpenLayers/EOxMap JSON layer configuration; does NOT download tiles or return image pixels.\n" +
        "- AMBIGUITY: If a catalog query matches multiple indicators closely, returns error with structured `candidates` array; retry with `collection_id`.",
      inputSchema: z
        .object({
          url: z
            .string()
            .optional()
            .describe(
              "STAC catalog URL, collection URL, indicator URL, or STAC API endpoint. Either 'url' or 'stac_object' must be provided. The tool will auto-infer catalog/indicator/collection types and handle child links.",
            ),
          stac_object: z
            .record(z.any())
            .optional()
            .describe(
              "Pre-fetched STAC JSON document (Catalog, Collection, Indicator, or Item). Either 'url' or 'stac_object' must be provided. Use this when the STAC content is already loaded in memory.",
            ),
          query: z
            .string()
            .optional()
            .describe(
              "Search term (name, title, tags, themes, description) to select an indicator from a STAC catalog (e.g. 'Carbon Dioxide', 'CO2', 'NO2'). If ambiguous, tool returns candidate list.",
            ),
          collection_id: z
            .string()
            .optional()
            .describe(
              "Specific collection ID or code to select from a STAC catalog (e.g. 'N2_CO2_mean')",
            ),
          datetime: z
            .string()
            .optional()
            .describe(
              "ISO 8601 date or datetime string (e.g. '2024-06-01T00:00:00Z'). If omitted, resolves the latest date from the collection.",
            ),
          bbox: z
            .array(z.number())
            .length(4)
            .optional()
            .describe(
              "Bounding box [minX, minY, maxX, maxY] in EPSG:4326 (WGS84 degrees)",
            ),
          viewProjection: z
            .string()
            .optional()
            .describe(
              "Desired map view projection (e.g. 'EPSG:4326', 'EPSG:3035'). Defaults to STAC metadata projection or 'EPSG:3857'.",
            ),
          rasterEndpoint: z
            .string()
            .optional()
            .describe("Base URL for TiTiler raster tile rendering endpoint"),
          api: z
            .boolean()
            .optional()
            .describe(
              "Explicitly specify whether the STAC endpoint is a dynamic STAC API (true) or static catalog (false). Defaults to auto-inferred from URL (.json -> static).",
            ),
        })
        .refine((data) => Boolean(data.url || data.stac_object), {
          message: "Either 'url' or 'stac_object' must be provided.",
          path: ["url"],
        }),
    },
    async (params) => {
      try {
        const result = await buildStacMap(params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        if (err?.candidates) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: "Ambiguous query",
                    message: err.message,
                    candidates: err.candidates,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to build STAC map configuration: ${err?.message || String(err)}`,
            },
          ],
        };
      }
    },
  );
}
