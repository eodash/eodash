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
