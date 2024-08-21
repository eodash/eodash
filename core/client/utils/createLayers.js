import { registerProjection } from "@/store/Actions";
import { extractRoles, assignProjID, getProjectionCode } from "./helpers";

/**
 * @param {string} id
 * @param {string} title
 * @param {Record<string,import("stac-ts").StacAsset>} assets
 * @param {import("stac-ts").StacItem } item
 * @param {import("ol/layer/WebGLTile").Style} [style]
 * @param {Record<string, unknown>} [layerConfig]
 * @param {Record<string, unknown>} [layerDatetime]
 **/
export async function createLayersFromAssets(
  id,
  title,
  assets,
  item,
  style,
  layerConfig,
  layerDatetime,
) {
  let jsonArray = [];
  let geoTIFFSources = [];
  /** @type {import("stac-ts").StacAsset | null} */
  let geoTIFFAsset = null;

  for (const ast in assets) {
    // register projection if exists
    const assetProjection =
      /** @type {string | number | {name: string, def: string, extent?:number[]} | undefined} */ (
        assets[ast]?.["proj:epsg"] || assets[ast]?.["eodash:proj4_def"]
      );
    await registerProjection(assetProjection);

    if (assets[ast]?.type === "application/geo+json") {
      const layer = {
        type: "Vector",
        source: {
          type: "Vector",
          url: assets[ast].href,
          format: "GeoJSON",
        },
        properties: {
          id,
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

      assignProjID(item, assets[ast], id, layer);

      extractRoles(layer.properties, assets[ast]);
      jsonArray.push(layer);
    } else if (assets[ast]?.type === "image/tiff") {
      geoTIFFAsset = assets[ast];
      geoTIFFSources.push({ url: assets[ast].href });
    }
  }

  if (geoTIFFSources.length) {
    const layer = {
      type: "WebGLTile",
      source: {
        type: "GeoTIFF",
        normalize: !style,
        sources: geoTIFFSources,
      },
      properties: {
        id,
        title,
        layerConfig,
        layerDatetime,
      },
      style,
    };
    assignProjID(
      item,
      /** @type {import("stac-ts").StacAsset} */
      (geoTIFFAsset),
      id,
      layer,
    );
    jsonArray.push(layer);
  }

  return jsonArray;
}

/**
 * @param {string} id
 * @param {import('stac-ts').StacItem} item
 * @param {string} title
 * @param {Record<string,any>} [layerDatetime]
 */
export const createLayersFromLinks = async (id, title, item, layerDatetime) => {
  /** @type {Record<string,any>[]} */
  const jsonArray = [];
  const wmsArray = item.links.filter((l) => l.rel === "wms");
  const wmtsArray = item.links.filter((l) => l.rel === "wmts");
  const xyzArray = item.links.filter((l) => l.rel === "xyz") ?? [];

  for (const wmsLink of wmsArray ?? []) {
    // Registering setting sub wms link projection

    const wmsLinkProjection =
      /** @type {number | string | {name: string, def: string} | undefined} */
      (wmsLink?.["proj:epsg"] || wmsLink?.["eodash:proj4_def"]);

    await registerProjection(wmsLinkProjection);
    const projectionCode = getProjectionCode(wmsLinkProjection || "EPSG:4326");

    let json = {
      type: "Tile",
      properties: {
        id,
        title: wmsLink.title || title || item.id,
        layerDatetime,
      },
      source: {
        type: "TileWMS",
        url: wmsLink.href,
        projection: projectionCode,
        params: {
          LAYERS: wmsLink["wms:layers"],
          TILED: true,
        },
      },
    };

    assignProjID(item, wmsLink, id, json);

    extractRoles(json.properties, wmsLink);

    if ("wms:dimensions" in wmsLink) {
      // Expand all dimensions into the params attribute
      Object.assign(json.source.params, wmsLink["wms:dimensions"]);
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
    if (wmtsLink.title === "wmts capabilities") {
      json = {
        type: "Tile",
        properties: {
          id,
          title: title || item.id,
          layerDatetime,
        },
        source: {
          type: "WMTS",
          // TODO: Hard coding url as the current one set is for capabilities
          url: "https://wmts.marine.copernicus.eu/teroWmts",
          layer: wmtsLink["wmts:layer"],
          style: wmtsLink.style || "default",
          // TODO: Hard coding matrixSet until we find solution to wmts creation from capabilities
          matrixSet: "EPSG:3857",
          projection: projectionCode,
          tileGrid: {
            tileSize: [128, 128],
          },
          dimensions: wmtsLink["wmts:dimensions"],
        },
      };
    } else {
      json = {
        type: "Tile",
        properties: {
          id,
          title: wmtsLink.title || title || item.id,
          layerDatetime,
        },
        source: {
          type: "WMTS",
          url: wmtsLink,
          layer: wmtsLink["wmts:layer"],
          style: wmtsLink.style || "default",
          matrixSet: wmtsLink.matrixSet || "EPSG:3857",
          projection: projectionCode,
          tileGrid: {
            tileSize: [128, 128],
          },
          dimensions: wmtsLink["wmts:dimensions"],
        },
      };
    }

    assignProjID(item, wmtsLink, id, json);

    extractRoles(json.properties, wmtsLink);

    jsonArray.push(json);
  }

  for (const xyzLink of xyzArray ?? []) {
    const xyzLinkProjection =
      /** @type {number | string | {name: string, def: string} | undefined} */
      (xyzLink?.["proj:epsg"] || xyzLink?.["eodash:proj4_def"]);

    await registerProjection(xyzLinkProjection);

    const projectionCode = getProjectionCode(xyzLinkProjection || "EPSG:3857");
    let json = {
      type: "Tile",
      properties: {
        id,
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

    assignProjID(item, xyzLink, id, json);

    extractRoles(json.properties, xyzLink);

    jsonArray.push(json);
  }
  return jsonArray;
};
