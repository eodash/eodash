import Ajv from "ajv";
import addFormats from "ajv-formats";

export const COLLECTION_SCHEMA_URL =
  "https://eodash.github.io/eodash-schemas/catalog/collection-schema.json";
export const INDICATOR_SCHEMA_URL =
  "https://eodash.github.io/eodash-schemas/catalog/indicator-schema.json";

/** @type {{ ajv: any; validateCatalogCollection: any; validateCatalogIndicator: any } | null} */
export let cachedValidators = null;

export function _resetValidatorsCache() {
  cachedValidators = null;
}

/**
 * Creates and configures an Ajv instance with custom formats
 */
export function createAjvInstance() {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
    logger: {
      log: console.log,
      warn: () => {},
      error: console.error,
    },
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

  ajv.addFormat("bounding-box", {
    type: "array",
    validate: (b) =>
      Array.isArray(b) &&
      b.length === 4 &&
      b.every((n) => typeof n === "number"),
  });

  ajv.addFormat("point", {
    type: "array",
    validate: (p) =>
      Array.isArray(p) &&
      p.length === 2 &&
      p.every((n) => typeof n === "number"),
  });

  ajv.addFormat("datetime", {
    type: "string",
    validate: (dt) =>
      typeof dt === "string" &&
      (!Number.isNaN(Date.parse(dt)) || /^\d{4}\d{2}\d{2}/.test(dt)),
  });

  ajv.addFormat("markdown", {
    type: "string",
    validate: (s) => typeof s === "string",
  });

  ajv.addFormat("categories", {
    validate: () => true,
  });

  return ajv;
}

/**
 * Fetch remote schemas directly from authoritative eodash-schemas URL
 */
export async function loadSchemas() {
  const [colSchema, indSchema] = await Promise.all([
    fetch(COLLECTION_SCHEMA_URL).then(async (r) => {
      if (!r.ok) {
        throw new Error(
          `HTTP ${r.status} ${r.statusText} fetching collection schema from ${COLLECTION_SCHEMA_URL}`,
        );
      }
      return r.json();
    }),
    fetch(INDICATOR_SCHEMA_URL).then(async (r) => {
      if (!r.ok) {
        throw new Error(
          `HTTP ${r.status} ${r.statusText} fetching indicator schema from ${INDICATOR_SCHEMA_URL}`,
        );
      }
      return r.json();
    }),
  ]);

  return { colSchema, indSchema };
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

  const validateCatalogCollection = ajv.compile(colSchema);
  const validateCatalogIndicator = ajv.compile(indSchema);

  cachedValidators = {
    ajv,
    validateCatalogCollection,
    validateCatalogIndicator,
  };

  return cachedValidators;
}
