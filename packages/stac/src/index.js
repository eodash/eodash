import { createHTTPInstance } from "./http.js";
import { findParquetMirror } from "./helpers/assets.js";
import { fetchAllStyles } from "./helpers/style.js";
import { createAPICollection } from "./collections/api.js";
import { createParquetCollection } from "./collections/parquet.js";
import { createStaticCollection } from "./collections/static.js";

/**
 * Creates a collection reader for querying dates and generating map layers.
 * Selects an API, GeoParquet, or static collection reader based on the options and collection metadata.
 *
 * @param {string} url - Collection URL or API search endpoint
 * @param {object} [options]
 * @param {boolean} [options.api=false] - Whether the collection uses a STAC API endpoint
 * @param {number} [options.maxItems] - Maximum items to retrieve per search query
 * @param {import("./http.js").AxiosInstance} [options.client] - Custom HTTP client instance
 * @param {string} [options.color] - Color assigned to layers generated from this collection
 * @param {string} [options.viewProjection] - Map view projection code used to namespace layer identifiers
 * @param {string} [options.rasterEndpoint] - Base URL for raster tile rendering
 * @param {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [options.upscalingEndpoints] - Tile endpoints for high-resolution rendering
 * @param {Record<string, any> | null} [options.tileMatrixSets] - TileMatrixSet configurations keyed by projection
 * @param {Record<string, Record<string, import("./types").Render>>} [options.renders] - Render configurations mapped by collection ID
 * @returns {Promise<import("./types").Reader>}
 */
export const createEodashCollection = async (url, options = {}) => {
  const {
    api = false,
    maxItems,
    client,
    color,
    viewProjection,
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
  const context = { url, stac, http, color, viewProjection, rasterOptions };

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
