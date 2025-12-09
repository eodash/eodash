import axios from "@/plugins/axios";
import { createLayersFromLinks } from "./createLayers";
import { Item } from "stac-js";
import { mosaicState } from "@/utils/states";

/**
 * Fetches the STAC definition for the mosaic. TODO: reuse registered queries
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {string | object | null} [cqlQuery] - Optional CQL query to filter the mosaic.
 * @returns {Promise<import("stac-ts").StacItem | null>}
 */
export async function registerMosaic(mosaicEndpoint, cqlQuery) {
  if (!mosaicEndpoint) {
    return null;
  }

  const url = mosaicEndpoint;
  const body = cqlQuery
    ? {
      "filter-lang": "cql2-json",
      filter: cqlQuery,
      sortby: [{ field: "datetime", direction: "desc" }],
    }
    : null;
  if (!body) {
    console.trace("[eodash] No query provided for mosaic registration");
    return null;
  }

  console.log("[eodash] Registering mosaic with query:", body);
  return await axios
    .post(url, body)
    .then((response) => response.data)
    .catch((error) => {
      console.error("[eodash] Failed to register mosaic:", error);
      return null;
    });
}

/**
 * Creates a layer configuration for the mosaic.
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {string | object | null} [cqlQuery] - Optional CQL query.
 * @returns {Promise<Record<string, any>[]>}
 */
export async function createMosaicLayer(mosaicEndpoint, cqlQuery) {
  const mosaicStac = await registerMosaic(mosaicEndpoint, cqlQuery);
  if (!mosaicStac) {
    return [];
  }

  // treat the mosaic STAC as an item
  const item = new Item(mosaicStac);
  const tileJSONLink = item.links.find((l) => l.rel === "tilejson");
  if (!tileJSONLink) {
    return [];
  }
  // todo: fetch the assets properly
  const url = tileJSONLink.href + "?" + "tile_scale=2&assets=B04&assets=B03&assets=B02&color_formula=Gamma%20RGB%203.2%20Saturation%200.8%20Sigmoidal%20RGB%2025%200.35&nodata=0&minzoom=9&collection=sentinel-2-l2a&format=png";
  console.log("[eodash] Created mosaic layer with tileJSON:", url);
  // todo: use createLayersFromLinks
  return [
    {
      type: "Tile",
      properties: {
        id: "Mosaic" + Date.now(),
        title: "Mosaic",
      },
      source: {
        type: "TileJSON",
        url,
      },
    },
  ];
  // // create layers from links
  // const layers = await createLayersFromLinks(
  //   item.id,
  //   item.id,
  //   item,
  //   mosaicEndpoint,
  //   undefined,
  //   {},
  // );

  // return layers;
}

/**
 * Modifies the layers collection to display the mosaic layer.
 * Removes existing layers in the AnalysisGroup and adds the mosaic layer.
 * @param {Record<string, any>[]} layersCollection - The layers collection to modify.
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {string | object | null} [cqlQuery] - Optional CQL query.
 */
export async function renderMosaic(layersCollection, mosaicEndpoint, cqlQuery) {
  const mosaicLayers = await createMosaicLayer(mosaicEndpoint, cqlQuery);

  if (mosaicLayers.length) {
    const analysisGroup = layersCollection.find(
      (l) => l.properties?.id === "AnalysisGroup",
    );

    if (analysisGroup) {
      analysisGroup.layers = mosaicLayers;
      mosaicState.showButton = false;
    }
  }
}
/**
 * Updates the mosaic layer based on the current filters in mosaicState.
 * @param {Record<string, any>[]} layersCollection - The layers collection to modify.
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {{ timeRange?: [string, string]; bbox?: [number, number, number, number]; collection?: string }} queries - Optional CQL queries.
 */
export async function updateMosaicLayer(
  layersCollection,
  mosaicEndpoint,
  { timeRange, bbox, collection } = {},
) {
  /** @type {(string|object)[]} */
  const filters = [];
  if (timeRange && Array.isArray(timeRange) && timeRange.length === 2) {
    const timeFilter = {
      op: "between",
      args: [
        { property: "datetime" },
        { timestamp: timeRange[0] },
        { timestamp: timeRange[1] },
      ],
    };
    filters.push(timeFilter);
    mosaicState.filters.time = timeFilter;
  }
  if (bbox && Array.isArray(bbox) && bbox.length === 4) {
    const [minx, miny, maxx, maxy] = bbox;
    const spatialQuery = {
      op: "s_intersects",
      args: [
        { property: "geometry" },
        {
          type: "Polygon",
          coordinates: [
            [
              [minx, miny],
              [maxx, miny],
              [maxx, maxy],
              [minx, maxy],
              [minx, miny]
            ]
          ]
        }
      ]
    }
    filters.push(spatialQuery);
    mosaicState.filters.spatial = spatialQuery;
  }
  if (collection) {
    mosaicState.filters.collection = collection;
    filters.push({
      op: "=",
      args: [{ property: "collection" }, collection],
    });
  }

  let cqlQuery = null;
  if (filters.length === 1) {
    cqlQuery = filters[0];
  } else if (filters.length > 1) {
    cqlQuery = {
      op: "and",
      args: filters,
    };
  }

  mosaicState.query = cqlQuery;
  await renderMosaic(layersCollection, mosaicEndpoint, cqlQuery);
}
