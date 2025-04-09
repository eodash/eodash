import mustache from "mustache";
import { extractLayerConfig } from "@/eodashSTAC/helpers";
import axios from "@/plugins/axios";
import { createTiffLayerDefinition, separateEndpointLinks } from "./utils";

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
 * @param {object} options
 * @param {import("stac-ts").StacLink[] | undefined} options.links
 * @param {Record<string,any> | undefined} options.jsonformValue
 * @param {string} options.specUrl
 * @param {(input:import("^/EodashProcess/types").CustomEnpointInput)=>Promise<Record<string,any>[] | undefined | null>} [options.customEndpointsHandler]
 * @param {import("vue").Ref<boolean>} options.isPolling
 * @param {import("stac-ts").StacCollection} options.selectedStac
 * @param {Record<string,any>} options.jsonformSchema
 * @returns {Promise<[import("@eox/chart").EOxChart["spec"] | null,Record<string,any>|null]>}
 **/
export async function getChartValues({
  links,
  jsonformValue,
  specUrl,
  customEndpointsHandler,
  jsonformSchema,
  selectedStac,
  isPolling,
}) {
  if (!specUrl || !links) return [null, null];
  /** @type {import("vega").Spec} */
  const spec = await axios.get(specUrl).then((resp) => {
    return resp.data;
  });

  const [standardLinks, endpointLinks] = separateEndpointLinks(
    links,
    "service",
    undefined,
  );

  const data =
    customEndpointsHandler &&
    jsonformValue &&
    (await customEndpointsHandler({
      jsonformSchema,
      jsonformValue,
      links: endpointLinks,
      selectedStac,
      isPolling,
    }));

  if (data && data.length) {
    //@ts-expect-error we assume data to exist in spec
    spec.data.values = data;
    return [spec, data];
  }

  const dataLinks = standardLinks.filter((link) => link.rel === "service");
  /** @type {Record<string,any>} */
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
    // not sure if this is used anymore, we need to revise our
    // chart defs and which vega data type we are using
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
 * @param {object} options
 * @param {import("stac-ts").StacLink[] | undefined} options.links
 * @param {Record<string,any> | undefined} options.jsonformValue
 * @param {string} options.layerId
 * @param {import("vue").Ref<boolean>} options.isPolling
 * @param {string} options.projection
 * @param {import("stac-ts").StacCollection} options.selectedStac
 * @param {import("json-schema").JSONSchema7} options.jsonformSchema
 * @param {(input:import("^/EodashProcess/types").CustomEnpointInput)=>Promise<Record<string,any>[] | undefined | null>} [options.customEndpointsHandler]
 */
export async function processGeoTiff({
  links,
  jsonformValue,
  layerId,
  isPolling,
  projection,
  selectedStac,
  jsonformSchema,
  customEndpointsHandler,
}) {
  if (!links) return;

  const [geotiffLinks, endpointLinks] = separateEndpointLinks(
    links,
    "service",
    "image/tiff",
  );
  const layers =
    customEndpointsHandler &&
    jsonformValue &&
    (await customEndpointsHandler({
      jsonformValue,
      links: endpointLinks,
      selectedStac,
      isPolling,
      jsonformSchema,
    }));
  console.log("custom endpoint layers", layers);
  if (layers && layers.length) {
    return layers;
  }

  if (!geotiffLinks.length) {
    return;
  }
  let urls = [];
  let processId = "";
  for (const link of geotiffLinks ?? []) {
    urls.push(mustache.render(link.href, { ...(jsonformValue ?? {}) }));
  }
  return [
    createTiffLayerDefinition(
      geotiffLinks[0],
      layerId,
      urls,
      projection,
      processId,
    ),
  ];
}
