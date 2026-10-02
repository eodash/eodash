import Fuse from "fuse.js";
import { createEodashIndicator } from "@eodash/stac";
import { isSTACItem, toAbsolute } from "@eodash/stac/helpers";

/**
 * Fuse.js configuration for fuzzy-searching catalog indicators.
 */
const CATALOG_FUSE_OPTIONS = {
  keys: [
    { name: "title", weight: 0.35 },
    { name: "subtitle", weight: 0.2 },
    { name: "tags", weight: 0.2 },
    { name: "themes", weight: 0.1 },
    { name: "id", weight: 0.1 },
    { name: "code", weight: 0.05 },
    { name: "description", weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
};

/**
 * Checks whether a STAC object represents a Catalog (rather than Collection or Item).
 *
 * @param {Record<string, any>} [doc]
 * @returns {boolean}
 */
export function isSTACCatalog(doc) {
  if (!doc || typeof doc !== "object") return false;
  if (doc.type === "Catalog") return true;
  // If it has type explicitly not Collection / Feature, or lacks extent but has child links
  if (!doc.extent && !doc.geometry && Array.isArray(doc.links)) {
    const hasChildren = doc.links.some(
      (l) => l.rel === "child" && (l.type ? l.type.includes("json") : true),
    );
    if (hasChildren && doc.type !== "Collection" && doc.type !== "Feature") {
      return true;
    }
  }
  return false;
}

/**
 * Creates a minimal standalone STAC Collection document to wrap a self-contained STAC Item.
 *
 * @param {import("@eodash/stac").STACItem} item
 * @param {string} [fallbackUrl]
 * @returns {import("@eodash/stac").STACCollection}
 */
function createDummyCollectionForItem(item, fallbackUrl = "") {
  const collectionId =
    item.collection ||
    (typeof item.id === "string" ? `collection-${item.id}` : "item-collection");
  const selfHref =
    item.links?.find((l) => l.rel === "self")?.href || fallbackUrl || "";

  return {
    type: "Collection",
    stac_version: item.stac_version || "1.0.0",
    id: collectionId,
    title:
      typeof item.properties?.title === "string"
        ? item.properties.title
        : collectionId,
    description:
      typeof item.properties?.description === "string"
        ? item.properties.description
        : "Auto-generated collection for STAC Item",
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
 * @param {string} [options.collection_id] - Specific collection ID or code
 * @param {string} [options.query] - Free-text search query
 * @returns {Record<string, any>} Selected child link object
 */
export function selectCatalogIndicator(catalog, { collection_id, query } = {}) {
  const childLinks = (catalog.links || []).filter(
    (l) => l.rel === "child" && (l.type ? l.type.includes("json") : true),
  );

  if (childLinks.length === 0) {
    throw new Error(
      `STAC Catalog "${catalog.id || "root"}" does not contain any child indicator collections.`,
    );
  }

  // 1. Direct collection_id match
  if (collection_id && collection_id.trim()) {
    const targetId = collection_id.trim();
    const matched = childLinks.find(
      (l) =>
        l.id === targetId ||
        l.code === targetId ||
        l.subcode === targetId ||
        l.href?.includes(targetId),
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
  if (query && query.trim()) {
    const trimmed = query.trim().toLowerCase();

    // Exact word / acronym / substring priority check (e.g. "CO2", "NO2", exact title / tag match)
    const exactMatch = childLinks.find((l) => {
      const id = String(l.id || "").toLowerCase();
      const code = String(l.code || "").toLowerCase();
      const title = String(l.title || "").toLowerCase();
      const tags = Array.isArray(l.tags)
        ? l.tags.map((t) => String(t).toLowerCase())
        : [];

      // Exact ID or code match
      if (id === trimmed || code === trimmed) return true;
      // Exact tag match
      if (tags.includes(trimmed)) return true;
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
          id: r.item.id || r.item.code,
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
    .slice(0, 15)
    .map((l) => `"${l.title || l.id}" (id: ${l.id || l.code})`)
    .join("\n- ");
  throw new Error(
    `The provided URL is a STAC Catalog containing ${childLinks.length} indicator collections. ` +
      `Please provide a 'query' (e.g. 'Carbon Dioxide') or 'collection_id' to select an indicator.\nAvailable indicators include:\n- ${available}`,
  );
}

/**
 * Builds complete EOxMap layer configuration and view parameters from a STAC catalog, collection/indicator URL, pre-fetched collection, or STAC API.
 *
 * @param {object} params
 * @param {string} [params.url] - STAC catalog/collection/indicator URL or STAC API endpoint
 * @param {Record<string, any>} [params.stac_object] - Pre-fetched STAC document (Catalog, Collection, Indicator, or Item)
 * @param {Record<string, any>} [params.collection] - Deprecated alias for stac_object
 * @param {import("@eodash/stac").STACItem} [params.item] - Deprecated alias for stac_object when passing an Item
 * @param {string} [params.query] - Free-text search query to select an indicator from a catalog
 * @param {string} [params.collection_id] - Specific collection ID to select from a catalog
 * @param {string} [params.datetime] - Target ISO datetime string
 * @param {number[]} [params.bbox] - Bounding box [minX, minY, maxX, maxY]
 * @param {string} [params.viewProjection] - Desired map view projection (e.g. 'EPSG:4326', 'EPSG:3035')
 * @param {string} [params.rasterEndpoint] - Base URL for TiTiler / raster tile rendering
 * @param {object} [options]
 * @param {import("@eodash/stac").HttpClient | import("@eodash/stac/http").AxiosInstance} [options.client] - Optional HTTP client (for hermetic testing)
 * @returns {Promise<import("@eodash/stac").MapConfig & { indicator?: { id?: string, title?: string, href?: string } }>}
 */
export async function buildStacMap(
  {
    url,
    stac_object,
    collection,
    item,
    query,
    collection_id,
    datetime,
    bbox,
    viewProjection,
    rasterEndpoint,
  },
  { client } = {},
) {
  const inputObject = stac_object || collection || item;

  if (!url && !inputObject) {
    throw new Error(
      "At least one of 'url' or 'stac_object' must be provided to build STAC map configuration.",
    );
  }

  let resolvedCollection = undefined;
  let resolvedItem = undefined;
  let currentUrl = url || "";
  /** @type {{ id?: string, title?: string, href?: string } | undefined} */
  let matchedIndicatorInfo = undefined;

  // 1. If pre-fetched document provided via stac_object / collection / item
  if (inputObject) {
    if (isSTACItem(inputObject)) {
      resolvedItem = /** @type {any} */ (inputObject);
    } else {
      resolvedCollection = inputObject;
    }
  }

  // 2. Inspect document: fetch once if URL given without pre-resolved collection or item
  // If it is a catalog (or query / collection_id specified), resolve the catalog indicator
  if (currentUrl && !resolvedCollection && !resolvedItem) {
    let fetchedDoc = null;
    if (client?.get) {
      fetchedDoc = await client.get(currentUrl).catch(() => null);
    } else if (typeof fetch === "function") {
      try {
        const resp = await fetch(currentUrl);
        if (resp.ok) {
          fetchedDoc = await resp.json();
        }
      } catch {
        // Fallback: let createEodashIndicator handle loading if fetch fails
      }
    }

    if (fetchedDoc) {
      if (isSTACItem(fetchedDoc)) {
        resolvedItem = fetchedDoc;
      } else if (isSTACCatalog(fetchedDoc)) {
        resolvedCollection = fetchedDoc;
      }
    }
  }

  // 3. Auto-infer STAC Catalog: if document is a Catalog, select matching child indicator
  if (resolvedCollection && isSTACCatalog(resolvedCollection)) {
    const selectedLink = selectCatalogIndicator(resolvedCollection, {
      collection_id,
      query,
    });
    // Resolve absolute URL to child indicator
    const parentHref =
      currentUrl ||
      resolvedCollection.links?.find((l) => l.rel === "self")?.href ||
      "";
    currentUrl = toAbsolute(selectedLink.href, parentHref);
    matchedIndicatorInfo = {
      id: selectedLink.id || selectedLink.code,
      title: selectedLink.title,
      href: currentUrl,
    };
    // Clear resolvedCollection so child indicator is loaded from its own URL
    resolvedCollection = undefined;
  }

  // 4. Resolve targetUrl: prioritize collection link, then collection self link, then item self link, then currentUrl
  const targetUrl =
    currentUrl ||
    resolvedCollection?.links?.find((l) => l.rel === "self")?.href ||
    resolvedItem?.links?.find((l) => l.rel === "collection")?.href ||
    resolvedItem?.links?.find((l) => l.rel === "self")?.href ||
    "";

  // 5. If caller only provided an item directly without collection or url, wrap it with a dummy collection
  if (resolvedItem && !resolvedCollection && !targetUrl) {
    resolvedCollection = createDummyCollectionForItem(resolvedItem, targetUrl);
  }

  const indicator = await createEodashIndicator(targetUrl, {
    stac: resolvedCollection,
    client,
    viewProjection,
    rasterEndpoint,
  });

  const mapConfig = await indicator.getMapConfig({
    datetime,
    item: resolvedItem,
    bbox,
  });

  if (matchedIndicatorInfo) {
    mapConfig.indicator = matchedIndicatorInfo;
  }

  // Extract legend from built layers if present (eox:colorlegend, style legend, rasterform legend, or image asset)
  const legendLayer = mapConfig.layers?.find(
    (l) =>
      l.properties?.layerLegend ||
      l.properties?.layerConfig?.legend ||
      l.properties?.description?.includes("<img"),
  );
  if (legendLayer) {
    mapConfig.legend = legendLayer.properties.layerLegend ||
      legendLayer.properties.layerConfig?.legend || {
        html: legendLayer.properties.description,
      };
  }

  return mapConfig;
}
