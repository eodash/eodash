import { isMulti } from "@eox/jsonform/src/custom-inputs/spatial/utils";
import { nextTick, onMounted, watch } from "vue";
import mustache from "mustache";
import axios from "axios";
import { extractLayerConfig } from "@/eodashSTAC/helpers";
import log from "loglevel";
import { getLayers } from "@/store/actions";
import { mapEl } from "@/store/states";

/**
 * Polls the process status and fetches a result item when the process is successful.
 *
 * @param {Object} params - Parameters for polling the process status.
 * @param {string} params.processUrl - The URL of the process JSON report.
 * @param {import("vue").Ref<boolean>} params.isPolling - checks wether the polling should continue
 * @param {number} [params.pollInterval=5000] - The interval (in milliseconds) between polling attempts.
 * @param {number} [params.maxRetries=60] - The maximum number of polling attempts.
 * @returns {Promise<JSON>} The fetched results JSON.
 * @throws {Error} If the process does not complete successfully within the maximum retries.
 */
export async function pollProcessStatus({
  processUrl,
  isPolling,
  pollInterval = 5000,
  maxRetries = 60,
}) {
  let retries = 0;
  isPolling.value = true;
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
 * Auto execute the process when the jsonform has the execute option
 *
 * @param {import("vue").Ref<boolean>} autoExec
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} jsonformEl
 * @param {import("vue").Ref<Record<string,any> | null>} jsonformSchema
 * @param {() => Promise<void>} startProcess
 **/
export function useAutoExec(
  autoExec,
  jsonformEl,
  jsonformSchema,
  startProcess,
) {
  /**
   * @param {CustomEvent} _e
   **/
  const onJsonFormChange = async (_e) => {
    await startProcess();
  };

  const addEventListener = async () => {
    await nextTick(() => {
      //@ts-expect-error TODO
      jsonformEl.value?.addEventListener("change", onJsonFormChange);
    });
  };
  const removeEventListener = () => {
    //@ts-expect-error TODO
    jsonformEl.value?.removeEventListener("change", onJsonFormChange);
  };

  watch(jsonformSchema, (updatedSchema) => {
    autoExec.value = updatedSchema?.options?.["execute"] || false;
  });

  onMounted(() => {
    watch(
      autoExec,
      async (exec) => {
        if (exec) {
          await addEventListener();
        } else {
          removeEventListener();
        }
      },
      { immediate: true },
    );
  });
}

/**
 * @param {Record<string,any> |null} [jsonformSchema]
 **/
export function getBboxProperty(jsonformSchema) {
  return /** @type {string} */ (
    Object.keys(jsonformSchema?.properties ?? {}).find(
      (key) => jsonformSchema?.properties[key].format === "bounding-box",
    )
  );
}

/**
 * Extracts the keys of type "geojson" from the jsonform schema
 * @param {Record<string,any> |null} [jsonformSchema]
 **/
export function getGeoJsonProperties(jsonformSchema) {
  return /** @type {string[]} */ (
    Object.keys(jsonformSchema?.properties ?? {}).filter(
      (key) => jsonformSchema?.properties[key].type === "geojson",
    )
  );
}

/**
 * Converts jsonform geojson values to stringified geometries
 * @param {Record<string,any> |null} [jsonformSchema]
 * @param {Record<string,any>} jsonformValue
 **/
export function extractGeometries(jsonformValue, jsonformSchema) {
  const geojsonKeys = getGeoJsonProperties(jsonformSchema);

  for (const key of geojsonKeys) {
    if (!jsonformValue[key]) {
      continue;
    }

    if (isMulti(jsonformSchema?.properties[key])) {
      // jsonformValue[key] is a feature collection
      jsonformValue[key] =
        /** @type {import("ol/format/GeoJSON").GeoJSONFeatureCollection} */ (
          jsonformValue[key]
        ).features.map((feature) => JSON.stringify(feature.geometry));
    } else {
      // jsonformValue[key] is a single feature
      jsonformValue[key] = JSON.stringify(jsonformValue[key].geometry);
    }
  }
}

