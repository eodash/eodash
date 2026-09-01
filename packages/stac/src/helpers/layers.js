import log from "loglevel";
import { isBaseLayerOrOverlay } from "./assets.js";

/**
 * Finds a layer by its ID in a layer tree.
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

  if (typeof refId !== "string" || !refId.includes(";:;")) {
    throw new Error("Reference layer ID must contain a ';:;' separator.");
  }

  const prefix = refId.split(";:;")[0];
  const matches = [];

  for (const layer of layers) {
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      matches.push(...findLayersByLayerPrefix(layer.layers, referenceLayer));
    } else {
      const id = layer?.properties?.id;
      if (typeof id === "string" && id.split(";:;")[0] === prefix) {
        matches.push(layer);
      }
    }
  }

  return matches;
};

/**
 * Removes layers by ID from a layer tree.
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
 * Replaces target layers in a layer tree immutably, preserving unchanged array references.
 *
 * @param {import("@eox/map").EoxLayer[]} layers - Existing layer tree array
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
  let lId = `${collectionId ?? ""};:;${itemId ?? ""};:;${linkId ?? ""};:;${projectionCode ?? ""}`;
  // If we are looking at base layers and overlays we remove the collection and item part
  // as we want to make sure tiles are not reloaded when switching layers
  if (isBaseLayerOrOverlay(link)) {
    lId = `${linkId ?? ""};:;${projectionCode ?? ""}`;
  }
  log.debug("Generated Layer ID", lId);
  return lId;
};

/**
 * Generates a unique layer ID for a STAC asset by index.
 *
 * @param {string} collectionId
 * @param {string} itemId
 * @param {number} index
 * @returns {string}
 */
export const createAssetID = (collectionId, itemId, index) => {
  let lId = `${collectionId ?? ""};:;${itemId ?? ""};:;${index ?? ""}`;
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
export const getColFromLayer = (readers, layerId) => {
  if (!layerId) {
    return undefined;
  }
  const [collectionId] = layerId.split(";:;");
  return readers.find((reader) => reader.stac?.id === collectionId);
};
