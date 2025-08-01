import { compareIndicator, indicator } from "@/store/states";
// we don't want to use the caching axios instance here
import axios from "axios";
import {
  applyProcessLayersToMap,
  creatAsyncProcessLayerDefinitions,
  download,
  extractAsyncResults,
} from "./utils";
import log from "loglevel";

/**
 * Polls the process status and fetches a result item when the process is successful.
 *
 * @param {Object} params - Parameters for polling the process status.
 * @param {import("vue").Ref<import("../types").AsyncJob[]>} params.jobs - The list of jobs to update.
 * @param {string} params.processUrl - The URL of the process JSON report.
 * @param {import("vue").Ref<boolean>} params.isPolling - checks wether the polling should continue
 * @param {number} [params.pollInterval=5000] - The interval (in milliseconds) between polling attempts.
 * @param {number} [params.maxRetries=60] - The maximum number of polling attempts.
 * @param {boolean} [params.enableCompare=false] - Whether to enable comparison mode, affecting the indicator used.
 * @returns {Promise<import("../types").EOxHubProcessResults>} The fetched results JSON.
 * @throws {Error} If the process does not complete successfully within the maximum retries.
 */
export async function pollProcessStatus({
  jobs,
  processUrl,
  isPolling,
  pollInterval = 10000,
  maxRetries = 560,
  enableCompare = false,
}) {
  let retries = 0;
  isPolling.value = true;
  // Ensure the jobs status is updated after the job has started and before polling
  setTimeout(() => {
    updateJobsStatus(
      jobs,
      enableCompare ? compareIndicator.value : indicator.value,
    );
  }, 500);

  while (retries < maxRetries && isPolling.value) {
    try {
      // Fetch the process JSON report
      const cacheBuster = new Date().getTime(); // Add a timestamp for cache busting
      const response = await axios.get(`${processUrl}?t=${cacheBuster}`);
      const processReport = response.data;

      // Check if the status is "successful"
      if (processReport.status === "successful") {
        console.log("Process completed successfully. Fetching result item...");

        // Extract the result item URL
        const resultsUrl = processReport.links[1].href;
        if (!resultsUrl) {
          throw new Error(`Result links not found in the process report.`);
        }

        // Fetch the result item
        const resultResponse = await axios.get(resultsUrl);
        console.log("Result file fetched successfully:", resultResponse.data);
        return resultResponse.data; // Return the json result list
      }
      if (processReport.status === "failed") {
        isPolling.value = false;
        throw new Error("Process failed.", processReport);
      }

      // Log the current status if not successful
      console.log(
        `Status: ${processReport.status}. Retrying in ${pollInterval / 1000} seconds...`,
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error while polling process status:", error.message);
      } else {
        console.error("Unknown error occurred:", error);
      }
    }

    // Wait for the next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    retries++;
  }
  if (!isPolling.value) {
    console.warn("Polling was stopped before the process was completed.");
    return JSON.parse("{}");
  }

  throw new Error(
    "Max retries reached. Process did not complete successfully.",
  );
}

/**
 *
 * @param {import("vue").Ref<import("../types").AsyncJob[]>} jobs
 * @param {string} indicator
 */
export async function updateJobsStatus(jobs, indicator) {
  /** @type {string[]} */
  const jobsUrls = JSON.parse(localStorage.getItem(indicator) || "[]");
  /** @type {import("../types").AsyncJob[]} */
  const jobResults = await Promise.all(
    jobsUrls.map((url) =>
      axios
        .get(url, { params: { t: Date.now() } })
        .then((response) => response.data),
    ),
  );
  jobResults.sort((a, b) => {
    return (
      new Date(b.job_start_datetime).getTime() -
      new Date(a.job_start_datetime).getTime()
    );
  });
  jobs.value = jobResults;
}

/**
 * Removes a job from the local storage and updates the job status
 * @param {import("vue").Ref<import("../types").AsyncJob[]>} jobs
 * @param {import("../types").AsyncJob} jobObject
 * @param {string} indicator
 */
export const deleteJob = async (jobs, jobObject, indicator) => {
  /** @type {string[]} */
  const jobsUrls = JSON.parse(localStorage.getItem(indicator) || "[]");
  const newJobs = jobsUrls.filter((url) => !url.includes(jobObject.jobID));
  localStorage.setItem(indicator, JSON.stringify(newJobs));
  await updateJobsStatus(jobs, indicator);
};

/**
 * Downloads an existing process results
 * @param {import("../types").AsyncJob} jobObject
 * @param {import("stac-ts").StacCollection | null} selectedStac
 */
export const downloadPreviousResults = async (jobObject, selectedStac) => {
  /** @type {string[]} */
  const results = [];
  const link = jobObject.links.find(
    (link) => link.rel.includes("results") && link.type == "application/json",
  );
  if (!link) {
    return;
  }
  await axios
    .get(link.href)
    .then((response) => response.data)
    .then((data) => {
      results.push(...data.urls);
    });
  results.forEach((result) => {
    if (!result) {
      return;
    }
    let fileName = "";
    if (typeof result === "string") {
      fileName = result.includes("/")
        ? (result.split("/").pop() ?? "")
        : result;
      fileName = fileName.includes("?") ? fileName.split("?")[0] : fileName;
    } else {
      fileName = selectedStac?.id + "_process_results.json";
    }
    download(fileName, result);
  });
};

/**
 * Load the process results and update the map layers.
 *
 * @async
 * @param {import("../types").AsyncJob} jobObject
 * @param {import("stac-ts").StacCollection | null} selectedStac
 * @param {import("@eox/map").EOxMap | null} mapElement
 */
export const loadProcess = async (jobObject, selectedStac, mapElement) => {
  /** @type {import("../types").EOxHubProcessResults} */
  const results = await axios
    .get(jobObject.links[1].href)
    .then((response) => response.data);

  await loadPreviousProcess({
    selectedStac,
    results,
    jobId: jobObject.jobID,
    mapElement,
  });
};

/**
 * load a geotiff to the map from an existing process
 *
 * @param {Object} params
 * @param {import("stac-ts").StacCollection | null} params.selectedStac
 * @param {string} params.jobId
 * @param {import("../types").EOxHubProcessResults} params.results
 * @param {import("@eox/map").EOxMap | null} params.mapElement
 */
export async function loadPreviousProcess({
  selectedStac,
  results,
  jobId,
  mapElement,
}) {
  const asyncLink = selectedStac?.links.find(
    (link) => link.rel === "service" && link.endpoint == "eoxhub_workspaces",
  );
  if (!asyncLink) {
    return;
  }

  const unifiedResult = extractAsyncResults(results);

  const layers = await creatAsyncProcessLayerDefinitions(
    unifiedResult,
    asyncLink,
    selectedStac,
    jobId,
  );

  log.debug("rendered layers after loading previous process:", layers);
  applyProcessLayersToMap(mapElement, layers);
}
