import { useEmitLayersUpdate } from "@/composables";
import {
  extractLayerConfig,
  mergeGeojsons,
  replaceLayer,
  getLegendInfoFromStac,
} from "@/eodashSTAC/helpers";
import axios from "@/plugins/axios";
import { getCompareLayers, getLayers } from "@/store/actions";
import { isMulti } from "@eox/jsonform/src/custom-inputs/spatial/utils";

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
 *
 * @param {import("stac-ts").StacLink} link
 * @param {string} layerId
 * @param {string[]} urls
 * @param {import("openlayers").ProjectionLike} projection
 * @param {string} processId
 */
export async function createTiffLayerDefinition(
  link,
  layerId,
  urls,
  projection,
  processId,
) {
  let flatStyleJSON = null;
  if ("eox:flatstyle" in (link ?? {})) {
    flatStyleJSON = await axios
      .get(/** @type {string} */ (link["eox:flatstyle"]))
      .then((resp) => resp.data);
  }

  let layerConfig;
  let style;
  if (flatStyleJSON) {
    const extracted = extractLayerConfig(layerId ?? "", flatStyleJSON);
    layerConfig = extracted.layerConfig;
    style = extracted.style;
  }
  // We want to make sure the urls are alphabetically sorted
  urls = urls.sort();
  /** @type {import("@eox/map/src/layers").EOxLayerType<"WebGLTile","GeoTIFF"> | undefined} */
  const layerdef =
    urls.length > 0
      ? {
          type: "WebGLTile",
          source: {
            type: "GeoTIFF",
            normalize: !style,
            sources: urls.map((url) => ({ url })),
          },
          properties: {
            id: link.id + "_process" + processId,
            title: "Results " + layerId,
            ...(layerConfig && { layerConfig: layerConfig }),
            layerControlToolsExpand: true,
          },
          ...(style && { style: style }),
        }
      : undefined;

  // We want to see if the currently selected indicator uses a
  // specific map projection if it does we want to apply it
  if (projection && layerdef) {
    //@ts-expect-error TODO
    layerdef.source.projection = projection;
  }
  return layerdef;
}
/**
 * @param {string} fileName
 * @param {string|Record<string,any>} content
 * @returns
 */
export const download = (fileName, content) => {
  if (!content) {
    return;
  }
  let url = /** @type string */ (content);
  if (typeof content === "object") {
    content = JSON.stringify(content);
    const blob = new Blob([content], { type: "text" });
    url = URL.createObjectURL(blob);
  }
  const link = document.createElement("a");
  if (confirm(`Would you like to download ${fileName}?`)) {
    link.href = url;
    link.download = fileName;
    link.click();
  }
  URL.revokeObjectURL(url);
  link.remove();
};

/**
 * Generate time pairs from a temporal extent
 * @param {import("stac-ts").TemporalExtent} stacExtent - [start, end]
 * @param {import("stac-ts").TemporalExtent} [userExtent] -[start, end]
 * @param {string} [distribution] - daily, weekly, monthly, or yearly
 */
export function generateTimePairs(stacExtent, userExtent, distribution) {
  // check whether the userExtent is provided
  // if it is check that it doesn't exceed the stacExtent
  // and clamp it otherwise

  /** @type {string|Date} */
  let from = "";

  /** @type {string|Date} */
  let to = "";
  [from, to] = /** @type {[string, string]} */ (userExtent ?? ["", ""]);

  const [stacFrom, stacTo] = /** @type {[string, string]} */ (
    stacExtent ?? ["", ""]
  );

  try {
    if (from && to) {
      from = new Date(from);
      to = new Date(to);
    } else {
      from = new Date(stacFrom);
      to = new Date(stacTo);
    }

    if (from < new Date(stacFrom) || from > new Date(stacTo)) {
      console.warn(
        "[eodash] warn: start date is outside of the collection temporal extent and will be clamped",
        `\nprovided start date:${from.toISOString()}`,
        `\ncollection start date:${stacFrom}`,
      );
      from = new Date(stacFrom);
    }

    if (to > new Date(stacTo) || to < new Date(stacFrom)) {
      console.warn(
        "[eodash] warn: end date is outside of the collection temporal extent and will be clamped",
        `\nprovided end date:${to.toISOString()}`,
        `\ncollection end date:${stacTo}`,
      );
      to = new Date(stacTo);
    }

    if (from > to) {
      console.error(
        "[eodash] Error: start date is greater than end date",
        from,
        to,
      );
      return [];
    }
  } catch (e) {
    //@ts-expect-error e should be an error
    console.error("[eodash] Invalid date:", e.message);
    return [];
  }

  const startDate = /** @type {Date} */ (from).toISOString();
  const endDate = /** @type {Date} */ (to).toISOString();

  if (!startDate || !endDate) {
    return [];
  }
  const times = [];
  let latest = new Date(endDate);
  const start = new Date(startDate);
  const oneDay = 24 * 60 * 60 * 1000;
  // Use fixed step of 1 day (in milliseconds)
  const step =
    distribution === "daily"
      ? oneDay
      : distribution === "weekly"
        ? oneDay * 7
        : distribution === "monthly"
          ? oneDay * 30
          : distribution === "yearly"
            ? oneDay * 365
            : oneDay;

  // Add dates, limiting to 31 dates (30 pairs maximum)
  while (latest >= start && times.length < 31) {
    times.push(new Date(latest));
    latest.setTime(latest.getTime() - step);
  }

  const timePairs = [];
  for (let i = 0; i < times.length - 1; i++) {
    timePairs.push([times[i].toISOString(), times[i + 1].toISOString()]);
  }

  return timePairs;
}

