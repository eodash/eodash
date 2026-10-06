import {
  extractUrlKeys,
  isGeoZarrLayer,
  replaceLayer,
} from "@eodash/stac/helpers";
import { assignLayers } from "@/store/actions";

/**
 * Updates a GeoZarr layer definition with newly selected bands and updates the map layers.
 *
 * @param {import("ol/layer/Layer").default} olLayer - Target OpenLayers layer
 * @param {Record<string, any>} jsonformValue - Form values containing band selections
 * @param {import("@eox/map").EOxMap | null} map - Map instance
 */
export function updateGeoZarrBands(olLayer, jsonformValue, map) {
  const jsonLayer = olLayer.get("_jsonDefinition");
  const updatedBands = jsonformValue.bands;
  if (!isGeoZarrLayer(jsonLayer) || !updatedBands) {
    return;
  }

  const oldBands = jsonLayer.source.bands;
  if (JSON.stringify(updatedBands) === JSON.stringify(oldBands)) {
    return;
  }

  assignLayers(
    map,
    replaceLayer(map?.layers ?? [], olLayer.get("id"), [
      {
        ...jsonLayer,
        source: { ...jsonLayer.source, bands: [...updatedBands] },
      },
    ]),
  );
}

/**
 * Appends query parameters to a URL string while preserving URI templates.
 * @param {string} url
 * @param {Record<string, string>} params
 * @returns {string}
 */
function appendQueryParams(url, params) {
  const [base, query] = url.split("?");
  const searchParams = new URLSearchParams(query || "");

  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      searchParams.set(key, val);
    } else {
      searchParams.delete(key);
    }
  }

  const newQuery = searchParams.toString();
  return newQuery ? `${base}?${newQuery}` : base;
}

/**
 * Updates a VectorTile or Vector layer source URL by injecting form values mapped to URL keys.
 *
 * @param {import("ol/layer/Layer").default} olLayer - Target OpenLayers layer
 * @param {Record<string, any>} jsonformValue - Form values mapped to URL parameters
 * @returns {boolean} True if the source URL was updated
 */
export function updateLayerUrl(olLayer, jsonformValue) {
  const jsonLayer = olLayer.get("_jsonDefinition");
  if (!jsonLayer || (jsonLayer.type !== "VectorTile" && jsonLayer.type !== "Vector")) {
    return false;
  }

  const schema = jsonLayer.properties?.layerConfig?.schema;
  const queryParamsToInject = extractUrlKeys(schema, jsonformValue);

  if (Object.keys(queryParamsToInject).length === 0) {
    return false;
  }

  let originalUrl = olLayer.get("originalUrl") || jsonLayer.source?.url;

  if (!originalUrl || typeof originalUrl !== "string") {
    return false;
  }

  if (!olLayer.get("originalUrl")) {
    olLayer.set("originalUrl", originalUrl);
  }

  const newUrl = appendQueryParams(originalUrl, queryParamsToInject);

  if (jsonLayer.source?.url) {
    if (jsonLayer.source.url === newUrl) {
      return false;
    }
    jsonLayer.source.url = newUrl;
    if (olLayer.get("injectedUrl") === newUrl) {
      return false;
    }
    const source = olLayer.getSource();
    olLayer.set("injectedUrl", newUrl);

    if (source) {
      if ("setUrl" in source) {
        /** @type {any} */ (source).setUrl(newUrl);
      } else if ("setUrls" in source) {
        /** @type {any} */ (source).setUrls([newUrl]);
      }

      if ("refresh" in source && typeof source.refresh === "function") {
        /** @type {any} */ (source).refresh();
      }
      return true;
    }
  }

  return false;
}
