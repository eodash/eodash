import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export { CUSTOM_WIDGET_GUIDES } from "./helpers/guides.js";
export { generateLandingPage } from "./helpers/landing-page.js";
export {
  DEFAULT_STAC_ENDPOINT,
  DEFAULT_BRAND_NAME,
  getAvailableTemplates,
  getEodashVersion,
  loadTemplateExamples,
  readDirectoryFiles,
  parseHeaderMetadata,
} from "./helpers/templates.js";
export {
  isPrivateOrReservedIP,
  validateUrlIsSafe,
  safeFetch,
  createSafeHttpClient,
} from "./helpers/safe-fetch.js";
export {
  sanitizeText,
  countGeoJsonVertices,
  hasCircularReference,
  MAX_GEOJSON_VERTICES,
} from "./helpers/security.js";
export {
  createDummyCollectionForItem,
  selectCatalogIndicator,
} from "./helpers/stac.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedMetadata = null;

export function _resetMetadataCache() {
  cachedMetadata = null;
}

/**
 * Loads cached metadata from pre-generated JSON files in data/
 */
export function getMetadata() {
  if (cachedMetadata) return cachedMetadata;
  const baseDir = fs.existsSync(path.join(__dirname, "data"))
    ? __dirname
    : path.join(__dirname, "..");
  const widgetsFile = path.join(baseDir, "data/widgets-metadata.json");
  const archFile = path.join(baseDir, "data/architecture-metadata.json");

  if (fs.existsSync(widgetsFile) && fs.existsSync(archFile)) {
    try {
      const widgetsData = JSON.parse(fs.readFileSync(widgetsFile, "utf8"));
      const architectureData = JSON.parse(fs.readFileSync(archFile, "utf8"));

      // Count examples
      let examplesCount = 0;
      const examplesDir = path.join(baseDir, "data/examples");
      if (fs.existsSync(examplesDir)) {
        const exampleFiles = fs.readdirSync(examplesDir);
        for (const file of exampleFiles) {
          if (file.endsWith(".json")) {
            try {
              const content = JSON.parse(
                fs.readFileSync(path.join(examplesDir, file), "utf8"),
              );
              if (Array.isArray(content)) {
                examplesCount += content.length;
              }
            } catch (err) {
              console.warn(
                `Could not parse example file ${file}:`,
                err.message,
              );
            }
          }
        }
      }

      cachedMetadata = { widgetsData, architectureData, examplesCount };
      return cachedMetadata;
    } catch (err) {
      console.warn("Could not read cached metadata:", err.message);
    }
  }

  throw new Error(
    "Metadata not found in @eodash/mcp-server/data/. Run 'npm run mcp:generate' or ensure data/*.json is packaged.",
  );
}
