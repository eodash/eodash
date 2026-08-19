/**
 * Whether a STAC link or asset is rendered as a baselayer or an overlay
 * @param {import("../types").EodashLink | import("../types").EodashAsset | undefined} linkOrAsset
 * @returns {boolean}
 * */
export const isBaseLayerOrOverlay = (linkOrAsset) => {
  const roles = /** @type {string[] | undefined} */ (linkOrAsset?.roles);
  return !!roles?.some((role) => role === "baselayer" || role === "overlay");
};

/**
 * Assign extracted roles to layer properties
 * @param {Record<string,any>} properties
 * @param {import("../types").EodashLink | import("../types").EodashAsset} linkOrAsset
 * */
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
 * A collection asset holding every item, standing in for `item` links.
 *
 * @param {import("../types").EodashCollection} collection
 */
export const findParquetMirror = (collection) =>
  Object.values(collection.assets ?? {}).find(
    (asset) =>
      asset.type === "application/vnd.apache.parquet" &&
      asset.roles?.includes("collection-mirror"),
  );
