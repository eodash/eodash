import log from "loglevel";
import { extractRoles, isBaseLayerOrOverlay } from "../helpers/assets.js";
import { createHTTPInstance } from "../http.js";
import { mergeGeojsons } from "../helpers/geojson.js";
import {
  extractLayerConfig,
  getBandsProperty,
} from "../helpers/layer-config.js";
import { createAssetID } from "../helpers/layers.js";
import { getProjectionCode } from "../helpers/projection.js";
import { addTooltipInteraction, resolveStyle } from "../helpers/style.js";

/**
 * @param {string} collectionId
 * @param {string} title
 * @param {Record<string,import("../types").EodashAsset>} assets
 * @param {import("../types").EodashItem | import("../types").EodashCollection} stacObject
 * @param {Record<string, unknown>} [layerDatetime]
 * @param {object | null} [extraProperties]
 * @param {import("../types").EodashCollection | null} [collection] - Used to fall back to a collection-level style link.
 * @param {string} [map] - which map the layers are built for
 * @param {import("../http.js").HttpClient} [http] reads every url this needs
 * @returns {Promise<{ layers: import("../types").EoxLayer[], projections: import("../types").Projection[] }>} the projections come back with the layers, for the caller to register before they are assigned
 **/
export async function createLayersFromAssets(
  collectionId,
  title,
  assets,
  stacObject,
  layerDatetime,
  extraProperties,
  collection,
  map = "main",
  http = createHTTPInstance(),
) {
  log.debug("Creating layers from assets");
  /** @type {import("../types").EoxLayer[]} */
  const jsonArray = [];
  /** @type {import("../types").Projection[]} */
  const projections = [];
  const geoTIFFSources = [];
  const geoTIFFIdx = [];

  const geoJsonSources = [];
  const geoJsonIdx = [];

  const fgbIdx = [];
  const fgbSources = [];
  const zarrAssetIds = [];
  const zarrIdx = [];
  const assetIds = [];

  for (const [idx, assetId] of Object.keys(assets).entries()) {
    assetIds.push(assetId);

    if (
      assets[assetId]?.type?.includes("application/geo+json") &&
      assets[assetId]?.href?.includes("http")
    ) {
      geoJsonSources.push(assets[assetId].href);
      geoJsonIdx.push(idx);
    } else if (
      assets[assetId]?.type?.includes("application/vnd.flatgeobuf") &&
      assets[assetId]?.href?.includes("http")
    ) {
      fgbSources.push(assets[assetId].href);
      fgbIdx.push(idx);
    } else if (
      assets[assetId]?.type ==
      "application/vnd.zarr; version=3; profile=multiscales"
    ) {
      zarrAssetIds.push(assetId);
      zarrIdx.push(idx);
    } else if (
      assets[assetId]?.type?.includes("image/tiff") &&
      assets[assetId]?.href?.includes("http")
    ) {
      geoTIFFIdx.push(idx);
      geoTIFFSources.push({
        url: assets[assetId].href,
        ...(assets[assetId].attribution
          ? { attributions: assets[assetId].attribution }
          : {}),
      });
    } else if (assets[assetId]?.type?.includes("application/geodb+json")) {
      const responseData = await http.get(assets[assetId].href);
      geoJsonIdx.push(idx);
      if (
        !responseData ||
        !Array.isArray(responseData) ||
        responseData.length === 0
      ) {
        console.error(
          "[eodash] GeoDB response data is not in expected format",
          responseData,
        );
        continue;
      }
      /** @type {Record<string,any>[]} */
      const features = [];
      responseData.forEach((ftr, i) => {
        const { geometry, ...properties } = ftr;
        if (
          geometry.type === "MultiPoint" ||
          geometry.type === "MultiPolygon"
        ) {
          geometry.coordinates.forEach(
            (
              /** @type {Record<string,any>[]} */ coordPair,
              /** @type {number} */ j,
            ) => {
              const singleGeometry = {
                type: geometry.type === "MultiPoint" ? "Point" : "Polygon",
                coordinates: coordPair,
              };
              features.push({
                type: "Feature",
                id: `${i}_${j}`,
                properties,
                geometry: singleGeometry,
              });
            },
          );
        } else {
          features.push({
            type: "Feature",
            properties,
            id: `${i}`,
            geometry: geometry,
          });
        }
      });

      const geojson = {
        type: "FeatureCollection",
        features: features,
      };
      geoJsonSources.push(
        encodeURI(
          "data:application/json;charset=utf-8," + JSON.stringify(geojson),
        ),
      );
    }
  }

  if (geoTIFFSources.length) {
    for (const [i, geotiffSource] of geoTIFFSources.entries()) {
      const assetName = assetIds[geoTIFFIdx[i]];
      const styles = await resolveStyle(
        stacObject,
        collection,
        http,
        undefined,
        assetName,
      );
      // get the correct style which is not attached to a link
      let { layerConfig, style } = extractLayerConfig(
        collectionId,
        styles,
        undefined,
        undefined,
        map,
      );
      let assetLayerId = createAssetID(
        collectionId,
        stacObject.id,
        geoTIFFIdx[i],
      );
      const isBaseOrOverlay = isBaseLayerOrOverlay(assets[assetName]);
      if (isBaseOrOverlay) {
        // to prevent them being removed by date change on main dataset
        assetLayerId = assetName;
      }
      log.debug("Creating WebGLTile layer from GeoTIFF", assetLayerId);
      log.debug("Configured Sources", geoTIFFSources);
      const sources =
        stacObject?.["eodash:merge_assets"] !== false
          ? geoTIFFSources
          : [geotiffSource];
      const layer = {
        /** @type {"WebGLTile"} */
        type: "WebGLTile",
        source: {
          /** @type {"GeoTIFF"} */
          type: "GeoTIFF",
          normalize: !style,
          interpolate: false,
          sources,
        },
        properties: {
          id: assetLayerId,
          title: assets[assetName]?.title || title,
          ...(!isBaseOrOverlay && { layerConfig }),
          layerDatetime,
        },
        style,
      };
      if (extraProperties) {
        layer.properties = { ...layer.properties, ...extraProperties };
      }
      extractRoles(layer.properties, assets[assetName]);
      addTooltipInteraction(layer, style);
      jsonArray.push(layer);
      if (stacObject?.["eodash:merge_assets"] !== false) break;
    }
  }

  if (zarrAssetIds.length) {
    for (const [i, assetName] of zarrAssetIds.entries()) {
      const fetchedStyle = await resolveStyle(
        stacObject,
        collection,
        http,
        undefined,
        assetName,
      );
      const { layerConfig, style } = extractLayerConfig(
        collectionId,
        fetchedStyle,
        undefined,
        undefined,
        map,
      );
      const bandsPath = getBandsProperty(layerConfig?.schema);
      const defaultBands = bandsPath?.reduce(
        (node, key) => node?.[key],
        layerConfig?.schema,
      )?.default ?? ["b04", "b03", "b02"];

      let assetLayerId = createAssetID(collectionId, stacObject.id, zarrIdx[i]);
      const isBaseOrOverlay = isBaseLayerOrOverlay(assets[assetName]);
      if (isBaseOrOverlay) {
        assetLayerId = assetName;
      }

      log.debug("Creating WebGLTile layer from GeoZarr", assetLayerId);

      const layer = {
        /** @type {"WebGLTile"} */
        type: "WebGLTile",
        properties: {
          id: assetLayerId,
          title: assets[assetName]?.title || title,
          ...(!isBaseOrOverlay && { layerConfig }),
          layerDatetime,
        },
        source: {
          /** @type {"GeoZarr"} */
          type: "GeoZarr",
          url: assets[assetName].href,
          bands: defaultBands,
        },
        ...(style ? { style } : {}),
      };
      if (extraProperties) {
        layer.properties = { ...layer.properties, ...extraProperties };
      }
      extractRoles(layer.properties, assets[assetName]);
      jsonArray.push(layer);
    }
  }

  if (geoJsonSources.length) {
    for (const [i, geoJsonSource] of geoJsonSources.entries()) {
      // fetch styles and separate them by their mapping between links and assets
      const assetName = assetIds[geoJsonIdx[i]];
      const styles = await resolveStyle(
        stacObject,
        collection,
        http,
        undefined,
        assetName,
      );
      // get the correct style which is not attached to a link
      let { layerConfig, style } = extractLayerConfig(
        collectionId,
        styles,
        undefined,
        undefined,
        map,
      );
      let assetLayerId = createAssetID(
        collectionId,
        stacObject.id,
        geoJsonIdx[i],
      );
      const isBaseOrOverlay = isBaseLayerOrOverlay(assets[assetName]);
      if (isBaseOrOverlay) {
        // to prevent them being removed by date change on main dataset
        assetLayerId = assetName;
      }

      log.debug(`Creating Vector layer from GeoJsons`, assetLayerId);
      // register projection if exists
      const assetProjection =
        assets[assetName]?.["proj:epsg"] ||
        assets[assetName]?.["eodash:proj4_def"];
      if (assetProjection) {
        projections.push(assetProjection);
      }
      const projection = getProjectionCode(assetProjection) || "EPSG:4326";
      const geoJSONURL =
        stacObject?.["eodash:merge_assets"] === false
          ? geoJsonSource
          : await mergeGeojsons(geoJsonSources, http);

      const layer = {
        /** @type {"Vector"} */
        type: "Vector",
        source: {
          /** @type {"Vector"} */
          type: "Vector",
          url: geoJSONURL,
          format: {
            /** @type {"GeoJSON"} */
            type: "GeoJSON",
            dataProjection: projection,
          },
          ...(assets[assetName].attribution
            ? { attributions: assets[assetName].attribution }
            : {}),
        },
        properties: {
          id: assetLayerId,
          title: assets[assetName]?.title || title,
          layerDatetime,
          ...(layerConfig &&
            !isBaseOrOverlay && {
              layerConfig: {
                ...layerConfig,
                style,
              },
            }),
        },
        ...(!style?.variables && { style }),
        interactions: [],
      };
      layer.properties = { ...layer.properties, ...(extraProperties ?? {}) };
      extractRoles(layer.properties, assets[assetName]);
      addTooltipInteraction(layer, style);
      jsonArray.push(layer);
      // if we merged assets (default yes), then we can break from this loop
      if (stacObject?.["eodash:merge_assets"] !== false) break;
    }
  }
  if (fgbSources.length) {
    for (const [i, fgbSource] of fgbSources.entries()) {
      // fetch styles and separate them by their mapping between links and assets
      const assetName = assetIds[fgbIdx[i]];
      const styles = await resolveStyle(
        stacObject,
        collection,
        http,
        undefined,
        assetName,
      );
      // get the correct style which is not attached to a link
      let { layerConfig, style } = extractLayerConfig(
        collectionId,
        styles,
        undefined,
        undefined,
        map,
      );
      let assetLayerId = createAssetID(collectionId, stacObject.id, fgbIdx[i]);
      const isBaseOrOverlay = isBaseLayerOrOverlay(assets[assetName]);
      if (isBaseOrOverlay) {
        // to prevent them being removed by date change on main dataset
        assetLayerId = assetName;
      }
      log.debug(`Creating Vector layer from FlatGeoBuf`, assetLayerId);
      // register projection if exists
      const assetProjection =
        assets[assetName]?.["proj:epsg"] ||
        assets[assetName]?.["eodash:proj4_def"];
      if (assetProjection) {
        projections.push(assetProjection);
      }
      const projection = getProjectionCode(assetProjection) || "EPSG:4326";
      // in case we merge them, we pass urls, else just single url
      const urlsObject = {
        url:
          stacObject?.["eodash:merge_assets"] === false
            ? fgbSource
            : fgbSources,
      };
      const layer = {
        /** @type {"Vector"} */
        type: "Vector",
        source: {
          ...urlsObject,
          /** @type {"FlatGeoBuf"} */
          type: "FlatGeoBuf",
          projection,
          ...(assets[assetName].attribution
            ? { attributions: assets[assetName].attribution }
            : {}),
        },
        properties: {
          id: assetLayerId,
          title: assets[assetName]?.title || title,
          layerDatetime,
          ...(layerConfig &&
            !isBaseOrOverlay && {
              layerConfig: {
                ...layerConfig,
                style,
              },
            }),
        },
        ...(!style?.variables && { style }),
        interactions: [],
      };
      layer.properties = { ...layer.properties, ...(extraProperties ?? {}) };
      extractRoles(layer.properties, assets[assetName]);
      addTooltipInteraction(layer, style);
      jsonArray.push(layer);
      // if we merged assets (default yes), then we can break from this loop
      if (stacObject?.["eodash:merge_assets"] !== false) break;
    }
  }

  return { layers: jsonArray, projections };
}
