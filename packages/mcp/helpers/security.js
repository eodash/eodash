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
