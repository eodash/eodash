import { extractUrlKeys, replaceLayer } from "@eodash/stac/helpers";
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
 * @typedef {import("@eox/map/src/layers").EOxLayerType<"WebGLTile","GeoZarr">} GeoZarrLayer
 * @typedef {import("@eox/map/src/layers").EoxSource<"GeoZarr">} GeoZarrSource
 */

/**
 * Checks if a layer definition is a GeoZarr layer.
 * @param {any} layer - Layer configuration object
 * @returns {layer is Omit<GeoZarrLayer, "source"> & { source: GeoZarrSource }}
 */
function isGeoZarrLayer(layer) {
  return layer?.type === "WebGLTile" && layer?.source?.type === "GeoZarr";
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
 * Updates a VectorTile layer source URL by injecting form values mapped to URL keys.
 *
 * @param {import("ol/layer/Layer").default} olLayer - Target OpenLayers layer
 * @param {Record<string, any>} jsonformValue - Form values mapped to URL parameters
 * @returns {boolean} True if the source URL was updated
 */
export function updateLayerUrl(olLayer, jsonformValue) {
  const jsonLayer = olLayer.get("_jsonDefinition");
  if (!jsonLayer || jsonLayer.type !== "VectorTile") {
    return false;
  }

  const schema = jsonLayer.properties?.layerConfig?.schema;
  const urlKeys = extractUrlKeys(schema);

  if (Object.keys(urlKeys).length === 0) {
    return false;
  }

  let originalUrl = olLayer.get("originalUrl") || jsonLayer.source?.url;

  if (!originalUrl || typeof originalUrl !== "string") {
    return false;
  }

  if (!olLayer.get("originalUrl")) {
    olLayer.set("originalUrl", originalUrl);
  }

  /** @type {Record<string, string>} */
  const queryParamsToInject = {};
  for (const [propName, urlKey] of Object.entries(urlKeys)) {
    queryParamsToInject[urlKey] = jsonformValue[propName];
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
    if (source && "setUrl" in source) {
      /** @type {any} */ (source).setUrl(newUrl);
      return true;
    }
    if (source && "setUrls" in source) {
      /** @type {any} */ (source).setUrls([newUrl]);
      return true;
    }
  }

  return false;
}
