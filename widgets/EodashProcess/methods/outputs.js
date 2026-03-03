import mustache from "mustache";
import { extractLayerConfig } from "@/eodashSTAC/helpers";
import axios from "@/plugins/axios";
import { createTiffLayerDefinition, separateEndpointLinks } from "./utils";
import { useSTAcStore } from "@/store/stac";
import { isFirstLoad } from "@/utils/states";

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
 * @param {import("vue").Ref<import("../types").AsyncJob[]>} options.jobs
 * @param {boolean} [options.enableCompare=false] - Whether to enable compare mode
 * @returns {Promise<[import("vega-embed").VisualizationSpec | null,Record<string,any>|null]>}
 **/
export async function processCharts({
  links,
  jsonformValue,
  specUrl,
  customEndpointsHandler,
  jsonformSchema,
  selectedStac,
  isPolling,
  jobs,
  enableCompare = false,
}) {
  if (!specUrl || !links) return [null, null];
  /** @type {import("vega-lite").TopLevelSpec} **/
  const spec = await axios.get(specUrl).then((resp) => {
    return resp.data;
  });

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
      jobs,
      enableCompare,
    }));

  if (data && data.length) {
    //@ts-expect-error we assume data to exist in spec
    spec.data.values = data;
    return [structuredClone(spec), structuredClone(dataValues)];
  }
  const dataLinks = standardLinks.filter((link) => link.rel === "service");

  // We count if there are at least two application/json links, if yes,
  // we download the data and assign them to specific data ids in the spec
  const jsonLinks = dataLinks.filter(
    (link) => link.type === "application/json",
  );
  if (jsonLinks.length >= 2) {
    for (const link of jsonLinks ?? []) {
      let linkType = link.type;
      switch (linkType) {
        case undefined:
          continue;
        case "application/json":
          dataValues[/** @type {string} */ (link.id)] = await axios
            .get(
              mustache.render(link.href, {
                ...(jsonformValue ?? {}),
              }),
            )
            .then((resp) => resp.data);
          // assign to spec datasets, assuming spec.data is InlineData
          // Always assign values as an object with string keys
          if (spec.data) {
            /** @type {import("vega-lite/build/src/data").InlineData} */
            (spec.data).values = {
              ...(spec.data &&
              "values" in spec.data &&
              typeof spec.data.values === "object"
                ? spec.data.values
                : {}),
              [/** @type {string} */ (link.id)]:
                dataValues[/** @type {string} */ (link.id)],
            };
          }
          break;
        default:
          break;
      }
    }
    return [spec, dataValues];
  }
  try {
    checkForData: for (const link of dataLinks ?? []) {
      switch (link.type) {
        case undefined:
          continue;
        case "application/json":
          await injectVegaInlineData(spec, {
            url: link.href,
            jsonformValue: jsonformValue,
            link: link,
            flatstyleUrl: /** @type string */ (link["eox:flatstyle"]),
            jsonformSchema,
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
  } catch (e) {
    console.error("[eodash] Error while injecting Vega data", e);
  }
  return [structuredClone(spec), structuredClone(dataValues)];
}

/**
 *
 * @param {import("vega-lite").TopLevelSpec} spec
 * @param {object} injectables
 * @param {string} injectables.url
 * @param {Record<string,any>} [injectables.jsonformValue]
 * @param {import("stac-ts").StacLink} injectables.link
 * @param {url} [injectables.flatstyleUrl]
 * @param {import("json-schema").JSONSchema7} [injectables.jsonformSchema]
 */
async function injectVegaInlineData(
  spec,
  { url, jsonformValue, link, flatstyleUrl, jsonformSchema },
) {
  if (!spec.data) {
    return;
  }
  if (link.method == "GET") {
    // we see if any of the multiQuery values match an array in the jsonformValue
    // and if so, we can do multiple requests and merge all data together.
    //@ts-expect-error type jsonform Schema
    const multiQuery = jsonformSchema?.options?.multiQuery;
    const matches = Object.keys(jsonformValue ?? {}).filter((key) => {
      return Array.isArray(multiQuery)
        ? multiQuery.includes(key)
        : multiQuery === key;
    });
    if (matches.length > 0 && jsonformValue) {
      const dataValues = [];
      for (const match of matches) {
        if (Array.isArray(jsonformValue[match])) {
          for (const value of jsonformValue[match]) {
            const dataUrl = await renderDataUrl(
              url,
              { ...jsonformValue, [match]: value },
              flatstyleUrl,
            );
            dataValues.push(await axios.get(dataUrl).then((resp) => resp.data));
          }
        } else {
          const dataUrl = await renderDataUrl(url, jsonformValue, flatstyleUrl);
          dataValues.push(await axios.get(dataUrl).then((resp) => resp.data));
        }
      }
      /** @type {import("vega-lite/build/src/data").InlineData} */
      (spec.data).values = dataValues.flat();
      return spec;
    }
    // if no array matches, we can just do a single request
    const dataUrl = await renderDataUrl(url, jsonformValue, flatstyleUrl);
    /** @type {import("vega-lite/build/src/data").InlineData} */
    (spec.data).values = await axios.get(dataUrl).then((resp) => {
      return resp.data;
    });
  } else if (link.method == "POST") {
    // get body template to be used in POST request, check first if available
    if (!link.body) {
      console.error(
        "[eodash] Inline data POST request requires a body template",
      );
      return spec;
    }
    /** @type {string} */
    const bodyTemplate = await axios
      // @ts-expect-error we assume link.body to be a string, not defined in stac-ts
      .get(link.body, { responseType: "text" })
      .then((resp) => {
        return resp.data;
      });
    const body = JSON.parse(
      mustache.render(bodyTemplate, {
        ...(jsonformValue ?? {}),
      }),
    );
    /** @type {import("vega-lite/build/src/data").InlineData} */
    (spec.data).values = await axios.post(url, body).then((resp) => {
      return resp.data;
    });
  }
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

/////// MAP LAYERS ///////

/**
 * @param {object} options
 * @param {import("stac-ts").StacLink[] | undefined} options.links
 * @param {Record<string,any> | undefined} options.jsonformValue
 * @param {string} options.layerId
 * @param {string} [options.projection]
 */
export async function processGeoTiff({
  links,
  jsonformValue,
  layerId,
  projection,
}) {
  if (!links) return;

  const [geotiffLinks, _] = separateEndpointLinks(
    links,
    "service",
    "image/tiff",
  );

  if (!geotiffLinks.length) {
    return;
  }
  let urls = [];
  let processId = "";
  for (const link of geotiffLinks ?? []) {
    urls.push(mustache.render(link.href, { ...(jsonformValue ?? {}) }));
  }
  const definitions = await Promise.all(
    geotiffLinks.map((geotiffLink) =>
      createTiffLayerDefinition(
        geotiffLink,
        layerId,
        urls,
        projection,
        processId,
      ),
    ),
  ).then((defs) => defs.filter((defs) => !!defs));
  return definitions;
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
  /** @type {import("@eox/map/src/layers").EOxLayerType<"Image","ImageStatic">[]} */
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
  /** @type {import("@eox/map/src/layers").EOxLayerType<"Vector",any>[]} */
  const layers = [];
  const vectorLinks = links.filter(
    (link) => link.rel === "service" && link.type === "application/geo+json",
  );
  if (!vectorLinks.length) return layers;

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
    /** @type {import("@eox/map/src/layers").EOxLayerType<"Vector","Vector"|"FlatGeoBuf">} */
    const layer = {
      type: "Vector",
      source: {
        type: "Vector",
        //@ts-expect-error TODO
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
      ...(style && { style }),
    };
    layers.push(layer);
  }
  return layers;
}

/**
 * Unified wrapper for processing map layer types (Vector, Image, GeoTiff)
 * @param {object} options
 * @param {import("stac-ts").StacLink[] | undefined} options.links
 * @param {Record<string,any> | undefined} options.jsonformValue
 * @param {string} options.layerId
 * @param {string} [options.projection] - Required for GeoTiff layers
 * @param {number[]} options.origBbox - Required for Image layers
 * @param {import("vue").Ref<boolean>} options.isPolling
 * @param {import("stac-ts").StacCollection} options.selectedStac
 * @param {import("json-schema").JSONSchema7} options.jsonformSchema
 * @param {import("vue").Ref<import("../types").AsyncJob[]>} options.jobs
 * @param {(input:import("../types").CustomEnpointInput)=>Promise<import("@eox/map").EoxLayer[]>} options.customLayersHandler
 * @param {boolean} [options.enableCompare=false] - Whether to enable compare mode
 */
export async function processLayers({
  links,
  jsonformValue,
  layerId,
  projection,
  origBbox,
  isPolling,
  selectedStac,
  jsonformSchema,
  jobs,
  customLayersHandler,
  enableCompare = false,
}) {
  if (!links) return [];
  /** @type {import("@eox/map").EoxLayer[]} */
  const layers = [];

  const [standardLinks, endpointLinks] = separateEndpointLinks(
    links,
    "service",
    undefined,
  );
  // Handle custom endpoints first if handler is provided
  if (customLayersHandler && jsonformValue && selectedStac && jsonformSchema) {
    if (endpointLinks.length > 0) {
      const customLayers = await customLayersHandler({
        jsonformValue,
        links: endpointLinks,
        selectedStac,
        isPolling,
        jsonformSchema,
        jobs,
        enableCompare,
      });

      if (customLayers.length) {
        layers.push(...customLayers);
      }
    }
  }

  const vectorlayers = await processVector(
    standardLinks,
    jsonformValue,
    layerId,
  );

  const imagelayers = processImage(standardLinks, jsonformValue, origBbox);

  const geotiffLayers = await processGeoTiff({
    links: standardLinks,
    jsonformValue,
    layerId,
    projection,
  });

  layers.push(
    ...[
      ...(vectorlayers ?? []),
      ...(imagelayers ?? []),
      ...(geotiffLayers ?? []),
    ],
  );

  return layers;
}

////// STAC PROCESSING /////
/**
 * This function loads a STAC collection as a processing output.
 * Currently, it only supports POI STAC collections
 *
 * @param {import("stac-ts").StacLink[]} links
 * @param {Record<string,any>} jsonformValue
 */
export async function processSTAC(links, jsonformValue, enableCompare = false) {
  const stacLink = links.find(
    (link) =>
      link.rel === "service" &&
      link.type == "application/json; profile=collection" &&
      link.endpoint === "STAC",
  );

  if (!stacLink) return;
  let poiUrl = mustache.render(stacLink.href, {
    ...(jsonformValue ?? {}),
  });
  if (isFirstLoad.value) {
    // prevent the map from jumping to the initial position
    isFirstLoad.value = false;
  }
  const store = useSTAcStore();
  const loadPOI = enableCompare
    ? store.loadSelectedCompareSTAC
    : store.loadSelectedSTAC;
  await loadPOI(poiUrl, true);
}
