import { isBaseLayerOrOverlay } from "../helpers/assets.js";
import { generateFeatures } from "../helpers/items.js";
import { findLayer } from "../helpers/layers.js";
import { OBSERVATION_POINT_THEMES } from "../helpers/themes.js";
import { createHTTPInstance } from "../http.js";
import { createLayersFromAssets } from "./assets.js";
import { createLayersFromLinks } from "./links.js";

/** Standard layer identifier for observation points. */
const OBSERVATION_POINTS_ID = "geodb-collection";

/**
 * Generates map base layers and overlays declared at the STAC Collection level.
 *
 * @param {import("../types").STACCollection} collection - STAC Collection
 * @param {Parameters<typeof createLayersFromLinks>[6] & { client?: import("../http.js").AxiosInstance }} [options] - Build options and HTTP client
 * @returns {Promise<import("../types").BuiltLayers>}
 */
export const getIndicatorLayers = async (
  collection,
  { client, ...rest } = {},
) => {
  const options = {
    ...rest,
    http: rest.http ?? createHTTPInstance({ client }),
  };
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
 * Creates a vector layer containing spatial observation points across collections.
 *
 * @param {import("../types").STACCollection[]} collections - Array of STAC Collections
 * @param {object} [options]
 * @param {import("../types").ObservationPointsThemes} [options.themes] - Theme styling options
 * @param {import("@eox/map").EoxLayer[]} [options.currentLayers] - Existing layer hierarchy to preserve interactions
 * @returns {import("@eox/map").EoxLayer | null} Vector layer definition or null if no points exist
 */
export const getObservationPointsLayer = (
  collections,
  { themes = OBSERVATION_POINT_THEMES, currentLayers = [] } = {},
) => {
  const features = collections.filter(isObservationPoints)
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
    interactions: [
      ...(findLayer(currentLayers, OBSERVATION_POINTS_ID)?.interactions ?? []),
    ],
  };
};

/**
 * Whether a collection's items are places: a geoDB endpoint, or one stating
 * that its children are locations.
 *
 * @param {import("../types").STACCollection} collection
 */
export function isObservationPoints(collection) {
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
