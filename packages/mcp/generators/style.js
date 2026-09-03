/**
 * OpenLayers FlatStyle & eodash:rasterform Generator
 *
 * Generates valid styling definitions for:
 * 1. OpenLayers Vector FlatStyle (ol/style/flat & ol/style/expressions) for vector & vector tile layers
 * 2. OpenLayers WebGLTile FlatStyle for GeoTIFF / Cloud Optimized GeoTIFF (COG)
 * 3. eodash:rasterform schemas for TiTiler / WMS / custom XYZ layers
 *
 * Includes STAC Item snippets, eodash_catalog collection snippets, and best practices.
 */

export const COLORMAPS_URL =
  "https://raw.githubusercontent.com/eurodatacube/eodash-assets/refs/heads/main/defaults/colormaps.json";

/**
 * Fallback palettes for offline execution or tests
 */
export const FALLBACK_PALETTES = {
  viridis: [
    "#440154",
    "#482878",
    "#3e4a89",
    "#31688e",
    "#26828e",
    "#1f9e89",
    "#35b779",
    "#6ece58",
    "#b5de2b",
    "#fde725",
  ],
  magma: [
    "#000004",
    "#180f3d",
    "#440f76",
    "#721f81",
    "#9e2f7f",
    "#cd4071",
    "#f1605d",
    "#fd9668",
    "#feca8d",
    "#fcfdbf",
  ],
  plasma: [
    "#0d0887",
    "#46039f",
    "#7201a8",
    "#9c179e",
    "#bd3786",
    "#d8576b",
    "#ed7953",
    "#fb9f3a",
    "#fdca26",
    "#f0f921",
  ],
};

/** @type {Record<string, string[]> | null} */
let cachedColormaps = null;

/**
 * Fetch full colormaps list from GitHub or fallback
 * @returns {Promise<Record<string, string[]>>}
 */
export async function fetchColormaps() {
  if (cachedColormaps) return cachedColormaps;
  try {
    const res = await fetch(COLORMAPS_URL);
    if (res.ok) {
      cachedColormaps = await res.json();
      return cachedColormaps;
    }
  } catch {
    // Network fallback
  }
  return FALLBACK_PALETTES;
}

/**
 * Backward compatibility alias for PALETTES
 */
export const PALETTES = FALLBACK_PALETTES;

/**
 * Get color ramp array for a colormap name
 * @param {string} name
 * @returns {Promise<string[]>}
 */
export async function getColormapRamp(name) {
  const maps = await fetchColormaps();
  if (maps && maps[name]) {
    return maps[name];
  }
  return FALLBACK_PALETTES[name] || FALLBACK_PALETTES.viridis;
}

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

  // 3. Graduated Mode (Linear Interpolation)
  if (mode === "graduated") {
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

  // Attach tooltips if configured
  if (tooltipFields && tooltipFields.length > 0) {
    style.tooltip = tooltipFields.map((f) => {
      const item = { id: f.id };
      if (f.title) item.title = f.title;
      if (f.appendix) item.appendix = f.appendix;
      if (typeof f.decimals === "number") item.decimals = f.decimals;
      return item;
    });
  }

  if (Object.keys(variables).length > 0) {
    style.variables = variables;
  }
  if (jsonform) {
    style.jsonform = jsonform;
  }
  if (legend) {
    style.legend = legend;
  }

  return style;
}

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

/**
 * Generate eodash:rasterform for TiTiler / WMS / XYZ layers
 */
