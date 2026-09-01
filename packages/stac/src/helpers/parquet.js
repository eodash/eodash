/**
 * Normalizes raw GeoParquet rows into standard STAC Items.
 * Migrates non-STAC columns under `properties`, converts BigInts to numbers, and formats the bbox object as an array.
 *
 * @param {Record<string, any>[]} items - Raw rows decoded by hyparquet.
 * @returns {import("../types").STACItem[]}
 */
export const adjustParquetItems = (items) => {
  return items.map((item) => {
    item = moveItemProperties(item);
    item = adjustItemsBigInts(item);

    return /** @type {import("../types").STACItem} */ ({
      ...item,

      // Convert Date instances to ISO 8601 strings for consistent RFC 3339 formatting
      properties: ((properties) => {
        for (const key of ["datetime", "start_datetime", "end_datetime"]) {
          if (properties[key] instanceof Date) {
            properties[key] = properties[key].toISOString();
          }
        }
        return properties;
      })(item.properties ?? {}),

      assets: ((assets) => {
        for (const [key, value] of Object.entries(assets)) {
          if (!value || !value.href) {
            delete assets[key];
          }
        }
        return assets;
      })(item.assets),

      bbox: ((bbox) => {
        const { xmax, xmin, ymax, ymin } = bbox;
        return [xmin, ymin, xmax, ymax].map((v) => parseFloat(v));
      })(item.bbox),
    });
  });
};

/**
 *
 * @param {Record<string, any>} item
 */
function moveItemProperties(item) {
  const stacProperties = [
    "assets",
    "links",
    "bbox",
    "geometry",
    "stac_version",
    "stac_extensions",
    "type",
    "id",
    "collection",
    "properties",
    "auth:schemes",
    "eodash:merge_assets",
  ];
  for (const key in item) {
    if (!stacProperties.includes(key)) {
      if (!item.properties) {
        item.properties = {};
      }
      item.properties[key] = item[key];
      delete item[key];
    }
  }
  return item;
}

/**
 *
 * @param {Record<string, any>} item
 */
function adjustItemsBigInts(item) {
  /** @param {*} obj */
  const adjustBigInt = (obj) => {
    for (const key in obj ?? {}) {
      if (typeof obj[key] === "bigint") {
        obj[key] = parseFloat(obj[key].toString());
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        adjustBigInt(obj[key]);
      }
    }
  };
  adjustBigInt(item.links);
  adjustBigInt(item.properties);
  adjustBigInt(item.assets);
  adjustBigInt(item.bbox);
  adjustBigInt(item.geometry);
  return item;
}
