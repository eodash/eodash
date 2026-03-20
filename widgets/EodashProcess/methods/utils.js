import { useEmitLayersUpdate } from "@/composables";
import {
  extractLayerConfig,
  mergeGeojsons,
  replaceLayer,
  extractLayerLegend,
} from "@/eodashSTAC/helpers";
import axios from "@/plugins/axios";
import { getCompareLayers, getLayers } from "@/store/actions";
import { isMulti } from "@eox/jsonform/src/custom-inputs/spatial/utils";

/** Max number of timesteps to show as discrete enum buttons vs. range slider */
const MAX_DISCRETE_TIMESTEPS = 10;

/** Endpoint identifier for EOxHub workspace-based process links */
export const EOXHUB_WORKSPACES_ENDPOINT = "eoxhub_workspaces";

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
    let extraProperties = extractLayerLegend(selectedStac);

    /** @type {any} */
    const cfg = layerConfig;

    switch (resultItem.type) {
      case "image/tiff": {
        // If datetimes are provided, dynamically override the time_step jsonform
        // to show datetime labels and set correct maximum
        if (
          resultItem.datetimes?.length &&
          cfg?.schema?.properties?.time_step
        ) {
          const n = resultItem.datetimes.length;
          const enumValues = Array.from({ length: n }, (_, i) => i + 1);
          const enumTitles = resultItem.datetimes.map((dt) => {
            try {
              const d = new Date(dt);
              return d.toISOString().slice(0, 16).replace("T", " ");
            } catch {
              return (
                dt || `Step ${enumValues[resultItem.datetimes?.indexOf(dt) ?? 0]}`
              );
            }
          });
          cfg.schema.properties.time_step = {
            ...cfg.schema.properties.time_step,
            maximum: n,
            minimum: 1,
            default: 1,
            ...(n <= MAX_DISCRETE_TIMESTEPS && {
              enum: enumValues,
              options: {
                ...(cfg.schema.properties.time_step.options || {}),
                enum_titles: enumTitles,
              },
            }),
          };
          if (
            n <= MAX_DISCRETE_TIMESTEPS &&
            cfg.schema.properties.time_step.format === "range"
          ) {
            delete cfg.schema.properties.time_step.format;
          }
        }

        layers.push({
          type: "WebGLTile",
          ...(resultItem.visible === false && { visible: false }),
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
            ...(resultItem.datetimes && { datetimes: resultItem.datetimes }),
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
      case "application/json": {
        // JSON results update the chart spec (handled in eoxhub-workspaces-endpoint.js).
        // No map layer is created for this type.
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
        layers.push({
          type: "Vector",
          source: {
            type: "FlatGeoBuf",
            url: resultItem.urls,
          },
          properties: {
            id: endpointLink.id + "_process_" + resultItem.id + postfixId,
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
    /** @type {any} */
    const entry = /** @type {any} */ (resultItem)[key];
    extracted.push({
      // used as a key to identify the corresponding style
      id: key,
      urls: /** @type {string[]} */ (entry.urls),
      type: /** @type {string} */ (entry.mimetype),
      ...(entry?.datetimes && {
        datetimes: entry.datetimes,
      }),
      ...(entry?.visible !== undefined && {
        visible: entry.visible,
      }),
      ...(entry?.data && { data: entry.data }),
    });
  }
  return extracted;
}

/**
 * Walk the OL layer tree and update style variables on layers matching `filterFn`.
 * Uses `setStyle()` instead of `updateStyleVariables()` for WebGLTile layers
 * because `updateStyleVariables()` doesn't properly invalidate cached tiles
 * when the `band` expression uses a variable (e.g. `["band", ["var", "time_step"]]`).
 *
 * @param {import("ol/Map").default} map - OpenLayers map instance
 * @param {(layerId: string) => boolean} filterFn - Predicate receiving the layer id
 * @param {Record<string, any>} styleVars - Style variables to set (e.g. `{ time_step: 3 }`)
 */
export function updateProcessLayerStyleVars(map, filterFn, styleVars) {
  /** @param {*} layerGroup */
  const walk = (layerGroup) => {
    if (!layerGroup?.getLayers) return;
    for (const olLayer of layerGroup.getLayers().getArray()) {
      const id = olLayer.get("id") ?? "";
      if (filterFn(id) && typeof olLayer.updateStyleVariables === "function") {
        const style =
          (typeof olLayer.getStyle === "function"
            ? olLayer.getStyle()
            : null) ?? olLayer.style_;
        if (style?.variables) {
          Object.assign(style.variables, styleVars);
          if (typeof olLayer.setStyle === "function") {
            olLayer.setStyle(style);
          }
        } else {
          olLayer.updateStyleVariables(styleVars);
          olLayer.changed();
        }
      }
      if (typeof olLayer.getLayers === "function") {
        walk(olLayer);
      }
    }
  };
  walk(map);
}

/**
 * Find the temporal field name from a Vega-Lite encoding object.
 * Checks top-level encoding first, then falls back to the first
 * layer's encoding (layered specs may keep encoding at layer level).
 *
 * Note: only searches top-level and first-level layers; deeply nested
 * layer-within-layer specs are not traversed.
 *
 * @param {Record<string, any>} spec - Vega-Lite specification
 * @returns {string | null} The temporal field name, or null if not found
 */
export function findTemporalField(spec) {
  /** @param {Record<string, any> | undefined} enc */
  const fromEncoding = (enc) => {
    if (!enc) return null;
    const key = Object.keys(enc).find((k) => enc[k]?.type === "temporal");
    return key ? enc[key]?.field : null;
  };
  const field = fromEncoding(spec?.encoding);
  if (field) return field;
  if (Array.isArray(spec?.layer)) {
    for (const layer of spec.layer) {
      const f = fromEncoding(layer.encoding);
      if (f) return f;
    }
  }
  return null;
}

/**
 * Find the index of the closest datetime in an array to a target Date.
 *
 * @param {string[]} datetimes - Array of ISO datetime strings
 * @param {Date} targetDate - The target date to match against
 * @returns {number} Index of the closest datetime (0-based)
 */
export function findClosestDatetimeIndex(datetimes, targetDate) {
  const targetMs = targetDate.getTime();
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < datetimes.length; i++) {
    const diff = Math.abs(new Date(datetimes[i]).getTime() - targetMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Build a Vega-Lite spec with inline data, optionally fetching a template spec.
 *
 * @param {string | undefined} specUrl - URL to fetch a Vega-Lite spec template
 * @param {any[]} data - Inline data values to inject
 * @param {Record<string, any> | null} [fallbackSpec=null] - Spec to use if fetch fails
 * @returns {Promise<Record<string, any> | null>} The spec with data injected, or null
 */
export async function buildChartSpecWithData(
  specUrl,
  data,
  fallbackSpec = null,
) {
  let spec = fallbackSpec;
  if (specUrl) {
    try {
      spec = await axios.get(specUrl).then((r) => r.data);
    } catch (e) {
      console.warn("[eodash] Could not fetch Vega spec template:", e);
    }
  }
  if (!spec) return null;
  return {
    ...spec,
    ...(!("background" in spec) && { background: "transparent" }),
    data: { values: data },
  };
}

/** @param {*} jsonformSchema
 * @returns { string[] }
 */
export const getDrawToolsProperties = (jsonformSchema) => {
  const properties = [];
  for (const property in jsonformSchema.properties) {
    if (jsonformSchema.properties[property]?.options?.drawtools) {
      properties.push(property);
    }
  }
  return properties;
};

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
      analysisGroup.layers.push(layer);
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
