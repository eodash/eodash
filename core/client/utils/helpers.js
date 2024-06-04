
/**
 * @param {import("stac-ts").StacLink[]} links
 */
export function generateFeatures(links) {
  /**
   * @type {{
   * type:string;
   * geometry:{
   * type: string;
   * coordinates: [number, number],
   * }
   * }[]}
   */
  const features = [];
  links.forEach(element => {
    if (element.rel === "item" && "latlng" in element) {
      //@ts-expect-error
      const [lat, lon] = element.latlng.split(",").map((/** @type {string} */it) => Number(it))
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
      })
    }
  });
  const geojsonObject = {
    'type': 'FeatureCollection',
    'crs': {
      'type': 'name',
      'properties': {
        'name': 'EPSG:4326',
      },
    },
    features,
  };
  return geojsonObject;
}
