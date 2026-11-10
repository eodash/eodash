import {
  LAYER_ID_SEPARATOR,
  getLayerCollectionPrefix,
} from "@eodash/stac/helpers";

/**
 * Returns a shortened, stable identifier for a layer ID by omitting transient itemId and projection parts:
 * - 4-part: collection;:;item;:;link;:;proj -> collection;:;link
 * - 3-part: collection;:;item;:;link -> collection;:;link
 * - 2-part: link;:;proj -> link (for base layers/overlays)
 * - 1-part: returned as-is
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
    // [collection, item, link, ...] -> collection;:;link
    return `${parts[0]}${LAYER_ID_SEPARATOR}${parts[2]}`;
  }
  if (parts.length === 2) {
    // [link, proj] -> link
    return parts[0];
  }
  return layerId;
}

/**
 * Checks whether a full layerId matches a shortened layer key or collection prefix.
 *
 * @param {string} fullLayerId
 * @param {string} key
 * @returns {boolean}
 */
export function layerMatchesKey(fullLayerId, key) {
  if (!fullLayerId || !key) return false;
  return (
    fullLayerId === key ||
    toShortLayerKey(fullLayerId) === key ||
    getLayerCollectionPrefix(fullLayerId) === key
  );
}

/**
 * Flattens an array of layers, walking groups recursively.
 *
 * @param {Array<Record<string, any>>} layers
 * @returns {Array<Record<string, any>>}
 */
export function getFlatLayers(layers) {
  if (!Array.isArray(layers)) return [];
  const result = [];
  for (const layer of layers) {
    if (layer?.type === "Group" && Array.isArray(layer.layers)) {
      result.push(...getFlatLayers(layer.layers));
    } else if (layer) {
      result.push(layer);
    }
  }
  return result;
}

/**
 * Applies restored state (visible, opacity, datetime) to layers matching the restored state map.
 *
 * @param {Array<Record<string, any>>} layers
 * @param {Record<string, { visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }> | null} restoredState
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
  const flatLayers = getFlatLayers(layers);

  for (const layer of flatLayers) {
    const id = layer?.properties?.id;
    if (!id) continue;

    const shortKey = toShortLayerKey(id);
    const prefix = getLayerCollectionPrefix(id);
    const override =
      restoredState[shortKey] || restoredState[id] || restoredState[prefix];
    if (!override) continue;

    if (override.visible !== undefined) {
      layer.properties = layer.properties || {};
      layer.properties.visible = override.visible;
      layer.visible = override.visible;
      modified = true;
    }

    if (override.opacity !== undefined) {
      layer.opacity = override.opacity;
      modified = true;
    }

    if (override.datetime && layer.properties?.layerDatetime) {
      layer.properties.layerDatetime.currentStep = override.datetime;
      modified = true;
    }
  }
  return modified;
}
