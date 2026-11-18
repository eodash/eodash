import mustache from "mustache";
import { toAbsolute } from "@eodash/stac/helpers";

/**
 * Resolves a location collection service link against its parent collection URL.
 * @param {import("@eodash/stac").STACCollection} collection
 * @param {string} collectionUrl
 * @param {string} poiId
 * @returns {string | undefined}
 */
export function resolvePoiCollectionUrl(collection, collectionUrl, poiId) {
  if (!poiId) return;

  const serviceLink = collection.links.find(
    (link) =>
      link.rel === "service" &&
      link.type === "application/json; profile=collection",
  );
  if (!serviceLink) return;

  const keyToken = mustache
    .parse(serviceLink.href)
    .find((token) => token[0] === "name" && token[1] !== ".");
  const view = keyToken ? { [keyToken[1]]: poiId } : poiId;
  return toAbsolute(mustache.render(serviceLink.href, view), collectionUrl);
}
