import log from "loglevel";
import { extractGeometries, getBboxProperty } from "./utils";
import { currentUrl, datetime, mapEl } from "@/store/states";
import axios from "@/plugins/axios";
import { getLayers } from "@/store/actions";
import {
  getChartValues,
  processGeoTiff,
  processImage,
  processVector,
} from "./outputs";
import { toAbsolute } from "stac-js/src/http.js";
import { extractCollectionUrls } from "@/eodashSTAC/helpers";

/**
 * Fetch and set the jsonform schema to initialize the process
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
  } else {
    if (!jsonformSchema.value) {
      return;
    }
    jsonformSchema.value = null;
  }
}

/**
 *
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
  if (!jsonformEl.value || !jsonformSchema.value || !selectedStac.value) {
    return;
  }

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
    await handleVedaEndpoint(
      serviceLinks,
      jsonformSchema.value,
      jsonformValue,
      selectedStac.value,
    );
    await handleSentinelHubProcess(
      serviceLinks,
      jsonformValue,
      selectedStac.value,
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
      //@ts-expect-error TODO
      selectedStac.value?.["eodash:mapProjection"]?.["name"] ?? null,
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
 * Handles the click event on a chart to extract temporal information and update the global datetime value.
 *
 * @param {object} evt - The click event object.
 * @param {object} evt.target - The target of the event, expected to have a Vega-Lite specification (`spec`).
 * @param {object} evt.target.spec - The Vega-Lite specification of the chart.
 * @param {Record<string,{type?:string;field?:string;}>} [evt.target.spec.encoding] - The encoding specification of the chart.
 * @param {object} evt.detail - The detail of the event, containing information about the clicked item.
 * @param {import("vega").Item} evt.detail.item - The Vega item that was clicked.
 */
export const onChartClick = (evt) => {
  const chartSpec = evt.target?.spec;
  if (!chartSpec) {
    return;
  }
  const encodingKey = Object.keys(chartSpec.encoding ?? {}).find(
    (key) => chartSpec.encoding?.[key].type === "temporal",
  );
  if (!encodingKey) {
    return;
  }
  const temporalKey = chartSpec.encoding?.[encodingKey].field;
  if (!temporalKey) {
    return;
  }
  try {
    const vegaItem = evt.detail.item;
    const temporalValue = new Date(vegaItem.datum.datum[temporalKey]);
    datetime.value = temporalValue.toISOString();
  } catch (error) {
    console.warn(
      "[eodash] Error while setting datetime from eox-chart:",
      error,
    );
  }
};

/**
 *
 * @param {import("stac-ts").StacLink[]} links
 * @param {Record<string,any>} jsonformSchema
 * @param {Record<string,any>} jsonformValue
 * @param {import("stac-ts").StacCollection} selectedStac
 */
export async function handleVedaEndpoint(
  links,
  jsonformSchema,
  jsonformValue,
  selectedStac,
) {
  const vedaLink = links.find(
    (link) => link.rel === "service" && link.endpoint === "veda",
  );
  if (!vedaLink) {
    return;
  }
  const endpoint = vedaLink?.href;
  const bboxProperty = getBboxProperty(jsonformSchema);

  const bbox = jsonformValue[bboxProperty];
  console.log("bbox", bbox);

  console.log("endpoint", endpoint);
  const endpoints = await fetchVedaCOGs(selectedStac);
  console.log("endpoints", endpoints);
  const data = await Promise.all(
    endpoints.map((endpoint) => {
      return axios
        .post(endpoint + `?url=${endpoint}`, {
          ...{
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [bbox[0], bbox[1]],
                  [bbox[2], bbox[1]],
                  [bbox[2], bbox[3]],
                  [bbox[0], bbox[3]],
                  [bbox[0], bbox[1]],
                ],
              ],
            },
          },
        })
        .then((resp) => resp.data)
        .catch((resp) =>
          console.error(
            "[eodash] Error while fetching data from veda endpoint:",
            resp,
          ),
        );
    }),
  );
  console.log("data", data);
}

