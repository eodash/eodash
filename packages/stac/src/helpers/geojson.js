import axios from "axios";

/**
 * @param {string[]} geojsonUrls
 */
export async function mergeGeojsons(geojsonUrls) {
  if (!geojsonUrls.length) {
    return undefined;
  }
  if (geojsonUrls.length === 1) {
    return geojsonUrls[0];
  }

  const merged = {
    type: "FeatureCollection",
    /** @type {import("ol").Feature[]} */
    features: [],
  };
  await Promise.all(
    geojsonUrls.map((url) => {
      // Use native fetch for blob URLs to avoid axios/cache interceptor issues
      if (url.startsWith("blob:")) {
        return fetch(url)
          .then(async (resp) => await resp.json())
          .then((geojson) => {
            merged.features.push(...(geojson.features ?? []));
          });
      }
      return axios.get(url).then((resp) => {
        const geojson = resp.data;
        merged.features.push(...(geojson.features ?? []));
      });
    }),
  );

  return encodeURI(
    "data:application/json;charset=utf-8," + JSON.stringify(merged),
  );
}