/**
 * Filter links to separate those with and without endpoint property
 * @param {import("stac-ts").StacLink[] | undefined} links
 * @param {string} [relType] - Optional relationship type
 * @param {string} [contentType] - Optional content type
 * @returns {[import("stac-ts").StacLink[], import("stac-ts").StacLink[]]}
 */
export function separateEndpointLinks(links, relType, contentType) {
  if (!links) return [[], []];
  const standardLinks = [];
  const endpointLinks = [];

  for (const link of links) {
    // Check if the link matches the specified relType and contentType (if provided)
    const relTypeMatch = relType ? link.rel === relType : true;
    const contentTypeMatch = contentType ? link.type === contentType : true;

    if (relTypeMatch && contentTypeMatch) {
      if (link.endpoint) {
        endpointLinks.push(link);
      } else {
        standardLinks.push(link);
      }
    }
  }

  return [standardLinks, endpointLinks];
}

/**
 * Generates layer definitions for asynchronous process results.
 * using AsyncProcessResults data structure.
 * @param {import("^/EodashProcess/types").AsyncProcessResults} processResults
 * @param {import("stac-ts").StacLink} endpointLink
 * @param {import("stac-ts").StacCollection|null} selectedStac
 * @param {string} [postfixId=""] - Optional layers id postfix
 * @returns
 */
