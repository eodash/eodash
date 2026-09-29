import { createHTTPInstance } from "../http.js";

/**
 * @param {string[]} geojsonUrls
 * @param {import("../http.js").HttpClient} [http] -  uses fetch by default
 */
export async function mergeGeojsons(geojsonUrls, http = createHTTPInstance()) {
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
    geojsonUrls.map((url) =>
      http.get(url).then((geojson) => {
        merged.features.push(...(geojson.features ?? []));
      }),
    ),
  );

  return (
    "data:application/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(merged))
  );
}
