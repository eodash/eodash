import mustache from "mustache";
import { extractLayerConfig } from "@/eodashSTAC/helpers";
import axios from "@/plugins/axios";
import { createTiffLayerDefinition, separateEndpointLinks } from "./utils";
import { useSTAcStore } from "@/store/stac";
import { toAbsolute } from "stac-js/src/http.js";
import { currentUrl } from "@/store/states";

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
        id: link.id + "_process",
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
      const extracted = extractLayerConfig(layerId ?? "", flatStyleJSON);
      layerConfig = extracted.layerConfig;
      style = extracted.style;
    }
    const layer = {
      type: "Vector",
      source: {
        type: "Vector",
        url: mustache.render(link.href, {
          ...(jsonformValue ?? {}),
        }),
        format: "GeoJSON",
      },
      properties: {
        id: link.id + "_process",
        title: "Results " + layerId,
        ...(layerConfig && { ...layerConfig }),
      },
      ...(style && { style: style }),
    };
    layers.push(layer);
  }
  return layers;
}
////// --- CHARTS --- //////
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
  /** @type {import("vega-lite").TopLevelSpec} **/
  const spec = await axios.get(specUrl).then((resp) => {
    return resp.data;
  });
  if (!spec.data) {
    console.error(
      "[eodash] Make sure the Vega spec definition has a data property",
    );
    return [null, null];
  }

  /** @type {Record<string,any>} */
  const dataValues = {};

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
    return [spec, dataValues];
  }

  const dataLinks = standardLinks.filter((link) => link.rel === "service");

  checkForData: for (const link of dataLinks ?? []) {
    switch (link.type) {
      case undefined:
        continue;
      case "application/json":
        await injectVegaInlineData(spec, {
          url: link.href,
          jsonformValue: jsonformValue,
          flatstyleUrl: /** @type string */ (link["eox:flatstyle"]),
        });
        break checkForData;
      case "text/csv":
        await injectVegaUrlData(spec, {
          url: link.href,
          jsonformValue: jsonformValue,
          flatstyleUrl: /** @type string */ (link["eox:flatstyle"]),
        });
        break checkForData;
      default:
        // this is not used anymore,
        // but we should check it specific types may need this

        // dataValues[/** @type {string} */ (link.id)] = await axios
        // .get(
        //   mustache.render(link.href, {
        //     ...(jsonformValue ?? {}),
        //     ...(link["eox:flatstyle"] ?? {}), // TODO
        //   }),
        // )
        // .then((resp) => resp.data);
        break;
    }
  }
  return [spec, dataValues];
}

/**
 *
 * @param {import("vega-lite").TopLevelSpec} spec
 * @param {object} injectables
 * @param {string} injectables.url
 * @param {Record<string,any>} [injectables.jsonformValue]
 * @param {url} [injectables.flatstyleUrl]
 */
async function injectVegaInlineData(
  spec,
  { url, jsonformValue, flatstyleUrl },
) {
  if (!spec.data) {
    return;
  }
  const dataUrl = await renderDataUrl(url, jsonformValue, flatstyleUrl);
  /** @type {import("vega-lite/build/src/data").InlineData} */
  (spec.data).values = await axios.get(dataUrl).then((resp) => {
    return resp.data;
  });
  return spec;
}

/**
 * @param {import("vega-lite").TopLevelSpec} spec
 * @param {object} injectables
 * @param {string} injectables.url
 * @param {Record<string,any>} [injectables.jsonformValue]
 * @param {url} [injectables.flatstyleUrl]
 */
async function injectVegaUrlData(spec, { url, jsonformValue, flatstyleUrl }) {
  if (!spec.data) {
    console.error(
      "[eodash] Make sure the Vega spec definition has a data property",
    );
    return;
  }
  const dataUrl = await renderDataUrl(url, jsonformValue, flatstyleUrl);
  /** @type {import("vega").UrlData} */
  (spec.data).url = dataUrl;
  return spec;
}
/**
 *
 * @param {string} url
 * @param {Record<string,any>} [jsonformValue]
 * @param {string} [flatstyleUrl]
 */
async function renderDataUrl(url, jsonformValue, flatstyleUrl) {
  let flatStyles = {};
  if (flatstyleUrl) {
    flatStyles = await axios.get(flatstyleUrl).then((resp) => resp.data);
  }

  return mustache.render(url, {
    ...(jsonformValue ?? {}),
    ...flatStyles,
  });
}

///////

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
  const definitions = geotiffLinks.map((geotiffLink) =>
    createTiffLayerDefinition(
      geotiffLink,
      layerId,
      urls,
      projection,
      processId,
    ),
  );
  return definitions;
}

/**
 *
 * @param {import("stac-ts").StacLink[]} links
 * @param {Record<string,any>} jsonformValue
 */
export async function processSTAC(links, jsonformValue) {
  const stacLink = links.find(
    (link) =>
      link.rel === "service" &&
      link.type == "application/json; profile=collection" &&
      link.endpoint === "STAC",
  );

  if (!stacLink) return;
  let stacUrl = mustache.render(stacLink.href, {
    ...(jsonformValue ?? {}),
  });
  if (!stacUrl.startsWith("http://")) {
    stacUrl = toAbsolute(stacUrl, currentUrl.value);
  }
  await useSTAcStore().loadSelectedSTAC(stacUrl, true);
}