export function generateRasterForm({
  _serviceType = "titiler",
  colormaps = [
    "viridis",
    "magma",
    "plasma",
    "inferno",
    "cividis",
    "spectral",
    "rainbow",
    "turbo",
  ],
  colormapOptions,
  defaultColormap = "viridis",
  vmin,
  vmax,
  min,
  max,
  sliderMin,
  sliderMax,
  defaultMin,
  defaultMax,
  hasRescale = true,
  hasMultiAssetBranching = false,
  assets = [],
} = {}) {
  const effectiveColormaps = colormapOptions || colormaps;
  const effectiveDefaultMin = defaultMin ?? vmin ?? min ?? 0;
  const effectiveDefaultMax = defaultMax ?? vmax ?? max ?? 250;

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

  /** @type {Record<string, any>} */
  const rasterform = {
    type: "rasterform",
    legend: {
      rangeProperty: "colormap_name",
      domainProperties: ["vmin", "vmax"],
    },
  };

  if (hasMultiAssetBranching && assets && assets.length > 0) {
    // Multi-asset branching form with keep_oneof_values: false
    rasterform.jsonform = {
      type: "object",
      title: "Data Visualization Form",
      options: {
        keep_oneof_values: false,
        removeProperties: ["vminmax"],
      },
      oneOf: assets.map((asset) => {
        const assetDefaultMin = asset.defaultVmin ?? effectiveDefaultMin;
        const assetDefaultMax = asset.defaultVmax ?? effectiveDefaultMax;
        const assetSliderMin =
          asset.sliderMin ??
          (assetDefaultMin < 0
            ? Math.round(assetDefaultMin * 1.5)
            : assetDefaultMin === 0
              ? 0
              : Math.round(assetDefaultMin * 0.5));
        const assetSliderMax =
          asset.sliderMax ??
          (assetDefaultMax > 0
            ? Math.round(assetDefaultMax * 1.5)
            : assetDefaultMax === 0
              ? 100
              : Math.round(assetDefaultMax * 0.5));

        return {
          type: "object",
          title: asset.title || asset.id,
          properties: {
            assets: {
              type: "string",
              options: { hidden: true },
              default: asset.id,
            },
            colormap_name: {
              title: "Color Map",
              type: "string",
              enum: effectiveColormaps,
              default: defaultColormap,
            },
            vminmax: {
              title: "Value Range",
              type: "object",
              properties: {
                vmin: {
                  type: "number",
                  minimum: assetSliderMin,
                  maximum: assetSliderMax,
                  default: assetDefaultMin,
                  format: "range",
                },
                vmax: {
                  type: "number",
                  minimum: assetSliderMin,
                  maximum: assetSliderMax,
                  default: assetDefaultMax,
                  format: "range",
                },
              },
              format: "minmax",
            },
            rescale: {
              type: "string",
              template: "{{vminmax.vmin}},{{vminmax.vmax}}",
              watch: { vminmax: "vminmax" },
              options: { hidden: true },
            },
          },
        };
      }),
    };
  } else {
    // Single asset TiTiler / WMS form
    const properties = {};

    if (effectiveColormaps && effectiveColormaps.length > 0) {
      properties.colormap_name = {
        title: "Color Map",
        type: "string",
        enum: effectiveColormaps,
        default: defaultColormap,
      };
    }

    if (hasRescale) {
      properties.vminmax = {
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
      };

      properties.rescale = {
        type: "string",
        template: "{{vminmax.vmin}},{{vminmax.vmax}}",
        watch: { vminmax: "vminmax" },
        options: { hidden: true },
      };
    }

    rasterform.jsonform = {
      type: "object",
      title: "Data Visualization Form",
      options: {
        removeProperties: ["vminmax"],
      },
      properties,
    };
  }

  return rasterform;
}

/**
 * Main generate_layer_style router and snippet formatter
 */
