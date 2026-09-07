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
  ajv.addFormat("iri", true);
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

  const validateCatalogCollection = ajv.compile(colSchema);
  const validateCatalogIndicator = ajv.compile(indSchema);

  cachedValidators = {
    ajv,
    validateCatalogCollection,
    validateCatalogIndicator,
  };

  return cachedValidators;
}
