import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMetadata } from "./generate-metadata.js";

export { CUSTOM_WIDGET_GUIDES } from "./helpers/guides.js";
export { generateLandingPage } from "./helpers/landing-page.js";
export {
  DEFAULT_STAC_ENDPOINT,
  DEFAULT_BRAND_NAME,
  getAvailableTemplates,
  getEodashVersion,
} from "./helpers/templates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");

let cachedMetadata = null;

/**
 * Loads cached metadata or rebuilds on-the-fly
 */
export function getMetadata() {
  if (cachedMetadata) return cachedMetadata;
  const widgetsFile = path.join(__dirname, "data/widgets-metadata.json");
  const archFile = path.join(__dirname, "data/architecture-metadata.json");

  if (fs.existsSync(widgetsFile) && fs.existsSync(archFile)) {
    try {
      const widgetsData = JSON.parse(fs.readFileSync(widgetsFile, "utf8"));
      const architectureData = JSON.parse(fs.readFileSync(archFile, "utf8"));
      cachedMetadata = { widgetsData, architectureData };
      return cachedMetadata;
    } catch (err) {
      console.warn("Could not read cached metadata, rebuilding:", err.message);
    }
  }

  // Dynamic on-the-fly generation fallback
  const { widgetsMetadata, architectureMetadata } = buildMetadata(REPO_ROOT);
  cachedMetadata = {
    widgetsData: widgetsMetadata,
    architectureData: architectureMetadata,
  };
  return cachedMetadata;
}