export async function generateLayerStyle({
  styleType,
  vectorConfig = {},
  rasterWebglConfig = {},
  rasterConfig,
  rasterformConfig = {},
  rasterFormConfig,
} = {}) {
  let resultStyle;
  let summary = "";
  let stacItemSnippet = {};
  let catalogCollectionSnippet = {};
  const rulesAndBestPractices = [];

  const effectiveRasterWebglConfig = rasterConfig || rasterWebglConfig;
  const effectiveRasterFormConfig = rasterFormConfig || rasterformConfig;

  if (styleType === "vector-flatstyle") {
    if (vectorConfig.colormap && !cachedColormaps) {
      await fetchColormaps();
    }
    resultStyle = generateVectorFlatStyle(vectorConfig);
    summary = `Generated OpenLayers Vector FlatStyle for ${vectorConfig.geometryType || "polygon"} (${vectorConfig.mode || "single"} mode).`;

    rulesAndBestPractices.push(
      "Style and eox:flatstyle MUST be URL strings in STAC items and catalog collections. Host the style JSON file on your assets server.",
      "In eodash catalog configs use 'Style' on Collection or 'Resources[].Style'. Note: 'Flatstyle' does NOT exist on Resources (it is only used under Process execution definitions).",
      "OpenLayers flat styles support vector layers (GeoJSON, FlatGeobuf) and vector tile layers (MVT).",
      "Dynamic style variables (e.g. ['var', 'strokeWidth']) are reactive when paired with a matching jsonform schema in the style.",
      "OpenLayers Flat Style Specification: https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html",
      "OpenLayers Style Expressions Reference: https://openlayers.org/en/latest/apidoc/module-ol_style_expressions.html",
    );

    stacItemSnippet = {
      rel: "data",
      href: "https://example.com/data.geojson",
      type: "application/geo+json",
      "eox:flatstyle": "https://assets.example.com/styles/vector_style.json",
      roles: ["data", "visible"],
    };

    catalogCollectionSnippet = {
      Name: "vector_collection_resource",
      Style: "https://assets.example.com/styles/vector_style.json",
      Resources: [
        {
          Name: "GeoJSON Vector Resource",
          Style: "https://assets.example.com/styles/vector_style.json",
        },
      ],
    };
  } else if (
    styleType === "raster-flatstyle" ||
    styleType === "raster-webgl-flatstyle" ||
    styleType === "raster-cog"
  ) {
    resultStyle = await generateRasterFlatStyle(effectiveRasterWebglConfig);
    summary = `Generated OpenLayers Raster FlatStyle for COG / GeoTIFF (${effectiveRasterWebglConfig.mode || "single-band-normalized"}).`;

    rulesAndBestPractices.push(
      "The 'color' expression (case + interpolate) is mandatory for raster rendering. When adding or modifying 'jsonform' sliders, never omit the 'color' property.",
      "Raster FlatStyles run client-side for COG/GeoTIFF rendering using OpenLayers style expressions (['band', index], ['var', name], ['interpolate', ...]).",
      "Style and eox:flatstyle MUST be URL strings referencing the hosted style JSON file. In catalog configs use 'Style' or 'Resources[].Style' ('Flatstyle' only exists under Process outputs).",
      "The legend.domainProperties array connects slider min/max variables directly to the legend scale.",
      "Colormaps can use any preset from https://raw.githubusercontent.com/eurodatacube/eodash-assets/refs/heads/main/defaults/colormaps.json",
      "OpenLayers Raster Expressions: https://openlayers.org/en/latest/apidoc/module-ol_style_expressions.html",
      "OpenLayers Flat Style Specification: https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html",
    );

    stacItemSnippet = {
      rel: "data",
      href: "https://example.com/cog.tif",
      type: "image/tiff",
      "eox:flatstyle": "https://assets.example.com/styles/cog_style.json",
      roles: ["data", "visible"],
    };

    catalogCollectionSnippet = {
      Name: "cog_collection_resource",
      Resources: [
        {
          Name: "COG Resource",
          Style: "https://assets.example.com/styles/cog_style.json",
          EndPoint: "https://example.com/cog.tif",
        },
      ],
    };
  } else if (styleType === "rasterform") {
    resultStyle = generateRasterForm(effectiveRasterFormConfig);
    summary = `Generated eodash:rasterform for ${effectiveRasterFormConfig.serviceType || "titiler"} layer.`;

    rulesAndBestPractices.push(
      "The eodash:rasterform property is a hybrid and supports BOTH direct JSON objects and URL strings.",
      "When using branching forms (oneOf / anyOf) with differing properties, always set 'keep_oneof_values': false in options.",
      "Use 'removeProperties': ['vminmax'] in options so intermediate slider values do not pollute tile URL query strings.",
      "eodash STAC & Processing Guidelines: https://eodash.github.io/eodash/",
      "JSON-Editor Schema Documentation: https://github.com/json-editor/json-editor",
    );

    stacItemSnippet = {
      rel: "data",
      href: "https://example.com/titiler/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?url=https://example.com/cog.tif&colormap_name={colormap_name}&rescale={rescale}",
      type: "image/png",
      "eodash:rasterform": resultStyle,
      roles: ["data", "visible"],
    };

    catalogCollectionSnippet = {
      Name: "titiler_collection_resource",
      Resources: [
        {
          Name: "TiTiler Dynamic Resource",
          EndPoint:
            "https://example.com/titiler/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?url=https://example.com/cog.tif&colormap_name={colormap_name}&rescale={rescale}",
          Rasterform: resultStyle,
        },
      ],
    };
  }

  return {
    styleType,
    style: resultStyle,
    stacItemSnippet,
    catalogCollectionSnippet,
    summary,
    notice:
      "All top-level style properties (e.g. 'color', 'fill-color', 'stroke-color', 'variables', 'legend', 'jsonform') form a complete style definition. When adding sliders or editing properties, always output the full JSON with all style properties preserved.",
    rulesAndBestPractices,
  };
}
