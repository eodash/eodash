import { asyncBufferFromUrl, parquetRead } from "hyparquet";
import WKB from "ol/format/WKB.js";
import GeoJSON from "ol/format/GeoJSON";
import log from "loglevel";

/**
 * @param {string} url
 */
export const readParquetItems = async (url) => {
  /** @type {import("stac-ts").StacItem[]} */
  let items = [];
  await parquetRead({
    file: await asyncBufferFromUrl({ url }),
    rowFormat: "object",
    onComplete: (data) => {
      //@ts-expect-error onComplete param depends on the rowFormat
      items.push(...(adjustParquetItems(data) ?? []));
    },
  });
  log.debug("Adjusted Parquet items", items);
  return items;
};

/**
 *
 * @param {import("stac-ts").StacItem[]} items
 */
export const adjustParquetItems = (items) => {
  return items.map((item) => {
    item = moveItemProperties(item);
    item = adjustItemsBigInts(item);
    return {
      ...item,
      //@ts-expect-error geometry wkb conversion by stac-geoparquet
      geometry: wkbToGeometry(item.geometry),

      assets: ((assets) => {
        for (const [key, value] of Object.entries(assets)) {
          if (!value || !value.href) {
            delete assets[key];
          }
        }
        return assets;
      })(item.assets),

      bbox: ((bbox) => {
        //@ts-expect-error bbox conversion by stac-geoparquet
        const { xmax, xmin, ymax, ymin } = bbox;
        return [xmin, ymin, xmax, ymax].map((v) => parseFloat(v));
      })(item.bbox),
    };
  });
};
/**
 *  @param {string} wkb - Well Known Binary string
 */
function wkbToGeometry(wkb) {
  // Convert to Uint8Array
  const uint8Array = new Uint8Array(
    wkb.split("").map((char) => char.charCodeAt(0)),
  );
  const geoJsonFormatter = new GeoJSON();
  const wkbReader = new WKB();
  const olGeometry = wkbReader.readGeometry(uint8Array);
  return geoJsonFormatter.writeGeometryObject(olGeometry);
}

/**
 *
 * @param {import("stac-ts").StacItem} item
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
 * @param {import("stac-ts").StacItem} item
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
