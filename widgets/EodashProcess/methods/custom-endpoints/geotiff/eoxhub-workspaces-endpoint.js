import axios from "@/plugins/axios";
import { indicator } from "@/store/states";
import mustache from "mustache";
import { pollProcessStatus } from "^/EodashProcess/methods/async";
import { createTiffLayerDefinition } from "^/EodashProcess/methods/utils";

/**
 *
 * @param {import("^/EodashProcess/types").CustomEnpointInput} param0
 */

export async function handleEOxHubEndpoint({
  links,
  jsonformValue,
  isPolling,
  selectedStac,
}) {
  if (!isPolling) {
    return;
  }
  const eoxhubLinks = links.filter(
    (link) => link.rel === "service" && link.endpoint === "eoxhub_workspaces",
  );
  for (const link of eoxhubLinks) {
    // TODO: prove of concept, needs to be reworked for sure
    // Special handling for eoxhub workspace process endpoints
    const postBody = await axios
      .get(/** @type {string} */ (link["body"]), { responseType: "text" })
      .then((resp) => resp.data);
    const jsonData = JSON.parse(
      mustache.render(postBody, { ...(jsonformValue ?? {}) }),
    );
    try {
      const responseProcess = await axios.post(link.href, jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // We save the process status url into localstorage assigning it to the indicator id
      const currentJobs = JSON.parse(
        localStorage.getItem(indicator.value) || "[]",
      );
      currentJobs.push(responseProcess.headers.location);
      localStorage.setItem(indicator.value, JSON.stringify(currentJobs));
      /**
       *  @type {{
       * processId: string;
       * urls: string[];
       * }}
       * */
      const { processId, urls } = await pollProcessStatus({
        processUrl: responseProcess.headers.location,
        isPolling,
      })
        .then((resultItem) => {
          const resultUrls = resultItem?.urls;
          if (resultUrls?.length) {
            return { processId: "", urls: /** @type {string[]} */ ([]) };
          }
          /** @type {string} */
          const processId = resultItem?.id;
          /** @type {string[]} */
          const urls = resultUrls;
          return { processId, urls };
        })
        .catch((error) => {
          if (error instanceof Error) {
            console.error("Polling failed:", error.message);
          } else {
            console.error("Unknown error occurred during polling:", error);
          }
          return { processId: "", urls: /** @type {string[]} */ ([]) };
        });
      if (!processId || !urls.length) {
        return;
      }
      return await createTiffLayerDefinition(
        link,
        selectedStac?.id ?? "",
        urls,
        //@ts-expect-error TODO
        selectedStac?.["eodash:mapProjection"]?.["name"] ?? null,
        processId,
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sending POST request:", error.message);
      } else {
        console.error("Unknown error occurred:", error);
      }
    }
  }
}
