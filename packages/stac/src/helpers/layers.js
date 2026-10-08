import log from "loglevel";
import { isBaseLayerOrOverlay } from "./assets.js";

/**
 * Divides the parts of a layer id, which reads
 * `collection;:;item;:;link;:;projection`. Consumers split ids on it to
 * recognise the collection or link a layer came from.
 */
export const LAYER_ID_SEPARATOR = ";:;";

/**
 * Finds a layer by its ID, across nested groups.
 *
 * @param {import("@eox/map").EoxLayer[]} layers
 * @param {string} layer - Layer ID
 * @returns {import("@eox/map").EoxLayer | undefined}
 */
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
 * Finds all layers matching the collection prefix of a reference layer.
 *
 * @param {import("@eox/map").EoxLayer[]} layers
 * @param {import("@eox/map").EoxLayer | undefined} referenceLayer - Reference layer containing the prefix
 * @returns {import("@eox/map").EoxLayer[]} Matching layer objects
 */
export const findLayersByLayerPrefix = (layers, referenceLayer) => {
  if (!layers || !referenceLayer) {
    return [];
  }
  const refId = referenceLayer?.properties?.id;

  if (typeof refId !== "string" || !refId.includes(LAYER_ID_SEPARATOR)) {
    throw new Error(
      `Reference layer ID must contain a '${LAYER_ID_SEPARATOR}' separator.`,
    );
  }

  const prefix = refId.split(LAYER_ID_SEPARATOR)[0];
  const matches = [];

  for (const layer of layers) {
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      matches.push(...findLayersByLayerPrefix(layer.layers, referenceLayer));
    } else {
      const id = layer?.properties?.id;
      if (
        typeof id === "string" &&
        id.split(LAYER_ID_SEPARATOR)[0] === prefix
      ) {
        matches.push(layer);
      }
    }
  }

  return matches;
};

/**
 * Removes layers by ID, across nested groups.
 *
 * @param {import("@eox/map").EoxLayer[]} layers
 * @param {string[]} layerIds
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const removeLayers = (layers, layerIds) => {
  const result = [];
  for (const layer of layers) {
    if (layer.properties?.id && layerIds.includes(layer.properties.id)) {
      continue;
    }
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      const newGroupLayers = removeLayers(layer.layers, layerIds);
      result.push(
        newGroupLayers !== layer.layers
          ? { ...layer, layers: newGroupLayers }
          : layer,
      );
      continue;
    }

    result.push(layer);
  }

  return result.length === layers.length &&
    result.every((l, i) => l === layers[i])
    ? layers
    : result;
};

/**
 * Replaces target layers immutably, preserving unchanged array references.
 *
 * @param {import("@eox/map").EoxLayer[]} layers - The layers to replace within
 * @param {string | string[]} toRemove - ID(s) of layers to remove
 * @param {import("@eox/map").EoxLayer[]} toInsert - New layers to insert
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const replaceLayer = (layers, toRemove, toInsert) => {
  const removeIds = new Set(Array.isArray(toRemove) ? toRemove : [toRemove]);
  let inserted = false;
  const result = [];

  for (const layer of layers) {
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      const newGroupLayers = replaceLayer(layer.layers, toRemove, toInsert);
      result.push(
        newGroupLayers !== layer.layers
          ? { ...layer, layers: newGroupLayers }
          : layer,
      );
      continue;
    }

    const id = layer?.properties?.id;

    if (id && removeIds.has(id)) {
      if (!inserted) {
        result.push(...toInsert);
        inserted = true;
      }
      continue;
    }

    result.push(layer);
  }

  // If nothing changed, return the original reference to avoid unnecessary re-renders
  return result.length === layers.length &&
    result.every((l, i) => l === layers[i])
    ? layers
    : result;
};

/**
 * Generates a unique layer ID from STAC link metadata and projection.
 *
 * @param {string} collectionId
 * @param {string} itemId
 * @param {import("../types").STACLink} link
 * @param {string | import("ol/proj").ProjectionLike} projectionCode
 * @returns {string}
 */
export const createLayerID = (collectionId, itemId, link, projectionCode) => {
  const linkId = link.id || link.title || link.href;
  let lId = [
    collectionId ?? "",
    itemId ?? "",
    linkId ?? "",
    projectionCode ?? "",
  ].join(LAYER_ID_SEPARATOR);
  // If we are looking at base layers and overlays we remove the collection and item part
  // as we want to make sure tiles are not reloaded when switching layers
  if (isBaseLayerOrOverlay(link)) {
    lId = [linkId ?? "", projectionCode ?? ""].join(LAYER_ID_SEPARATOR);
  }
  log.debug("Generated Layer ID", lId);
  return lId;
};

