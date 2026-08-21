/**
 * Checks if a given object qualifies as a valid STAC Item.
 *
 * @param {*} stacObject
 * @returns {stacObject is import("../types").STACItem}
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
 * Generates a GeoJSON FeatureCollection from a list of STAC Links that contain a `latlng` property.
 *
 * @param {import("../types").STACLink[]} [links]
 * @param {Record<string,any>} [extraProperties]
 * @param {string} [rel = "item"]
 */
export function generateFeatures(links, extraProperties = {}, rel = "item") {
  /**
   * @type {import("../types").GeoJSONFeature[]}
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
