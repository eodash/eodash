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
  min,
  max,
  sliderMin,
  sliderMax,
  defaultMin,
  defaultMax,
  colormap = "viridis",
  customColors,
  interactiveMinMax = true,
  maskBands = [],
} = {}) {
  const palette = customColors || (await getColormapRamp(colormap));
  const style = {};

  const effectiveDefaultMin = defaultMin ?? range?.[0] ?? min ?? 0;
  const effectiveDefaultMax = defaultMax ?? range?.[1] ?? max ?? 250;

  const effectiveSliderMin =
    sliderMin ??
    (effectiveDefaultMin < 0
      ? Math.round(effectiveDefaultMin * 1.5)
      : effectiveDefaultMin === 0
        ? 0
        : Math.round(effectiveDefaultMin * 0.5));

  const effectiveSliderMax =
    sliderMax ??
    (effectiveDefaultMax > 0
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
        min: effectiveDefaultMin,
        max: effectiveDefaultMax,
      };

      const normalizedExpression = [
        "/",
        ["-", ["band", bandIdx], ["var", "min"]],
        ["-", ["var", "max"], ["var", "min"]],
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

      style.legend = {
        domainProperties: ["min", "max"],
        range: palette,
        scaleType: "continuous",
      };

      style.jsonform = {
        type: "object",
        title: "Layer Data Settings",
        properties: {
          minmax: {
            title: "Value Range",
            type: "object",
            properties: {
              min: {
                type: "number",
                minimum: effectiveSliderMin,
                default: effectiveDefaultMin,
                format: "range",
              },
              max: {
                type: "number",
                maximum: effectiveSliderMax,
                default: effectiveDefaultMax,
                format: "range",
              },
            },
            format: "minmax",
          },
        },
      };

      const conditions = [[">", ["band", bandIdx], 0]];
      if (maskBands && maskBands.length > 0) {
        for (const mb of maskBands) {
          const varMin = mb.variableMin || `band${mb.band}min`;
          const varMax = mb.variableMax || `band${mb.band}max`;
          style.variables[varMin] = mb.min ?? 0;
          style.variables[varMax] = mb.max ?? 100;

          conditions.push([
            "between",
            ["band", mb.band],
            ["var", varMin],
            ["var", varMax],
          ]);

          const formKey = mb.formKey || `${varMin.replace(/min$/i, "")}range`;
          style.jsonform.properties[formKey] = {
            title: mb.title || `Band ${mb.band} Range`,
            type: "object",
            properties: {
              [varMin]: {
                type: "number",
                minimum: mb.sliderMin ?? mb.min ?? 0,
                maximum: mb.sliderMax ?? mb.max ?? 100,
                default: mb.min ?? 0,
                format: "range",
              },
              [varMax]: {
                type: "number",
                minimum: mb.sliderMin ?? mb.min ?? 0,
                maximum: mb.sliderMax ?? mb.max ?? 100,
                default: mb.max ?? 100,
                format: "range",
              },
            },
            format: "minmax",
          };
        }
      }

      const conditionExpr =
        conditions.length === 1 ? conditions[0] : ["all", ...conditions];

      style.color = [
        "case",
        conditionExpr,
        interpolateStops,
        ["color", 0, 0, 0, 0],
      ];
    } else {
      const rangeDelta = effectiveDefaultMax - effectiveDefaultMin || 1;
      const normalizedExpression = [
        "/",
        ["-", ["band", bandIdx], effectiveDefaultMin],
        rangeDelta,
      ];

      const interpolateStops = [
        "interpolate",
        ["linear"],
        normalizedExpression,
      ];
      if (palette.length > 1) {
        const step = 1.0 / (palette.length - 1);
        for (let i = 0; i < palette.length; i++) {
          interpolateStops.push(Number((step * i).toFixed(4)), palette[i]);
        }
      } else {
        interpolateStops.push(
          0,
          palette[0] || "#440154",
          1,
          palette[0] || "#fde725",
        );
      }

      const conditions = [[">", ["band", bandIdx], 0]];
      if (maskBands && maskBands.length > 0) {
        for (const mb of maskBands) {
          conditions.push([
            "between",
            ["band", mb.band],
            mb.min ?? 0,
            mb.max ?? 100,
          ]);
        }
      }

      const conditionExpr =
        conditions.length === 1 ? conditions[0] : ["all", ...conditions];

      style.color = [
        "case",
        conditionExpr,
        interpolateStops,
        ["color", 0, 0, 0, 0],
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
