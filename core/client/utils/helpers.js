import { changeMapProjection } from "@/store/Actions";
import { availableMapProjection } from "@/store/States";
import { toAbsolute } from "stac-js/src/http.js";
import axios from "axios";

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

/**
 * @param {import("stac-ts").StacLink[]} [links]
 * @param {string|null} [current]
 **/
export const extractLayerDatetime = (links, current) => {
  if (!current || !links?.length) {
    return;
  }
  const hasDatetime = links.some((l) => typeof l.datetime === "string");
  if (!hasDatetime) {
    return;
  }
  const values = links.reduce((vals, link) => {
    if (link.datetime) {
      vals.push(/** @type {string} */ (link.datetime));
    }
    return vals;
  }, /** @type {string[]} */ ([]));

  if (values.length <= 1) {
    return;
  }

  if (!values.includes(current) && current.includes("T")) {
    current = current.split("T")[0];
  }

  return {
    values,
    current,
    slider: true,
    disablePlay: false,
  };
};

/**
 *  @param {Record<string,any> & {properties:{id?:string,title?:string}}} layer
 *  @param {Record<string, any>[]} layers
 *  @returns {Record<string,any> | undefined}
 **/
export const findLayer = (layers, layer) => {
  const property = layer.properties.id ? "id" : "title";
  for (const l of layers) {
    if (l.type === "Group") {
      return findLayer(l.layers, layer);
    }
    if (l.properties[property] === layer.properties[property]) {
      return l;
    }
  }
};
/**
 * @param {Record<string,any>[]} currentLayers
 * @param {Record<string,any>} oldLayer
 * @param {Record<string,any>[]} newLayers
 * @returns {Record<string,any>[] | undefined}
 */
export const replaceLayer = (currentLayers, oldLayer, newLayers) => {
  const oldLayerIdx = currentLayers.findIndex(
    (l) => l.properties.id === oldLayer.properties.id,
  );
  if (oldLayerIdx === -1) {
    for (const l of currentLayers) {
      if (l.type === "Group") {
        const updatedGroup = replaceLayer(l.layers, oldLayer, newLayers);
        if (updatedGroup?.length) {
          const idx = currentLayers.findIndex(
            (l) => l.properties.id === oldLayer.properties.id,
          );
          currentLayers[idx] = updatedGroup;
          return currentLayers;
        }
      }
    }
  }

  currentLayers.splice(oldLayerIdx, 1, ...newLayers);
  return currentLayers;
};
/**
 * @param {import('./eodashSTAC.js').EodashCollection[]} indicators
 * @param {import('ol/layer').Layer} layer
 */
export const getColFromLayer = async (indicators, layer) => {
  // init cols
  const collections = await Promise.all(
    indicators.map((ind) => ind.fetchCollection()),
  );
  const [collectionId, itemId, _asset] = layer.get("id").split("  ");

  const chosen = collections.find((col) => {
    const isInd =
      col.id === collectionId &&
      col.links?.some(
        (link) => link.rel === "item" && link.href.includes(itemId),
      );
    return isInd ?? false;
  });
  return indicators.find((ind) => ind.collectionStac?.id === chosen?.id);
};
/**
 *
 * @param {string} colId
 * @param {string} itemId
 * @param {boolean} isAsset
 * @returns
 */
export const createLayerID = (colId, itemId, isAsset) => {
  // todo: find a better seperator
  return `${colId ?? ""}  ${itemId ?? ""}  ${isAsset ? "_asset" : ""}`;
};
