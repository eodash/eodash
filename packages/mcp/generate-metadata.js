#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildWidgetsMetadata } from "./metadata/widget-parser.js";
import { buildArchitectureMetadata } from "./metadata/arch-parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, "../..");

export function buildMetadata(repoRoot = DEFAULT_REPO_ROOT) {
  const widgetsMetadata = buildWidgetsMetadata(repoRoot);
  const architectureMetadata = buildArchitectureMetadata(repoRoot);
  return { widgetsMetadata, architectureMetadata };
}

// CLI execution
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename)
) {
  const outputDir = path.join(__dirname, "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { widgetsMetadata, architectureMetadata } =
    buildMetadata(DEFAULT_REPO_ROOT);

  fs.writeFileSync(
    path.join(outputDir, "widgets-metadata.json"),
    JSON.stringify(widgetsMetadata, null, 2),
  );
  fs.writeFileSync(
    path.join(outputDir, "architecture-metadata.json"),
    JSON.stringify(architectureMetadata, null, 2),
  );

  console.log(
    `Auto-generated metadata for ${Object.keys(widgetsMetadata).length} widgets and reactiveStore (${architectureMetadata.reactiveStore.states.length} states, ${architectureMetadata.reactiveStore.stacStore.length} STAC store items, ${architectureMetadata.reactiveStore.actions.length} actions) in packages/mcp/data/`,
  );
}
