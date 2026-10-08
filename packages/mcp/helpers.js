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
} from "./helpers/templates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedMetadata = null;

/**
 * Loads cached metadata from pre-generated JSON files in data/
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
      console.warn("Could not read cached metadata:", err.message);
    }
  }

  throw new Error(
    "Metadata not found in @eodash/mcp-server/data/. Run 'npm run mcp:generate' or ensure data/*.json is packaged.",
  );
}