/**
 * @typedef {import("@eox/map/src/layers").EOxLayerType<"WebGLTile","GeoZarr">} GeoZarrLayer
 * @typedef {import("@eox/map/src/layers").EoxSource<"GeoZarr">} GeoZarrSource
 */

/**
 * Checks if a layer definition is a GeoZarr layer.
 *
 * @param {any} layer - Layer configuration object
 * @returns {layer is Omit<GeoZarrLayer, "source"> & { source: GeoZarrSource }}
 */
export const isGeoZarrLayer = (layer) =>
  layer?.type === "WebGLTile" && layer?.source?.type === "GeoZarr";

/**
 * Generates a unique layer ID for a STAC asset by index.
 *
 * @param {string} collectionId
 * @param {string} itemId
 * @param {number} index
 * @returns {string}
 */
export const createAssetID = (collectionId, itemId, index) => {
  let lId = [collectionId ?? "", itemId ?? "", index ?? ""].join(
    LAYER_ID_SEPARATOR,
  );
  log.debug("Generated Asset ID", lId);
  return lId;
};

/**
 * Resolves the collection reader corresponding to a given layer ID.
 *
 * @template {{ stac?: import("../types").STACCollection }} Reader
 * @param {Reader[]} readers
 * @param {string} [layerId]
 * @returns {Reader | undefined}
 */
export const findReaderByLayerId = (readers, layerId) => {
  if (!layerId) {
    return undefined;
  }
  const prefix = layerId.split(LAYER_ID_SEPARATOR)[0];
  return readers.find((reader) => reader.stac?.id === prefix);
};

/**
 * Applies link visibility roles to layer properties based on link role definitions in the collection.
 *
 * @param {import("../types").STACCollection | null | undefined} collection - STAC collection
 * @param {import("@eox/map").EoxLayer[]} [layers] - Layers to apply roles to
 */
export const applyVisibilityRoles = (collection, layers = []) => {
  const visibilityLinks = (collection?.links ?? []).filter(
    (link) =>
      Array.isArray(link.roles) &&
      (link.roles.includes("disable") || link.roles.includes("hidden")),
  );

  for (const link of visibilityLinks) {
    const targets = layers.filter(
      (layer) =>
        typeof layer.properties?.id === "string" &&
        layer.properties.id.split(LAYER_ID_SEPARATOR)[0] === link.id,
    );
    for (const target of targets) {
      if (!target?.properties) {
        continue;
      }
      if (/** @type {string[]} */ (link.roles).includes("disable")) {
        target.properties.visible = false;
        target.properties.layerControlExpand = false;
      } else {
        target.properties.layerControlHide = true;
      }
    }
  }
};

/**
 * Default fallback base layer (OpenStreetMap) when no baselayer links are provided by STAC.
 * @type {import("@eox/map").EoxLayer[]}
 */
export const DEFAULT_BASE_LAYERS = [
  {
    type: "Tile",
    properties: {
      id: "osm",
      title: "OpenStreetMap",
      group: "baselayer",
      visible: true,
      layerControlExclusive: true,
    },
    source: {
      type: "OSM",
    },
  },
];

/**
 * Normalizes baselayer visibility and exclusivity on a set of base layers.
 *
 * @param {import("@eox/map").EoxLayer[]} baseLayers
 * @param {import("@eox/map").EoxLayer[]} [fallbackBaseLayers]
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const normalizeBaseLayers = (
  baseLayers,
  fallbackBaseLayers = DEFAULT_BASE_LAYERS,
) => {
  if (baseLayers.length) {
    const layers = baseLayers.map((bl) => ({
      ...bl,
      properties: { ...(bl.properties || {}) },
    }));
    let counter = 0;
    let lastPos = 0;
    for (let indx = 0; indx < layers.length; indx++) {
      const bl = layers[indx];
      if (!("visible" in bl.properties)) {
        bl.properties.visible = false;
      }

      if (bl.properties.visible) {
        counter++;
        lastPos = indx;
      }
    }

    if (counter === 0) {
      layers[0].properties.visible = true;
    }

    if (counter > 0) {
      layers.forEach((bl, indx) => {
        bl.properties.visible = indx === lastPos;
      });
    }

    layers.forEach((bl) => {
      bl.properties.layerControlExclusive = true;
    });
    return /** @type {import("@eox/map").EoxLayer[]} */ (layers);
  }

  return [...fallbackBaseLayers];
};
