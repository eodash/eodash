import { LAYER_ID_SEPARATOR } from "@eodash/stac/helpers";

/**
 * Returns a shortened, stable identifier for a layer ID by omitting transient itemId parts.
 * - 4-part: collection;:;item;:;link;:;proj -> collection;:;link;:;proj
 * - 3-part: collection;:;item;:;link -> collection;:;link
 * - 2-part or 1-part (base layers, overlays): returned as-is
 *
 * @param {string} layerId
 * @returns {string}
 */
export function toShortLayerKey(layerId) {
  if (!layerId || typeof layerId !== "string") {
    return "";
  }
  const parts = layerId.split(LAYER_ID_SEPARATOR);
  if (parts.length >= 3) {
    // parts: [collection, item, ...rest]
    return [parts[0], ...parts.slice(2)].join(LAYER_ID_SEPARATOR);
  }
  return layerId;
}

/**
 * Checks whether a full layerId matches a shortened layer key or collection prefix.
 *
 * @param {string} fullLayerId
 * @param {string} shortKey
 * @returns {boolean}
 */
export function layerMatchesKey(fullLayerId, shortKey) {
  if (!fullLayerId || !shortKey) {
    return false;
  }
  if (fullLayerId === shortKey) {
    return true;
  }
  if (toShortLayerKey(fullLayerId) === shortKey) {
    return true;
  }
  // If the key is just the collection prefix, match layers belonging to that collection
  const prefix = fullLayerId.split(LAYER_ID_SEPARATOR)[0];
  return prefix === shortKey;
}

/**
 * Flattens all leaf layers from a potentially nested layer array/group tree.
 *
 * @param {Array<Record<string, any>>} layers
 * @returns {Array<Record<string, any>>}
 */
export function flattenLayers(layers) {
  if (!Array.isArray(layers)) {
    return [];
  }
  const result = [];
  for (const layer of layers) {
    if (layer?.type === "Group" && Array.isArray(layer.layers)) {
      result.push(...flattenLayers(layer.layers));
    } else if (layer) {
      result.push(layer);
    }
  }
  return result;
}

/**
 * Traverses a layer tree and applies restored state (v: visibility, o: opacity)
 * to any layer matching the restored state map.
 *
 * @param {Array<Record<string, any>>} layers
 * @param {Record<string, { v?: boolean; o?: number; t?: string; c?: Record<string, any> }> | null} restoredState
 * @returns {boolean} true if any layer was modified
 */
export function applyRestoredLayerProperties(layers, restoredState) {
  if (
    !restoredState ||
    !Object.keys(restoredState).length ||
    !Array.isArray(layers)
  ) {
    return false;
  }
  let modified = false;
  for (const layer of layers) {
    if (layer?.type === "Group" && Array.isArray(layer.layers)) {
      if (applyRestoredLayerProperties(layer.layers, restoredState)) {
        modified = true;
      }
      continue;
    }

    const id = layer?.properties?.id;
    if (!id) {
      continue;
    }

    const shortKey = toShortLayerKey(id);
    const prefix = id.split(LAYER_ID_SEPARATOR)[0];
    const override =
      restoredState[shortKey] || restoredState[id] || restoredState[prefix];
    if (!override) {
      continue;
    }

    if (override.v !== undefined) {
      layer.properties = layer.properties || {};
      layer.properties.visible = override.v;
      layer.visible = override.v;
      modified = true;
    }

    if (override.o !== undefined) {
      layer.opacity = override.o;
      modified = true;
    }
  }
  return modified;
}
