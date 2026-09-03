import log from "loglevel";
import { extractRoles } from "../helpers/assets.js";
import { extractLayerTimeValues } from "../helpers/datetime.js";
import {
  createLayerConfigHelpers,
  renderConfigTemplate,
} from "../helpers/layer-config.js";
import { getProjection } from "../helpers/projection.js";
import { extractLayerLegend, fetchStyle } from "../helpers/style.js";
import { createHTTPInstance } from "../http.js";
import { createLayersFromAssets } from "./assets.js";
import { createLayersFromLinks } from "./links.js";
import { createLayerFromRender } from "./renders.js";

/**
 * Context provided by the caller to build layers. Includes HTTP configuration, map state, and external overrides.
 *
 * @typedef {object} BuildContext
 * @property {import("../types").BBox} [bbox]
 * @property {string} [title]
 * @property {string} [itemDatetime]
 * @property {string} [color]
 * @property {string} [rasterEndpoint]
 * @property {string} [viewProjection]
 * @property {Record<string, any> | null} [tileMatrixSets]
 * @property {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [upscalingEndpoints]
 * @property {Record<string, Record<string, import("../types").Render>>} [renders]
 * @property {import("../http.js").HttpClient} [http]
 * @property {import("../types").LayerConfigHelpers} [layerConfigHelpers]
 */

/** Link relations supported for layer rendering. */
const RENDERABLE_RELS = [
  "wms",
  "xyz",
  "wmts",
  "vector-tile",
  "mapbox-style-document",
  "tilejson",
];

/**
 * Generates @eox/map layer definitions and projection definitions for a single STAC Item.
 * Evaluates web service links (WMS, WMTS, XYZ, VectorTile), data assets (COG, GeoTIFF, GeoJSON, Zarr),
 * and STAC Render extensions.
 *
 * @param {import("../types").STACItem} item - Target STAC Item containing data links/assets
 * @param {BuildContext & { stac: import("../types").STACCollection, getDates: (datetime?: import("../types").Datetime) => Promise<Date[]> }} context - Context dependencies (HTTP client, STAC collection, state config)
 * @returns {Promise<{ layers: import("../types").EoxLayer[], projections: import("../types").Projection[] }>} Layer array for @eox/map and required projections
 */
export const buildLayers = async (item, context) => {
  const {
    stac: collection,
    getDates,
    title = collection.title || collection.id || "",
    itemDatetime,
    color,
    rasterEndpoint,
    viewProjection,
    tileMatrixSets,
    upscalingEndpoints,
    renders,
    http = createHTTPInstance(),
    layerConfigHelpers = createLayerConfigHelpers(),
  } = context;
  const options = {
    viewProjection,
    tileMatrixSets,
    upscalingEndpoints,
    renders,
    http,
    layerConfigHelpers,
  };

  log.debug("Building layers", item, title, itemDatetime);

  /** @type {import("../types").Projection[]} */
  const projections = [];
  // the item's own projection, which the app registers before assigning
  const indicatorProjection = getProjection(item);
  if (indicatorProjection) {
    projections.push(indicatorProjection);
  }

  const itemDate = item.properties?.datetime ?? item.properties?.start_datetime ?? itemDatetime;
  const { layerDatetime, timeControlValues } = extractLayerTimeValues(
    await getDates(itemDate ?? undefined),
    itemDate,
  );

  const dataAssets = Object.keys(item.assets ?? {}).reduce((data, ast) => {
    if (item.assets[ast].roles?.includes("data")) {
      data[ast] = item.assets[ast];
    }
    return data;
  }, /** @type {import("../types").STACItem["assets"]} */ ({}));

  const isSupported =
    item.links.some((link) => RENDERABLE_RELS.includes(link.rel)) ||
    Object.keys(dataAssets).length;

  if (!isSupported) {
    return {
      layers: [
        await buildStacLayer(item, collection, title, http, layerConfigHelpers),
      ],
      projections,
    };
  }

  const extraProperties = {
    ...extractLayerLegend(collection),
    ...(color && { color }),
    ...(timeControlValues && {
      timeControlValues,
      timeControlProperty: "TIME",
    }),
    ...(!!collection["eodash:layerExclusive"] && {
      layerControlExclusive: true,
      layerControlExpand: false,
    }),
  };

  // the three are independent, so their fetches overlap; array order fixes layer order
  const built = await Promise.all([
    createLayersFromLinks(
      collection.id,
      title,
      item,
      layerDatetime,
      extraProperties,
      collection,
      options,
    ),
    createLayersFromAssets(
      collection.id,
      title || collection.title || item.id,
      dataAssets,
      item,
      layerDatetime,
      extraProperties,
      collection,
      options,
    ),
    ...(rasterEndpoint
      ? [
          createLayerFromRender(
            rasterEndpoint,
            collection,
            item,
            { ...extraProperties, ...(layerDatetime && { layerDatetime }) },
            options,
          ),
        ]
      : []),
  ]);

  return {
    layers: built.flatMap((result) => result.layers),
    projections: [
      ...projections,
      ...built.flatMap((result) => result.projections),
    ],
  };
};

/**
 * Fallback layer builder for items that cannot be explicitly matched to a supported rendering strategy.
 * Defers to the @eox/map STAC layer type to attempt extraction.
 *
 * @param {import("../types").STACItem} item
 * @param {import("../types").STACCollection} collection
 * @param {string} title
 * @param {import("../http.js").HttpClient} http
 * @param {import("../types").LayerConfigHelpers} layerConfigHelpers
 * @returns {Promise<import("../types").EoxLayer>}
 */
async function buildStacLayer(
  item,
  collection,
  title,
  http,
  layerConfigHelpers,
) {
  const styles = renderConfigTemplate(await fetchStyle(item, http), item);
  const { layerConfig, style } = layerConfigHelpers.extractLayerConfig(styles);
  const json = {
    /** @type {"STAC"} */
    type: "STAC",
    displayWebMapLink: true,
    displayFootprint: false,
    data: item,
    properties: {
      id: collection.id,
      title: title || item.id,
      layerConfig,
    },
    style,
  };
  extractRoles(
    json.properties,
    //@ts-expect-error using the item incase no self link is found
    item.links.find((link) => link.rel === "self") ?? item,
  );
  return json;
}

export * from "./assets.js";
export * from "./links.js";
export * from "./renders.js";
