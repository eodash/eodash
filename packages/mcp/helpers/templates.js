import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../..");

export const DEFAULT_STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
export const DEFAULT_BRAND_NAME = "EOxHub Demo Dashboard";

let cachedTemplates = null;

function getRootPackage() {
  try {
    const pkgPath = path.join(REPO_ROOT, "package.json");
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    }
  } catch {
    // fallback when root package.json is unreachable
  }
  return { version: "5.9.0" };
}

/**
 * Dynamically discovers available built-in templates from templates/*.js
 */
export function getAvailableTemplates() {
  if (cachedTemplates) return cachedTemplates;
  const templatesDir = path.join(REPO_ROOT, "templates");
  if (fs.existsSync(templatesDir)) {
    const files = fs.readdirSync(templatesDir);
    const discovered = files
      .filter(
        (f) => f.endsWith(".js") && f !== "index.js" && f !== "baseConfig.js",
      )
      .map((f) => path.basename(f, ".js"));
    if (discovered.length > 0) {
      cachedTemplates = discovered;
      return cachedTemplates;
    }
  }

  // Standalone package fallback: read from pre-built architecture metadata if present
  const archFile = path.join(__dirname, "../data/architecture-metadata.json");
  if (fs.existsSync(archFile)) {
    try {
      const arch = JSON.parse(fs.readFileSync(archFile, "utf8"));
      if (arch.templateSystem?.builtInTemplates?.length) {
        cachedTemplates = arch.templateSystem.builtInTemplates.map(
          (t) => t.name,
        );
        return cachedTemplates;
      }
    } catch {
      // fallback
    }
  }

  cachedTemplates = ["explore", "lite", "expert", "compare"];
  return cachedTemplates;
}

/**
 * Gets the current @eodash/eodash version from the root package.json
 */
export function getEodashVersion() {
  const rootPkg = getRootPackage();
  return rootPkg.version ? `^${rootPkg.version}` : "^5.9.0";
}
