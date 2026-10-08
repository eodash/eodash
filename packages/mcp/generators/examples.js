import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fuse from "fuse.js";
import { loadTemplateExamples } from "./template-loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXAMPLES_DIR = path.resolve(__dirname, "../data/examples");

let cachedExamples = null;

/**
 * Load examples registry from data/examples/*.json category files and file-backed templates
 * @returns {Array<{ id: string, title: string, category: string, tags: string[], description: string, targetContext: string, code: any }>}
 */
export function getExamples() {
  if (cachedExamples) return cachedExamples;

  const jsonExamples = [];
  if (fs.existsSync(EXAMPLES_DIR)) {
    const files = fs
      .readdirSync(EXAMPLES_DIR)
      .filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(EXAMPLES_DIR, file);
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          jsonExamples.push(...parsed);
        } else if (parsed && typeof parsed === "object") {
          jsonExamples.push(parsed);
        }
      } catch (err) {
        console.error(`Failed to load category examples from ${file}:`, err);
      }
    }
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
    { name: "id", weight: 0.05 },
    { name: "code", weight: 0.05 },
  ],
  getFn: (obj, path) => {
    const val = Fuse.config.getFn(obj, path);
    if (val && typeof val === "object") {
      return JSON.stringify(val);
    }
    return val;
  },
  threshold: 0.32,
  ignoreLocation: true,
  minMatchCharLength: 2,
  findAllMatches: true,
};

/**
 * Search and retrieve curated eodash configuration snippets using Fuse.js
 * @param {{ query?: string, category?: string, limit?: number }} [options]
 */
export function findExamples({ query, category, limit = 5 } = {}) {
  const allExamples = getExamples();

  let candidates = allExamples;
  if (category && category !== "all") {
    candidates = candidates.filter((ex) => ex.category === category);
  }

  let matchedItems = candidates;

  if (query && query.trim()) {
    const trimmed = query.trim();
    const fuse = new Fuse(candidates, FUSE_OPTIONS);
    const searchResults = fuse.search(trimmed);

    if (searchResults.length === 0 && trimmed.includes(" ")) {
      const terms = trimmed.split(/\s+/).filter(Boolean);
      const scoreMap = new Map();

      for (const term of terms) {
        for (const res of fuse.search(term)) {
          const current = scoreMap.get(res.item.id) || {
            item: res.item,
            score: 0,
          };
          current.score += 1 - (res.score ?? 0);
          scoreMap.set(res.item.id, current);
        }
      }

      matchedItems = Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item);
    } else {
      matchedItems = searchResults.map((r) => r.item);
    }
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
