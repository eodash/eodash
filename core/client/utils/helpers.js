import { changeMapProjection, registerProjection } from "@/store/Actions";
import { availableMapProjection } from "@/store/States";
import { toAbsolute } from "stac-js/src/http.js";

/** @param {import("stac-ts").StacLink[]} links */
export function generateFeatures(links) {
  /**
   * @type {{
   *   type: string;
   *   geometry: {
   *     type: string;
   *     coordinates: [number, number];
   *   };
   * }[]}
   */
  const features = [];
  links.forEach((element) => {
    if (element.rel === "item" && "latlng" in element) {
      const [lat, lon] = /** @type {string} */ (element.latlng)
        .split(",")
        .map((it) => Number(it));
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
      });
    }
  });
  const geojsonObject = {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: {
        name: "EPSG:4326",
      },
    },
    features,
  };
  return geojsonObject;
}

/** @param { import("ol/layer/WebGLTile").Style & { jsonform?: object } } [style] */
export function extractLayerConfig(style) {
  /** @type {Record<string,unknown>} */
  let layerConfig = {};
  if (style?.jsonform) {
    layerConfig = { schema: style.jsonform, type: "style" };
    delete style?.jsonform;
  }
  return { layerConfig, style };
}
/**
 * @param {string} id
 * @param {string} title
 * @param {Record<string,import("stac-ts").StacAsset>} assets
 * @param {import("ol/layer/WebGLTile").Style} [style]
 * @param {Record<string, unknown>} [layerConfig]
 **/
export async function createLayersFromDataAssets(
  id,
  title,
  assets,
  style,
  layerConfig,
) {
  let jsonArray = [];
  let geoTIFFSources = [];
  for (const ast in assets) {
    // register projection if exists
    const assetProjection =
      /** @type {string | number | {name: string, def: string} | undefined} */ (
        assets[ast]?.["proj:epsg"] || assets[ast]?.["eodash:proj4_def"]
      );
    await registerProjection(assetProjection);

    if (assets[ast]?.type === "application/geo+json") {
      jsonArray.push({
        type: "Vector",
        source: {
          type: "Vector",
          url: assets[ast].href,
          format: "GeoJSON",
        },
        properties: {
          id,
          title,
          layerConfig: {
            ...layerConfig,
            style,
          },
        },
      });
    } else if (assets[ast]?.type === "image/tiff") {
      geoTIFFSources.push({ url: assets[ast].href });
    }
  }
  if (geoTIFFSources.length) {
    jsonArray.push({
      type: "WebGLTile",
      source: {
        type: "GeoTIFF",
        normalize: style ? false : true,
        sources: geoTIFFSources,
      },
      properties: {
        id,
        title,
        layerConfig,
      },
      style,
    });
  }
  return jsonArray;
}

/**
 * checks if there's a projection on the Collection and
 * updates {@link availableMapProjection}
 * @param {import('stac-ts').StacCollection} STAcCollection
 */
export const setMapProjFromCol = (STAcCollection) => {
  // if a projection exists on the collection level
  const projection =
    STAcCollection?.["eodash:mapProjection"] ||
    STAcCollection?.["proj:epsg"] ||
    STAcCollection?.["eodash:proj4_def"];
  if (projection) {
    const projectionCode = getProjectionCode(projection);
    if (
      availableMapProjection.value &&
      availableMapProjection.value !== projectionCode
    ) {
      changeMapProjection(
        /** @type {number | string | {name: string, def: string}} */
        (projection),
      );
    }
    // set it for `EodashMapBtns`
    availableMapProjection.value = /** @type {string} */ (projectionCode);
  } else {
    // reset to default projection
    changeMapProjection((availableMapProjection.value = "EPSG:3857"));
  }
};

/**
 * Function to extract collection urls from an indicator
 * @param {import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 * } stacObject
 * @param {string} basepath
 * @returns {string[]}
 */
export function extractCollectionUrls(stacObject, basepath) {
  const collectionUrls = [];
  // Support for two structure types, flat and indicator, simplified here:
  // Flat assumes Catalog-Collection-Item
  // Indicator assumes Catalog-Collection-Collection-Item
  // TODO: this is not the most stable test approach,
  // we should discuss potential other approaches

  if (stacObject?.links && stacObject?.links[1].rel === "item") {
    collectionUrls.push(basepath);
  } else if (stacObject?.links[1].rel === "child") {
    // TODO: Iterate through all children to create collections
    stacObject.links.forEach((link) => {
      if (link.rel === "child") {
        collectionUrls.push(toAbsolute(link.href, basepath));
      }
    });
  }
  return collectionUrls;
}

/**
 * Return projection code which is to be registered in `eox-map`
 * @param {string|number|{name: string, def: string}} [projection]
 * @returns {string}
 */
export const getProjectionCode = (projection) => {
  let code = projection;
  switch (typeof projection) {
    case "number":
      code = `EPSG:${projection}`;
      break;
    case "string":
      code = projection;
      break;
    case "object":
      code = projection?.name;
  }
  return /** @type {string} */ (code);
};
