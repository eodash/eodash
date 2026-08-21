/**
 * Determines if a STAC link or asset acts as a base layer or an overlay based on its roles.
 *
 * @param {import("../types").STACLink | import("../types").STACAsset | undefined} linkOrAsset
 * @returns {boolean}
 */
export const isBaseLayerOrOverlay = (linkOrAsset) => {
  const roles = /** @type {string[] | undefined} */ (linkOrAsset?.roles);
  return !!roles?.some((role) => role === "baselayer" || role === "overlay");
};

/**
 * Translates STAC roles ("visible", "invisible", "overlay", "baselayer") into properties.
 * Modifies the properties object in-place and returns it.
 *
 * @param {Record<string,any>} properties
 * @param {import("../types").STACLink | import("../types").STACAsset} linkOrAsset
 */
export const extractRoles = (properties, linkOrAsset) => {
  const roles = /** @type {string[]} */ (linkOrAsset.roles);
  roles?.forEach((role) => {
    if (role === "visible") {
      properties.visible = true;
    } else if (role === "invisible") {
      properties.visible = false;
    }
    if (role === "overlay" || role === "baselayer") {
      properties.group = role;
    }
  });
  return properties;
};

/**
 * Finds a GeoParquet collection mirror asset (`application/vnd.apache.parquet`).
 *
 * @param {import("../types").STACCollection} collection
 * @returns {import("../types").STACAsset | undefined}
 */
export const findParquetMirror = (collection) =>
  Object.values(collection.assets ?? {}).find(
    (asset) =>
      asset.type === "application/vnd.apache.parquet" &&
      asset.roles?.includes("collection-mirror"),
  );