/**
 *
 * @param {import("stac-ts").StacLink[]} links
 * @param {Record<string,any>} jsonformValue
 * @param {import("stac-ts").StacCollection} selectedStac
 */
export async function handleSentinelHubProcess(
  links,
  jsonformValue,
  selectedStac,
) {
  const sentinelHubLink = links.find(
    (link) => link.rel === "service" && link.endpoint === "sentinelhub",
  );
  const evalScriptLink = await getEvalScriptLink(selectedStac);
  console.log("sentinelHubLink", sentinelHubLink);
  console.log("evalScriptLink", evalScriptLink);

  if (!sentinelHubLink || !evalScriptLink) {
    return;
  }
  const endpoint = sentinelHubLink.href;
  const bboxProperty = getBboxProperty(jsonformValue);
  const bbox = jsonformValue[bboxProperty];
  console.log("bbox", bbox);

  const clientId = import.meta.env.VITE_SENTINELHUB_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SENTINELHUB_CLIENT_SECRET;

  console.log("clientId", clientId);
  console.log("clientSecret", clientSecret);

  const bearer = await sentinelHubAuth(clientId, clientSecret);
  if (!bearer) {
    console.error(
      "[eodash] Error while fetching bearer token from sentinel hub",
    );
    return;
  }
  console.log("bearer", bearer);

  // generate 30 dates from the start and end date of the selected stac
  // generate time pairs from the selected stac temporal extent
  const timePairs = generateTimePairs(selectedStac.extent.temporal.interval);
  console.log("timePairs", timePairs);

  // fetch data from sentinel hub
  const data = await Promise.all(
    timePairs.map(([from, to]) => {
      return fetchSentinelHubData({
        url: endpoint,
        clientId,
        bearer,
        bbox,
        from,
        to,
        exampleLink: evalScriptLink,
      }).catch((err) =>
        console.error(
          "[eodash] Error while fetching data from sentinel hub endpoint:",
          err,
        ),
      );
    }),
  );
  console.log("data", data);
  return data;
}

/**
 *
 * @param {import("stac-ts").StacCollection} selectedStac
 */
export async function fetchVedaCOGs(selectedStac) {
  // retrieve the collections from the indicator
  const collectionLinks = selectedStac.links.filter(
    (link) => link.rel == "child",
  );
  /** @type {import("stac-ts").StacCollection[]} */
  const collections = [];
  if (!collectionLinks.length) {
    collections.push(selectedStac);
  } else {
    collections.push(
      ...(await Promise.all(
        collectionLinks.map((link) =>
          axios
            .get(toAbsolute(link.href, currentUrl.value))
            .then((resp) => resp.data),
        ),
      )),
    );
  }
  /** @type {string[]} */
  const endpoints = [];
  for (const collection of collections) {
    let itemLinks = collection.links.filter((link) => link.rel == "item");
    endpoints.push(
      ...itemLinks.map((link) =>
        toAbsolute(
          link.href.replace(/\/\d{4}\//g, "/").replace(".json", ".tif"),
          "s3://veda-data-store/",
        ),
      ),
    );
  }
  endpoints.sort((a, b) => b.localeCompare(a));
  return endpoints.length > 365 ? endpoints.slice(0, 365) : endpoints;
}

/**
 * @param {string} clientId
 * @param {string} clientSecret
 * @returns {Promise<string | void>}
 */
async function sentinelHubAuth(clientId, clientSecret) {
  const sessionToken = sessionStorage.getItem("sentinelhub_token");
  const sessionTokenTime = /** @type {string} */ (
    sessionStorage.getItem("sentinelhub_token_time")
  );
  const isValid =
    new Date().getTime() - new Date(sessionTokenTime).getTime() < 3600 * 1000;

  // if the token is still valid, return it
  if (sessionToken && isValid) {
    return sessionToken;
  }
  const token = await retrieveSentinelHubToken(clientId, clientSecret);
  if (!token) {
    return;
  }
  sessionStorage.setItem("sentinelhub_token", token);
  sessionStorage.setItem("sentinelhub_token_time", new Date().toISOString());
  return token;
}
/**
 * @param {string} clientId
 * @param {string} clientSecret
 * @returns {Promise<string | void>}
 */
export async function retrieveSentinelHubToken(clientId, clientSecret) {
  const url = "https://services.sentinel-hub.com/oauth/token";
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    response_type: "token",
    grant_type: "client_credentials",
  });
  return await axios
    .post(url, body, { headers })
    .then((resp) => resp.data.access_token);
}
/**
 *
 * @param {object} param0
 * @param {string} param0.url  - url to the sentinel hub endpoint
 * @param {string} param0.bearer - bearer token for authentication
 * @param {number[]} param0.bbox - bounding box of the area of interest
 * @param {string} param0.from - start date of the time range
 * @param {string} param0.to - end date of the time range
 * @param {number} [param0.timeout = 20000] - timeout for the request
 * @param {string} param0.clientId - client id for the sentinel hub
 * @param {import("stac-ts").StacLink} [param0.exampleLink] - example link containing evalscript to use for the request
 * @returns
 */
