import { isBaseLayerOrOverlay } from "../helpers/assets.js";
import { generateFeatures } from "../helpers/items.js";
import { findLayer } from "../helpers/layers.js";
import { OBSERVATION_POINT_THEMES } from "../helpers/themes.js";
import { createLayersFromAssets } from "./assets.js";
import { createLayersFromLinks } from "./links.js";

/** The id the observation points layer always carries. */
const OBSERVATION_POINTS_ID = "geodb-collection";

/**
 * The base layers and overlays a collection states, built from the collection
 * itself rather than from any of its items.
 *
 * @param {import("../types").EodashCollection} collection
 * @param {Parameters<typeof createLayersFromLinks>[6]} [options]
 * @returns {Promise<import("../types").BuiltLayers>}
 */
export const getIndicatorLayers = async (collection, options = {}) => {
  const assets = Object.fromEntries(
    Object.entries(collection.assets ?? {}).filter(([, asset]) =>
      isBaseLayerOrOverlay(asset),
    ),
  );
  const title = collection.title || collection.id;

  const built = await Promise.all([
    createLayersFromLinks(
      collection.id ?? "",
      title,
      // the collection stands in for the item: only its links are read
      /** @type {any} */ (collection),
      undefined,
      undefined,
      undefined,
      options,
    ),
    createLayersFromAssets(
      collection.id ?? "",
      title,
      assets,
      collection,
      undefined,
      undefined,
      undefined,
      options,
    ),
  ]);

  return {
    layers: built.flatMap((result) => result.layers),
    projections: built.flatMap((result) => result.projections),
  };
};

/**
 * One layer holding every observation point across `collections`, which are the
 * collections whose items are places rather than times.
 *
 * @param {import("../types").EodashCollection[]} collections
 * @param {object} [options]
 * @param {import("../types").ObservationPointsThemes} [options.themes] marker colour and icon per theme; eodash's own when left out
 * @param {import("../types").EoxLayer[]} [options.currentLayers] the tree as it stands, so the layer keeps the interactions already on it
 * @returns {import("../types").EoxLayer | null} nothing when no collection holds points
 */
export const getObservationPointsLayer = (
  collections,
  { themes = OBSERVATION_POINT_THEMES, currentLayers = [] } = {},
) => {
  const features = collections
    .filter(isObservationPoints)
    .flatMap((collection) =>
      generateFeatures(
        collection.links,
        {
          collection_id: collection.id,
          geoDBID: collection.geoDBID,
          themes: collection.themes ?? [],
        },
        collection.locations ? "child" : "item",
      ).features,
    );

  if (!features.length) {
    return null;
  }

  const featureCollection = {
    type: "FeatureCollection",
    crs: { type: "name", properties: { name: "EPSG:4326" } },
    features,
  };

  return {
    type: "Vector",
    properties: {
      id: OBSERVATION_POINTS_ID,
      title: "Observation Points",
    },
    source: {
      type: "Vector",
      url: "data:," + encodeURIComponent(JSON.stringify(featureCollection)),
      format: "GeoJSON",
    },
    style: themeStyle(themes),
    // carried over so eox-map reads the layer as unchanged and leaves them bound
    interactions: [
      ...(findLayer(currentLayers, OBSERVATION_POINTS_ID)?.interactions ?? []),
    ],
  };
};

/**
 * Whether a collection's items are places: a geoDB endpoint, or one stating
 * that its children are locations.
 *
 * @param {import("../types").EodashCollection} collection
 */
function isObservationPoints(collection) {
  return collection.endpointtype === "GeoDB" || !!collection.locations;
}

/**
 * A flat style per theme, falling through to a plain circle.
 *
 * @param {import("../types").ObservationPointsThemes} themes
 */
function themeStyle(themes) {
  return [
    ...Object.entries(themes).map(([theme, { color, icon }], index) => ({
      ...(index !== 0 && { else: true }),
      filter: ["==", ["get", "themes", 0], theme],
      style: { "icon-src": markerIcon(color, icon) },
    })),
    {
      else: true,
      style: {
        "circle-radius": 10,
        "circle-fill-color": "#00417077",
        "circle-stroke-color": "#004170",
        "fill-color": "#00417077",
        "stroke-color": "#004170",
      },
    },
  ];
}

/**
 * @param {string} color
 * @param {string} icon an svg path
 */
function markerIcon(color, icon) {
  const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="30" stroke="white" fill="${color}" stroke-width="4"/>
              <path d="${icon}" fill="#fff" transform="translate(19.5, 20) scale(1.3) "/>
            </svg>
            `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}