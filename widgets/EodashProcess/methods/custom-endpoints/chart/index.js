import log from "loglevel";
import { handleSentinelHubProcess } from "./sentinelhub-endpoint";
import { handleVedaEndpoint } from "./veda-endpoint";

export const handleChartCustomEndpoints = createCustomChartEndpointsHandler([
  handleSentinelHubProcess,
  handleVedaEndpoint,
]);
/**
 * @param {((input:import("^/EodashProcess/types").CustomEnpointInput)=> Promise<any[] | undefined | null>)[]} callbacks
 */
function createCustomChartEndpointsHandler(callbacks) {
  /**
   * @param {import("^/EodashProcess/types").CustomEnpointInput} inputs
   * */
  return async (inputs) => {
    for (const callback of callbacks) {
      const data = await callback(inputs);
      log.debug(
        "Custom endpoint data:",
        data,
        "for callback:",
        callback.name,
        "inputs:",
        inputs,
      );
      const isNotValid = !data || !data.length || data.some((item) => !item);
      if (isNotValid) {
        continue;
      }
      return data;
    }
    return null;
  };
}
