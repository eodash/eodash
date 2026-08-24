import { createHTTPInstance } from "./http.js";
import { findParquetMirror } from "./helpers/assets.js";
import { fetchAllStyles } from "./helpers/style.js";
import { createAPICollection } from "./collections/api.js";
import { createParquetCollection } from "./collections/parquet.js";
import { createStaticCollection } from "./collections/static.js";

/**
 * Creates a collection reader for date lookups and layer creation.
 * Static collections use item links or a GeoParquet mirror asset. STAC APIs require `options.api = true`.
 *
 * @param {string} url - Collection JSON URL or API search endpoint
 * @param {object} [options]
 * @param {boolean} [options.api=false] - Set to true if queried via STAC API search
 * @param {number} [options.maxItems] - Max items returned per search query
 * @param {import("./http.js").AxiosInstance} [options.client] - Custom HTTP client
 * @param {string} [options.color] - Tints this collection's layers, so several rendered together stay tellable apart
 * @param {string} [options.rasterEndpoint] - TiTiler base url the render extension builds tile urls against; without it no render layer is produced
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [options.upscalingEndpoints] - Endpoints a tile url is rewritten onto when the item asks to be upscaled
 * @param {Record<string, any> | null} [options.tileMatrixSets] - Tile matrix set definitions, resolved by projection code
 * @param {Record<string, Record<string, import("./types").Render>>} [options.renders] - Render definitions by collection id, taking precedence over the collection's own
 */
export const createEodashCollection = async (url, options = {}) => {
  const {
    api = false,
    maxItems,
    client,
    color,
    rasterEndpoint,
    upscalingEndpoints,
    tileMatrixSets,
    renders,
  } = options;
  const http = createHTTPInstance({ client });
  /** @type {import("./types").STACCollection} */
  const stac = await http.get(url);
  const rasterOptions = {
    rasterEndpoint,
    upscalingEndpoints,
    tileMatrixSets,
    renders,
  };
  const context = { url, stac, http, color, rasterOptions };

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
