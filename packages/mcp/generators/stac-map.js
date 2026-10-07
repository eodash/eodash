import Fuse from "fuse.js";
import { createEodashIndicator } from "@eodash/stac";
import { isSTACCatalog, isSTACItem, toAbsolute } from "@eodash/stac/helpers";
import { createSafeHttpClient } from "../utils/safe-fetch.js";

export { isSTACCatalog };

/**
 * Strips null bytes and non-printable control characters, capping description length.
 *
 * @param {string} str
 * @param {number} [maxLength=1000]
 * @returns {string}
 */
export function sanitizeText(str, maxLength = 1000) {
  if (typeof str !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const regex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200D\uFEFF]/g;
  const cleaned = str.replace(regex, "");
  return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength);
}

const MAX_GEOJSON_VERTICES = 10_000;

/**
 * Counts coordinate vertices in a GeoJSON geometry.
 *
 * @param {any} geometry
 * @returns {number}
 */
export function countGeoJsonVertices(geometry) {
  if (!geometry || !geometry.coordinates) return 0;
  let count = 0;
  function walk(coords) {
    if (!Array.isArray(coords)) return;
    if (
      coords.length >= 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number"
    ) {
      count += 1;
      return;
    }
    for (const c of coords) {
      walk(c);
      if (count > MAX_GEOJSON_VERTICES) return;
    }
  }
  walk(geometry.coordinates);
  return count;
}

/**
 * Checks if an object contains circular references.
 *
 * @param {any} obj
 * @param {WeakSet<object>} [seen]
 * @returns {boolean}
 */
export function hasCircularReference(obj, seen = new WeakSet()) {
  if (!obj || typeof obj !== "object") return false;
  if (seen.has(obj)) return true;
  seen.add(obj);
  for (const val of Object.values(obj)) {
    if (typeof val === "object" && val !== null) {
      if (hasCircularReference(val, seen)) return true;
    }
  }
  return false;
}

