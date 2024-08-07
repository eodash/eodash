import { registerProjection } from "@/store/Actions";
import { extractRoles, getProjectionCode } from "./helpers";

/**
 * @param {string} id
 * @param {string} title
 * @param {Record<string,import("stac-ts").StacAsset>} assets
 * @param {import("ol/layer/WebGLTile").Style} [style]
 * @param {Record<string, unknown>} [layerConfig]
 * @param {Record<string, unknown>} [layerDatetime]
 **/
export async function createLayersFromDataAssets(
  id,
  title,
  assets,
  style,
  layerConfig,
  layerDatetime,
) {
  let jsonArray = [];
  let geoTIFFSources = [];
  for (const ast in assets) {
    // register projection if exists
    const assetProjection =
      /** @type {string | number | {name: string, def: string} | undefined} */ (
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
      extractRoles(layer.properties, assets[ast]?.roles ?? []);
      jsonArray.push(layer);
    } else if (assets[ast]?.type === "image/tiff") {
      geoTIFFSources.push({ url: assets[ast].href });
    }
  }

  if (geoTIFFSources.length) {
    jsonArray.push({
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
    });
  }

  return jsonArray;
}

/**
 * @param {import('stac-ts').StacItem} item
 * @param {string} id
 * @param {string} title
 * @param {Record<string,any>} [layerDatetime]
 */
export const createLayersFromLinks = async (id, title, item, layerDatetime) => {
  /** @type {Record<string,any>[]} */
  const jsonArray = [];
  const wmsArray = item.links.filter((l) => l.rel === "wms");
  const xyzArray = item.links.filter((l) => l.rel === "xyz") ?? [];


  for(const wmsLink of wmsArray ?? [] ){
      // Registering setting sub wms link projection

      const wmsLinkProjection =  /** @type {number | string | {name: string, def: string} | undefined} */
      (wmsLink?.["proj:epsg"] || wmsLink?.["eodash:proj4_def"]);

      await registerProjection(wmsLinkProjection)
      const projectionCode = getProjectionCode(
        wmsLinkProjection || "EPSG:4326",
      );
      let json = {
        type: "Tile",
        properties: {
          id,
          title: title || wmsLink.title || item.id,
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

      extractRoles(json.properties, /** @type {string[]} */ (wmsLink.roles));

      if ("wms:dimensions" in wmsLink) {
        // Expand all dimensions into the params attribute
        Object.assign(json.source.params, wmsLink["wms:dimensions"]);
      }
      jsonArray.push(json);
    }



    for(const xyzLink of xyzArray ?? []){

      const xyzLinkProjection =/** @type {number | string | {name: string, def: string} | undefined} */
      (xyzLink?.["proj:epsg"] || xyzLink?.["eodash:proj4_def"]);

      await registerProjection(xyzLinkProjection);

      const projectionCode = getProjectionCode(
        xyzLinkProjection || "EPSG:3857",
      );
      let json = {
        type: "Tile",
        properties: {
          id,
          title: title || xyzLink.title || item.id,
          roles: xyzLink.roles,
          layerDatetime,
        },
        source: {
          type: "XYZ",
          url: xyzLink.href,
          projection: projectionCode,
        },
      };

      extractRoles(json.properties, /** @type {string[]} */ (xyzLink.roles));
      jsonArray.push(json);
    }
    return jsonArray;
  }
