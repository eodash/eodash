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
 * @param {*} link
 * @param {*} layerId
 * @param {string[]} urls
 * @param {*} projection
 * @param {*} processId
 * @returns
 */
export async function createLayerDefinition(
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

  /** @type {Record<string,any>|undefined} */
  let layerConfig;
  /** @type {Record<string,any>|undefined} */
  let style;
  if (flatStyleJSON) {
    const extracted = extractLayerConfig(layerId ?? "", flatStyleJSON);
    layerConfig = extracted.layerConfig;
    style = extracted.style;
  }
  // We want to make sure the urls are alphabetically sorted
  urls = urls.sort();
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
            id: layerId + "_geotiff_process" + processId,
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
