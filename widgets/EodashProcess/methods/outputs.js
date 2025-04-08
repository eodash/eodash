import mustache from "mustache";
import { extractLayerConfig } from "@/eodashSTAC/helpers";
import axios from "@/plugins/axios";
import { createLayerDefinition } from "./utils";
import { pollProcessStatus } from "./async";
import { indicator } from "@/store/states";

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
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {Record<string,any> | undefined} jsonformValue
 * @param {import("vue").Ref<boolean>} isPolling
 * @param {string} layerId
 * @param {string} projection
 */
export async function processGeoTiff(
  links,
  jsonformValue,
  layerId,
  isPolling,
  projection,
) {
  if (!links) return;
  const geotiffLinks = links.filter(
    (link) => link.rel === "service" && link.type === "image/tiff",
  );
  let urls = [];
  let processId = "";
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
        // We save the process status url into localstorage assigning it to the indicator id
        const currentJobs = JSON.parse(
          localStorage.getItem(indicator.value) || "[]",
        );
        currentJobs.push(responseProcess.headers.location);
        localStorage.setItem(indicator.value, JSON.stringify(currentJobs));
        await pollProcessStatus({
          processUrl: responseProcess.headers.location,
          isPolling,
        })
          .then((resultItem) => {
            // @ts-expect-error we have currently no definition of what is allowed as response
            const resultUrls = resultItem?.urls;
            if (resultUrls?.length < 1) {
              return;
            }
            //@ts-expect-error todo
            processId = resultItem?.id;
            urls = resultUrls;
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
  }

  return createLayerDefinition(links[0], layerId, urls, projection, processId);
}
