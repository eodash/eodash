import Fuse from "fuse.js";

export const DEFAULT_MAX_COLLECTIONS = 100;
export const DEFAULT_MAX_TRAVERSAL_DEPTH = 5;

/**
 * Fuse.js configuration for fuzzy-searching catalog indicators.
 */
export const CATALOG_FUSE_OPTIONS = {
  keys: [
    { name: "title", weight: 0.35 },
    { name: "subtitle", weight: 0.2 },
    { name: "tags", weight: 0.2 },
    { name: "themes", weight: 0.1 },
    { name: "id", weight: 0.1 },
    { name: "description", weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
};

/**
 * Creates a minimal standalone STAC Collection document to wrap a self-contained STAC Item.
 *
 * @param {import("@eodash/stac").STACItem} item
 * @param {string} [fallbackUrl]
 * @returns {import("@eodash/stac").STACCollection}
 */
export function createDummyCollectionForItem(item, fallbackUrl = "") {
  const collectionId = "single-item-collection";
  const selfHref =
    item.links?.find((l) => l.rel === "self")?.href || fallbackUrl || "";

  return {
    type: "Collection",
    stac_version: "1.0.0",
    id: collectionId,
    title: collectionId,
    description: "Auto-generated collection for STAC Item",
    license: "proprietary",
    extent: {
      spatial: {
        bbox: [item.bbox || [-180, -90, 180, 90]],
      },
      temporal: {
        interval: [
          [
            item.properties?.datetime ||
              item.properties?.start_datetime ||
              "1970-01-01T00:00:00Z",
            item.properties?.datetime ||
              item.properties?.end_datetime ||
              "2099-12-31T23:59:59Z",
          ],
        ],
      },
    },
    links: [
      ...(selfHref
        ? [
            {
              rel: "self",
              href: selfHref,
              type: "application/json",
            },
          ]
        : []),
    ],
  };
}

/**
 * Selects an indicator child link from a STAC Catalog using exact matches or Fuse.js fuzzy search.
 *
 * @param {Record<string, any>} catalog - The STAC catalog document
 * @param {object} [options]
 * @param {string} [options.collection_id] - Specific collection ID
 * @param {string} [options.query] - Free-text search query
 * @returns {Record<string, any>} Selected child link object
 */
export function selectCatalogIndicator(catalog, { collection_id, query } = {}) {
  const maxCollections = parseInt(
    process.env.EODASH_MAX_COLLECTIONS || String(DEFAULT_MAX_COLLECTIONS),
    10,
  );
  const childLinks = (catalog.links || [])
    .filter(
      (l) => l.rel === "child" && (l.type ? l.type.includes("json") : true),
    )
    .slice(0, maxCollections);

  if (childLinks.length === 0) {
    throw new Error(
      `STAC Catalog "${catalog.id || "root"}" does not contain any child indicator collections.`,
    );
  }

  // 1. Direct collection_id match
  if (collection_id) {
    const targetId = collection_id.trim();
    const matched = childLinks.find(
      (l) => l.id === targetId || l.href?.includes(targetId),
    );
    if (!matched) {
      const sample = childLinks
        .slice(0, 10)
        .map((l) => l.id || l.title || l.href)
        .join(", ");
      throw new Error(
        `Collection "${targetId}" not found in catalog. Available examples: ${sample}${
          childLinks.length > 10 ? ` (and ${childLinks.length - 10} more)` : ""
        }`,
      );
    }
    return matched;
  }

  // 2. Query search
  if (query) {
    const trimmed = query.trim().toLowerCase();

    // Exact word / acronym / substring priority check (e.g. "CO2", "NO2", exact title)
    const exactMatch = childLinks.find((l) => {
      const id = String(l.id || "").toLowerCase();
      const title = String(l.title || "").toLowerCase();

      // Exact ID match
      if (id === trimmed) return true;
      // Word boundary match in title
      const titleWords = title.split(/[\s,()[\]\-_]+/);
      if (titleWords.includes(trimmed)) return true;
      return false;
    });

    if (exactMatch) {
      return exactMatch;
    }

    // Fuzzy search by query (name, title, subtitle, tags, themes, description)
    const fuse = new Fuse(childLinks, CATALOG_FUSE_OPTIONS);
    const searchResults = fuse.search(query.trim());

    if (searchResults.length > 0) {
      // Check for ambiguous candidates: if top 2+ results have very close scores (difference <= 0.08)
      // and both are good matches (score <= 0.4), throw structured error with candidates list
      const topScore = searchResults[0].score ?? 0;
      const closeMatches = searchResults.filter(
        (r) => (r.score ?? 0) <= topScore + 0.08 && (r.score ?? 0) <= 0.4,
      );

      if (closeMatches.length > 1) {
        const candidates = closeMatches.map((r) => ({
          id: r.item.id,
          title: r.item.title,
          description: r.item.subtitle || r.item.description || "",
          score: Number((1 - (r.score ?? 0)).toFixed(2)),
          href: r.item.href,
        }));
        const candidateDescriptions = candidates
          .map(
            (c, i) =>
              `${i + 1}. "${c.title}" (id: ${c.id}) - ${c.description || "Score: " + c.score}`,
          )
          .join("\n");

        /** @type {any} */
        const ambiguityError = new Error(
          `Multiple close indicator matches found for query "${query.trim()}". Please clarify by providing a specific 'collection_id':\n${candidateDescriptions}`,
        );
        ambiguityError.candidates = candidates;
        throw ambiguityError;
      }

      return searchResults[0].item;
    }

    // Fallback: word-by-word union scoring
    if (query.trim().includes(" ")) {
      const terms = query.trim().split(/\s+/).filter(Boolean);
      const scoreMap = new Map();

      for (const term of terms) {
        for (const res of fuse.search(term)) {
          const key = res.item.id || res.item.href;
          const current = scoreMap.get(key) || {
            item: res.item,
            score: 0,
          };
          current.score += 1 - (res.score ?? 0);
          scoreMap.set(key, current);
        }
      }

      if (scoreMap.size > 0) {
        const sorted = Array.from(scoreMap.values()).sort(
          (a, b) => b.score - a.score,
        );
        return sorted[0].item;
      }
    }

    const sample = childLinks
      .slice(0, 8)
      .map((l) => `"${l.title || l.id}"`)
      .join(", ");
    throw new Error(
      `No indicator in catalog matched query "${query.trim()}". Available indicators include: ${sample}...`,
    );
  }

  // 3. No collection_id or query supplied for Catalog -> prompt with available collections
  const available = childLinks
    .slice(0, 10)
    .map((l) => `"${l.title || l.id}" (id: ${l.id})`)
    .join("\n- ");
  throw new Error(
    `The provided URL is a STAC Catalog containing ${childLinks.length} indicator collections. ` +
      `Please provide a 'query' (e.g. 'Carbon Dioxide') or 'collection_id' to select an indicator.\nAvailable indicators include:\n- ${available}`,
  );
}
