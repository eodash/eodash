import { handleEOxHubEndpoint } from "./eoxhub-workspaces-endpoint";

export const handleGeotiffCustomEndpoints = createCustomGeoTiffEndpointsHandler(
  [handleEOxHubEndpoint],
);

/**
 * @param {((input:import("^/EodashProcess/types").CustomEnpointInput)=> Promise<Record<string,any> | undefined | null>)[]} callbacks
 * @returns {(inputs:import("^/EodashProcess/types").CustomEnpointInput)=>Promise<Record<string,any>[]>}
 */
function createCustomGeoTiffEndpointsHandler(callbacks) {
  return async (inputs) => {
    // this allows multiple endpoints links to exist
    // and return multiple layers
    return await Promise.all(
      callbacks.map((callback) => callback(inputs)),
    ).then(
      (layers) =>
        /** @type {Record<string,any>[]} */ (
          layers.filter((layer) => layer && isValidGeoTIFF(layer))
        ),
    );
  };
}

/**
 *
 * @param {Record<string,any>} layer
 * @returns
 */
function isValidGeoTIFF(layer) {
  return (
    layer &&
    layer.source &&
    layer.source.type === "GeoTIFF" &&
    layer.source.sources?.length
  );
}
