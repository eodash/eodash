import log from "loglevel";
import { handleEOxHubEndpoint } from "./eoxhub-workspaces-endpoint";

export const handleGeotiffCustomEndpoints = createCustomGeoTiffEndpointsHandler(
  [handleEOxHubEndpoint],
);

/**
 * @param {((input:import("^/EodashProcess/types").CustomEnpointInput)=> Promise<Record<string,any> | undefined | null>)[]} callbacks
 */
function createCustomGeoTiffEndpointsHandler(callbacks) {
  /**
   * @param {import("^/EodashProcess/types").CustomEnpointInput} inputs
   */
  return async (inputs) => {
    const layers = await Promise.all(
      callbacks.map((callback) =>
        callback(inputs).then((layer) => {
          const isInvalidGeotiff =
            !layer ||
            !layer.source ||
            layer.source.type !== "GeoTIFF" ||
            !layer.source.sources ||
            !layer.source.sources.length;
          if (isInvalidGeotiff) {
            return;
          }

          log.debug(
            "Custom endpoint layer:",
            layer,
            "for callback:",
            callback.name,
            "inputs:",
            inputs,
          );
          return layer;
        }),
      ),
    );

    return layers.filter((result) => !!result) || undefined;
  };
}
