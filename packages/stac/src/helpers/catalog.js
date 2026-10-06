/**
 * Checks whether a STAC object represents a Catalog (rather than Collection or Item).
 *
 * @param {Record<string, any>} [doc]
 * @returns {doc is import("../types").STACCatalog}
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
