import { z } from "zod";
import { generateLayerStyle } from "../../generators/style.js";

/**
 * Register generate_layer_style tool
 */
export function registerStyleGeneratorTool(server) {
  server.registerTool(
    "generate_layer_style",
    {
      description:
        "Generate OpenLayers FlatStyles (vector/raster COG) or eodash:rasterform definitions with legend and jsonform.",
      inputSchema: z.object({
        styleType: z
          .enum([
            "vector-flatstyle",
            "raster-flatstyle",
            "raster-webgl-flatstyle",
            "raster-cog",
            "rasterform",
          ])
          .describe("Target style type"),
        vectorConfig: z
          .object({
            geometryType: z
              .enum(["point", "polygon", "line"])
              .optional()
              .default("polygon")
              .describe("Geometry symbolizer type"),
            mode: z
              .enum(["single", "categorical", "continuous", "graduated"])
              .optional()
              .default("single")
              .describe("Coloring mode (single, categorical, continuous)"),
            attribute: z
              .string()
              .optional()
              .default("value")
              .describe("Feature property for data-driven styling"),
            colormap: z
              .string()
              .optional()
              .default("viridis")
              .describe("Colormap preset name"),
            colors: z
              .array(z.string())
              .optional()
              .describe("Color hex array"),
            categories: z
              .array(z.record(z.any()))
              .optional()
              .describe("Category mappings [{value, color, label?}]"),
            range: z
              .array(z.number())
              .optional()
              .describe("[min, max] data range"),
            fillColor: z.string().optional().describe("Fill color hex/rgba"),
            strokeColor: z
              .string()
              .optional()
              .describe("Stroke color hex/rgba"),
            strokeWidth: z.number().optional().describe("Stroke width (px)"),
            pointRadius: z.number().optional().describe("Point radius (px)"),
            tooltipFields: z
              .array(z.record(z.any()))
              .optional()
              .describe(
                "Tooltip fields [{id, title?, appendix?, decimals?}]",
              ),
            interactiveSliders: z
              .boolean()
              .optional()
              .default(false)
              .describe("Generate stroke width slider"),
          })
          .optional()
          .describe("Vector flatstyle options"),
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
              .describe("Raster rendering mode"),
            bands: z
              .array(z.number())
              .optional()
              .default([1])
              .describe("1-based band indices (e.g. [1] or [4,3,2])"),
            bandIndex: z
              .number()
              .optional()
              .describe("Band index (1-based)"),
            redBand: z.number().optional().describe("Red band index"),
            greenBand: z.number().optional().describe("Green band index"),
            blueBand: z.number().optional().describe("Blue band index"),
            range: z
              .array(z.number())
              .optional()
              .describe("[min, max] data range"),
            vmin: z.number().optional().describe("Min data value"),
            vmax: z.number().optional().describe("Max data value"),
            sliderMin: z
              .number()
              .optional()
              .describe("Slider track min bound"),
            sliderMax: z
              .number()
              .optional()
              .describe("Slider track max bound"),
            colormap: z
              .string()
              .optional()
              .describe("Colormap preset name"),
            customColors: z
              .array(z.string())
              .optional()
              .describe("Custom color ramp array"),
            interactiveMinMax: z
              .boolean()
              .optional()
              .default(true)
              .describe("Generate interactive min/max slider"),
          })
          .optional()
          .describe("Raster COG flatstyle options"),
        rasterWebglConfig: z
          .any()
          .optional()
          .describe("Alias for rasterConfig"),
        rasterformConfig: z
          .object({
            serviceType: z
              .enum(["titiler", "wms", "custom-xyz"])
              .optional()
              .default("titiler")
              .describe("Raster backend type"),
            colormaps: z
              .array(z.string())
              .optional()
              .describe("Colormap dropdown options"),
            defaultColormap: z
              .string()
              .optional()
              .default("viridis")
              .describe("Default active colormap"),
            vmin: z.number().optional().describe("Default min rescale value"),
            vmax: z.number().optional().describe("Default max rescale value"),
            sliderMin: z
              .number()
              .optional()
              .describe("Slider track min bound"),
            sliderMax: z
              .number()
              .optional()
              .describe("Slider track max bound"),
            hasRescale: z
              .boolean()
              .optional()
              .default(true)
              .describe("Include rescale slider"),
            hasMultiAssetBranching: z
              .boolean()
              .optional()
              .default(false)
              .describe("Include multi-asset branching form"),
            assets: z
              .array(z.record(z.any()))
              .optional()
              .describe(
                "Branching assets [{id, title, defaultVmin?, defaultVmax?}]",
              ),
          })
          .optional()
          .describe("Rasterform options for TiTiler/WMS/XYZ"),
        rasterFormConfig: z
          .any()
          .optional()
          .describe("Alias for rasterformConfig"),
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
}
