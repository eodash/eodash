/**
 * Keys that are catalog based and have dedicated parameters
 * sent to a remote API (e.g. TiTiler, eoAPI STAC search).
 * @type {string[]}
 */
const SKIP_KEYS = ["collection", "datetime", "bbox"];

/**
 * Strips the "properties." prefix that eox-itemfilter catalog configs add to
 * item property keys (e.g. "properties.eo:cloud_cover" -> "eo:cloud_cover").
 * Keys without the prefix are returned unchanged.
 * @param {string} key
 * @returns {string}
 */
function normalizeFilterKey(key) {
  return key.startsWith("properties.") ? key.slice("properties.".length) : key;
}

/**
 * Builds a CQL2-text filter string from an eox-itemfilter filters record.
 *
 * Handles range, multiselect, and select filter types.
 * - Strips "properties." prefix from keys (catalog eox-itemfilter convention).
 * - Double-quotes property names that contain non-word characters (e.g. "eo:cloud_cover").
 * - Skips catalog-only keys (e.g. "collection").
 *
 * Compatible with both TiTiler's `filter` param and the STAC API `filter` param
 * (both accept CQL2-text).
 *
 * @param {import("@/types").ItemFilterFilters | null | undefined} filters
 * @returns {string}
 */
export function buildCqlFilter(filters) {
  if (!filters) return "";

  /** @type {string[]} */
  const parts = [];

  for (const filter of Object.values(filters)) {
    if (!filter?.key || SKIP_KEYS.includes(filter.key)) continue;

    const key = normalizeFilterKey(filter.key);
    const prop = /\W/.test(key) ? `"${key}"` : key;

    if (filter.type === "range" && filter.state) {
      const { min, max } = filter.state;
      if (min != null && min > (filter.min ?? -Infinity)) {
        parts.push(`${prop} >= ${min}`);
      }
      if (max != null && max < (filter.max ?? Infinity)) {
        parts.push(`${prop} <= ${max}`);
      }
    } else if (
      filter.type === "multiselect" &&
      filter.stringifiedState?.length
    ) {
      parts.push(`${prop} IN (${filter.stringifiedState})`);
    } else if (filter.type === "select" && filter.stringifiedState) {
      parts.push(`${prop} = '${filter.stringifiedState}'`);
    }
  }

  return parts.join(" AND ");
}
