import { cachedColormaps, FALLBACK_PALETTES } from "./colormaps.js";

/**
 * Generate OpenLayers Vector FlatStyle for vector & vector tile layers
 */
export function generateVectorFlatStyle({
  geometryType = "polygon",
  mode = "single",
  attribute = "value",
  colormap = "viridis",
  colors = [],
  categories = [],
  range = [0, 100],
  min,
  max,
  vmin,
  vmax,
  fillColor = "rgba(0, 113, 194, 0.6)",
  strokeColor = "#ffffff",
  strokeWidth = 1.5,
  pointRadius = 6,
  tooltipFields = [],
  interactiveSliders = false,
} = {}) {
  const isPoint = geometryType === "point";
  const isLine = geometryType === "line";

  /** @type {Record<string, any>} */
  const style = {};
  /** @type {Record<string, any>} */
  const variables = {};
  /** @type {Record<string, any>} */
  let jsonform = null;
  /** @type {any} */
  let legend = null;

  if (interactiveSliders) {
    variables.strokeWidth = strokeWidth;

    jsonform = {
      type: "object",
      title: "Layer Style Configuration",
      properties: {
        strokeWidth: {
          type: "number",
          title: "Stroke Width",
          minimum: 0,
          maximum: 10,
          step: 0.5,
          default: strokeWidth,
          format: "range",
        },
      },
    };
  }

  // 1. Single Mode
  if (mode === "single") {
    if (isPoint) {
      style["circle-radius"] = pointRadius;
      style["circle-fill-color"] = fillColor;
      style["circle-stroke-color"] = strokeColor;
      style["circle-stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    } else if (isLine) {
      style["stroke-color"] = strokeColor || fillColor;
      style["stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    } else {
      // Polygon
      style["fill-color"] = fillColor;
      style["stroke-color"] = strokeColor;
      style["stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    }

    legend = {
      domain: ["Feature"],
      range: [fillColor || strokeColor],
      scaleType: "categorical",
    };
  }

  // 2. Categorical Match Mode
  if (mode === "categorical") {
    const cats =
      categories.length > 0
        ? categories
        : [
            { value: "A", label: "Category A", color: "#1f77b4" },
            { value: "B", label: "Category B", color: "#ff7f0e" },
            { value: "C", label: "Category C", color: "#2ca02c" },
          ];

    const matchExpression = ["match", ["get", attribute]];
    for (const cat of cats) {
      matchExpression.push(cat.value, cat.color);
    }
    matchExpression.push("rgba(128, 128, 128, 0.5)"); // Fallback color

    if (isPoint) {
      style["circle-radius"] = pointRadius;
      style["circle-fill-color"] = matchExpression;
      style["circle-stroke-color"] = strokeColor;
      style["circle-stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    } else if (isLine) {
      style["stroke-color"] = matchExpression;
      style["stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    } else {
      style["fill-color"] = matchExpression;
      style["stroke-color"] = strokeColor;
      style["stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    }

    legend = {
      domain: cats.map((c) => c.label || String(c.value)),
      range: cats.map((c) => c.color),
      scaleType: "categorical",
    };
  }

  // 3. Graduated / Continuous Mode (Linear Interpolation)
  if (mode === "graduated" || mode === "continuous") {
    let palette = colors;
    if (!palette || palette.length <= 1) {
      palette =
        cachedColormaps?.[colormap] ||
        FALLBACK_PALETTES[colormap] ||
        FALLBACK_PALETTES.viridis;
    }
    const effectiveRange =
      range && range.length === 2
        ? range
        : [vmin ?? min ?? 0, vmax ?? max ?? 100];
    const [minVal, maxVal] = effectiveRange;
    const step = (maxVal - minVal) / (palette.length - 1);

    const interpolateExpression = [
      "interpolate",
      ["linear"],
      ["get", attribute],
    ];
    for (let i = 0; i < palette.length; i++) {
      const val = minVal + step * i;
      interpolateExpression.push(Number(val.toFixed(2)), palette[i]);
    }

    if (isPoint) {
      style["circle-radius"] = pointRadius;
      style["circle-fill-color"] = interpolateExpression;
      style["circle-stroke-color"] = strokeColor;
      style["circle-stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    } else if (isLine) {
      style["stroke-color"] = interpolateExpression;
      style["stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    } else {
      style["fill-color"] = interpolateExpression;
      style["stroke-color"] = strokeColor;
      style["stroke-width"] = interactiveSliders
        ? ["var", "strokeWidth"]
        : strokeWidth;
    }

    legend = {
      domain: [minVal, maxVal],
      range: palette,
      scaleType: "continuous",
    };
  }

  const result = {
    ...style,
  };

  if (Object.keys(variables).length > 0) {
    result.variables = variables;
  }
  if (jsonform) {
    result.jsonform = jsonform;
  }
  if (legend) {
    result.legend = legend;
  }
  if (tooltipFields && tooltipFields.length > 0) {
    result.tooltip = tooltipFields;
  }

  return result;
}
