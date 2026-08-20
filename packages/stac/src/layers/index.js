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
 * What the app supplies for a build: everything the builders need that the
 * collection document does not state.
 *
 * @typedef {object} BuildContext
 * @property {import("../types").BBox} [bbox] - narrows an api's date search to the viewport
 * @property {string} [title]
 * @property {string} [itemDatetime] - stands in where the item states no datetime
 * @property {string} [color] - the colour the collection is drawn in
 * @property {string} [rasterEndpoint] - titiler, without which the render extension is not built
 * @property {string} [viewProjection] - the map view's projection, which the compare map follows
 * @property {Record<string, any> | null} [tileMatrixSets] - tile matrix set definitions keyed by id
 * @property {Array<string | { url: string; titilerVersion?: 1 | 2; scaleFactor?: number }>} [upscalingEndpoints]
 * @property {Record<string, Record<string, import("../types").Render>>} [renders] - renders the app config states, keyed by collection id
 * @property {import("../http.js").HttpClient} [http] - reads every url a build needs; `fetch` when left out
 * @property {import("../types").LayerConfigHelpers} [layerConfigHelpers] - restores what the collection's config editors held onto the rebuilt layers
 */

/** The link rels the builders know how to render. */
const RENDERABLE_RELS = [
  "wms",
  "xyz",
  "wmts",
  "vector-tile",
  "mapbox-style-document",
  "tilejson",
];

/**
 * The layer config for one item, from its links, its data assets and the render
 * extension. Nothing is fetched for the item itself; the caller already holds it.
 *
 * @param {import("../types").EodashItem} item
 * @param {BuildContext & { stac: import("../types").EodashCollection, getDates: (datetime?: import("../types").Datetime) => Promise<Date[]> }} context
 * @returns {Promise<{ layers: import("../types").EoxLayer[], projections: import("../types").Projection[] }>}
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

  const itemDate =
    item.properties?.datetime ?? item.properties.start_datetime ?? itemDatetime;
  const { layerDatetime, timeControlValues } = extractLayerTimeValues(
    await getDates(itemDate ?? undefined),
    itemDate,
  );

  const dataAssets = Object.keys(item.assets ?? {}).reduce((data, ast) => {
    if (item.assets[ast].roles?.includes("data")) {
      data[ast] = item.assets[ast];
    }
    return data;
  }, /** @type {import("../types").EodashItem["assets"]} */ ({}));

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
 * The fallback for an item nothing else knows how to render: hand it to eox-map
 * as a STAC layer and let it extract what it supports.
 *
 * @param {import("../types").EodashItem} item
 * @param {import("../types").EodashCollection} collection
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
