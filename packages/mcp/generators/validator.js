import {
  COLLECTION_SCHEMA_URL,
  INDICATOR_SCHEMA_URL,
  createAjvInstance,
  loadSchemas,
  getValidators,
} from "./validator/schemas.js";
import { validateCustomRules } from "./validator/rules.js";

export {
  COLLECTION_SCHEMA_URL,
  INDICATOR_SCHEMA_URL,
  createAjvInstance,
  loadSchemas,
  getValidators,
};

/**
 * Validate an EODash catalog configuration against official eodash schemas and custom business rules
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

  // Auto-detect or normalize config type
  const rawType = String(configType).toLowerCase().trim();
  let resolvedType = rawType;

  if (rawType === "auto") {
    if (
      parsed.Indicators ||
      (parsed.Name && Array.isArray(parsed.Collections))
    ) {
      resolvedType = "indicator";
    } else {
      resolvedType = "collection";
    }
  } else if (
    rawType === "indicator" ||
    rawType === "catalog-indicator" ||
    rawType === "catalog_indicator"
  ) {
    resolvedType = "indicator";
  } else {
    resolvedType = "collection";
  }

  const { validateCatalogCollection, validateCatalogIndicator } =
    await getValidators();

  const isIndicator =
    resolvedType === "indicator" || resolvedType === "catalog-indicator";
  const validator = isIndicator
    ? validateCatalogIndicator
    : validateCatalogCollection;
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

  validateCustomRules(parsed, errors, warnings);

  const isActuallyValid = valid && errors.length === 0;

  return {
    valid: isActuallyValid,
    configType: resolvedType,
    schemaUrl,
    errors,
    warnings,
    summary: isActuallyValid
      ? `Configuration is valid according to ${resolvedType} schema.`
      : `Validation failed with ${errors.length} error(s)${warnings.length ? ` and ${warnings.length} warning(s)` : ""}.`,
  };
}