export async function creatAsyncProcessLayerDefinitions(
  processResults,
  endpointLink,
  selectedStac,
  postfixId = "",
) {
  /** @type {import("@eox/map").EoxLayer[]} */
  const layers = [];
  const flatStyles = await fetchProcessStyles(endpointLink);

  for (const resultItem of processResults) {
    const flatStyleJSON = extractStyleFromResult(resultItem, flatStyles);
    /** @type {import("@/types").EodashStyleJson | undefined} */
    let style;
    /** @type {Record<string, unknown> | undefined}  */
    let layerConfig;
    if (flatStyleJSON) {
      const extracted = extractLayerConfig(
        selectedStac?.id ?? "",
        flatStyleJSON,
      );
      layerConfig = extracted.layerConfig;
      style = extracted.style;
    }

    // Check if collection has eox:colorlegend definition, if yes overwrite legend description
    let extraProperties = getLegendInfoFromStac(selectedStac);

    switch (resultItem.type) {
      case "image/tiff": {
        layers.push({
          type: "WebGLTile",
          properties: {
            id: endpointLink.id + "_process" + resultItem.id + postfixId,
            title:
              "Results " +
              (selectedStac?.id ?? "") +
              " " +
              (resultItem.id ?? ""),
            layerControlToolsExpand: true,
            ...(layerConfig && { layerConfig }),
            ...extraProperties,
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
            id: endpointLink.id + "_process_" + resultItem.id + postfixId,
            title:
              "Results " +
              (selectedStac?.id ?? "") +
              " " +
              (resultItem.id ?? ""),
            ...(layerConfig && {
              layerConfig: {
                ...layerConfig,
                style,
              },
            }),
            ...extraProperties,
          },
          ...(!style?.variables && { style }),
          interactions: [],
        });
        break;
      }
      case "application/vnd.flatgeobuf": {
        // TODO after more flatgeobuf urls are possible in EOxMap https://github.com/EOX-A/EOxElements/issues/1789
        // we should change this handler to only create one layer instead of many
        resultItem.urls.forEach((url, i) => {
          layers.push({
            type: "Vector",
            source: {
              type: "FlatGeoBuf",
              url,
            },
            properties: {
              id:
                endpointLink.id +
                "_process_" +
                resultItem.id +
                postfixId +
                `_${i}`,
              title:
                "Results " +
                (selectedStac?.id ?? "") +
                " " +
                (resultItem.id ?? ""),
              layerControlToolsExpand: true,
              ...(layerConfig && {
                layerConfig: {
                  ...layerConfig,
                  style,
                },
              }),
              ...extraProperties,
            },
          });
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
 * @param {import("stac-ts").StacLink} endpointLink
 * @returns
 */
async function fetchProcessStyles(endpointLink) {
  /** @type {import("@/types").EodashStyleJson | (Record<string,import("@/types").EodashStyleJson> & {multipleStyles:true}) | null} */
  let flatStyles = null;
  if (endpointLink["eox:flatstyle"]) {
    if (typeof endpointLink["eox:flatstyle"] === "string") {
      flatStyles = await axios
        .get(/** @type {string} */ (endpointLink["eox:flatstyle"]))
        .then((resp) => /** @type {} */ resp.data);
    } else if (
      Array.isArray(endpointLink["eox:flatstyle"]) &&
      endpointLink["eox:flatstyle"].length
    ) {
      // multipleStyles as a flag to indicate it
      flatStyles = { multipleStyles: true };

      await Promise.all(
        /** @type {{id:string;url:string}[]} */
        (endpointLink["eox:flatstyle"]).map(async (styleDict) => {
          //@ts-expect-error TODO
          flatStyles[styleDict.id] = await axios
            .get(styleDict.url)
            .then(
              (resp) =>
                /** @type {import("@/types").EodashStyleJson} */ (resp.data),
            );
        }),
      );
    } else {
      // multipleStyles as a flag to indicate it
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
  return flatStyles;
}

/**
 *
 * @param {import("^/EodashProcess/types").AsyncProcessResults[number]} processResult
 * @param {null| import("@/types").EodashStyleJson | (Record<string,import("@/types").EodashStyleJson> & {multipleStyles:true})} flatStyles
 */
function extractStyleFromResult(processResult, flatStyles) {
  if (!flatStyles) {
    return undefined;
  }
  if (!("multipleStyles" in flatStyles)) {
    return flatStyles;
  }

  const outputKey = processResult.id;
  if (!outputKey || !(outputKey in flatStyles)) {
    return undefined;
  }
  return flatStyles[outputKey];
}

/**
 *
 * @param {import("^/EodashProcess/types").EOxHubProcessResults} resultItem
 * @returns {import("^/EodashProcess/types").AsyncProcessResults}
 */
export function extractAsyncResults(resultItem) {
  if (!resultItem) {
    return [];
  }
  // if no type specified we assume the results are geotiff sources
  if ("urls" in resultItem && Array.isArray(resultItem.urls)) {
    return [{ id: "", urls: resultItem.urls, type: "image/tiff" }];
  }

  const extracted = [];
  for (const key in resultItem) {
    if (key === "id") {
      continue;
    }
    extracted.push({
      // used as a key to identify the corresponding style
      id: key,
      //@ts-expect-error TODO
      urls: /** @type {string[]} */ (resultItem[key].urls),
      //@ts-expect-error TODO
      type: /** @type {string} */ (resultItem[key].mimetype),
    });
  }
  return extracted;
}
/**
 * @param {import("@eox/map").EOxMap | null} mapElement
 * @param {import("@eox/map").EoxLayer[]} processLayers
 */
export const applyProcessLayersToMap = (mapElement, processLayers) => {
  if (!processLayers.length || !mapElement) {
    return;
  }
  const getMapLayers =
    mapElement.id === "compare" ? getCompareLayers : getLayers;
  const currentLayers = [...getMapLayers()];

  let analysisGroup =
    /*** @type {import("@eox/map/src/layers").EOxLayerTypeGroup | undefined} */ (
      currentLayers.find((l) => l.properties?.id.includes("AnalysisGroup"))
    );
  if (!analysisGroup) {
    return;
  }

  for (const layer of processLayers) {
    const exists = analysisGroup.layers.find(
      (l) => l.properties?.id === layer.properties?.id,
    );
    if (!exists) {
      analysisGroup.layers.unshift(layer);
    } else {
      analysisGroup.layers = replaceLayer(
        analysisGroup.layers,
        layer.properties?.id ?? "",
        [layer],
      );
    }
  }
  if (mapElement) {
    const layers = [...currentLayers];
    const evtKey =
      mapElement.id === "compare"
        ? "compareProcess:updated"
        : "process:updated";
    useEmitLayersUpdate(evtKey, mapElement, layers);
    mapElement.layers = layers;
  }
};
/**
 * Updates the jsonform schema to target the compare map
 * @param {import("json-schema").JSONSchema7 | null | undefined} jsonformSchema
 */
export function updateJsonformSchemaTarget(jsonformSchema) {
  if (!jsonformSchema) {
    return jsonformSchema;
  }
  const stringified = JSON.stringify(jsonformSchema).replaceAll(
    "eox-map#main",
    "eox-map#compare",
  );
  return /** @type {import("json-schema").JSONSchema7} */ (
    JSON.parse(stringified)
  );
}
