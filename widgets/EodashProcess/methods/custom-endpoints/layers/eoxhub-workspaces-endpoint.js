import axios from "@/plugins/axios";
import { indicator } from "@/store/states";
import mustache from "mustache";
import { pollProcessStatus } from "^/EodashProcess/methods/async";
import { extractLayerConfig, mergeGeojsons } from "@/eodashSTAC/helpers";

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

      const processResults = await pollProcessStatus({
        processUrl: responseProcess.headers.location,
        isPolling,
      })
        .then((resultItem) => {
          return extractResults(resultItem);
        })
        .catch((error) => {
          if (error instanceof Error) {
            console.error("Polling failed:", error.message);
          } else {
            console.error("Unknown error occurred during polling:", error);
          }
          return [];
        });

      return await creatAsyncProcessLayerDefinitions(
        processResults,
        link,
        selectedStac,
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
/**
 *
 * @param {import("^/EodashProcess/types").EOxHubProcessResponse} resultItem
 * @returns {import("^/EodashProcess/types").AsyncProcessResponse}
 */
function extractResults(resultItem) {
  if (!resultItem) {
    return [];
  }
  // if no type specified we assume the results are geotiff sources
  if ("urls" in resultItem && Array.isArray(resultItem.urls)) {
    return [{ id: resultItem.id, urls: resultItem.urls, type: "image/tiff" }];
  }
  const extracted = [];
  for (const key in resultItem) {
    if (key === "id") {
      continue;
    }
    extracted.push({
      //This id structure is later used to identify the style for the layer
      id: resultItem.id + "_" + key,
      //@ts-expect-error TODO
      urls: /** @type {string[]} */ (resultItem[key].urls),
      //@ts-expect-error TODO
      type: /** @type {string} */ (resultItem[key].mimetype),
    });
  }
  return extracted;
}

/**
 * Generates layer definitions for asynchronous process results.
 * using AsyncProcessResponse data structure.
 * @param {import("^/EodashProcess/types").AsyncProcessResponse} processResults
 * @param {import("stac-ts").StacLink} endpointLink
 * @param {import("stac-ts").StacCollection|null} selectedStac
 * @returns
 */
export async function creatAsyncProcessLayerDefinitions(
  processResults,
  endpointLink,
  selectedStac,
) {
  if (!processResults.length) {
    return;
  }
  /** @type {import("@eox/map").EoxLayer[]} */
  const layers = [];
  /** @type {import("@/types").EodashStyleJson | (Record<string,import("@/types").EodashStyleJson> & {multipleStyles:true}) | null} */
  let flatStyles = null;
  if (endpointLink["eox:flatstyle"]) {
    if (typeof endpointLink["eox:flatstyle"] === "string") {
      flatStyles = await axios
        .get(/** @type {string} */ (endpointLink["eox:flatstyle"]))
        .then((resp) => /** @type {} */ resp.data);
    } else {
      flatStyles = { multipleStyles: true };
      await Promise.all(
        Object.keys(endpointLink["eox:flatstyle"] ?? {}).map((key) => {
          //@ts-expect-error TODO
          flatStyles[key] = axios
            //@ts-expect-error TODO
            .get(endpointLink["eox:flatstyle"][key])
            .then((resp) => resp.data);
        }),
      );
    }
  }

  for (const resultItem of processResults) {
    const flatStyleJSON = extractStyle(resultItem, flatStyles);
    let style, layerConfig;
    if (flatStyleJSON) {
      const extracted = extractLayerConfig(
        selectedStac?.id ?? "",
        flatStyleJSON,
      );
      layerConfig = extracted.layerConfig;
      style = extracted.style;
    }

    switch (resultItem.type) {
      case "image/tiff": {
        layers.push({
          type: "WebGLTile",
          properties: {
            id: endpointLink.id + "_process" + resultItem.id,
            title:
              "Results " +
              (selectedStac?.id ?? "") +
              " " +
              (resultItem.id.split("_")?.[1] ?? ""),
            layerControlToolsExpand: true,
            ...(layerConfig && { layerConfig }),
          },
          source: {
            type: "GeoTIFF",
            normalize: !style,
            sources: resultItem.urls.map((url) => ({ url })),
            //@ts-expect-error TODO
            ...(selectedStac["eodash:mapProjection"]?.["name"] && {
              //@ts-expect-error TODO
              projection: selectedStac["eodash:mapProjection"]["name"],
            }),
          },
          ...(style && { style }),
        });
        break;
      }
      case "application/geo+json": {
        const mergedUrl = await mergeGeojsons(resultItem.urls);
        layers.push({
          type: "Vector",
          source: {
            type: "Vector",
            format: "GeoJSON",
            ...(mergedUrl && { url: mergedUrl }),
          },
          properties: {
            id: endpointLink.id + "_process" + resultItem.id,
            title:
              "Results " +
              (selectedStac?.id ?? "") +
              " " +
              (resultItem.id.split("_")?.[1] ?? ""),
            ...(layerConfig && {
              layerConfig: {
                ...layerConfig,
                style,
              },
            }),
          },
          ...(!style?.variables && { style }),
          interactions: [],
        });
        break;
      }
      default:
        console.warn(
          `[eodash] Unsupported result type "${resultItem.type}" for ${resultItem.id} layer creation.`,
        );
        break;
    }
  }
  return layers;
}
/**
 *
 * @param {import("^/EodashProcess/types").AsyncProcessResponse[number]} processResult
 * @param {null| import("@/types").EodashStyleJson | (Record<string,import("@/types").EodashStyleJson> & {multipleStyles:true})} flatStyles
 */
function extractStyle(processResult, flatStyles) {
  if (!flatStyles) {
    return undefined;
  }
  if (!("multipleStyles" in flatStyles)) {
    return flatStyles;
  }

  const [_processId, outputKey] = processResult.id.split("_");
  if (!outputKey || !(outputKey in flatStyles)) {
    return undefined;
  }
  return flatStyles[outputKey];
}
