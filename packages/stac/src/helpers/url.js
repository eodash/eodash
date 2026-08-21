/**
 * Resolves `href` against `baseUrl` when it is relative, and leaves absolute
 * hrefs alone, `blob:` and `data:` included.
 *
 * @param {string} href
 * @param {string} [baseUrl]
 * @returns {string}
 */
export const toAbsolute = (href, baseUrl) =>
  baseUrl ? new URL(href, baseUrl).toString() : href;

/**
 * Recursively extracts URL keys from a JSON Schema.
 * Maps schema property names to their defined `url_key`.
 *
 * @param {Record<string, any> | null | undefined} schema
 * @returns {Record<string, string>}
 */
export function extractUrlKeys(schema) {
  /** @type {Record<string, string>} */
  const keys = {};
  if (!schema || typeof schema !== "object") return keys;

  if (schema.properties) {
    for (const [key, propDef] of Object.entries(schema.properties)) {
      if (propDef && typeof propDef === "object") {
        if (typeof propDef.url_key === "string") {
          keys[key] = propDef.url_key;
        }
        Object.assign(keys, extractUrlKeys(propDef));
      }
    }
  }

  for (const combinator of ["oneOf", "allOf", "anyOf"]) {
    if (Array.isArray(schema[combinator])) {
      for (const sub of schema[combinator]) {
        Object.assign(keys, extractUrlKeys(sub));
      }
    }
  }

  return keys;
}

/**
 * Serializes an object into a query string compatible with TiTiler.
 * Arrays repeat the key per element, nested elements comma-join, and objects are JSON-encoded.
 *
 * @param {Record<string,any>} obj
 * @returns {string}
 */
export function encodeURLObject(obj) {
  let str = "";
  for (const key in obj) {
    const value = obj[key];
    if (value === null || value === undefined || value === "") {
      continue;
    }

    const valueType = Array.isArray(value) ? "array" : typeof value;

    switch (valueType) {
      case "array": {
        for (const val of value) {
          if (Array.isArray(val)) {
            str += `${key}=${val.join(",")}&`;
          } else {
            str += `${key}=${encodeURIComponent(val)}&`;
          }
        }
        break;
      }
      case "object": {
        str += `${key}=${encodeURI(JSON.stringify(value))}&`;
        break;
      }
      default: {
        str += `${key}=${encodeURIComponent(value)}&`;
        break;
      }
    }
  }
  return str;
}

/**
 * Extracts absolute collection URLs from a STAC indicator or catalog.
 *
 * @param {import("../types").STACCatalog | import("../types").STACCollection | import("../types").STACItem | null} stacObject
 * @param {string} basepath
 * @returns {string[]}
 */
export function extractCollectionUrls(stacObject, basepath) {
  /** @type {string[]} */
  const collectionUrls = [];
  // Support for two structure types, flat and indicator, simplified here:
  // Flat assumes Catalog-Collection-Item
  // Indicator assumes Catalog-Collection-Collection-Item

  const children = stacObject?.links?.filter(
    (link) => link.rel === "child" && link.type?.includes("json"),
  );
  if (!children?.length) {
    collectionUrls.push(basepath);
    return collectionUrls;
  }
  children.forEach((link) => {
    if (link.href.startsWith("http")) {
      collectionUrls.push(link.href);
      return;
    }
    collectionUrls.push(toAbsolute(link.href, basepath));
  });
  return collectionUrls;
}

/**
 * Injects jsonform values into a tile URL's search parameters.
 * Nested objects spread into sub-keys, and arrays become repeated parameters.
 *
 * @param {string} url
 * @param {Record<string, any>} values
 * @returns {string}
 */
export function applyValuesToUrl(url, values) {
  const [base, query] = url.split("?");
  const searchParams = new URLSearchParams(query || "");
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (Array.isArray(value)) {
      searchParams.delete(key);
      value.forEach((v) => searchParams.append(key, String(v)));
    } else if (typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if (v !== undefined && v !== null && v !== "") {
          searchParams.set(k, String(v));
        }
      }
    } else {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}
