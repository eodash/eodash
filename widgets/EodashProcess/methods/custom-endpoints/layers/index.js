import { handleEOxHubEndpoint } from "./eoxhub-workspaces-endpoint";

export const handleLayersCustomEndpoints = createCustomLayersEndpointsHandler([
  handleEOxHubEndpoint,
]);

/**
 * @param {((input:import("^/EodashProcess/types").CustomEnpointInput)=> Promise<Record<string,any> | undefined | null>)[]} callbacks
 * @returns {(input: import("^/EodashProcess/types").CustomEnpointInput) => Promise<import("@eox/map/.").EoxLayer[]>}
 */
function createCustomLayersEndpointsHandler(callbacks) {
  return async (inputs) => {
    // this allows multiple endpoints links to exist
    // and return multiple layers
    return await Promise.all(
      callbacks.map((callback) => callback(inputs)),
    ).then((layers) => layers.filter(isValidEoxLayer));
  };
}

/**
 *
 * @param {any} layer
 * @returns {layer is import("@eox/map/.").EoxLayer}
 */
function isValidEoxLayer(layer) {
  return layer && layer.type && (layer.source || layer.layers);
}
