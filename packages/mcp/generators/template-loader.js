import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_TEMPLATES_DIR = path.resolve(__dirname, "../templates");

/**
 * Recursively read directory into a map of { relativePath: utf8Content }
 * @param {string} dir
 * @param {string} [baseDir]
 * @returns {Record<string, string>}
 */
function readDirectoryFiles(dir, baseDir = dir) {
  const files = {};
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(files, readDirectoryFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name !== "manifest.json") {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      files[relPath] = fs.readFileSync(fullPath, "utf8");
    }
  }
  return files;
}

/**
 * Parse metadata from header comments (// @tag value or JSDoc)
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseHeaderMetadata(content) {
  const meta = {};
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) {
      const match = trimmed.match(/@(\w+)\s+(.*)/);
      if (match) {
        const [, tag, value] = match;
        meta[tag] = value.trim();
      }
    } else if (trimmed && !trimmed.startsWith("/*")) {
      // Stop scanning once code starts
      break;
    }
  }
  return meta;
}

/**
 * Dynamically load scaffold and config templates from disk
 * @param {string} [templatesDir]
 * @returns {Array<{ id: string, title: string, category: string, tags: string[], description: string, targetContext: string, code: any }>}
 */
export function loadTemplateExamples(templatesDir = DEFAULT_TEMPLATES_DIR) {
  const examples = [];
  if (!fs.existsSync(templatesDir)) return examples;

  // 1. Scaffolds
  const scaffoldsDir = path.join(templatesDir, "scaffolds");
  if (fs.existsSync(scaffoldsDir)) {
    const folders = fs.readdirSync(scaffoldsDir, { withFileTypes: true });
    for (const folder of folders) {
      if (folder.isDirectory()) {
        const folderPath = path.join(scaffoldsDir, folder.name);
        const manifestPath = path.join(folderPath, "manifest.json");

        let manifest = {};
        if (fs.existsSync(manifestPath)) {
          try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          } catch {
            manifest = {};
          }
        }

        const files = readDirectoryFiles(folderPath);
        const tags = manifest.tags || [];

        examples.push({
          id: manifest.id || `dashboard-scaffold-${folder.name}`,
          title: manifest.title || `Scaffold for ${folder.name}`,
          category: "dashboard-scaffold",
          tags,
          description: manifest.description || "",
          targetContext: manifest.targetContext || "",
          code: files,
        });
      }
    }
  }

  // 2. Configs
  const configsDir = path.join(templatesDir, "configs");
  if (fs.existsSync(configsDir)) {
    const files = fs.readdirSync(configsDir, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile() && file.name.endsWith(".js")) {
        const filePath = path.join(configsDir, file.name);
        const content = fs.readFileSync(filePath, "utf8");
        const doc = parseHeaderMetadata(content);
        const baseName = path.basename(file.name, ".js");

        const tags = doc.tags
          ? doc.tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        examples.push({
          id: doc.id || `dashboard-config-${baseName}`,
          title: doc.title || baseName,
          category: "dashboard-config",
          tags,
          description: doc.description || "",
          targetContext:
            "Place into src/main.js or config.js in an eodash application.",
          code: content,
        });
      }
    }
  }

  return examples;
}
