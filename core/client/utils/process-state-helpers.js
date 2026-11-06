/**
 * Utilities for extracting, diffing, and serializing process jsonform values.
 */

/**
 * Extracts default values from a jsonform schema.
 *
 * @param {Record<string, any> | null | undefined} schema
 * @returns {Record<string, any>}
 */
export function extractSchemaDefaults(schema) {
  if (!schema || typeof schema !== "object") return {};
  /** @type {Record<string, any>} */
  const defaults = {};
  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (prop && typeof prop === "object") {
        if (prop.default !== undefined) {
          defaults[key] = JSON.parse(JSON.stringify(prop.default));
        } else if (prop.type === "object" && prop.properties) {
          defaults[key] = extractSchemaDefaults(prop);
        }
      }
    }
  }
  return defaults;
}

/**
 * Sanitizes form values for serialization by stripping internal properties and normalizing feature objects.
 *
 * @param {any} val
 * @returns {any}
 */
export function sanitizeFormValue(val) {
  if (Array.isArray(val)) {
    return val.map((v) => sanitizeFormValue(v));
  }
  if (val && typeof val === "object") {
    // If it's a native OL feature or has getProperties/ol_uid, convert to a plain serializable form
    if (typeof val.getProperties === "function" || val.ol_uid) {
      const props =
        typeof val.getProperties === "function" ? val.getProperties() : {};
      const id = val.getId?.() || props.id || props.ID || val.ol_uid;
      return { id };
    }
    /** @type {Record<string, any>} */
    const res = {};
    for (const [k, v] of Object.entries(val)) {
      if (k.startsWith("_") || typeof v === "function") continue;
      res[k] = sanitizeFormValue(v);
    }
    return res;
  }
  return val;
}

/**
 * Computes a delta object containing only keys from `current` that differ from `baseline`.
 *
 * @param {Record<string, any>} current
 * @param {Record<string, any>} baseline
 * @returns {Record<string, any>}
 */
export function diffFormValues(current, baseline) {
  if (!current || typeof current !== "object") return {};
  /** @type {Record<string, any>} */
  const delta = {};
  for (const [key, val] of Object.entries(current)) {
    if (key.startsWith("_")) continue;
    const cleanVal = sanitizeFormValue(val);
    const baseVal = baseline ? baseline[key] : undefined;

    if (JSON.stringify(cleanVal) !== JSON.stringify(baseVal)) {
      delta[key] = cleanVal;
    }
  }
  return delta;
}

/**
 * Deep merges delta values into a target schema's defaults or form value.
 *
 * @param {Record<string, any>} target
 * @param {Record<string, any>} delta
 * @returns {Record<string, any>}
 */
export function mergeFormDelta(target, delta) {
  if (!delta || typeof delta !== "object") return target;
  const merged = { ...(target || {}) };
  for (const [key, val] of Object.entries(delta)) {
    if (
      val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      merged[key] &&
      typeof merged[key] === "object" &&
      !Array.isArray(merged[key])
    ) {
      merged[key] = mergeFormDelta(merged[key], val);
    } else {
      merged[key] = val;
    }
  }
  return merged;
}
