import { indicator, mapEl } from "@/store/states";
import axios from "axios";
import { ref } from "vue";
import { createTiffLayerDefinition, download } from "./utils";
import log from "loglevel";
import { getLayers } from "@/store/actions";

/**
 * The list of job result from the server
 * {job_start_datetime: string, job_end_datetime: string,status: string}
 *  @type {import("vue").Ref<any[]>}
 **/
export const jobs = ref([]);

/**
 * Polls the process status and fetches a result item when the process is successful.
 *
 * @param {Object} params - Parameters for polling the process status.
 * @param {string} params.processUrl - The URL of the process JSON report.
 * @param {import("vue").Ref<boolean>} params.isPolling - checks wether the polling should continue
 * @param {number} [params.pollInterval=5000] - The interval (in milliseconds) between polling attempts.
 * @param {number} [params.maxRetries=60] - The maximum number of polling attempts.
 * @returns {Promise<Record<string,any>>} The fetched results JSON.
 * @throws {Error} If the process does not complete successfully within the maximum retries.
 */
export async function pollProcessStatus({
  processUrl,
  isPolling,
  pollInterval = 10000,
  maxRetries = 560,
}) {
  let retries = 0;
  isPolling.value = true;
  setTimeout(() => {
    updateJobsStatus(jobs, indicator);
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
 * @param {*} jobs
 * @param {*} indicator
 */
export async function updateJobsStatus(jobs, indicator) {
  /** @type {string[]} */
  const jobsUrls = JSON.parse(localStorage.getItem(indicator.value) || "[]");
  const jobResults = await Promise.all(
    jobsUrls.map((url) => fetch(url).then((response) => response.json())),
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
 * @param {*} jobObject
 */
export const deleteJob = async (jobObject) => {
  /** @type {string[]} */
  const jobsUrls = JSON.parse(localStorage.getItem(indicator.value) || "[]");
  const newJobs = jobsUrls.filter((url) => !url.includes(jobObject.jobID));
  localStorage.setItem(indicator.value, JSON.stringify(newJobs));
  updateJobsStatus(jobs, indicator);
};

/**
 * Downloads an existing process results
 *  @param {*} jobObject
 * @param {*} selectedStac
 */
export const downloadPreviousResults = async (jobObject, selectedStac) => {
  /** @type {any[]} */
  const results = [];
  await fetch(jobObject.links[1].href)
    .then((response) => response.json())
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
 * @param {*} jobObject
 * @param {*} selectedStac
 */
export const loadProcess = async (jobObject, selectedStac) => {
  /** @type {any[]} */
  const results = [];
  await axios
    .get(jobObject.links[1].href)
    .then((response) => results.push(response.data));

  await loadPreviousProcess({
    selectedStac,
    results,
    jobId: jobObject.jobID,
  });
};

/**
 * load a geotiff to the map from an existing process
 *
 * @param {Object} params
 * @param {import("stac-ts").StacCollection | null} params.selectedStac
 * @param {any[]} params.results
 * @param {string} params.jobId
 */
export async function loadPreviousProcess({ selectedStac, results, jobId }) {
  const geotiffLinks = selectedStac?.links.filter(
    (link) => link.rel === "service" && link.type === "image/tiff",
  );
  // TODO: support multiple geotiff layers from one process
  // const stacProjection = selectedStac
  const geotiffLayer = await createTiffLayerDefinition(
    geotiffLinks?.[0],
    selectedStac?.id ?? "",
    results?.[0].urls,
    //@ts-expect-error TODO
    selectedStac?.["eodash:mapProjection"]?.["name"] ?? null,
    jobId,
  );

  log.debug("rendered layers after loading previous process:", geotiffLayer);

  if (geotiffLayer) {
    const layers = [...(geotiffLayer ? [geotiffLayer] : [])];
    let currentLayers = [...getLayers()];
    let analysisGroup = currentLayers.find((l) =>
      l.properties.id.includes("AnalysisGroup"),
    );
    analysisGroup?.layers.push(...layers);

    if (mapEl.value) {
      mapEl.value.layers = [...currentLayers];
    }
  }
}
