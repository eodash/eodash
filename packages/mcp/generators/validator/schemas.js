import Ajv from "ajv";
import addFormats from "ajv-formats";

export const COLLECTION_SCHEMA_URL =
  "https://eodash.github.io/eodash-schemas/catalog/collection-schema.json";
export const INDICATOR_SCHEMA_URL =
  "https://eodash.github.io/eodash-schemas/catalog/indicator-schema.json";

/** @type {{ ajv: any; validateCatalogCollection: any; validateCatalogIndicator: any; usedFallback?: boolean } | null} */
export let cachedValidators = null;

/**
 * Creates and configures an Ajv instance with custom formats
 */
export function createAjvInstance() {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
  });
  addFormats(ajv);

  // Custom formats used in eodash-schemas
  ajv.addFormat("stac-endpoint", {
    type: "string",
    validate: (url) => typeof url === "string" && url.length > 0,
  });

  ajv.addFormat("datetime-iso8601", {
    type: "string",
    validate: (dt) => !Number.isNaN(Date.parse(dt)),
  });

  ajv.addFormat("style-url", {
    type: "string",
    validate: (url) =>
      typeof url === "string" &&
      (url.startsWith("http") || url.startsWith("/")),
  });

  ajv.addFormat("coordinate-pair", {
    type: "array",
    validate: (arr) =>
      Array.isArray(arr) &&
      arr.length === 2 &&
      typeof arr[0] === "number" &&
      typeof arr[1] === "number",
  });

  ajv.addFormat("polygon-coordinates", {
    type: "array",
    validate: (coords) => {
      if (!Array.isArray(coords) || coords.length === 0) return false;
      const ring = coords[0];
      return (
        Array.isArray(ring) &&
        ring.length >= 4 &&
        ring.every(
          (pt) =>
            Array.isArray(pt) &&
            pt.length === 2 &&
            pt.every((n) => typeof n === "number"),
        )
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
      fetch(COLLECTION_SCHEMA_URL, {
        signal: AbortSignal.timeout(3000),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      fetch(INDICATOR_SCHEMA_URL, {
        signal: AbortSignal.timeout(3000),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    ]);

    return { colSchema, indSchema, usedFallback: false };
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
    return { colSchema, indSchema, usedFallback: true };
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
  const { colSchema, indSchema, usedFallback } = await loadSchemas();

  const validateCatalogCollection = ajv.compile(colSchema);
  const validateCatalogIndicator = ajv.compile(indSchema);

  const validators = {
    ajv,
    validateCatalogCollection,
    validateCatalogIndicator,
    usedFallback,
  };

  if (!usedFallback) {
    cachedValidators = validators;
  }

  return validators;
}
