import { extractLayerConfig } from "@/eodashSTAC/helpers";
import axios from "@/plugins/axios";
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
