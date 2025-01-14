import { registerProjection } from "@/store/actions";
import { mapEl } from "@/store/states";
import {
  extractRoles,
  getProjectionCode,
  createLayerID,
  createAssetID,
} from "./helpers";
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

  for (const [idx, ast] of Object.keys(assets).entries()) {
    // register projection if exists
    const assetProjection =
      /** @type {string | number | {name: string, def: string, extent?:number[]} | undefined} */ (
        assets[ast]?.["proj:epsg"] || assets[ast]?.["eodash:proj4_def"]
      );
    await registerProjection(assetProjection);

    if (
      assets[ast]?.type === "application/geo+json" ||
      assets[ast]?.type === "application/vnd.flatgeobuf"
    ) {
      const assetId = createAssetID(collectionId, item.id, idx);
      const sourceType =
        assets[ast]?.type === "application/geo+json" ? "Vector" : "FlatGeoBuf";
      log.debug(`Creating Vector layer from ${sourceType}`, assetId);
      const layer = {
        type: "Vector",
        source: {
          type: sourceType,
          url: assets[ast].href,
          format: "GeoJSON",
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
      };
      // add tooltip interaction if style has tooltip
      if (style?.tooltip) {
        // @ts-expect-error no type for eox-map layer
        layer.interactions = [
          {
            type: "select",
            options: {
              id: "selectInteraction",
              condition: "pointermove",
              style: {
                "stroke-color": "#335267",
                "stroke-width": 4,
              },
            },
          },
        ];
      }

      extractRoles(layer.properties, assets[ast]);

      layer.properties = { ...layer.properties, ...(extraProperties ?? {}) };

      jsonArray.push(layer);
    } else if (assets[ast]?.type === "image/tiff") {
      geoTIFFIdx = idx;
      geoTIFFSources.push({ url: assets[ast].href });
    }
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
 * @param {Record<string,any>} [layerDatetime]
 * @param {object | null} [extraProperties]
 */
export const createLayersFromLinks = async (
  collectionId,
  title,
  item,
  layerDatetime,
  extraProperties,
) => {
  log.debug("Creating layers from links");
  /** @type {Record<string,any>[]} */
  const jsonArray = [];
  const wmsArray = item.links.filter((l) => l.rel === "wms");
  const wmtsArray = item.links.filter((l) => l.rel === "wmts");
  const xyzArray = item.links.filter((l) => l.rel === "xyz") ?? [];

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
      },
    };

    extractRoles(json.properties, xyzLink);
    if (extraProperties !== null) {
      json.properties = { ...json.properties, ...extraProperties };
    }
    jsonArray.push(json);
  }
  return jsonArray;
};
