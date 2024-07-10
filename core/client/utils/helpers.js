import { registerProjection } from "@/store/Actions";

/** @param {import("stac-ts").StacLink[]} links */
export function generateFeatures(links) {
  /**
   * @type {{
   *   type: string;
   *   geometry: {
   *     type: string;
   *     coordinates: [number, number];
   *   };
   * }[]}
   */
  const features = [];
  links.forEach((element) => {
    if (element.rel === "item" && "latlng" in element) {
      const [lat, lon] = /** @type {string} */ (element.latlng)
        .split(",")
        .map((it) => Number(it));
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
      });
    }
  });
  const geojsonObject = {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: {
        name: "EPSG:4326",
      },
    },
    features,
  };
  return geojsonObject;
}

/** @param {import("@/types").JSONFormStyles} [styles] */
export function extractJSONForm(styles) {
  let jsonform = styles?.jsonform
  if (jsonform) {
    jsonform = { schema: jsonform, type: "style" }
    delete styles?.jsonform;
  }
  return { jsonform, styles }
}
/**
* @param {string} id
* @param {string} title
* @param {Record<string,import("stac-ts").StacAsset>} assets
* @param {import("@/types").JSONFormStyles} [styles]
* @param {Record<string, unknown>} [jsonform]
**/
export async function createLayersFromDataAssets(id, title, assets, styles, jsonform) {
  let jsonArray = []
  let geoTIFFSources = []
  for (const ast in assets) {
    const projDef = assets[ast]?.['proj:epsg'] ? `EPSG:${assets[ast]['proj:epsg']}` : "EPSG:3857"
    // add this logic to the item level as well
   await registerProjection(projDef)

    if (assets[ast]?.type === "application/geo+json") {
      jsonArray.push({
        type: "Vector",
        source: {
          type: "Vector",
          url: assets[ast].href,
          format: "GeoJSON",
        },
        properties: {
          id,
          title,
          layerConfig: jsonform
        },
        styles: styles
      });
    } else if (assets[ast]?.type === "image/tiff") {
      geoTIFFSources.push({ url: assets[ast].href })
    }
  }
  if (geoTIFFSources.length) {
    jsonArray.push({
      type: "WebGLTile",
      source: {
        type: "GeoTIFF",
        normalize: styles?.variables ? false : true,
        sources: geoTIFFSources
      },
      properties: {
        id,
        title,
        layerConfig: jsonform
      },
      style: styles
    });
  }
  return jsonArray
}
