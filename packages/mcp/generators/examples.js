import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

/**
 * Search and retrieve curated eodash configuration snippets
 */
export function findExamples({
  query,
  category,
  dataType,
  feature,
  limit = 5,
} = {}) {
  const allExamples = getExamples();

  let results = allExamples.map((ex) => {
    let score = 0;

    // Category filter
    if (category && category !== "all") {
      if (ex.category === category) {
        score += 50;
      } else {
        return null; // Strict category filter if provided
      }
    }

    // DataType filter
    if (dataType && dataType !== "all") {
      if (ex.dataType === dataType) {
        score += 30;
      } else {
        return null;
      }
    }

    // Feature filter
    if (feature && feature !== "all") {
      if (ex.features && ex.features.includes(feature)) {
        score += 30;
      } else {
        return null;
      }
    }

    // Free text query matching
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      const terms = q.split(/\s+/);

      let termMatches = 0;
      for (const term of terms) {
        let termFound = false;

        if (ex.title && ex.title.toLowerCase().includes(term)) {
          score += 25;
          termFound = true;
        }
        if (ex.id && ex.id.toLowerCase().includes(term)) {
          score += 20;
          termFound = true;
        }
        if (ex.tags && ex.tags.some((t) => t.toLowerCase().includes(term))) {
          score += 15;
          termFound = true;
        }
        if (
          ex.features &&
          ex.features.some((f) => f.toLowerCase().includes(term))
        ) {
          score += 15;
          termFound = true;
        }
        if (ex.description && ex.description.toLowerCase().includes(term)) {
          score += 10;
          termFound = true;
        }

        if (termFound) termMatches++;
      }

      // If text query provided, must match at least one term
      if (termMatches === 0) {
        return null;
      }
      score += termMatches * 10;
    } else {
      // Default base score when no text query
      score += 10;
    }

    return { example: ex, score };
  });

  const filtered = results
    .filter((r) => r !== null)
    .sort((a, b) => b.score - a.score);

  const totalFound = filtered.length;
  const paginated = filtered
    .slice(0, Math.min(20, Math.max(1, limit)))
    .map((r) => r.example);

  return {
    totalFound,
    query: query || null,
    category: category || "all",
    results: paginated,
  };
}
