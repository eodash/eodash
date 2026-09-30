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
  fillColor = "rgba(0, 113, 194, 0.6)",
  strokeColor = "#ffffff",
  strokeWidth = 1.5,
  pointRadius = 6,
  tooltipFields = [],
  interactiveSliders = false,
  interactiveStrokeWidth = false,
  interactivePointRadius = false,
  labelAttribute,
  labelField,
  textColor = "#111111",
  textFont = "bold 12px sans-serif",
  textOffsetX = 10,
  textOffsetY = 0,
  textAlign = "left",
} = {}) {
  const isPoint = geometryType === "point";
  const isLine = geometryType === "line";
  const hasInteractiveStroke = interactiveSliders || interactiveStrokeWidth;
  const hasInteractiveRadius =
    isPoint && (interactiveSliders || interactivePointRadius);
  const effectiveLabelAttr = labelAttribute || labelField;

  /** @type {Record<string, any>} */
  const style = {};
  /** @type {Record<string, any>} */
  const variables = {};
  /** @type {Record<string, any>} */
  const formProperties = {};
  /** @type {any} */
  let legend = null;

  if (hasInteractiveStroke) {
    variables.strokeWidth = strokeWidth;
    formProperties.strokeWidth = {
      type: "number",
      title: "Stroke Width (px)",
      minimum: 0,
      maximum: 15,
      step: 0.5,
      default: strokeWidth,
      format: "range",
    };
  }

  if (hasInteractiveRadius) {
    variables.pointRadius = pointRadius;
    formProperties.pointRadius = {
      type: "number",
      title: "Point Radius (px)",
      minimum: 1,
      maximum: 30,
      step: 1,
      default: pointRadius,
      format: "range",
    };
  }

  const effectiveRadius = hasInteractiveRadius
    ? ["var", "pointRadius"]
    : pointRadius;
  const effectiveStrokeWidth = hasInteractiveStroke
    ? ["var", "strokeWidth"]
    : strokeWidth;

  // 1. Single Mode
  if (mode === "single") {
    if (isPoint) {
      style["circle-radius"] = effectiveRadius;
      style["circle-fill-color"] = fillColor;
      style["circle-stroke-color"] = strokeColor;
      style["circle-stroke-width"] = effectiveStrokeWidth;
    } else if (isLine) {
      style["stroke-color"] = strokeColor || fillColor;
      style["stroke-width"] = effectiveStrokeWidth;
    } else {
      // Polygon
      style["fill-color"] = fillColor;
      style["stroke-color"] = strokeColor;
      style["stroke-width"] = effectiveStrokeWidth;
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
      matchExpression.push(cat.value, cat.color || "rgba(128, 128, 128, 0.5)");
    }
    matchExpression.push("rgba(128, 128, 128, 0.5)"); // Fallback color

    if (isPoint) {
      style["circle-radius"] = effectiveRadius;
      style["circle-fill-color"] = matchExpression;
      style["circle-stroke-color"] = strokeColor;
      style["circle-stroke-width"] = effectiveStrokeWidth;
    } else if (isLine) {
      style["stroke-color"] = matchExpression;
      style["stroke-width"] = effectiveStrokeWidth;
    } else {
      style["fill-color"] = matchExpression;
      style["stroke-color"] = strokeColor;
      style["stroke-width"] = effectiveStrokeWidth;
    }

    legend = {
      domain: cats.map((c) => c.label || String(c.value)),
      range: cats.map((c) => c.color || "rgba(128, 128, 128, 0.5)"),
      scaleType: "categorical",
    };
  }

  // 3. Continuous Mode (Linear Interpolation)
  if (mode === "continuous") {
    let palette = colors;
    if (!palette || palette.length <= 1) {
      palette =
        cachedColormaps?.[colormap] ||
        FALLBACK_PALETTES[colormap] ||
        FALLBACK_PALETTES.viridis;
    }
    const effectiveRange =
      range && range.length === 2 ? range : [min ?? 0, max ?? 100];
    const [minVal, maxVal] = effectiveRange;
    const rangeDelta = maxVal - minVal || 1;
    const step = palette.length > 1 ? rangeDelta / (palette.length - 1) : 0;

    const interpolateExpression = [
      "interpolate",
      ["linear"],
      ["get", attribute],
    ];
    if (palette.length > 1) {
      for (let i = 0; i < palette.length; i++) {
        const val = minVal + step * i;
        interpolateExpression.push(Number(val.toFixed(2)), palette[i]);
      }
    } else {
      interpolateExpression.push(
        minVal,
        palette[0] || "#440154",
        maxVal,
        palette[0] || "#fde725",
      );
    }

    if (isPoint) {
      style["circle-radius"] = effectiveRadius;
      style["circle-fill-color"] = interpolateExpression;
      style["circle-stroke-color"] = strokeColor;
      style["circle-stroke-width"] = effectiveStrokeWidth;
    } else if (isLine) {
      style["stroke-color"] = interpolateExpression;
      style["stroke-width"] = effectiveStrokeWidth;
    } else {
      style["fill-color"] = interpolateExpression;
      style["stroke-color"] = strokeColor;
      style["stroke-width"] = effectiveStrokeWidth;
    }

    legend = {
      domain: [minVal, maxVal],
      range: palette,
      scaleType: "continuous",
    };
  }

  // Text Symbolizer (Labels)
  if (effectiveLabelAttr) {
    style["text-value"] = ["to-string", ["get", effectiveLabelAttr]];
    style["text-font"] = textFont;
    style["text-fill-color"] = textColor;
    style["text-offset-x"] = textOffsetX;
    style["text-offset-y"] = textOffsetY;
    style["text-align"] = textAlign;
  }

  const result = {
    ...style,
  };

  if (Object.keys(variables).length > 0) {
    result.variables = variables;
  }
  if (Object.keys(formProperties).length > 0) {
    result.jsonform = {
      type: "object",
      title: "Layer Style Configuration",
      properties: formProperties,
    };
  }
  if (legend) {
    result.legend = legend;
  }
  if (tooltipFields && tooltipFields.length > 0) {
    result.tooltip = tooltipFields;
  }

  return result;
}
