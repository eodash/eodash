import {
  COLORMAPS_URL,
  FALLBACK_PALETTES,
  PALETTES,
  cachedColormaps,
  fetchColormaps,
  getColormapRamp,
} from "./style/colormaps.js";
import { generateVectorFlatStyle } from "./style/vector.js";
import {
  generateRasterFlatStyle,
  generateRasterWebglStyle,
} from "./style/raster.js";
import { generateRasterForm } from "./style/rasterform.js";

export {
  COLORMAPS_URL,
  FALLBACK_PALETTES,
  PALETTES,
  fetchColormaps,
  getColormapRamp,
  generateVectorFlatStyle,
  generateRasterFlatStyle,
  generateRasterWebglStyle,
  generateRasterForm,
};

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
      "Use 'removeProperties': ['minmax'] in options so intermediate slider values do not pollute tile URL query strings.",
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
