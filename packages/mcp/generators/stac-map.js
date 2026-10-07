import { createEodashIndicator } from "@eodash/stac";
import { isSTACCatalog, isSTACItem, toAbsolute } from "@eodash/stac/helpers";
import { createSafeHttpClient } from "../helpers/safe-fetch.js";
import { sanitizeText, hasCircularReference } from "../helpers/security.js";
import {
  DEFAULT_MAX_COLLECTIONS,
  DEFAULT_MAX_TRAVERSAL_DEPTH,
  createDummyCollectionForItem,
  selectCatalogIndicator,
} from "../helpers/stac.js";

export {
  isSTACCatalog,
  sanitizeText,
  hasCircularReference,
  createDummyCollectionForItem,
  selectCatalogIndicator,
};

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
