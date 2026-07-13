/*
  Suggests filter config for a STAC API endpoint by inspecting each collection's
  queryables (range/enum schemas) and summaries. Prints to stdout - review and
  paste into your config.

  By default it prints eox-itemfilter `filterProperties`. Pass `--widget` to
  print EodashItemCatalog `filters` instead.

  Usage:
    node core/node/scripts/suggestFilters.js <stac-api-endpoint> [collectionId ...] [--widget]
*/

import { fileURLToPath } from "url";

const DATETIME_KEYS = ["datetime", "start_datetime", "end_datetime"];
const SKIP_PROPERTIES = new Set([...DATETIME_KEYS, "created", "updated"]);
const NUMERIC_TYPES = new Set(["number", "integer"]);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const widgetFormat = args.includes("--widget");
  const [endpointArg, ...collectionArgs] = args.filter(
    (arg) => !arg.startsWith("--"),
  );
  if (!endpointArg) {
    console.error(
      "Usage: node core/node/scripts/suggestFilters.js <stac-api-endpoint> [collectionId ...] [--widget]",
    );
    process.exit(1);
  }
  main(endpointArg.replace(/\/+$/, ""), collectionArgs, widgetFormat).catch(
    (error) => {
      console.error(error.message);
      process.exit(1);
    },
  );
}

/**
 * @param {string} endpoint STAC API root
 * @param {string[]} collectionArgs explicit collection ids, or empty for all
 * @param {boolean} [widgetFormat] print EodashItemCatalog `filters` instead of eox `filterProperties`
 */
async function main(endpoint, collectionArgs, widgetFormat = false) {
  const collectionIds = collectionArgs.length
    ? collectionArgs
    : await listCollections(endpoint);
  if (!collectionIds.length) {
    throw new Error(`No collections found at ${endpoint}`);
  }

  /** @type {Map<string, Record<string, any>>} suggested filter by property */
  const byProperty = new Map();
  for (const id of collectionIds) {
    const [summaries, queryables] = await Promise.all([
      getJson(`${endpoint}/collections/${id}`)
        .then((collection) => collection?.summaries ?? {})
        .catch(() => ({})),
      getJson(`${endpoint}/collections/${id}/queryables`)
        .then((doc) => doc?.properties ?? {})
        .catch(() => ({})),
    ]);
    mergeQueryables(byProperty, queryables);
    mergeSummaries(byProperty, summaries);
  }

  const filters = [...byProperty.values()];
  const output = widgetFormat ? filters : filters.map(toEoxFilterProperty);
  console.log(JSON.stringify(output, null, 2));
}

/**
 * Convert an EodashItemCatalog filter to an eox-itemfilter `filterProperties` entry.
 * @param {Record<string, any>} filter EodashItemCatalog filter
 * @returns {Record<string, any>} eox-itemfilter filter property
 */
function toEoxFilterProperty(filter) {
  const key = `properties.${filter.property}`;
  if (filter.type === "range") {
    return {
      key,
      title: filter.title,
      type: "range",
      expanded: true,
      min: filter.min,
      max: filter.max,
    };
  }
  return {
    key,
    title: filter.title,
    type: "multiselect",
    inline: false,
    filterKeys: filter.filterKeys,
  };
}

/**
 * @param {string} endpoint STAC API root
 * @returns {Promise<string[]>} collection ids
 */
async function listCollections(endpoint) {
  const doc = await getJson(`${endpoint}/collections`);
  return (doc?.collections ?? []).map((collection) => collection.id);
}

/**
 * @param {string} url request url
 * @returns {Promise<any>} parsed JSON body
 */
async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

/**
 * @param {Map<string, Record<string, any>>} byProperty accumulator
 * @param {Record<string, any>} queryables queryables `properties` map
 */
function mergeQueryables(byProperty, queryables) {
  for (const [property, schema] of Object.entries(queryables)) {
    if (SKIP_PROPERTIES.has(property)) continue;
    if (NUMERIC_TYPES.has(schema?.type)) {
      mergeRange(byProperty, property, schema.minimum, schema.maximum);
    } else if (Array.isArray(schema?.enum)) {
      mergeOptions(byProperty, property, schema.enum);
    }
  }
}

/**
 * @param {Map<string, Record<string, any>>} byProperty accumulator
 * @param {Record<string, any>} summaries collection `summaries` map
 */
function mergeSummaries(byProperty, summaries) {
  for (const [property, value] of Object.entries(summaries)) {
    if (SKIP_PROPERTIES.has(property)) continue;
    if (Array.isArray(value)) {
      mergeOptions(byProperty, property, value);
    } else if (typeof value?.minimum === "number") {
      mergeRange(byProperty, property, value.minimum, value.maximum);
    }
  }
}

/**
 * @param {Map<string, Record<string, any>>} byProperty accumulator
 * @param {string} property STAC property key
 * @param {number} [minimum] lower bound
 * @param {number} [maximum] upper bound
 */
function mergeRange(byProperty, property, minimum, maximum) {
  const existing = byProperty.get(property) ?? {
    property,
    type: "range",
    title: humanize(property),
  };
  if (typeof minimum === "number") {
    existing.min =
      existing.min === undefined ? minimum : Math.min(existing.min, minimum);
  }
  if (typeof maximum === "number") {
    existing.max =
      existing.max === undefined ? maximum : Math.max(existing.max, maximum);
  }
  byProperty.set(property, existing);
}

/**
 * @param {Map<string, Record<string, any>>} byProperty accumulator
 * @param {string} property STAC property key
 * @param {any[]} options enum values
 */
function mergeOptions(byProperty, property, options) {
  const existing = byProperty.get(property) ?? {
    property,
    type: "multiselect",
    title: humanize(property),
    filterKeys: [],
  };
  const filterKeys = new Set(existing.filterKeys ?? []);
  for (const option of options) {
    if (typeof option === "string" || typeof option === "number") {
      filterKeys.add(option);
    }
  }
  existing.filterKeys = [...filterKeys];
  byProperty.set(property, existing);
}

/**
 * "eo:cloud_cover" -> "Cloud Cover".
 * @param {string} property STAC property key
 * @returns {string} human-readable label
 */
function humanize(property) {
  return property
    .split(":")
    .pop()
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export {
  main,
  mergeQueryables,
  mergeSummaries,
  toEoxFilterProperty,
  humanize,
};
