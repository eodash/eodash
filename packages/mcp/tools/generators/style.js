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
          .enum(["vector-flatstyle", "raster-flatstyle", "rasterform"])
          .describe("Target style type"),
        vectorConfig: z
          .object({
            geometryType: z
              .enum(["point", "polygon", "line"])
              .optional()
              .default("polygon")
              .describe("Geometry symbolizer type"),
            mode: z
              .enum(["single", "categorical", "continuous"])
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
            colors: z.array(z.string()).optional().describe("Color hex array"),
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
            labelAttribute: z
              .string()
              .optional()
              .describe("Feature property to display as text label"),
            textColor: z
              .string()
              .optional()
              .describe("Text label color (hex/rgba)"),
            textFont: z
              .string()
              .optional()
              .describe("Text label font (e.g. 'bold 12px sans-serif')"),
            textOffsetX: z
              .number()
              .optional()
              .describe("Text label horizontal offset (px)"),
            textOffsetY: z
              .number()
              .optional()
              .describe("Text label vertical offset (px)"),
            textAlign: z
              .enum(["left", "center", "right", "start", "end"])
              .optional()
              .describe("Text label alignment"),
            tooltipFields: z
              .array(z.record(z.any()))
              .optional()
              .describe("Tooltip fields [{id, title?, appendix?, decimals?}]"),
            interactiveStrokeWidth: z
              .boolean()
              .optional()
              .describe("Generate reactive stroke width slider"),
            interactivePointRadius: z
              .boolean()
              .optional()
              .describe("Generate reactive point radius slider"),
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
            bandIndex: z.number().optional().describe("Band index (1-based)"),
            redBand: z.number().optional().describe("Red band index"),
            greenBand: z.number().optional().describe("Green band index"),
            blueBand: z.number().optional().describe("Blue band index"),
            range: z
              .array(z.number())
              .optional()
              .describe("[min, max] data range"),
            min: z.number().optional().describe("Min data value"),
            max: z.number().optional().describe("Max data value"),
            sliderMin: z.number().optional().describe("Slider track min bound"),
            sliderMax: z.number().optional().describe("Slider track max bound"),
            colormap: z.string().optional().describe("Colormap preset name"),
            customColors: z
              .array(z.string())
              .optional()
              .describe("Custom color ramp array"),
            interactiveMinMax: z
              .boolean()
              .optional()
              .default(true)
              .describe("Generate interactive min/max slider"),
            maskBands: z
              .array(
                z.object({
                  band: z.number().describe("Band index for masking"),
                  min: z.number().optional().describe("Min threshold value"),
                  max: z.number().optional().describe("Max threshold value"),
                  variableMin: z
                    .string()
                    .optional()
                    .describe("Min variable name"),
                  variableMax: z
                    .string()
                    .optional()
                    .describe("Max variable name"),
                  sliderMin: z.number().optional().describe("Slider min bound"),
                  sliderMax: z.number().optional().describe("Slider max bound"),
                  title: z.string().optional().describe("Slider group title"),
                }),
              )
              .optional()
              .describe("Multi-band threshold masking filters"),
          })
          .optional()
          .describe("Raster COG flatstyle options"),
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
            min: z.number().optional().describe("Default min rescale value"),
            max: z.number().optional().describe("Default max rescale value"),
            sliderMin: z.number().optional().describe("Slider track min bound"),
            sliderMax: z.number().optional().describe("Slider track max bound"),
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
                "Branching assets [{id, title, defaultMin?, defaultMax?}]",
              ),
          })
          .optional()
          .describe("Rasterform options for TiTiler/WMS/XYZ"),
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