/**
 * Injects CSS to remove the borders of the jsonform from inside the shadowRoot
 * @param {import("@eox/jsonform").EOxJSONForm | null} jsonFormEl
 **/
export function injectJsonformCSS(jsonFormEl) {
  if (!jsonFormEl?.shadowRoot) {
    console.error("jsonform has no shadowRoot");
    return;
  }
  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(`.je-indented-panel {
    border: none !important;
  }`);
  jsonFormEl.shadowRoot.adoptedStyleSheets = [stylesheet];
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any>|undefined} jsonformValue
 * @param {number[]} origBbox
 */
export function processImage(links, jsonformValue, origBbox) {
  if (!links) return;
  const imageLinks = links.filter(
    (link) => link.rel === "service" && link.type === "image/png",
  );
  const layers = [];
  for (const link of imageLinks) {
    layers.push({
      type: "Image",
      properties: {
        id: link.id,
        title: "Results " + link.id,
      },
      source: {
        type: "ImageStatic",
        imageExtent: origBbox,
        url: mustache.render(link.href, {
          ...(jsonformValue ?? {}),
        }),
      },
    });
  }
  return layers;
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any> | undefined} jsonformValue
 * @param {string} layerId
 */
export async function processVector(links, jsonformValue, layerId) {
  if (!links) return;
  /** @type {Record<string,any>[]} */
  const layers = [];
  const vectorLinks = links.filter(
    (link) => link.rel === "service" && link.type === "application/geo+json",
  );
  if (vectorLinks.length === 0) return layers;

  let flatStyleJSON = null;

  for (const link of vectorLinks) {
    if ("eox:flatstyle" in (link ?? {})) {
      flatStyleJSON = await axios
        .get(/** @type {string} */ (link["eox:flatstyle"]))
        .then((resp) => resp.data);
    }

    /** @type {Record<string,any>|undefined} */
    let layerConfig;
    /** @type {Record<string,any>|undefined} */
    let style;
    if (flatStyleJSON) {
      const extracted = extractLayerConfig(flatStyleJSON);
      layerConfig = extracted.layerConfig;
      style = extracted.style;
    }

    layers.push({
      type: "Vector",
      source: {
        type: "Vector",
        url: mustache.render(link.href, {
          ...(jsonformValue ?? {}),
        }),
        format: "GeoJSON",
      },
      properties: {
        id: layerId + "_vector_process",
        title: "Results " + layerId,
        ...(layerConfig && { ...layerConfig, ...(style && { style: style }) }),
      },
    });
  }
  return layers;
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any> | undefined} jsonformValue
 * @param {import("vue").Ref<boolean>} isPolling
 * @param {string} layerId
 */
export async function processGeoTiff(links, jsonformValue, layerId, isPolling) {
  if (!links) return;
  const geotiffLinks = links.filter(
    (link) => link.rel === "service" && link.type === "image/tiff",
  );
  let urls = [];
  let flatStyleJSON = null;
  for (const link of geotiffLinks ?? []) {
    if (link.endpoint === "eoxhub_workspaces") {
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
        console.log(responseProcess.headers.location);
        await pollProcessStatus({
          processUrl: responseProcess.headers.location,
          isPolling,
        })
          .then((resultItem) => {
            // @ts-expect-error we have currently no definition of what is allowed as response
            const resultUrls = resultItem?.urls;
            if (!resultUrls?.length) {
              return;
            }

            urls.push(resultUrls[0]);
          })
          .catch((error) => {
            if (error instanceof Error) {
              console.error("Polling failed:", error.message);
            } else {
              console.error("Unknown error occurred during polling:", error);
            }
          });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error sending POST request:", error.message);
        } else {
          console.error("Unknown error occurred:", error);
        }
      }
    } else {
      urls.push(mustache.render(link.href, { ...(jsonformValue ?? {}) }));
    }
    if ("eox:flatstyle" in (link ?? {})) {
      flatStyleJSON = await axios
        .get(/** @type {string} */ (link["eox:flatstyle"]))
        .then((resp) => resp.data);
    }
  }
  /** @type {Record<string,any>|undefined} */
  let layerConfig;
  /** @type {Record<string,any>|undefined} */
  let style;
  if (flatStyleJSON) {
    const extracted = extractLayerConfig(flatStyleJSON);
    layerConfig = extracted.layerConfig;
    style = extracted.style;
  }
  return urls.length
    ? {
        type: "WebGLTile",
        source: {
          type: "GeoTIFF",
          normalize: !style,
          sources: urls.map((url) => ({ url })),
        },
        properties: {
          id: layerId + "_geotiff_process",
          title: "Results " + layerId,
          ...(layerConfig && { layerConfig: layerConfig }),
        },
        ...(style && { style: style }),
      }
    : undefined;
}

