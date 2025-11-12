import { registerProjection } from "@/store/actions";
import { mapEl } from "@/store/states";

import {
  extractRoles,
  getProjectionCode,
  createLayerID,
  createAssetID,
  mergeGeojsons,
  extractLayerConfig,
  addTooltipInteraction,
  fetchStyle,
} from "./helpers";
import { handleAuthenticationOfLink } from "./auth";
import log from "loglevel";

/**
 * @param {string} collectionId
 * @param {string} title
 * @param {Record<string,import("stac-ts").StacAsset>} assets
 * @param {import("stac-ts").StacItem } item
 * @param {import("@/types").EodashStyleJson} [style]
 * @param {Record<string, unknown>} [layerConfig]
 * @param {Record<string, unknown>} [layerDatetime]
 * @param {object | null} [extraProperties]
 **/
export async function createLayersFromAssets(
  collectionId,
  title,
  assets,
  item,
  style,
  layerConfig,
  layerDatetime,
  extraProperties,
) {
  log.debug("Creating layers from assets");
  let jsonArray = [];
  let geoTIFFSources = [];
  /** @type {number|null} */
  let geoTIFFIdx = null;

  let geoJsonIdx = 0;
  let geoJsonAttributions = [];

  const geoJsonSources = [];
  let geoJsonRoles = {};
  let projection = undefined;
  for (const [idx, ast] of Object.keys(assets).entries()) {
    // register projection if exists
    const assetProjection =
      /** @type {string | number | {name: string, def: string, extent?:number[]} | undefined} */ (
        assets[ast]?.["proj:epsg"] || assets[ast]?.["eodash:proj4_def"]
      );
    await registerProjection(assetProjection);
    projection = getProjectionCode(assetProjection) || "EPSG:4326";
    if (assets[ast]?.type === "application/geo+json") {
      geoJsonSources.push(assets[ast].href);
      geoJsonIdx = idx;
      if (assets[ast].attribution)
        geoJsonAttributions.push(assets[ast].attribution);
      extractRoles(geoJsonRoles, assets[ast]);
    } else if (assets[ast]?.type === "application/vnd.flatgeobuf") {
      const assetId = createAssetID(collectionId, item.id, idx);
      log.debug(`Creating Vector layer from FlatGeoBuf`, assetId);

      const layer = {
        type: "Vector",
        source: {
          type: "FlatGeoBuf",
          url: assets[ast].href,
          projection,
          attributions: assets[ast].attribution,
        },
        properties: {
          id: assetId,
          title,
          layerDatetime,
          ...(layerConfig && {
            layerConfig: {
              ...layerConfig,
              style,
            },
          }),
        },
        ...(!style?.variables && { style }),
        interactions: [],
      };
      // add tooltip interaction if style has tooltip
      addTooltipInteraction(layer, style);

      extractRoles(layer.properties, assets[ast]);

      layer.properties = { ...layer.properties, ...(extraProperties ?? {}) };

      jsonArray.push(layer);
    } else if (assets[ast]?.type === "image/tiff") {
      geoTIFFIdx = idx;
      geoTIFFSources.push({
        url: assets[ast].href,
        attributions: assets[ast].attribution,
      });
    } else if (assets[ast]?.type === "application/geodb+json") {
      const responseData = await (await fetch(assets[ast].href)).json();
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
        if (geometry.type === 'MultiPoint' || geometry.type === 'MultiPolygon') {
          geometry.coordinates.forEach((/** @type {Record<string,any>[]} */ coordPair, /** @type {number} */j) => {
            const singleGeometry = {
              type: geometry.type === 'MultiPoint' ? 'Point' : 'Polygon',
              coordinates: coordPair,
            };
            features.push({
              type: 'Feature',
              id: `${i}_${j}`,
              properties,
              geometry: singleGeometry,
            });
          });
        } else {
          features.push({
            type: 'Feature',
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

  if (geoJsonSources.length) {
    const assetId = createAssetID(collectionId, item.id, geoJsonIdx);
    log.debug(`Creating Vector layer from GeoJsons`, assetId);
    // assumption that each GeoJSON asset is in same projection due to their merging
    const layer = {
      type: "Vector",
      source: {
        type: "Vector",
        url: await mergeGeojsons(geoJsonSources),
        format: {"type": "GeoJSON", "dataProjection": projection},
        attributions: geoJsonAttributions,
      },
      properties: {
        ...geoJsonRoles,
        id: assetId,
        title,
        layerDatetime,
        ...(layerConfig && {
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
    addTooltipInteraction(layer, style);
    jsonArray.push(layer);
  }
  if (geoTIFFSources.length && typeof geoTIFFIdx === "number") {
    const geotiffSourceID = collectionId + ";:;GeoTIFF";
    log.debug("Creating WebGLTile layer from GeoTIFF", geotiffSourceID);
    log.debug("Configured Sources", geoTIFFSources);
    const layer = {
      type: "WebGLTile",
      source: {
        type: "GeoTIFF",
        normalize: !style,
        interpolate: false,
        sources: geoTIFFSources,
      },
      properties: {
        id: createAssetID(collectionId, item.id, geoTIFFIdx),
        title,
        layerConfig,
        layerDatetime,
      },
      style,
    };
    if (extraProperties) {
      layer.properties = { ...layer.properties, ...extraProperties };
    }
    jsonArray.push(layer);
  }

  return jsonArray;
}

/**
 * @param {string} collectionId
 * @param {import('stac-ts').StacItem} item
 * @param {string} title
 * @param {string} itemUrl
 * @param {Record<string,any>} [layerDatetime]
 * @param {object | null} [extraProperties]
 */
export const createLayersFromLinks = async (
  collectionId,
  title,
  item,
  itemUrl,
  layerDatetime,
  extraProperties,
) => {
  log.debug("Creating layers from links");
  /** @type {Record<string,any>[]} */
  const jsonArray = [];
  const wmsArray = item.links.filter((l) => l.rel === "wms");
  const wmtsArray = item.links.filter((l) => l.rel === "wmts");
  const xyzArray = item.links.filter((l) => l.rel === "xyz") ?? [];
  const vectorTileArray = item.links.filter((l) => l.rel === "vector-tile") ?? [];

  // Taking projection code from main map view, as main view defines
  // projection for comparison map
  const viewProjectionCode = mapEl?.value?.projection || "EPSG:3857";

  for (const wmsLink of wmsArray ?? []) {
    // Registering setting sub wms link projection

    const wmsLinkProjection =
      /** @type {number | string | {name: string, def: string} | undefined} */
      (wmsLink?.["proj:epsg"] || wmsLink?.["eodash:proj4_def"]);

    await registerProjection(wmsLinkProjection);

    const linkProjectionCode =
      getProjectionCode(wmsLinkProjection) || "EPSG:4326";
    // Projection code need to be based on map view projection to make sure
    // tiles are reloaded when changing projection
    const linkId = createLayerID(
      collectionId,
      item.id,
      wmsLink,
      viewProjectionCode,
    );
    log.debug("WMS Layer added", linkId);
    const tileSize = /** @type {number[]} */ (
      "wms:tilesize" in wmsLink
        ? [wmsLink["wms:tilesize"], wmsLink["wms:tilesize"]]
        : [512, 512]
    );
    let json = {
      type: "Tile",
      properties: {
        id: linkId,
        title: wmsLink.title || title || item.id,
        layerDatetime,
      },
      source: {
        type: "TileWMS",
        url: wmsLink.href,
        projection: linkProjectionCode,
        tileGrid: {
          tileSize,
        },
        attributions: wmsLink.attribution,
        params: {
          LAYERS: wmsLink["wms:layers"],
          TILED: true,
        },
      },
    };
    if ("wms:version" in wmsLink) {
      // @ts-expect-error no type for eox-map
      json.source.params["VERSION"] = wmsLink["wms:version"];
    }
    extractRoles(json.properties, wmsLink);
    if ("wms:dimensions" in wmsLink) {
      // Expand all dimensions into the params attribute
      Object.assign(json.source.params, wmsLink["wms:dimensions"]);
    }
    if (extraProperties !== null) {
      json.properties = { ...json.properties, ...extraProperties };
    }
    jsonArray.push(json);
  }

  for (const wmtsLink of wmtsArray ?? []) {
    // Registering setting sub wmts link projection

    const wmtsLinkProjection =
      /** @type {number | string | {name: string, def: string} | undefined} */
      (wmtsLink?.["proj:epsg"] || wmtsLink?.["eodash:proj4_def"]);

    await registerProjection(wmtsLinkProjection);
    const projectionCode = getProjectionCode(wmtsLinkProjection || "EPSG:3857");
    // TODO: WARNING! This is a temporary project specific implementation
    // that needs to be removed once catalog and wmts creation from capabilities
    // combined with custom view projections is solved
    let json;
    const linkId = createLayerID(
      collectionId,
      item.id,
      wmtsLink,
      viewProjectionCode,
    );
    const dimensions = /** @type { {style:any} & Record<string,any> } */ (
      wmtsLink["wmts:dimensions"] || {}
    );
    let { style, ...dimensionsWithoutStyle } = { ...dimensions };
    let extractedStyle = /** @type { string } */ (style || "default");

    if (wmtsLink.title === "wmts capabilities") {
      log.debug(
        "Warning: WMTS Layer from capabilities added, function needs to be updated",
        linkId,
      );
      json = {
        type: "Tile",
        properties: {
          id: linkId,
          title: title || item.id,
          layerDatetime,
        },
        source: {
          type: "WMTS",
          // TODO: Hard coding url as the current one set is for capabilities
          url: "https://wmts.marine.copernicus.eu/teroWmts",
          layer: wmtsLink["wmts:layer"],
          style: extractedStyle,
          // TODO: Hard coding matrixSet until we find solution to wmts creation from capabilities
          matrixSet: "EPSG:3857",
          projection: projectionCode,
          tileGrid: {
            tileSize: [128, 128],
          },
          attributions: wmtsLink.attribution,
          dimensions: dimensionsWithoutStyle,
        },
      };
    } else {
      log.debug(
        "Warning: WMTS Layer from capabilities added, function needs to be updated",
        linkId,
      );
      json = {
        type: "Tile",
        properties: {
          id: linkId,
          title: wmtsLink.title || title || item.id,
          layerDatetime,
        },
        source: {
          type: "WMTS",
          url: wmtsLink.href,
          layer: wmtsLink["wmts:layer"],
          style: extractedStyle,
          matrixSet: wmtsLink.matrixSet || "EPSG:3857",
          projection: projectionCode,
          tileGrid: {
            tileSize: [512, 512],
          },
          attributions: wmtsLink.attribution,
          dimensions: dimensionsWithoutStyle,
        },
      };
    }
    extractRoles(json.properties, wmtsLink);
    if (extraProperties !== null) {
      json.properties = { ...json.properties, ...extraProperties };
    }
    jsonArray.push(json);
  }

  for (const xyzLink of xyzArray ?? []) {
    const xyzLinkProjection =
      /** @type {number | string | {name: string, def: string} | undefined} */
      (xyzLink?.["proj:epsg"] || xyzLink?.["eodash:proj4_def"]);

    await registerProjection(xyzLinkProjection);
    const projectionCode = getProjectionCode(xyzLinkProjection || "EPSG:3857");
    const linkId = createLayerID(
      collectionId,
      item.id,
      xyzLink,
      viewProjectionCode,
    );
    log.debug("XYZ Layer added", linkId);
    let json = {
      type: "Tile",
      properties: {
        id: linkId,
        title: xyzLink.title || title || item.id,
        roles: xyzLink.roles,
        layerDatetime,
      },
      source: {
        type: "XYZ",
        url: xyzLink.href,
        projection: projectionCode,
        attributions: xyzLink.attribution,
      },
    };

    extractRoles(json.properties, xyzLink);
    if (extraProperties !== null) {
      json.properties = { ...json.properties, ...extraProperties };
    }
    jsonArray.push(json);
  }

  for (const vectorTileLink of vectorTileArray ?? []) {
    const vectorTileLinkProjection =
      /** @type {number | string | {name: string, def: string} | undefined} */
      (vectorTileLink?.["proj:epsg"] || vectorTileLink?.["eodash:proj4_def"]);

    await registerProjection(vectorTileLinkProjection);
    const projectionCode = getProjectionCode(vectorTileLinkProjection || "EPSG:3857");
    const linkId = createLayerID(
      collectionId,
      item.id,
      vectorTileLink,
      viewProjectionCode,
    );
    log.debug("Vector Tile Layer added", linkId);
    const key = /** @type {string | undefined} */ (vectorTileLink["key"]) || undefined;
    // fetch styles and separate them by their mapping between links and assets
    const styles = await fetchStyle(item, itemUrl, key);
    // get the correct style which is not attached to a link
    let { layerConfig, style } = extractLayerConfig(
      linkId ?? "",
      styles,
    );
   
    let href = vectorTileLink.href;
    if ("auth:schemes" in item && "auth:refs" in vectorTileLink) {
      href = handleAuthenticationOfLink(/** @type { import("@/types").StacAuthItem} */ (item), /** @type { import("@/types").StacAuthLink} */ (vectorTileLink));
    }
    const json = {
      type: "VectorTile",
      declutter: true,
      properties: {
        id: linkId,
        title: vectorTileLink.title || title || item.id,
        roles: vectorTileLink.roles,
        layerDatetime,
        ...(layerConfig && {
            layerConfig: {
              ...layerConfig,
              style,
            },
          }),
      },
      source: {
        type: "VectorTile",
        format: {
          type: "MVT",
          idProperty: vectorTileLink.idProperty,
          layers: vectorTileLink.layers,
        },
        url: href,
        projection: projectionCode,
        attributions: vectorTileLink.attribution,
      },
      interactions: [],
      ...(!style?.variables && { style }),
    };
    addTooltipInteraction(json, style);
    extractRoles(json.properties, vectorTileLink);
    if (extraProperties !== null) {
      json.properties = { ...json.properties, ...extraProperties };
    }
    jsonArray.push(json);
  }
  return jsonArray;
};
/**
 * Implementation of a function that creates a layer from the render extention
 * @param {import("stac-ts").StacCollection | undefined | null} collection
 * @param {import("stac-ts").StacItem | undefined | null} item
 * @param {string} rasterURL
 * @param {Record<string, any>} [extraProperties]
 * @returns {import("@eox/map/src/layers").EOxLayerType<"Tile","XYZ">[]}
 */
export function createLayerFromRender(
  rasterURL,
  collection,
  item,
  extraProperties,
) {
  if (!collection || !collection.renders || !item) {
    return [];
  }

  const renders = /** @type {Record<string,import("@/types").Render>} */ (
    collection.renders ?? item?.renders
  );
  const layers = [];
  // special case for rescale
  for (const key in renders) {
    const title = renders[key].title;

    const assetsCollection =
      renders[key].assets[0] in item["assets"] ? item : collection;

    const paramsObject = {
      assets: renders[key].assets,
      expression:
        renders[key].expression ??
        assetsCollection["assets"]?.[renders[key].assets[0]]?.expression,
      nodata:
        renders[key].nodata ??
        assetsCollection["assets"]?.[renders[key].assets[0]]?.nodata,
      resampling:
        renders[key].resampling ??
        assetsCollection["assets"]?.[renders[key].assets[0]]?.resampling,
      color_formula:
        renders[key].color_formula ??
        assetsCollection["assets"]?.[renders[key].assets[0]]?.color_formula,
      colormap:
        renders[key].colormap ??
        assetsCollection["assets"]?.[renders[key].assets[0]]?.colormap,
      colormap_name:
        renders[key].colormap_name ??
        assetsCollection["assets"]?.[renders[key].assets[0]]?.colormap_name,
      rescale:
        renders[key].rescale ??
        assetsCollection["assets"]?.[renders[key].assets[0]]?.rescale,
    };
    const paramsStr = encodeURLObject(paramsObject);
    const url = `${rasterURL}/collections/${collection.id}/items/${item.id}/tiles/WebMercatorQuad/{z}/{x}/{y}?${paramsStr}`;
    layers.push({
      /** @type {"Tile"} */
      type: "Tile",
      properties: {
        id: createLayerID(
          collection.id,
          item.id,
          { id: item.id, href: "", title, rel: "" },
          "EPSG:3857",
        ),
        title,
        roles: item.roles,
        ...extraProperties,
      },
      source: {
        /** @type {"XYZ"} */
        type: "XYZ",
        url,
        projection: "EPSG:3857",
      },
    });
  }

  return layers;
}
/**
 *
 * @param {Record<string,any>} obj
 * @returns {string}
 */
function encodeURLObject(obj) {
  let str = "";
  for (const key in obj) {
    const value = obj[key];
    if (value === null || value === undefined || value === "") {
      continue;
    }

    const valueType = Array.isArray(value) ? "array" : typeof value;

    switch (valueType) {
      case "array": {
        // Check if any element in the array is itself an array (multi-dimensional)
        const hasNestedArrays = value.some((/** @type {any} */ item) =>
          Array.isArray(item),
        );

        if (hasNestedArrays) {
          // For multi-dimensional arrays, repeat the key with different values
          for (const val of value) {
            if (Array.isArray(val)) {
              str += `${key}=${val.join(",")}&`;
            } else {
              str += `${key}=${val}&`;
            }
          }
        } else {
          // For simple arrays, join with commas
          str += `${key}=${value.join(",")}&`;
        }
        break;
      }
      case "object": {
        str += `${key}=${encodeURI(JSON.stringify(value))}&`;
        break;
      }
      default: {
        str += `${key}=${encodeURIComponent(value)}&`;
        break;
      }
    }
  }
  return str;
}
