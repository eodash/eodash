import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fuse from "fuse.js";
import { loadTemplateExamples } from "./template-loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedExamples = null;

/**
 * Load examples registry from data/examples.json and file-backed templates
 */
export function getExamples() {
  if (cachedExamples) return cachedExamples;
  const filePath = path.join(__dirname, "../data/examples.json");
  let jsonExamples = [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    jsonExamples = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load examples registry:", err);
  }

  const templateExamples = loadTemplateExamples();
  cachedExamples = [...jsonExamples, ...templateExamples];
  return cachedExamples;
}

const FUSE_OPTIONS = {
  keys: [
    { name: "tags", weight: 0.4 },
    { name: "title", weight: 0.3 },
    { name: "description", weight: 0.2 },
    { name: "id", weight: 0.1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

/**
 * Search and retrieve curated eodash configuration snippets using Fuse.js
 */
export function findExamples({ query, category, limit = 5 } = {}) {
  const allExamples = getExamples();

  let candidates = allExamples;
  if (category && category !== "all") {
    candidates = candidates.filter((ex) => ex.category === category);
  }

  let matchedItems = candidates;

  if (query && query.trim()) {
    const fuse = new Fuse(candidates, FUSE_OPTIONS);
    const searchResults = fuse.search(query.trim());
    matchedItems = searchResults.map((r) => r.item);
  }

  const totalFound = matchedItems.length;
  const paginated = matchedItems.slice(0, Math.min(20, Math.max(1, limit)));

  return {
    totalFound,
    query: query || null,
    category: category || "all",
    results: paginated,
  };
}
