import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMetadata } from "../generate-metadata.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MCP_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(MCP_DIR, "../..");

export async function setup() {
  const dataDir = path.join(MCP_DIR, "data");
  const widgetsFile = path.join(dataDir, "widgets-metadata.json");
  const archFile = path.join(dataDir, "architecture-metadata.json");

  if (!fs.existsSync(widgetsFile) || !fs.existsSync(archFile)) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const { widgetsMetadata, architectureMetadata } = buildMetadata(REPO_ROOT);
    fs.writeFileSync(widgetsFile, JSON.stringify(widgetsMetadata, null, 2));
    fs.writeFileSync(archFile, JSON.stringify(architectureMetadata, null, 2));
  }
}
