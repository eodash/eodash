import axios from "@/plugins/axios";
import { compareIndicator, indicator } from "@/store/states";
import mustache from "mustache";
import {
  pollProcessStatus,
  updateJobsStatus,
} from "^/EodashProcess/methods/async";
import {
  creatAsyncProcessLayerDefinitions,
  extractAsyncResults,
} from "../../utils";

/**
 *
 * @param {import("^/EodashProcess/types").CustomEnpointInput} param0
 */

export async function handleEOxHubEndpoint({
  links,
  jsonformValue,
  isPolling,
  selectedStac,
  jobs,
  enableCompare = false,
}) {
  if (!isPolling) {
    return;
  }
  const eoxhubLinks = links.filter(
    (link) => link.rel === "service" && link.endpoint === "eoxhub_workspaces",
  );
  const layers = [];
  for (const link of eoxhubLinks) {
    // TODO: prove of concept, needs to be reworked for sure
    // Special handling for eoxhub workspace process endpoints
    const postBody = await axios
      .get(/** @type {string} */ (link["body"]), { responseType: "text" })
      .then((resp) => resp.data);
    const jsonData = JSON.parse(
      mustache.render(postBody, { ...(jsonformValue ?? {}) }),
    );
    const currentIndicator = enableCompare ? compareIndicator : indicator;
    try {
      const responseProcess = await axios.post(link.href, jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // We save the process status url into localstorage assigning it to the indicator id
      const currentJobs = JSON.parse(
        localStorage.getItem(currentIndicator.value) || "[]",
      );
      currentJobs.push(responseProcess.headers.location);
      localStorage.setItem(currentIndicator.value, JSON.stringify(currentJobs));

      const processResults = await pollProcessStatus({
        jobs,
        processUrl: responseProcess.headers.location,
        isPolling,
        enableCompare,
      })
        .then((resultItem) => {
          return extractAsyncResults(resultItem);
        })
        .catch((error) => {
          if (error instanceof Error) {
            console.error("Polling failed:", error.message);
          } else {
            console.error("Unknown error occurred during polling:", error);
          }
          return [];
        });
      await updateJobsStatus(jobs, currentIndicator.value);

      layers.push(
        ...(await creatAsyncProcessLayerDefinitions(
          processResults,
          link,
          selectedStac,
        )),
      );
    } catch (error) {
      await updateJobsStatus(jobs, currentIndicator.value);
      if (error instanceof Error) {
        console.error("Error sending POST request:", error.message);
      } else {
        console.error("Unknown error occurred:", error);
      }
    }
  }

  return layers;
}
