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
  const dateProperty = getDatetimeProperty(links);

  if (!dateProperty) {
    return undefined;
  }

  /** @type {string[]} */
  const controlValues = [];
  try {
    currentStep = new Date(currentStep).toISOString();
    links.reduce((vals, link) => {
      if (link[dateProperty] && link.rel === "item") {
        vals.push(
          new Date(/** @type {string} */ (link[dateProperty])).toISOString(),
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
    const currentStepTime = new Date(currentStep).getTime();
    currentStep = controlValues.reduce((a, b) => {
      const aDiff = Math.abs(new Date(a).getTime() - currentStepTime);
      const bDiff = Math.abs(new Date(b).getTime() - currentStepTime);
      return bDiff < aDiff ? b : a;
    });
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
 *  @param {import("@eox/map").EoxLayer[]} layers
 *  @returns {import("@eox/map").EoxLayer | undefined}
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
    if (lyr.properties?.id === layer) {
      return lyr;
    }
  }
};

/**
 * Removes the layer with the id provided and injects an array of layers in its position
 * @param {import("@eox/map").EoxLayer[]} currentLayers
 * @param {string} oldLayer - id of the layer to be replaced
 *  @param {import("@eox/map").EoxLayer[]} newLayers - array of layers to replace the old layer
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const replaceLayer = (currentLayers, oldLayer, newLayers) => {
  const oldLayerIdx = currentLayers.findIndex(
    (l) => l.properties?.id === oldLayer,
  );

  if (oldLayerIdx !== -1) {
    log.debug(
      "Replacing layer",
      oldLayer,
      "with",
      newLayers.map((l) => l.properties?.id),
    );
    currentLayers.splice(oldLayerIdx, 1, ...newLayers);
  }

  for (const l of currentLayers) {
    if (l.type === "Group") {
      const updatedGroupLyrs = replaceLayer(l.layers, oldLayer, newLayers);
      if (updatedGroupLyrs?.length) {
        l.layers = updatedGroupLyrs;
      }
    }
  }
  return currentLayers;
};

/**
 * Extracts the STAC collection which the layer was created from.
 *
 * @param {import('../eodashSTAC/EodashCollection.js').EodashCollection[]} indicators
 * @param {import('ol/layer').Layer} layer
 */
export const getColFromLayer = (indicators, layer) => {
  // init cols
  const collections = indicators.map((ind) => ind.collectionStac);
  const [collectionId, itemId, ..._other] = layer.get("id").split(";:;");

  const chosen = collections.find((col) => {
    const isInd =
      col?.id === collectionId &&
      col?.links?.some(
        (link) =>
          link.rel === "item" &&
          (link.href.includes(itemId) ||
            link.id === itemId ||
            //@ts-expect-error attaching the item in link when parsing .parquet items, see @/eodashSTAC/parquet.js
            (link["item"] && link["item"].id === itemId)),
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
 * @param {string | import("ol/proj").ProjectionLike} projectionCode
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
 *
 * @param {import("stac-ts").StacItem[]} items
 */
export function generateLinksFromItems(items) {
  /**
   * @param {string|Date} datetime
   * @returns
   */
  function formateDatetime(datetime) {
    if (datetime instanceof Date) {
      return datetime.toISOString();
    }
    if (typeof datetime === "string") {
      const date = new Date(datetime);
      return date.toISOString();
    }
    return datetime;
  }

  return items.map((item) => {
    const itemBlob = new Blob([JSON.stringify(item)], {
      type: "application/geo+json",
    });
    // urls are revoked when updating the collection. see updateEodashCollections in "../utils/index.js"
    const itemUrl = URL.createObjectURL(itemBlob);
    return {
      id: item.id,
      rel: "item",
      type: "application/geo+json",
      title: item.id,
      href: itemUrl,
      ...(item.properties.datetime && {
        datetime: formateDatetime(item.properties.datetime),
      }),
      ...(item.properties.start_datetime && {
        start_datetime: formateDatetime(item.properties.start_datetime),
      }),
      ...(item.properties.end_datetime && {
        end_datetime: formateDatetime(item.properties.end_datetime),
      }),
      //@ts-expect-error projection extension
      ...(item.properties?.["proj:epsg"] && {
        "proj:epsg": /** @type {number} **/ (item.properties["proj:epsg"]),
      }),
      //@ts-expect-error eodash projection
      ...(item.properties?.["eodash:proj4_def"] && {
        "eodash:proj4_def": item.properties["eodash:proj4_def"],
      }),

      ...(item.geometry?.type == "Point" &&
        item.geometry?.coordinates.length && {
          latlng: item.geometry.coordinates.reverse().join(","),
        }),
      ...(Object.values(item.assets ?? {}).some(
        (asset) =>
          asset.href.startsWith("s3://veda-data-store") &&
          asset.type === "image/tiff; application=geotiff",
      ) && {
        cog_href: Object.values(item.assets ?? {}).find((asset) =>
          asset.href.startsWith("s3://veda-data-store"),
        )?.href,
      }),
    };
  });
}

/**
 * @param {import("../eodashSTAC/EodashCollection.js").EodashCollection} collection
 */
export function revokeCollectionBlobUrls(collection) {
  collection.collectionStac?.links.forEach((link) => {
    if (!(link.rel === "item" && link.type === "application/geo+json")) {
      return;
    }
    if (link.href.startsWith("blob:")) {
      URL.revokeObjectURL(link.href);
    }
  });
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

/**
 *
 * @param {import("stac-ts").StacLink[]} [links]
 */
export function getDatetimeProperty(links) {
  if (!links?.length) {
    return undefined;
  }
  // TODO: consider other properties for datetime ranges
  const datetimeProperties = ["datetime", "start_datetime", "end_datetime"];
  for (const prop of datetimeProperties) {
    const propExists = links.some(
      (l) => l[prop] && typeof l[prop] === "string",
    );
    if (!propExists) {
      continue;
    }
    return prop;
  }
}
