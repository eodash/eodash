import axios from "@/plugins/axios";
import {
  compareIndicator,
  indicator,
  chartSpec,
  compareChartSpec,
} from "@/store/states";
import { activeProcessDatetime } from "../../../states";
import mustache from "mustache";
import {
  pollProcessStatus,
  updateJobsStatus,
} from "^/EodashProcess/methods/async";
import {
  buildChartSpecWithData,
  creatAsyncProcessLayerDefinitions,
  EOXHUB_WORKSPACES_ENDPOINT,
  extractAsyncResults,
  findTemporalField,
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
    (link) => link.rel === "service" && link.endpoint === EOXHUB_WORKSPACES_ENDPOINT,
  );
  if (!eoxhubLinks.length) return;

  // Prevent the stale chart spec (from a previous run's cached Vega URL)
  // from rendering while the async process is in progress.
  // The correct spec with live data will be set after polling completes below.
  const usedChartSpec = enableCompare ? compareChartSpec : chartSpec;
  usedChartSpec.value = null;

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

      // After polling, fetch JSON stats from URL and update chart
      const statsResult = processResults.find(
        (r) => r.type === "application/json" && r.urls?.length,
      );
      if (statsResult) {
        try {
          const statsResp = await axios.get(statsResult.urls[0]);
          const statsJson = statsResp.data;
          const chartData = statsJson?.data?.values ?? statsJson?.values ?? (Array.isArray(statsJson) ? statsJson : []);
          if (chartData.length) {
            const specUrl = /** @type {string | undefined} */ (selectedStac?.["eodash:vegadefinition"]);
            const builtSpec = await buildChartSpecWithData(
              specUrl,
              chartData,
              usedChartSpec.value,
            );
            if (builtSpec) {
              usedChartSpec.value = builtSpec;
            }
          }
        } catch (e) {
          console.warn("[eodash] Could not fetch stats from URL:", e);
        }
      }

      // Set initial highlight to the first chart data datetime so the red
      // line aligns exactly with the first box plot on the x-axis.
      // Fall back to the layer datetimes if chart data is unavailable.
      if (!activeProcessDatetime.value) {
        const usedSpec = usedChartSpec.value;
        const temporalKey = usedSpec ? findTemporalField(usedSpec) : null;
        const specData = /** @type {any} */ (usedSpec?.data)?.values;
        const firstChartDt = temporalKey && Array.isArray(specData) && specData.length
          ? specData[0][temporalKey]
          : null;
        if (firstChartDt) {
          activeProcessDatetime.value = firstChartDt;
        } else {
          const datetimeResult = processResults.find(
            (r) => (r.datetimes?.length ?? 0) > 0,
          );
          activeProcessDatetime.value = datetimeResult?.datetimes?.[0] ?? null;
        }
      }

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