const DEFAULT_MAX_COLLECTIONS = 100;
const DEFAULT_MAX_TRAVERSAL_DEPTH = 5;

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
function createDummyCollectionForItem(item, fallbackUrl = "") {
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

/**
 * Builds complete EOxMap layer configuration and view parameters from a STAC catalog, collection/indicator URL, pre-fetched collection, or STAC API.
 *
 * @param {object} params
 * @param {string} [params.url] - STAC catalog/collection/indicator URL or STAC API endpoint
 * @param {Record<string, any>} [params.stac_object] - Pre-fetched STAC document (Catalog, Collection, Indicator, or Item)
 * @param {string} [params.query] - Free-text search query to select an indicator from a catalog
 * @param {string} [params.collection_id] - Specific collection ID to select from a catalog
 * @param {string} [params.datetime] - Target ISO datetime string
 * @param {number[]} [params.bbox] - Bounding box [minX, minY, maxX, maxY]
 * @param {string} [params.viewProjection] - Desired map view projection (e.g. 'EPSG:4326', 'EPSG:3035')
 * @param {string} [params.rasterEndpoint] - Base URL for TiTiler / raster tile rendering
 * @param {boolean} [params.api] - Explicitly specify whether endpoint is STAC API (true) or static (false)
 * @param {object} [options]
 * @param {import("@eodash/stac").HttpClient | import("@eodash/stac/http").AxiosInstance} [options.client] - Optional HTTP client (for hermetic testing)
 * @returns {Promise<import("@eodash/stac").MapConfig & { indicator?: { id?: string, title?: string, href?: string } }>}
 */
export async function buildStacMap(
  {
    url,
    stac_object,
    query,
    collection_id,
    datetime,
    bbox,
    viewProjection,
    rasterEndpoint,
    api,
  },
  { client } = {},
) {
  const inputObject = stac_object;

  if (!url && !inputObject) {
    throw new Error(
      "At least one of 'url' or 'stac_object' must be provided to build STAC map configuration.",
    );
  }

  if (inputObject && hasCircularReference(inputObject)) {
    throw new Error("Invalid STAC object: circular references detected.");
  }

  const httpClient = client || createSafeHttpClient();
  const maxDepth = parseInt(
    process.env.EODASH_MAX_TRAVERSAL_DEPTH ||
      String(DEFAULT_MAX_TRAVERSAL_DEPTH),
    10,
  );
  const maxCollections = parseInt(
    process.env.EODASH_MAX_COLLECTIONS || String(DEFAULT_MAX_COLLECTIONS),
    10,
  );

  let resolvedCollection = undefined;
  let resolvedItem = undefined;
  let currentUrl = url || "";
  /** @type {{ id?: string, title?: string, href?: string } | undefined} */
  let matchedIndicatorInfo = undefined;

  // 1. If pre-fetched document provided via stac_object
  if (inputObject) {
    if (isSTACItem(inputObject)) {
      resolvedItem = /** @type {any} */ (inputObject);
    } else {
      resolvedCollection = inputObject;
    }
  }

  const visitedUrls = new Set();
  if (currentUrl) visitedUrls.add(currentUrl);

  let depth = 0;
  while (depth < maxDepth) {
    depth += 1;

    // 2. Inspect document: fetch once if URL given without pre-resolved collection or item
    // If it is a catalog (or query / collection_id specified), resolve the catalog indicator
    if (currentUrl && !resolvedCollection && !resolvedItem) {
      const res = await httpClient.get(currentUrl).catch(() => null);
      const fetchedDoc = res?.data || res;

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
      // Handle STAC API root catalogs (fetch collections via rel: "data" or "collections" link if child links are missing)
      const collectionsLink = resolvedCollection.links?.find(
        (l) =>
          l.rel === "data" ||
          l.rel === "collections" ||
          l.href?.endsWith("/collections"),
      );
      if (
        collectionsLink &&
        !resolvedCollection.links?.some((l) => l.rel === "child")
      ) {
        const parentHref =
          currentUrl ||
          resolvedCollection.links?.find((l) => l.rel === "self")?.href ||
          "";
        const absCollectionsUrl = toAbsolute(collectionsLink.href, parentHref);
        const res = await httpClient.get(absCollectionsUrl).catch(() => null);
        const collectionsDoc = res?.data || res;

        if (collectionsDoc?.collections) {
          resolvedCollection.links = [
            ...(resolvedCollection.links || []),
            ...collectionsDoc.collections
              .slice(0, maxCollections)
              .map((col) => ({
                rel: "child",
                type: "application/json",
                id: col.id,
                title: col.title || col.id,
                description: sanitizeText(col.description || "", 1000),
                href:
                  col.links?.find((l) => l.rel === "self")?.href ||
                  `${absCollectionsUrl.replace(/\/collections$/, "")}/collections/${col.id}`,
              })),
          ];
        }
      }

      const selectedLink = selectCatalogIndicator(resolvedCollection, {
        collection_id,
        query,
      });
      // Resolve absolute URL to child indicator
      const parentHref =
        currentUrl ||
        resolvedCollection.links?.find((l) => l.rel === "self")?.href ||
        "";
      const nextUrl = toAbsolute(selectedLink.href, parentHref);
      if (visitedUrls.has(nextUrl)) {
        throw new Error(
          `Circular reference detected in STAC catalog links at "${nextUrl}".`,
        );
      }
      visitedUrls.add(nextUrl);
      currentUrl = nextUrl;
      matchedIndicatorInfo = {
        id: selectedLink.id,
        title: sanitizeText(selectedLink.title || "", 200),
        description: sanitizeText(
          selectedLink.subtitle || selectedLink.description || "",
          1000,
        ),
        href: currentUrl,
      };
      // Clear resolvedCollection so child indicator is loaded from its own URL
      resolvedCollection = undefined;
      continue;
    }

    // Document is item or collection, finished traversal
    break;
  }

  // 4. Resolve targetUrl: prioritize currentUrl, then collection link, then collection self link, then item self link
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

  // Guard against massive GeoJSON vertex flood on any provided geometry
  const candidateGeometry = inputObject?.geometry || resolvedItem?.geometry;
  if (
    candidateGeometry &&
    countGeoJsonVertices(candidateGeometry) > MAX_GEOJSON_VERTICES
  ) {
    throw new Error(
      `Invalid STAC document: geometry exceeds maximum allowed vertex limit (${MAX_GEOJSON_VERTICES}).`,
    );
  }

  const indicator = await createEodashIndicator(targetUrl, {
    stac: resolvedCollection,
    client: httpClient,
    viewProjection,
    rasterEndpoint,
    ...(api !== undefined && { api }),
  });

  const mapConfig = await indicator.getMapConfig({
    datetime,
    item: resolvedItem,
    bbox,
  });

  if (matchedIndicatorInfo) {
    mapConfig.indicator = matchedIndicatorInfo;
  }

  // Extract legends from built layers if present (eox:colorlegend, style legend, rasterform legend, or image asset)
  const legendLayers = mapConfig.layers?.filter(
    (l) =>
      l.properties?.layerLegend ||
      l.properties?.layerConfig?.legend ||
      l.properties?.description?.includes("<img"),
  );
  if (legendLayers && legendLayers.length > 0) {
    mapConfig.legends = legendLayers.map(
      (l) =>
        l.properties.layerLegend ||
        l.properties.layerConfig?.legend || {
          html: l.properties.description,
        },
    );
  }

  // Sanitize text fields in mapConfig
  if (mapConfig.indicator) {
    if (mapConfig.indicator.title) {
      mapConfig.indicator.title = sanitizeText(mapConfig.indicator.title, 200);
    }
    if (mapConfig.indicator.description) {
      mapConfig.indicator.description = sanitizeText(
        mapConfig.indicator.description,
        1000,
      );
    }
  }
  if (mapConfig.layers) {
    for (const layer of mapConfig.layers) {
      if (layer.properties?.description) {
        layer.properties.description = sanitizeText(
          layer.properties.description,
          1000,
        );
      }
    }
  }

  return mapConfig;
}
