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
  defaultColormap = "viridis",
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
  const effectiveDefaultMin = defaultMin ?? min ?? 0;
  const effectiveDefaultMax = defaultMax ?? max ?? 250;

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

  /** @type {Record<string, any>} */
  const rasterform = {
    type: "rasterform",
    legend: {
      rangeProperty: "colormap_name",
      domainProperties: ["min", "max"],
    },
  };

  if (hasMultiAssetBranching && assets && assets.length > 0) {
    // Multi-asset branching form with keep_oneof_values: false
    rasterform.jsonform = {
      type: "object",
      title: "Data Visualization Form",
      options: {
        keep_oneof_values: false,
        removeProperties: ["minmax"],
      },
      oneOf: assets.map((asset) => {
        const assetDefaultMin = asset.defaultMin ?? effectiveDefaultMin;
        const assetDefaultMax = asset.defaultMax ?? effectiveDefaultMax;
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
              enum: colormaps,
              default: defaultColormap,
            },
            minmax: {
              title: "Value Range",
              type: "object",
              properties: {
                min: {
                  type: "number",
                  minimum: assetSliderMin,
                  default: assetDefaultMin,
                  format: "range",
                },
                max: {
                  type: "number",
                  maximum: assetSliderMax,
                  default: assetDefaultMax,
                  format: "range",
                },
              },
              format: "minmax",
            },
            rescale: {
              type: "string",
              template: "{{minmax.min}},{{minmax.max}}",
              watch: { minmax: "minmax" },
              options: { hidden: true },
            },
          },
        };
      }),
    };
  } else {
    // Single asset TiTiler / WMS form
    const properties = {};

    if (colormaps && colormaps.length > 0) {
      properties.colormap_name = {
        title: "Color Map",
        type: "string",
        enum: colormaps,
        default: defaultColormap,
      };
    }

    if (hasRescale) {
      properties.minmax = {
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
      };

      properties.rescale = {
        type: "string",
        template: "{{minmax.min}},{{minmax.max}}",
        watch: { minmax: "minmax" },
        options: { hidden: true },
      };
    }

    rasterform.jsonform = {
      type: "object",
      title: "Data Visualization Form",
      options: {
        removeProperties: ["minmax"],
      },
      properties,
    };
  }

  return rasterform;
}
