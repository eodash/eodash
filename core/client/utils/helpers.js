import { changeMapProjection, registerProjection } from "@/store/Actions";
import { availableMapProjection } from "@/store/States";
import axios from "axios";
import { toAbsolute } from "stac-js/src/http.js";

/** @param {import("stac-ts").StacLink[]} [links] */
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
  links?.forEach((element) => {
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

/** @param { import("ol/layer/WebGLTile").Style & { jsonform?: Record<string,any> } } [style] */
export function extractLayerConfig(style) {
  /** @type {Record<string,unknown> | undefined} */
  let layerConfig = undefined;
  if (style?.jsonform) {
    layerConfig = { schema: style.jsonform, type: "style" };
    delete style.jsonform;
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
    await registerProjection(
      /** @type {number | undefined} */ (assets[ast]?.["proj:epsg"]),
    );

    if (assets[ast]?.type === "application/geo+json") {
      const layer = {
        type: "Vector",
        source: {
          type: "Vector",
          url: assets[ast].href,
          format: "GeoJSON",
        },
        properties: {
          id,
          title,
          ...(layerConfig && {
            layerConfig: {
              ...layerConfig,
              style,
            },
          }),
        },
      };
      extractRoles(layer.properties, assets[ast]?.roles ?? []);
      jsonArray.push(layer);
    } else if (assets[ast]?.type === "image/tiff") {
      geoTIFFSources.push({ url: assets[ast].href });
    }
  }

  if (geoTIFFSources.length) {
    jsonArray.push({
      type: "WebGLTile",
      source: {
        type: "GeoTIFF",
        normalize: !style?.variables,
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
 * @param {import('stac-ts').StacItem} item
 * @param {string} id
 * @param {string} title
 */
export const createLayersFromLinks = (id, title, item) => {
  /** @type {Record<string,any>[]} */
  const jsonArray = [];
  const wmsArray = item.links.filter((l) => l.rel === "wms");
  const xyzArray = item.links.filter((l) => l.rel === "xyz");

  if (wmsArray.length) {
    wmsArray.forEach((link) => {
      let json = {
        type: "Tile",
        properties: {
          id: id || link.id,
          title: title || link.title || item.id,
        },
        source: {
          type: "TileWMS",
          url: link.href,
          params: {
            LAYERS: link["wms:layers"],
            TILED: true,
          },
        },
      };

      extractRoles(json.properties, /** @type {string[]} */ (link.roles));

      if ("wms:dimensions" in link) {
        // Expand all dimensions into the params attribute
        Object.assign(json.source.params, link["wms:dimensions"]);
      }
      jsonArray.push(json);
    });
  }

  if (xyzArray.length) {
    xyzArray.forEach((link) => {
      let json = {
        type: "Tile",
        properties: {
          id: link.id || item.id,
          title: title || link.title || item.id,
          roles: link.roles,
        },
        source: {
          type: "XYZ",
          url: link.href,
        },
      };

      extractRoles(json.properties, /** @type {string[]} */ (link.roles));
      jsonArray.push(json);
    });
  }
  return jsonArray;
};

/**
 * checks if there's a projection on the Collection and
 * updates {@link availableMapProjection}
 * @param {import('stac-ts').StacCollection} [STAcCollection]
 */
export const setMapProjFromCol = (STAcCollection) => {
  // if a projection exists on the collection level
  if (STAcCollection?.["proj:epsg"]) {
    if (
      availableMapProjection.value &&
      availableMapProjection.value !== STAcCollection?.["proj:epsg"]
    ) {
      changeMapProjection(
        /** @type {number} */
        (STAcCollection["proj:epsg"]),
      );
    }
    // set it for `EodashMapBtns`
    availableMapProjection.value = /** @type {string} */ (
      STAcCollection["proj:epsg"]
    );
  } else {
    // reset to default projection
    changeMapProjection((availableMapProjection.value = ""));
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

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

/**
 * Assign extracted roles to layer properties
 * @param {Record<string,any>} properties
 * @param {string[]} roles
 * */
export const extractRoles = (properties, roles) => {
  roles?.forEach((role) => {
    if (role === "visible") {
      properties.visible = true;
    }
    if (role === "overlay" || role === "baselayer") {
      properties.group = role;
    }
    return properties;
  });
};

/**
 * @param {import("stac-ts").StacItem} item
 * @param {string} itemUrl
 **/
export const fetchStyle = async (item, itemUrl) => {
  const styleLink = item.links.find((link) => link.rel.includes("style"));
  if (styleLink) {
    let url = "";
    if (styleLink.href.startsWith("http")) {
      url = styleLink.href;
    } else {
      url = toAbsolute(styleLink.href, itemUrl);
    }

    /** @type {import("ol/layer/WebGLTile").Style & {jsonform?:Record<string,any>}} */
    const styleJson = await axios.get(url).then((resp) => resp.data);
    return styleJson;
  }
};
