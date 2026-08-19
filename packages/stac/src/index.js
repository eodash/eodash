import axios from "axios";
import { findParquetMirror } from "./helpers/assets.js";
import { createAPICollection } from "./collections/api.js";
import { createParquetCollection } from "./collections/parquet.js";
import { createStaticCollection } from "./collections/static.js";

/**
 * Reads a collection and returns the reader that resolves its items.
 *
 * @param {string} url collection url
 * @param {object} [options]
 * @param {boolean} [options.api] the catalog is served by a STAC API, which the collection document cannot state
 * @param {number} [options.maxItems] most items one api search returns
 * @returns {Promise<import("./types").CollectionReader>}
 */
export const createEodashCollection = async (url, options = {}) => {
  const { api = false, maxItems } = options;
  /** @type {import("./types").EodashCollection} */
  const stac = await axios.get(url).then((response) => response.data);
  const context = { url, stac };

  if (api) {
    return createAPICollection({ ...context, maxItems });
  }

  if (findParquetMirror(stac)) {
    return createParquetCollection(context);
  }

  return createStaticCollection(context);
};
