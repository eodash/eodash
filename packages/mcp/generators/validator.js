import Ajv from "ajv";
import addFormats from "ajv-formats";

export const COLLECTION_SCHEMA_URL =
  "https://eodash.github.io/eodash-schemas/catalog/collection-schema.json";
export const INDICATOR_SCHEMA_URL =
  "https://eodash.github.io/eodash-schemas/catalog/indicator-schema.json";

let cachedValidators = null;

/**
 * Configure an Ajv instance with standard formats and custom eodash schema formats
 */
export function createAjvInstance() {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    verbose: true,
  });

  addFormats(ajv);

  // Custom formats used in eodash-schemas
  ajv.addFormat("categories", true);
  ajv.addFormat("markdown", true);
  ajv.addFormat("datetime", {
    type: "string",
    validate: (dateTime) => {
      if (typeof dateTime !== "string") return false;
      const d = new Date(dateTime);
      return !isNaN(d.getTime());
    },
  });
  ajv.addFormat("bounding-box", {
    type: "array",
    validate: (bbox) => {
      return (
        Array.isArray(bbox) &&
        bbox.length === 4 &&
        bbox.every((n) => typeof n === "number")
      );
    },
  });
  ajv.addFormat("point", {
    type: "array",
    validate: (pt) => {
      return (
        Array.isArray(pt) &&
        pt.length === 2 &&
        pt.every((n) => typeof n === "number")
      );
    },
  });

  return ajv;
}

/**
 * Fetch remote schemas from eodash-schemas GitHub Pages
 */
export async function loadSchemas() {
  try {
    const [colSchema, indSchema] = await Promise.all([
      fetch(COLLECTION_SCHEMA_URL).then((r) => r.json()),
      fetch(INDICATOR_SCHEMA_URL).then((r) => r.json()),
    ]);

    return { colSchema, indSchema };
  } catch (_err) {
    // Return minimal fallback schemas if network is unreachable
    const colSchema = {
      $id: COLLECTION_SCHEMA_URL,
      type: "object",
      properties: {
        Name: { type: "string" },
        Title: { type: "string" },
        Description: { type: "string" },
        Resources: { type: "array", minItems: 1 },
      },
      required: ["Name", "Title", "Description", "Resources"],
    };
    const indSchema = {
      $id: INDICATOR_SCHEMA_URL,
      type: "object",
      properties: {
        Name: { type: "string" },
        Title: { type: "string" },
        Description: { type: "string" },
        Collections: { type: "array", minItems: 1 },
      },
      required: ["Name", "Title", "Description", "Collections"],
    };
    return { colSchema, indSchema };
  }
}

/**
 * Initialize or get cached compiled validators
 */
export async function getValidators() {
  if (cachedValidators) {
    return cachedValidators;
  }

  const ajv = createAjvInstance();
  const { colSchema, indSchema } = await loadSchemas();

  const validateCollection = ajv.compile(colSchema);
  const validateIndicator = ajv.compile(indSchema);

  cachedValidators = {
    ajv,
    validateCollection,
    validateIndicator,
  };

  return cachedValidators;
}

/**
 * Validate a catalog configuration (collection or indicator) against official schemas and business rules
 *
 * @param {object} options
 * @param {string|object} options.config - Catalog configuration JSON string or object
 * @param {'collection'|'indicator'|'auto'} [options.configType='auto'] - Type of config to validate
 * @returns {Promise<{
 *   valid: boolean,
 *   configType: string,
 *   schemaUrl: string,
 *   errors: Array<{ path: string, message: string, params?: any, suggestion?: string }>,
 *   warnings: string[],
 *   summary: string
 * }>}
 */
export async function validateCatalogConfig({
  config,
  configType = "auto",
} = {}) {
  let parsed = config;
  if (typeof config === "string") {
    try {
      parsed = JSON.parse(config);
    } catch (err) {
      return {
        valid: false,
        configType: "unknown",
        schemaUrl: "",
        errors: [
          {
            path: "/",
            message: `JSON Parse error: ${err.message}`,
            suggestion: "Ensure configuration is valid JSON.",
          },
        ],
        warnings: [],
        summary: `Validation failed: Invalid JSON syntax.`,
      };
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      valid: false,
      configType: "unknown",
      schemaUrl: "",
      errors: [
        {
          path: "/",
          message: "Configuration must be a JSON object.",
        },
      ],
      warnings: [],
      summary: "Validation failed: Root configuration must be an object.",
    };
  }

  // Auto-detect config type
  let resolvedType = configType;
  if (resolvedType === "auto") {
    if (Array.isArray(parsed.Collections)) {
      resolvedType = "indicator";
    } else if (Array.isArray(parsed.Resources)) {
      resolvedType = "collection";
    } else {
      resolvedType = "collection"; // default assumption
    }
  }

  const { validateCollection, validateIndicator } = await getValidators();

  const isIndicator = resolvedType === "indicator";
  const validator = isIndicator ? validateIndicator : validateCollection;
  const schemaUrl = isIndicator ? INDICATOR_SCHEMA_URL : COLLECTION_SCHEMA_URL;

  const valid = validator(parsed);
  const errors = [];
  const warnings = [];

  if (!valid && validator.errors) {
    for (const err of validator.errors) {
      const errPath = err.instancePath || "/";
      let suggestion = "";

      if (err.keyword === "required") {
        suggestion = `Add missing required property '${err.params.missingProperty}'.`;
      } else if (err.keyword === "type") {
        suggestion = `Property '${errPath}' should be of type '${err.params.type}'.`;
      } else if (err.keyword === "enum") {
        suggestion = `Allowed values are: ${err.params.allowedValues.join(", ")}.`;
      }

      errors.push({
        path: errPath,
        keyword: err.keyword,
        message: err.message,
        params: err.params,
        suggestion: suggestion || undefined,
      });
    }
  }

  // Business Rules Checks
  if (parsed.Resources && Array.isArray(parsed.Resources)) {
    for (let i = 0; i < parsed.Resources.length; i++) {
      const res = parsed.Resources[i];
      // Rule 1: Style / eox:flatstyle must be URL string, not JSON object
      if (res.Style && typeof res.Style === "object") {
        errors.push({
          path: `/Resources/${i}/Style`,
          keyword: "type",
          message: "Style MUST be a URL string, not a direct JSON object.",
          suggestion:
            "Save the style to an external JSON file and provide the relative or absolute URL in Style.",
        });
      }

      // Rule 2: Rasterform branching keep_oneof_values check
      if (res.Rasterform && typeof res.Rasterform === "object") {
        if (
          (res.Rasterform.oneOf || res.Rasterform.anyOf) &&
          res.Rasterform.options?.keep_oneof_values !== false
        ) {
          warnings.push(
            `Resource[${i}] Rasterform uses branching (oneOf/anyOf) without "keep_oneof_values": false in options. This may cause values to leak between branches in json-editor.`,
          );
        }
      }
    }
  }

  const totalErrors = errors.length;
  const isValid = totalErrors === 0;

  let summary = isValid
    ? `Configuration is valid according to ${schemaUrl}.`
    : `Validation failed with ${totalErrors} error(s) according to ${schemaUrl}.`;

  if (warnings.length > 0) {
    summary += ` (${warnings.length} warning(s))`;
  }

  return {
    valid: isValid,
    configType: resolvedType,
    schemaUrl,
    errors,
    warnings,
    summary,
  };
}
