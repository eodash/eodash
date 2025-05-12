import { toAbsolute } from "stac-js/src/http.js";
import axios from "@/plugins/axios";
import log from "loglevel";
import { getStyleVariablesState } from "./triggers.js";

/**
 *  @param {import("stac-ts").StacLink[]} [links]
 *  @param {Record<string,any>} [extraProperties]
 * @param {string} [rel = "item"]
 **/
export function generateFeatures(links, extraProperties = {}, rel = "item") {
  /**
   * @type {import("geojson").Feature[]}
   */
  const features = [];
  links?.forEach((element) => {
    if (element.rel === rel && "latlng" in element) {
      const [lat, lon] = /** @type {string} */ (element.latlng)
        .split(",")
        .map((it) => Number(it));
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        properties: { ...element, ...extraProperties },
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

/**
 * Sperates and extracts layerConfig (jsonform schema & legend) from a style json
 *
 * @param {string} collectionId
 *  @param { import("@/types").EodashStyleJson} [style]
 * */
export function extractLayerConfig(collectionId, style) {
  if (!style) {
    return { layerConfig: undefined, style: undefined };
  }
  style = { ...style };

  if (Object.keys(style.variables ?? {}).length) {
    style.variables = getStyleVariablesState(collectionId, style.variables);
  }

  /** @type {Record<string,unknown> | undefined} */
  let layerConfig = undefined;

  if (style?.jsonform) {
    layerConfig = { schema: style.jsonform, type: "style" };
    delete style.jsonform;
    if (style?.legend) {
      layerConfig.legend = style.legend;
      delete style.legend;
    }
  }
  log.debug(
    "extracted layerConfig",
    JSON.parse(JSON.stringify({ layerConfig, style })),
  );

  return { layerConfig, style };
}

/**
 * Function to extract collection urls from an indicator
 * @param {import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 * } stacObject
 * @param {string} basepath
 */
export function extractCollectionUrls(stacObject, basepath) {
  /** @type {string[]} */
  const collectionUrls = [];
  // Support for two structure types, flat and indicator, simplified here:
  // Flat assumes Catalog-Collection-Item
  // Indicator assumes Catalog-Collection-Collection-Item

  const children = stacObject?.links?.filter(
    (link) => link.rel === "child" && link.type?.includes("json"),
  );
  if (!children?.length) {
    collectionUrls.push(basepath);
    return collectionUrls;
  }
  children.forEach((link) => {
    collectionUrls.push(toAbsolute(link.href, basepath));
  });
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
    }
  });
  return properties;
};

/**
 * Extracts style JSON from a STAC Item
 * @param {import("stac-ts").StacItem} item
 * @param {string} itemUrl
 * @returns
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

    /** @type {import("@/types").EodashStyleJson} */
    const styleJson = await axios.get(url).then((resp) => resp.data);

    log.debug("fetched styles JSON", JSON.parse(JSON.stringify(styleJson)));
    return { ...styleJson };
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
 * Extracts layercontrol LayerDatetime property from STAC Links
 * @param {import("stac-ts").StacLink[]} [links]
 * @param {string|null} [currentStep]
 **/
export const extractLayerDatetime = (links, currentStep) => {
  if (!currentStep || !links?.length) {
    return undefined;
  }

  // check if links has a datetime value
  // TODO: consider datetime ranges
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
    slider: true,
    navigation: true,
    play: false,
    displayFormat: "DD.MM.YYYY HH:MM",
  };
};

/**
 * Find JSON layer by ID
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
 * Removes the layer with the id provided and injects an array of layers in its position
 * @param {Record<string,any>[]} currentLayers
 * @param {string} oldLayer - id of the layer to be replaced
 * @param {Record<string,any>[]} newLayers - array of layers to replace the old layer
 * @returns {Record<string,any>[] | undefined}
 */
export const replaceLayer = (currentLayers, oldLayer, newLayers) => {
  const oldLayerIdx = currentLayers.findIndex(
    (l) => l.properties.id === oldLayer,
  );

  if (oldLayerIdx !== -1) {
    log.debug(
      "Replacing layer",
      oldLayer,
      "with",
      newLayers.map((l) => l.properties.id),
    );
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
 * Extracts the STAC collection which the layer was created from.
 *
 * @param {import('../eodashSTAC/EodashCollection.js').EodashCollection[]} indicators
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
    return isInd;
  });
  return indicators.find((ind) => ind.collectionStac?.id === chosen?.id);
};

/**
 * Generates layer specific ID from STAC Links
 * related functions are: {@link assignProjID} & {@link createAssetID}
 *
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
  if (
    /** @type {string[]} */
    (link.roles)?.find((r) => ["baselayer", "overlay"].includes(r))
  ) {
    lId = `${linkId ?? ""};:;${projectionCode ?? ""}`;
  }
  log.debug("Generated Layer ID", lId);
  return lId;
};

/**
 * Generates layer specific ID from STAC assets, related functions are: {@link assignProjID} & {@link createLayerID}
 *
 * @param {string} collectionId
 * @param {string} itemId
 * @param {number} index
 *
 */
export const createAssetID = (collectionId, itemId, index) => {
  let lId = `${collectionId ?? ""};:;${itemId ?? ""};:;${index ?? ""}`;
  log.debug("Generated Asset ID", lId);
  return lId;
};

/**
 * Assigns projection code to the layer ID
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

/**
 * @param {string[]} geojsonUrls
 */
export async function mergeGeojsons(geojsonUrls) {
  if (!geojsonUrls.length) {
    return undefined;
  }
  if (geojsonUrls.length === 1) {
    return geojsonUrls[0];
  }

  const merged = {
    type: "FeatureCollection",
    /** @type {import("ol").Feature[]} */
    features: [],
  };
  await Promise.all(
    geojsonUrls.map((url) =>
      axios.get(url).then((resp) => {
        const geojson = resp.data;
        merged.features.push(...(geojson.features ?? []));
      }),
    ),
  );

  return encodeURI(
    "data:application/json;charset=utf-8," + JSON.stringify(merged),
  );
}

/**
 * adds tooltip to the layer if the style has tooltip property
 * @param {Record<string,any>} layer
 * @param {import("@/types").EodashStyleJson} [style]
 */
export const addTooltipInteraction = (layer, style) => {
  if (style?.tooltip) {
    layer.interactions = [
      {
        type: "select",
        options: {
          id: (Math.random() * 10000).toFixed() + "_selectInteraction",
          condition: "pointermove",
          style: {
            "stroke-color": "#335267",
            "stroke-width": 4,
          },
        },
      },
    ];
  }
};
