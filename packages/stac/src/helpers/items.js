/**
 *
 * @param {*} stacObject
 * @returns {stacObject is import("../types").EodashItem}
 */
export function isSTACItem(stacObject) {
  return (
    stacObject &&
    typeof stacObject === "object" &&
    stacObject.collection &&
    stacObject.id &&
    stacObject.properties &&
    typeof stacObject.properties === "object"
  );
}

/**
 *  @param {import("../types").EodashLink[]} [links]
 *  @param {Record<string,any>} [extraProperties]
 * @param {string} [rel = "item"]
 **/
export function generateFeatures(links, extraProperties = {}, rel = "item") {
  /**
   * @type {import("geojson").Feature[]}
   */
  const features = [];
  links?.forEach((element) => {
    if (element.rel === rel && "latlng" in element) {
      const [lat, lon] = /** @type {string} */ (element.latlng)
        .split(",")
        .map((it) => Number(it));
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        properties: { ...element, ...extraProperties },
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
