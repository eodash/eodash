/**
 * Base64url encode and decode utilities for compact URL parameters.
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
  const jsonStr = typeof data === "string" ? data : JSON.stringify(data);
  if (!jsonStr || jsonStr === "{}" || jsonStr === "[]") {
    return "";
  }
  try {
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
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
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded);
  } catch (err) {
    console.warn("[eodash] Failed to decode base64url parameter:", err);
    return null;
  }
}
