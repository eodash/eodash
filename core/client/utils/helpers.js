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

/** @param {import("ol/style/flat").FlatStyle} [styles] */
export function extractJSONForm(styles) {
  //@ts-expect-error asfasf
  let jsonform = styles?.jsonform
  if (jsonform) {
    jsonform = { schema: jsonform }
    //@ts-expect-error adas
    delete styles?.jsonform;
  }
  console.log('styles:', styles);
  console.log('jsonform:', jsonform);
  return { jsonform, styles }
}
