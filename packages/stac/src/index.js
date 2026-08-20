import { createHTTPInstance } from "./http.js";
import { findParquetMirror } from "./helpers/assets.js";
import { fetchAllStyles } from "./helpers/style.js";
import { createAPICollection } from "./collections/api.js";
import { createParquetCollection } from "./collections/parquet.js";
import { createStaticCollection } from "./collections/static.js";

/**
 * A collection whose items are all stated, by `item` links or by a mirror. Both
 * kinds answer the same way, so which one was built does not reach the caller.
 *
 * @typedef {ReturnType<typeof createStaticCollection>
 *   | ReturnType<typeof createParquetCollection>} CollectionReader
 */

/**
 * A collection served by a STAC API, where a lookup carries what narrows it.
 *
 * @typedef {ReturnType<typeof createAPICollection>} ApiReader
 */

/**
 * Reads a collection served by a STAC API, whose items are found by searching.
 *
 * @overload
 * @param {string} url
 * @param {{ api: true, maxItems?: number, client?: import("axios").AxiosInstance }} options
 * @returns {Promise<ApiReader>}
 */
/**
 * Reads a collection that states its own items, as `item` links or as a mirror.
 *
 * @overload
 * @param {string} url
 * @param {{ api?: false, maxItems?: number, client?: import("axios").AxiosInstance }} [options]
 * @returns {Promise<CollectionReader>}
 */
/**
 * Reads a collection whose kind is only known at runtime, leaving the caller to
 * narrow what it gets back.
 *
 * @overload
 * @param {string} url
 * @param {{ api?: boolean, maxItems?: number, client?: import("axios").AxiosInstance }} options
 * @returns {Promise<ApiReader | CollectionReader>}
 */
/**
 * Reads a collection and returns the reader that resolves its items. `api` says
 * which one: a document cannot state that it is served by a search endpoint.
 *
 * @param {string} url collection url
 * @param {object} [options]
 * @param {boolean} [options.api] the catalog is served by a STAC API, which the collection document cannot state
 * @param {number} [options.maxItems] most items one api search returns
 * @param {import("axios").AxiosInstance} [options.client] reads every url the reader needs; `fetch` when left out
 * @returns {Promise<ApiReader | CollectionReader>}
 */
export const createEodashCollection = async (url, options = {}) => {
  const { api = false, maxItems, client } = options;
  const http = createHTTPInstance({ client });
  /** @type {import("./types").EodashCollection} */
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
 * The tooltip fields an item's styles declare, deduplicated by id: several
 * styles may name the same field, and the layer shows each one once.
 *
 * @param {import("./types").EodashItem} item
 * @param {object} [options]
 * @param {import("axios").AxiosInstance} [options.client] reads the style documents; `fetch` when left out
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
