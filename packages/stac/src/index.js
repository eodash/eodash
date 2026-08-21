import { createHTTPInstance } from "./http.js";
import { findParquetMirror } from "./helpers/assets.js";
import { fetchAllStyles } from "./helpers/style.js";
import { createAPICollection } from "./collections/api.js";
import { createParquetCollection } from "./collections/parquet.js";
import { createStaticCollection } from "./collections/static.js";

/**
 * A static STAC collection reader (backed by item links or a GeoParquet mirror).
 *
 * @typedef {ReturnType<typeof createStaticCollection>
 *   | ReturnType<typeof createParquetCollection>} CollectionReader
 */

/**
 * A STAC API search collection reader.
 *
 * @typedef {ReturnType<typeof createAPICollection>} ApiReader
 */

/**
 * Reads a STAC API collection endpoint.
 *
 * @overload
 * @param {string} url
 * @param {{ api: true, maxItems?: number, client?: import("./http.js").AxiosInstance }} options
 * @returns {Promise<ApiReader>}
 */
/**
 * Reads a static STAC collection or GeoParquet mirror collection.
 *
 * @overload
 * @param {string} url
 * @param {{ api?: false, maxItems?: number, client?: import("./http.js").AxiosInstance }} [options]
 * @returns {Promise<CollectionReader>}
 */
/**
 * Reads a STAC collection with dynamic API flag resolution.
 *
 * @overload
 * @param {string} url
 * @param {{ api?: boolean, maxItems?: number, client?: import("./http.js").AxiosInstance }} options
 * @returns {Promise<ApiReader | CollectionReader>}
 */
/**
 * Creates a collection reader for date lookups and layer creation.
 * Static collections use item links or a GeoParquet mirror asset. STAC APIs require `options.api = true`.
 *
 * @param {string} url - Collection JSON URL or API search endpoint
 * @param {object} [options]
 * @param {boolean} [options.api=false] - Set to true if queried via STAC API search
 * @param {number} [options.maxItems] - Max items returned per search query
 * @param {import("./http.js").AxiosInstance} [options.client] - Custom HTTP client
 * @returns {Promise<ApiReader | CollectionReader>}
 */
export const createEodashCollection = async (url, options = {}) => {
  const { api = false, maxItems, client } = options;
  const http = createHTTPInstance({ client });
  /** @type {import("./types").STACCollection} */
  const stac = await http.get(url);
  const context = { url, stac, http };

  if (api) {
    return createAPICollection({ ...context, maxItems });
  }

  if (findParquetMirror(stac)) {
    return createParquetCollection(context);
  }

  return createStaticCollection(context);
};

/**
 * Extracts and deduplicates tooltip definitions from an item's linked style documents.
 *
 * @param {import("./types").STACItem} item - The STAC Item containing style links
 * @param {object} [options]
 * @param {import("./http.js").AxiosInstance} [options.client] - Custom HTTP client for fetching styles
 * @returns {Promise<NonNullable<import("./types").EodashStyleJson["tooltip"]>>}
 */
export const getTooltipProperties = async (item, { client } = {}) => {
  const styles = await fetchAllStyles(item, createHTTPInstance({ client }));
  return [
    ...new Map(
      styles
        .flatMap((style) => style.tooltip ?? [])
        .map((entry) => [entry.id, entry]),
    ).values(),
  ];
};

export {
  getIndicatorLayers,
  getObservationPointsLayer,
} from "./layers/collection.js";