async function fetchSentinelHubData({
  url,
  bearer,
  bbox,
  from,
  to,
  clientId,
  timeout = 20000,
  exampleLink,
}) {
  console.log("fetching data from sentinel hub", exampleLink);

  return await axios
    .post(
      url,
      {
        input: {
          bounds: {
            bbox,
          },
        },
        data: [
          {
            dataFilter: {},
            type: clientId,
          },
        ],
        aggregation: {
          timeRange: {
            from,
            to,
          },
          aggregationInterval: {
            of: "P1D",
          },
          width: 100,
          height: 100,
        },
        calculations: {
          default: {},
        },
        ...(exampleLink && {
          evalscript: await fetch(exampleLink.href).then((resp) => resp.text()),
        }),
      },
      {
        headers: {
          Authorization: `Bearer ${bearer}`,
          "Content-Type": "application/json",
        },
        params: {
          credentials: "same-origin",
        },
        timeout,
      },
    )
    .then((resp) => resp.data);
}
/**
 * @param {import("stac-ts").StacCollection} selectedStac
 */
async function getEvalScriptLink(selectedStac) {
  const evalScriptLink = selectedStac.links.find(
    (link) => link.rel === "example" && link.title === "evalscript",
  );
  if (evalScriptLink) {
    return evalScriptLink;
  }
  for (const link of extractCollectionUrls(selectedStac, currentUrl.value)) {
    const scriptLink = axios
      .get(link)
      .then((resp) =>
        /** @type {import("stac-ts").StacCollection} */ (resp.data).links.find(
          (link) => link.rel === "example" && link.title === "evalscript",
        ),
      );

    if (scriptLink) {
      return scriptLink;
    }
  }
}
/**
 * Generate time pairs from a temporal extent
 * @param {import("stac-ts").TemporalExtents} temporalExtent - Array of temporal intervals [start, end]
 */
function generateTimePairs(temporalExtent) {
  const [startDate, endDate] = /** @type {[string, string]} */ (
    temporalExtent?.[0] ?? ["", ""]
  );
  if (!startDate || !endDate) {
    return [];
  }
  const times = [];
  let current = new Date(endDate);
  const start = new Date(startDate);

  // Use fixed step of 1 day (in milliseconds)
  const step = 24 * 60 * 60 * 1000;

  // Add dates, limiting to 31 dates (30 pairs maximum)
  while (current >= start && times.length < 31) {
    times.push(new Date(current));
    current.setTime(current.getTime() - step);
  }

  const timePairs = [];
  for (let i = 0; i < times.length - 1; i++) {
    timePairs.push([times[i].toISOString(), times[i + 1].toISOString()]);
  }

  return timePairs;
}
