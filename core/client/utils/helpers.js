import { changeMapProjection, registerProjection } from "@/store/Actions";
import { availableMapProjection } from "@/store/States";
import { toAbsolute } from "stac-js/src/http.js";
import axios from "@/plugins/axios";
import log from "loglevel";

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
  log.debug("Checking for available map projection in indicator");
  const projection =
    /** @type {number | string | {name: string, def: string} | undefined} */
    (
      STAcCollection?.["eodash:mapProjection"] ||
        STAcCollection?.["proj:epsg"] ||
        STAcCollection?.["eodash:proj4_def"]
    );
  if (projection) {
    log.debug("Projection found", projection);
    registerProjection(projection);
    const projectionCode = getProjectionCode(projection);
    if (
      availableMapProjection.value &&
      availableMapProjection.value !== projectionCode
    ) {
      log.debug(
        "Changing map projection",
        availableMapProjection.value,
        projectionCode,
      );
      changeMapProjection(projection);
    }
    // set it for `EodashMapBtns`
    availableMapProjection.value = /** @type {string} */ (projectionCode);
  } else {
    // reset to default projection
    log.debug("Resetting projection to default");
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
 * Assign extracted roles to layer properties
 * @param {Record<string,any>} properties
 * @param {import("stac-ts").StacLink | import("stac-ts").StacAsset} linkOrAsset
 * */
export const extractRoles = (properties, linkOrAsset) => {
  const roles = /** @type {string[]} */ (linkOrAsset.roles);
  roles?.forEach((role) => {
    if (role === "visible") {
      properties.visible = true;
    }
    if (role === "overlay" || role === "baselayer") {
      properties.group = role;
      //remove all the properties and replace the random ID with baselayer
      // provided ID
      const [_colId, _itemId, _isAsset, _random, proj] =
        properties.id.split(";:;");
      properties.id = ["", "", "", "", linkOrAsset.id, proj].join(";:;");
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

/**
 * @param {import("stac-ts").StacLink[]} [links]
 * @param {string|null} [currentStep]
 **/
export const extractLayerDatetime = (links, currentStep) => {
  if (!currentStep || !links?.length) {
    return undefined;
  }

  // check if links has a datetime value
  const hasDatetime = links.some((l) => typeof l.datetime === "string");
  if (!hasDatetime) {
    return undefined;
  }

  /** @type {string[]} */
  const controlValues = [];
  try {
    currentStep = new Date(currentStep).toISOString();

    links.reduce((vals, link) => {
      if (link.datetime && link.rel === "item") {
        vals.push(
          new Date(/** @type {string} */ (link.datetime)).toISOString(),
        );
      }
      return vals;
    }, controlValues);
  } catch (e) {
    console.warn("[eodash] not supported datetime format was provided", e);
    return undefined;
  }
  // not enough controlValues
  if (controlValues.length <= 1) {
    return undefined;
  }

  // item datetime is not included in the item links datetime
  if (!controlValues.includes(currentStep)) {
    return undefined;
  }

  return {
    controlValues,
    currentStep,
    slider: false,
    disablePlay: true,
  };
};

/**
 * Find layer by ID
 *  @param {string} layer
 *  @param {Record<string, any>[]} layers
 *  @returns {Record<string,any> | undefined}
 **/
export const findLayer = (layers, layer) => {
  for (const lyr of layers) {
    if (lyr.type === "Group") {
      const found = findLayer(lyr.layers, layer);
      if (!found) {
        continue;
      }
      return found;
    }
    if (lyr.properties.id === layer) {
      return lyr;
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
  if (oldLayerIdx !== -1) {
    currentLayers.splice(oldLayerIdx, 1, ...newLayers);
    return currentLayers;
  }

  for (const l of currentLayers) {
    if (l.type === "Group") {
      const updatedGroupLyrs = replaceLayer(l.layers, oldLayer, newLayers);
      if (updatedGroupLyrs?.length) {
        l.layers = updatedGroupLyrs;
        return currentLayers;
      }
    }
  }
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
  const [collectionId, itemId, ..._other] = layer.get("id").split(";:;");

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
 * generates layer specific ID, related functions are: {@link assignProjID} & {@link extractRoles}
 * @param {string} collectionId
 * @param {string} itemId
 * @param {import('stac-ts').StacLink} link
 * @param {string} projectionCode
 *
 */
export const createLayerID = (collectionId, itemId, link, projectionCode) => {
  const linkId = link.id || link.title || link.href;
  let lId = `${collectionId ?? ""};:;${itemId ?? ""};:;${linkId ?? ""};:;${projectionCode ?? ""}`;
  // If we are looking at base layers and overlays we remove the collection and item part
  // as we want to make sure tiles are not reloaded when switching layers
  // @ts-expect-error it seems roles it not defined for links yet
  if (link.roles && link.roles.find((r)=>["baselayer", "overlay"].includes(r))) {
    lId = `${linkId ?? ""};:;${projectionCode ?? ""}`;
  }
  // TODO: adding pseudo random number to make sure layers are always updated
  // this is necessary right now because changed layer properties will not be
  // update, like visible, opacity, ... if the id is the same
  lId = `${lId};:;${Math.random().toString(16).slice(2)}`;
  log.debug("Generated Layer ID", lId);
  return lId
};

/**
 *
 * @param {import("stac-ts").StacItem} item
 * @param {import("stac-ts").StacLink | import("stac-ts").StacAsset} linkOrAsset
 * @param {string} id - {@link createLayerID} & {@link extractRoles}
 * @param {{ properties:{id:string}  & Record<string, any> }& Record<string,any>} layer
 * @returns
 */
export function assignProjID(item, linkOrAsset, id, layer) {
  const indicatorProjection =
  /** @type { string | undefined} */
  (item?.["proj:epsg"]) ||
  /** @type { {name?: string} | undefined} */
  (item?.["eodash:mapProjection"])?.name ||
  "EPSG:3857";
  
  const idArr = id.split(";:;");
  
  idArr.pop();
  idArr.push(indicatorProjection);
  const updatedID = idArr.join(";:;");
  layer.properties.id = updatedID;

  log.debug("Updating layer id", updatedID);

  return updatedID;
}

/**
 * creates a structured clone from the layers and
 * removes all properties from the clone
 * except the ID and title
 *
 * @param {Record<string,any>[]} layers
 */
export const removeUnneededProperties = (layers) => {
  const cloned = structuredClone(layers);
  cloned.forEach((layer) => {
    const id = layer.properties.id;
    const title = layer.properties.title;
    layer.properties = { id, title };
    if (layer["interactions"]) {
      delete layer["interactions"];
    }
    if (layer.type === "Group") {
      layer.layers = removeUnneededProperties(layer.layers);
    }
  });
  return cloned;
};