/**
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any> | undefined} jsonformValue
 * @param {string} specUrl
 * @returns {Promise<[import("@eox/chart").EOxChart["spec"] | null,Record<string,any>|null]>}
 **/
export async function getChartValues(links, jsonformValue, specUrl) {
  if (!specUrl || !links) return [null, null];
  /** @type {import("vega").Spec} */
  const spec = await axios.get(specUrl).then((resp) => {
    return resp.data;
  });
  // //@ts-expect-error NamedData
  // const dataName = spec?.data?.name;
  const dataLinks = links.filter(
    (link) => link.rel === "service", // && dataName && link.id === dataName,
  );

  /** @type {Record<string,any>}  */
  const dataValues = {};
  for (const link of dataLinks ?? []) {
    if (link.type && ["application/json", "text/csv"].includes(link.type)) {
      const dataUrl = mustache.render(link.href, {
        ...(jsonformValue ?? {}),
        ...(link["eox:flatstyle"] ?? {}),
      });
      // Wait for data to be retrieved
      const data = await axios.get(dataUrl).then((resp) => {
        return resp.data;
      });
      // @ts-expect-error we assume data to exist in spec
      spec.data.values = data;
      continue;
    }

    dataValues[/** @type {string} */ (link.id)] = await axios
      .get(
        mustache.render(link.href, {
          ...(jsonformValue ?? {}),
          ...(link["eox:flatstyle"] ?? {}),
        }),
      )
      .then((resp) => resp.data);
  }
  return [spec, dataValues];
}

/**
 * @param {Object} params
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} params.selectedStac
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} params.jsonformEl
 * @param {import("vue").Ref<Record<string,any>|null>} params.jsonformSchema
 * @param {import("vue").Ref<import("@eox/chart").EOxChart["spec"] | null>} params.chartSpec
 * @param {import("vue").Ref<Record<string, any> | null>} params.chartData
 * @param {import("vue").Ref<boolean>} params.isPolling
 * @param {import("vue").Ref<any[]>} params.processResults
 */
