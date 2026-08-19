import log from "loglevel";
import { isBaseLayerOrOverlay } from "./assets.js";

/**
 * Find JSON layer by ID
 *  @param {import("@eox/map").EoxLayer[]} layers
 *  @param {string} layer
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
 * Recursively find all layers whose ID up to the first ; is same as given layer
 *
 * @param {import("@eox/map").EoxLayer[]} layers
 * @param {import("@eox/map").EoxLayer | undefined} referenceLayer - layer
 * @returns {import("@eox/map").EoxLayer[]} Matching layer objects.
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
 * Removes JSON layers by ID from the layer tree
 *  @param {import("@eox/map").EoxLayer[]} layers
 *  @param {string[]} layerIds
 *  @returns {import("@eox/map").EoxLayer[]}
 **/
export const removeLayers = (layers, layerIds) => {
  const result = [];
  for (const layer of layers) {
    // if the layer is hidden, do not include it without checking if it's a group
    if (layer.properties?.id && layerIds.includes(layer.properties.id)) {
      continue;
    }
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      const newGroupLayers = removeLayers(layer.layers, layerIds);
      // if the group is not hidden, add it with the updated layers (if any were removed)
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
 * Removes one or more layers (by id) from a layer/group structure and inserts
 * new layers in place of the first removed one.
 * Returns a new array reference at every level that changed (immutable).
 *
 * @param {import("@eox/map").EoxLayer[]} layers - Current layer array.
 * @param {string | string[]} toRemove - Id(s) of layers to remove.
 * @param {import("@eox/map").EoxLayer[]} toInsert - Layers to insert in place of the first removed one.
 * @returns {import("@eox/map").EoxLayer[]}
 */
export const replaceLayer = (layers, toRemove, toInsert) => {
  const removeIds = new Set(Array.isArray(toRemove) ? toRemove : [toRemove]);
  let inserted = false;
  const result = [];

  for (const layer of layers) {
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      const newGroupLayers = replaceLayer(layer.layers, toRemove, toInsert);
      // Only create a new object reference if children changed
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
      // Skip this layer (it’s removed)
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
 * Generates layer specific ID from STAC Links
 * related functions are: {@link assignProjID} & {@link createAssetID}
 *
 * @param {string} collectionId
 * @param {string} itemId
 * @param {import("../types").EodashLink} link
 * @param {string | import("ol/proj").ProjectionLike} projectionCode
 *
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
 * Extracts the STAC collection which the layer was created from.
 *
 * @param {import("../types").CollectionReader[]} indicators
 * @param {import('ol/layer').Layer} layer
 */
export const getColFromLayer = async (indicators, layer) => {
  const [collectionId, ..._other] = layer.get("id").split(";:;");

  for (const ind of indicators) {
    if (ind.stac?.id !== collectionId) continue;
    return ind;
  }
};
