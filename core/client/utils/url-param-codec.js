import base64EncodeSpec from "@eox/chart/src/methods/encode/encode-spec-b64.js";
import parseSpec from "@eox/chart/src/methods/decode/parse-spec.js";

/**
 * Base64url encode and decode utilities for compact URL parameters.
 * Delegates to @eox/chart's base64EncodeSpec and parseSpec, converting to URL-safe base64.
 */

/**
 * Encodes an object or string into a URL-safe Base64 string without '=' padding.
 * @param {unknown} data
 * @returns {string}
 */
export function encodeParam(data) {
  if (data === null || data === undefined) {
    return "";
  }
  if (typeof data === "object" && Object.keys(data).length === 0) {
    return "";
  }
  try {
    const b64 = base64EncodeSpec(
      /** @type {import("vega-embed").VisualizationSpec} */ (data),
    );
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (err) {
    console.error("[eodash] Failed to base64url encode parameter:", err);
    return "";
  }
}

/**
 * Decodes a URL-safe Base64 string back into parsed JSON or null if invalid.
 * @template T
 * @param {string | null | undefined} str
 * @returns {T | null}
 */
export function decodeParam(str) {
  if (!str) {
    return null;
  }
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return /** @type {T} */ (parseSpec(base64));
  } catch (err) {
    console.warn("[eodash] Failed to decode base64url parameter:", err);
    return null;
  }
}
