/**
 * Text and payload sanitization utilities for safe ingestion and output.
 */

/**
 * Sanitizes input string by stripping null bytes, control characters,
 * and invisible zero-width Unicode characters. Enforces maximum length.
 *
 * @param {string} str
 * @param {number} [maxLength=1000]
 * @returns {string}
 */
export function sanitizeText(str, maxLength = 1000) {
  if (typeof str !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const regex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200D\uFEFF]/g;
  const cleaned = str.replace(regex, "");
  return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength);
}

export const MAX_GEOJSON_VERTICES = 10_000;

/**
 * Counts coordinate vertices in a GeoJSON geometry.
 *
 * @param {any} geometry
 * @returns {number}
 */
export function countGeoJsonVertices(geometry) {
  if (!geometry || !geometry.coordinates) return 0;
  let count = 0;
  function walk(coords) {
    if (!Array.isArray(coords)) return;
    if (
      coords.length >= 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number"
    ) {
      count += 1;
      return;
    }
    for (const c of coords) {
      walk(c);
      if (count > MAX_GEOJSON_VERTICES) return;
    }
  }
  walk(geometry.coordinates);
  return count;
}

/**
 * Checks if an object contains circular references.
 *
 * @param {any} obj
 * @param {WeakSet<object>} [seen=new WeakSet()]
 * @returns {boolean}
 */
export function hasCircularReference(obj, seen = new WeakSet()) {
  if (!obj || typeof obj !== "object") return false;
  if (seen.has(obj)) return true;
  seen.add(obj);

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object") {
      if (hasCircularReference(val, seen)) return true;
    }
  }
  return false;
}
