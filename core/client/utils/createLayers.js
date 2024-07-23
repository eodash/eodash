import { registerProjection } from "@/store/Actions";
import { extractRoles } from "./helpers";

/**
 * @param {string} id
 * @param {string} title
 * @param {Record<string,import("stac-ts").StacAsset>} assets
 * @param {import("ol/layer/WebGLTile").Style} [style]
 * @param {Record<string, unknown>} [layerConfig]
 **/
export async function createLayersFromDataAssets(
  id,
  title,
  assets,
  style,
  layerConfig,
) {
  let jsonArray = [];
  let geoTIFFSources = [];
  for (const ast in assets) {
    // register projection if exists
    await registerProjection(
      /** @type {number | undefined} */ (assets[ast]?.["proj:epsg"]),
    );

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
          ...(layerConfig && {
            layerConfig: {
              ...layerConfig,
              style,
            },
          }),
        },
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
        normalize: !style?.variables,
        sources: geoTIFFSources,
      },
      properties: {
        id,
        title,
        layerConfig,
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
 */
export const createLayersFromLinks = (id, title, item) => {
  /** @type {Record<string,any>[]} */
  const jsonArray = [];
  const wmsArray = item.links.filter((l) => l.rel === "wms");
  const xyzArray = item.links.filter((l) => l.rel === "xyz");

  if (wmsArray.length) {
    wmsArray.forEach((link) => {
      let json = {
        type: "Tile",
        properties: {
          id: id || link.id,
          title: title || link.title || item.id,
        },
        source: {
          type: "TileWMS",
          url: link.href,
          params: {
            LAYERS: link["wms:layers"],
            TILED: true,
          },
        },
      };

      extractRoles(json.properties, /** @type {string[]} */ (link.roles));

      if ("wms:dimensions" in link) {
        // Expand all dimensions into the params attribute
        Object.assign(json.source.params, link["wms:dimensions"]);
      }
      jsonArray.push(json);
    });
  }

  if (xyzArray.length) {
    xyzArray.forEach((link) => {
      let json = {
        type: "Tile",
        properties: {
          id: link.id || item.id,
          title: title || link.title || item.id,
          roles: link.roles,
        },
        source: {
          type: "XYZ",
          url: link.href,
        },
      };

      extractRoles(json.properties, /** @type {string[]} */ (link.roles));
      jsonArray.push(json);
    });
  }
  return jsonArray;
};
