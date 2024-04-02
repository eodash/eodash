
//@ts-expect-error
export function generateFeatures(links) {
    //@ts-expect-error
    const features = [];
    //@ts-expect-error
    links.forEach(element => {
        if (element.rel === "item" && "latlng" in element) {
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
        //@ts-expect-error
        features,
    };
    return geojsonObject;
}