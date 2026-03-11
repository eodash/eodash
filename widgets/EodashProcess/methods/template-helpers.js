import mustache from "mustache";

/**
 * Returns form value keys that match the multiQuery configuration.
 * @param {Record<string, any> | undefined} jsonformValue
 * @param {Record<string, any>} jsonformSchema
 * @returns {string[]}
 */
export function getMultiQueryMatches(jsonformValue, jsonformSchema) {
  const multiQuery = jsonformSchema?.options?.multiQuery;
  return Object.keys(jsonformValue ?? {}).filter((key) => {
    return Array.isArray(multiQuery)
      ? multiQuery.includes(key)
      : multiQuery === key;
  });
}

/**
 * Extracts iterable scalar values for a multiQuery field.
 * Wraps single values in an array; returns empty array for undefined.
 * @param {string} match - The multiQuery field name
 * @param {Record<string, any>} jsonformValue
 * @returns {any[]}
 */
export function getScalarMultiQueryValues(match, jsonformValue) {
  const value = jsonformValue?.[match];
  if (Array.isArray(value)) {
    return value;
  }
  return value === undefined ? [] : [value];
}

/**
 * Extracts iterable values for a POST multiQuery field.
 * For GeoJSON fields, uses rawJsonformValue to get original Feature objects
 * (before extractGeometries stringifies them). For scalar fields, delegates
 * to getScalarMultiQueryValues.
 * @param {string} match - The multiQuery field name
 * @param {Record<string, any>} jsonformValue - Form values after geometry extraction
 * @param {Record<string, any> | undefined} rawJsonformValue - Form values before geometry extraction
 * @param {Record<string, any>} jsonformSchema
 * @returns {any[]}
 */
export function getPostMultiQueryValues(
  match,
  jsonformValue,
  rawJsonformValue,
  jsonformSchema,
) {
  if (jsonformSchema?.properties?.[match]?.type === "geojson") {
    return getGeoJsonMultiQueryValues(rawJsonformValue?.[match]);
  }
  return getScalarMultiQueryValues(match, jsonformValue);
}

/**
 * Extracts individual GeoJSON Feature objects from a value that may be
 * a FeatureCollection, a single Feature, or an array of Features.
 * Filters for valid Features with geometry and deduplicates.
 * @param {any} value
 * @returns {Record<string, any>[]}
 */
export function getGeoJsonMultiQueryValues(value) {
  if (value?.type === "FeatureCollection") {
    return dedupeMultiQueryValues(
      (value.features ?? []).filter(
        (/** @type {any} */ feature) =>
          feature?.type === "Feature" && feature.geometry,
      ),
    );
  }
  if (value?.type === "Feature") {
    return [value];
  }
  if (Array.isArray(value)) {
    return dedupeMultiQueryValues(
      value.filter(
        (/** @type {any} */ feature) =>
          feature?.type === "Feature" && feature.geometry,
      ),
    );
  }
  return [];
}

/**
 * Removes duplicate values using JSON serialization as the identity key.
 * @param {any[]} values
 * @returns {any[]}
 */
export function dedupeMultiQueryValues(values) {
  const seen = new Set();
  const deduped = [];
  for (const value of values ?? []) {
    const key =
      value && typeof value === "object" ? JSON.stringify(value) : String(value);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(value);
  }
  return deduped;
}

/**
 * Builds the Mustache rendering context for one multiQuery iteration.
 * Spreads the full form value, overrides the matched field with the current
 * iteration value, and adds a 1-based `multiQueryIndex`.
 * @param {Record<string, any>} jsonformValue
 * @param {string} match - The multiQuery field name being iterated
 * @param {any} value - The current iteration value
 * @param {number} index - Zero-based iteration index
 * @returns {Record<string, any>}
 */
export function createMultiQueryContext(jsonformValue, match, value, index) {
  return {
    ...(jsonformValue ?? {}),
    [match]: value,
    multiQueryIndex: index + 1,
  };
}

/**
 * Flattens an array of POST responses into a single values array.
 * Each response that is itself an array is spread; scalars are wrapped.
 * @param {any[]} values
 * @returns {any[]}
 */
export function aggregateInlineResponses(values) {
  return values.flatMap((value) => (Array.isArray(value) ? value : [value]));
}

/**
 * Renders a JSON body template string with the given context.
 * Primary path: parses the template as JSON, then recursively renders each
 * node (preserving object-valued placeholders as raw JSON).
 * Fallback: treats the template as a Mustache string, renders, then parses.
 * @param {string} bodyTemplate - JSON template string (may contain Mustache placeholders)
 * @param {Record<string, any>} context - Values to substitute into the template
 * @returns {any} Parsed JSON body ready for POST
 */
export function renderJsonBodyTemplate(bodyTemplate, context) {
  try {
    const parsedTemplate = JSON.parse(bodyTemplate);
    return renderTemplateNode(parsedTemplate, context);
  } catch {
    try {
      return JSON.parse(
        mustache.render(bodyTemplate, {
          ...(context ?? {}),
        }),
      );
    } catch (e) {
      throw new Error(
        `[eodash] Failed to render POST body template: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}

/**
 * Recursively renders a parsed JSON template node with context values.
 * - Arrays and objects are traversed recursively.
 * - Exact placeholders (where the entire string value is `"{{path}}"` or
 *   `"{{{path}}}"`) are resolved to their original typed value (object, array,
 *   number, etc.) instead of being stringified. This is critical for embedding
 *   GeoJSON geometry objects in POST bodies.
 * - Partial placeholders and mixed strings use standard Mustache interpolation.
 * @param {any} templateNode
 * @param {Record<string, any>} context
 * @returns {any}
 */
export function renderTemplateNode(templateNode, context) {
  if (Array.isArray(templateNode)) {
    return templateNode.map((value) => renderTemplateNode(value, context));
  }
  if (templateNode && typeof templateNode === "object") {
    return Object.fromEntries(
      Object.entries(templateNode).map(([key, value]) => [
        mustache.render(key, context),
        renderTemplateNode(value, context),
      ]),
    );
  }
  if (typeof templateNode !== "string") {
    return templateNode;
  }

  // Detect exact placeholder: entire value is "{{path}}" or "{{{path}}}".
  // Matches both double-brace {{...}} and triple-brace {{{...}}} syntax.
  // When matched, the resolved value is returned as its original type (e.g. an
  // object), rather than being coerced to a string by Mustache.
  const exactPlaceholder = templateNode.match(
    /^\{\{\{?\s*([^{}]+?)\s*\}?\}\}$/,
  );
  if (exactPlaceholder) {
    const resolvedValue = resolveTemplatePath(context, exactPlaceholder[1]);
    if (resolvedValue !== undefined) {
      return cloneTemplateValue(resolvedValue);
    }
  }

  return mustache.render(templateNode, context);
}

/**
 * Resolves a dot/bracket-notation path against a context object.
 * Supports paths like `"feature.geometry"` or `"list[0].name"`.
 * @param {Record<string, any>} context
 * @param {string} path
 * @returns {any}
 */
export function resolveTemplatePath(context, path) {
  const segments = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean);

  let currentValue = context;
  for (const segment of segments) {
    if (currentValue === null || currentValue === undefined) {
      return undefined;
    }
    currentValue = currentValue[segment];
  }
  return currentValue;
}

/**
 * Deep-clones objects via structuredClone to prevent template rendering
 * from mutating the original context values. Primitives pass through.
 * @param {any} value
 * @returns {any}
 */
export function cloneTemplateValue(value) {
  if (value && typeof value === "object") {
    return structuredClone(value);
  }
  return value;
}
