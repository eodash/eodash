import { getColormapRamp } from "./colormaps.js";

/**
 * Generate OpenLayers Raster FlatStyle for GeoTIFF / COG layers
 */
export async function generateRasterFlatStyle({
  mode = "single-band-normalized",
  bands = [1],
  bandIndex,
  redBand,
  greenBand,
  blueBand,
  range,
  vmin,
  vmax,
  min,
  max,
  sliderMin,
  sliderMax,
  defaultMin,
  defaultMax,
  colorMap,
  colormap,
  customColors,
  interactiveMinMax = true,
} = {}) {
  const effectiveColormap = colormap || colorMap || "viridis";
  const palette = customColors || (await getColormapRamp(effectiveColormap));
  const style = {};

  const effectiveDefaultMin = defaultMin ?? range?.[0] ?? vmin ?? min ?? 0;
  const effectiveDefaultMax = defaultMax ?? range?.[1] ?? vmax ?? max ?? 250;

  const effectiveSliderMin =
    sliderMin ??
    (min !== undefined && vmin !== undefined && min < vmin
      ? min
      : effectiveDefaultMin < 0
        ? Math.round(effectiveDefaultMin * 1.5)
        : effectiveDefaultMin === 0
          ? 0
          : Math.round(effectiveDefaultMin * 0.5));

  const effectiveSliderMax =
    sliderMax ??
    (max !== undefined && vmax !== undefined && max > vmax
      ? max
      : effectiveDefaultMax > 0
        ? Math.round(effectiveDefaultMax * 1.5)
        : effectiveDefaultMax === 0
          ? 100
          : Math.round(effectiveDefaultMax * 0.5));

  const effectiveMode =
    mode === "single-band" || mode === "single"
      ? "single-band-normalized"
      : mode === "rgb"
        ? "rgb-composite"
        : mode;

  // 1. Single Band Normalized mode
  if (effectiveMode === "single-band-normalized") {
    const bandIdx = bandIndex ?? bands[0] ?? 1;

    if (interactiveMinMax) {
      style.variables = {
        vmin: effectiveDefaultMin,
        vmax: effectiveDefaultMax,
      };

      const normalizedExpression = [
        "/",
        ["-", ["band", bandIdx], ["var", "vmin"]],
        ["-", ["var", "vmax"], ["var", "vmin"]],
      ];

      const interpolateStops = [
        "interpolate",
        ["linear"],
        normalizedExpression,
      ];
      const step = 1.0 / (palette.length - 1);
      for (let i = 0; i < palette.length; i++) {
        interpolateStops.push(Number((step * i).toFixed(4)), palette[i]);
      }

      style.color = [
        "case",
        ["==", ["band", bandIdx], 0],
        [0, 0, 0, 0], // Transparent nodata
        interpolateStops,
      ];

      style.legend = {
        domainProperties: ["vmin", "vmax"],
        range: palette,
        scaleType: "continuous",
      };

      style.jsonform = {
        type: "object",
        title: "Layer Data Settings",
        properties: {
          vminmax: {
            title: "Value Range",
            type: "object",
            properties: {
              vmin: {
                type: "number",
                minimum: effectiveSliderMin,
                maximum: effectiveSliderMax,
                default: effectiveDefaultMin,
                format: "range",
              },
              vmax: {
                type: "number",
                minimum: effectiveSliderMin,
                maximum: effectiveSliderMax,
                default: effectiveDefaultMax,
                format: "range",
              },
            },
            format: "minmax",
          },
        },
      };
    } else {
      const normalizedExpression = [
        "/",
        ["-", ["band", bandIdx], effectiveDefaultMin],
        effectiveDefaultMax - effectiveDefaultMin,
      ];

      const interpolateStops = [
        "interpolate",
        ["linear"],
        normalizedExpression,
      ];
      const step = 1.0 / (palette.length - 1);
      for (let i = 0; i < palette.length; i++) {
        interpolateStops.push(Number((step * i).toFixed(4)), palette[i]);
      }

      style.color = [
        "case",
        ["==", ["band", bandIdx], 0],
        [0, 0, 0, 0],
        interpolateStops,
      ];

      style.legend = {
        domain: [effectiveDefaultMin, effectiveDefaultMax],
        range: palette,
        scaleType: "continuous",
      };
    }
  }

  // 2. RGB Composite mode
  if (effectiveMode === "rgb-composite") {
    const rBand = redBand ?? bands[0] ?? 1;
    const gBand = greenBand ?? bands[1] ?? 2;
    const bBand = blueBand ?? bands[2] ?? 3;
    const divisor = effectiveDefaultMax || 255;

    style.variables = {
      bandDivisor: divisor,
    };

    style.color = [
      "case",
      ["==", ["band", rBand], 0],
      [0, 0, 0, 0],
      [
        "array",
        ["/", ["band", rBand], ["var", "bandDivisor"]],
        ["/", ["band", gBand], ["var", "bandDivisor"]],
        ["/", ["band", bBand], ["var", "bandDivisor"]],
        1,
      ],
    ];

    style.jsonform = {
      type: "object",
      title: "RGB Scaling Settings",
      properties: {
        bandDivisor: {
          type: "number",
          title: "Band Divisor (Brightness)",
          minimum: 1,
          maximum: 10000,
          default: divisor,
          format: "range",
        },
      },
    };
  }

  // 3. Band Ratio Index mode (e.g. NDVI, NDWI)
  if (mode === "band-ratio-index") {
    const nirBand = bands[0] || 8;
    const redBand = bands[1] || 4;

    const diff = ["-", ["band", nirBand], ["band", redBand]];
    const sum = ["+", ["band", nirBand], ["band", redBand]];
    const indexExpr = ["/", diff, sum];

    const interpolateStops = ["interpolate", ["linear"], indexExpr];
    const minVal = -1.0;
    const maxVal = 1.0;
    const step = (maxVal - minVal) / (palette.length - 1);
    for (let i = 0; i < palette.length; i++) {
      interpolateStops.push(Number((minVal + step * i).toFixed(2)), palette[i]);
    }

    style.color = ["case", ["==", sum, 0], [0, 0, 0, 0], interpolateStops];

    style.legend = {
      domain: [-1, 1],
      range: palette,
      scaleType: "continuous",
    };
  }

  return style;
}

/** Alias for generateRasterFlatStyle */
export const generateRasterWebglStyle = generateRasterFlatStyle;