export async function handleProcesses({
  loading,
  selectedStac,
  jsonformEl,
  jsonformSchema,
  chartSpec,
  chartData,
  isPolling,
  processResults,
}) {
  log.debug("Processing...");
  loading.value = true;
  try {
    const serviceLinks = selectedStac.value?.links?.filter(
      (l) => l.rel === "service",
    );
    const bboxProperty = getBboxProperty(jsonformSchema.value);
    const jsonformValue = /** @type {Record<string,any>} */ (
      jsonformEl.value?.value
    );

    extractGeometries(jsonformValue, jsonformSchema.value);

    const origBbox = jsonformValue[bboxProperty];

    const specUrl = /** @type {string} */ (
      selectedStac.value?.["eodash:vegadefinition"]
    );

    [chartSpec.value, chartData.value] = await getChartValues(
      serviceLinks,
      { ...(jsonformValue ?? {}) },
      specUrl,
    );
    if (Object.keys(chartData.value ?? {}).length) {
      processResults.value.push(chartData.value);
    }
    //@ts-expect-error we assume that the spec data is of type InlineData
    if (chartSpec.value?.data?.values?.length) {
      //@ts-expect-error we assume that the spec data is of type InlineData
      processResults.value.push(chartSpec.value?.data.values);
    }

    if (chartSpec.value && !("background" in chartSpec.value)) {
      chartSpec.value["background"] = "transparent";
    }

    const geotiffLayer = await processGeoTiff(
      serviceLinks,
      jsonformValue,
      selectedStac.value?.id ?? "",
      isPolling,
    );

    if (geotiffLayer && geotiffLayer.source?.sources.length) {
      processResults.value.push(
        ...(geotiffLayer.source?.sources?.map((source) => source.url) ?? []),
      );
    }
    // 3. vector geojson
    const vectorLayers = await processVector(
      serviceLinks,
      jsonformValue,
      selectedStac.value?.id ?? "",
    );

    if (vectorLayers?.length) {
      processResults.value.push(
        ...vectorLayers.map((layer) => layer.source?.url),
      );
    }

    const imageLayers = processImage(serviceLinks, jsonformValue, origBbox);
    if (imageLayers?.length) {
      processResults.value.push(
        ...imageLayers.map((layer) => layer.source?.url),
      );
    }

    log.debug(
      "rendered layers after processing:",
      geotiffLayer,
      vectorLayers,
      imageLayers,
    );

    if (geotiffLayer || vectorLayers?.length || imageLayers?.length) {
      const layers = [
        ...(geotiffLayer ? [geotiffLayer] : []),
        ...(vectorLayers ?? []),
        ...(imageLayers ?? []),
      ];
      let currentLayers = [...getLayers()];
      let analysisGroup = currentLayers.find((l) =>
        l.properties.id.includes("AnalysisGroup"),
      );
      analysisGroup?.layers.push(...layers);

      if (mapEl.value) {
        mapEl.value.layers = [...currentLayers];
      }
    }
    loading.value = false;
  } catch (error) {
    console.error("[eodash] Error while running process:", error);
    loading.value = false;
    throw error;
  }
}

/**
 * Reset the process state
 * @param {Object} params
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<boolean>} params.isProcessed
 * @param {import("vue").Ref<import("@eox/chart").EOxChart["spec"] | null>} params.chartSpec
 * @param {import("vue").Ref<boolean>} params.isPolling
 * @param {import("vue").Ref<any[]>} params.processResults
 * @param {import("vue").Ref<Record<string,any>|null>} params.jsonformSchema
 */
export function resetProcess({
  loading,
  isProcessed,
  chartSpec,
  jsonformSchema,
  processResults,
  isPolling,
}) {
  loading.value = false;
  isProcessed.value = false;
  isPolling.value = false;
  chartSpec.value = null;
  processResults.value = [];
  jsonformSchema.value = null;
}

/**
 * Description placeholder
 *
 * @export
 * @async
 * @param {Object} params
 * @param {import("vue").Ref<import("stac-ts").StacCollection>} params.selectedStac
 * @param {import("vue").Ref<import("@eox/jsonform").EOxJSONForm | null>} params.jsonformEl
 * @param {import("vue").Ref<Record<string,any> | null>} params.jsonformSchema
 * @param {import("vue").Ref<import("@eox/chart").EOxChart["spec"] | null>} params.chartSpec
 * @param {import("vue").Ref<any[]>} params.processResults
 * @param {import("vue").Ref<boolean>} params.isProcessed
 * @param {import("vue").Ref<boolean>} params.loading
 * @param {import("vue").Ref<boolean>} params.isPolling
 */
export async function initProcess({
  selectedStac,
  jsonformEl,
  jsonformSchema,
  chartSpec,
  isProcessed,
  processResults,
  loading,
  isPolling,
}) {
  if (!selectedStac.value) {
    return;
  }
  resetProcess({
    loading,
    isProcessed,
    chartSpec,
    jsonformSchema,
    isPolling,
    processResults,
  });
  if (selectedStac.value["eodash:jsonform"]) {
    jsonformEl.value?.editor.destroy();
    // wait for the layers to be rendered
    jsonformSchema.value = await axios
      //@ts-expect-error eodash extention
      .get(selectedStac.value["eodash:jsonform"])
      .then((resp) => resp.data);
    // remove borders from jsonform
    await nextTick(() => {
      injectJsonformCSS(jsonformEl.value);
    });
  } else {
    if (!jsonformSchema.value) {
      return;
    }
    jsonformSchema.value = null;
  }
}
