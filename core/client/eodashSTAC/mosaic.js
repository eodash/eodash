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
  const body = cqlQuery ? { filter: cqlQuery } : {};

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
  /** @type {import("ol/source/TileJSON").Options["tileJSON"]} */
  const tileJSON = await axios.get(tileJSONLink.href).then((response) => response.data);
  return [{
    type: "Tile",
    properties: {
      id: "Mosaic",
      title: "Mosaic",
    },
    source: {
      type: "TileJSON",
      tileJSON
    }
  }]

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
 */
export async function updateMosaicLayer(layersCollection, mosaicEndpoint) {
  /** @type {(string|object)[]} */
  const filters = [];
  if (mosaicState.filters.time) {
    filters.push(mosaicState.filters.time);
  }
  if (mosaicState.filters.spatial) {
    filters.push(mosaicState.filters.spatial);
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
