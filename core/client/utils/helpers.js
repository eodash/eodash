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
