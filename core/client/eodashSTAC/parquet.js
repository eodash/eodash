import { parquetRead } from "hyparquet";
import log from "loglevel";
import axios from "@/plugins/axios";

/**
 * @param {string} url
 */
export const readParquetItems = async (url) => {
  /** @type {import("stac-ts").StacItem[]} */
  let items = [];
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { Accept: "application/octet-stream" },
  });

  const contentType = /** @type {string} */ (
    response.headers["content-type"] ?? ""
  );
  if (
    !contentType.includes("application") &&
    !contentType.includes("octet-stream") &&
    !url.endsWith(".parquet")
  ) {
    console.warn(
      "Response may not be a Parquet file. Content-Type:",
      contentType,
    );
  }
  /** @type {ArrayBuffer} */
  const arrayBuffer = response.data;
  if (arrayBuffer.byteLength < 8) {
    throw new Error(
      "Downloaded buffer is too small to be a valid Parquet file.",
    );
  }
  await parquetRead({
    file: arrayBuffer,
    rowFormat: "object",
    // set utf8 to false to avoid parsing wkb to string
    utf8: false,
    /** @param {Record<string, any>[]} data */
    onComplete: (data) => {
      items.push(...(adjustParquetItems(data) ?? []));
    },
  });
  log.debug("Adjusted Parquet items", items);
  return items;
};

/**
 * Normalize raw geoparquet rows into STAC items: non-STAC columns move under
 * `properties`, BigInts become numbers, and the bbox object becomes an array.
 *
 * @param {Record<string, any>[]} items - raw rows as decoded by hyparquet
 */
export const adjustParquetItems = (items) => {
  return items.map((item) => {
    item = moveItemProperties(item);
    item = adjustItemsBigInts(item);

    return /** @type {import("stac-ts").StacItem} */ ({
      ...item,

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
