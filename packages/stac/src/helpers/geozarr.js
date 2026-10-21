// EOPF writes both `vnd.zarr` and the misspelled `vnd+zarr`
const ZARR_MEDIA_TYPE = /^application\/vnd[.+]zarr/;

/**
 * Whether an asset is a zarr group OL's `GeoZarr` source can render. Assets without
 * `bands` are store or metadata pointers.
 *
 * @param {import("../types").STACAsset} asset
 * @param {import("../types").STACItem | import("../types").STACCollection} stacObject
 * @returns {asset is import("../types").GeoZarrAsset}
 */
export const isRenderableGeoZarrAsset = (asset, stacObject) =>
  ZARR_MEDIA_TYPE.test(asset.type ?? "") &&
  !!asset.href &&
  Array.isArray(asset.bands) &&
  asset.bands.length > 0 &&
  // a valid-data mask qualifies another asset's pixels, it is not a layer of its own
  !asset.roles?.includes("data-mask") &&
  !hasOnlyAuxiliaryBands(asset, stacObject) &&
  !isInsideZarrGroup(asset, stacObject);

/**
 * The bands a GeoZarr layer starts with: the style's, else red/green/blue by common
 * name, else the first band alone.
 *
 * @param {import("../types").STACAsset} asset - one `isRenderableGeoZarrAsset` accepted
 * @param {string[]} [styleBands]
 * @returns {string[]}
 */
export const getDefaultGeoZarrBands = (asset, styleBands) => {
  if (styleBands?.length) {
    return styleBands;
  }
  const bands = Array.isArray(asset.bands) ? asset.bands : [];
  const rgb = ["red", "green", "blue"].flatMap(
    (commonName) =>
      bands.find((band) => band["eo:common_name"] === commonName)?.name ?? [],
  );
  return rgb.length === 3 ? rgb : [bands[0].name];
};

/**
 * A cube carries its own time axis, which eox-map slices from the store, so the item's
 * dates do not apply to its layer.
 *
 * @param {import("../types").STACAsset} asset
 * @param {import("../types").STACItem | import("../types").STACCollection} stacObject
 * @returns {boolean}
 */
export const isGeoZarrCube = (asset, stacObject) => {
  const dimensions =
    asset["cube:dimensions"] ??
    (stacObject.type === "Feature"
      ? stacObject.properties["cube:dimensions"]
      : undefined);
  return (
    typeof dimensions === "object" &&
    dimensions !== null &&
    Object.values(dimensions).some(
      (dimension) => dimension?.type === "temporal",
    )
  );
};

/**
 * The `layerDatetime` a GeoZarr layer starts with. A cube's slider comes from its store's
 * time axis, which eox-map reads, so the layer only names the slice to open; any other
 * zarr asset gets the item-level `layerDatetime` like every other layer, and falls back to
 * the step alone when the build wants no item-level time. STAC cannot tell whether a
 * non-cube store has a time axis; if it has, eox-map still swaps in its slices.
 *
 * @param {import("../types").STACAsset} asset
 * @param {import("../types").STACItem | import("../types").STACCollection} stacObject
 * @param {Record<string, unknown>} [layerDatetime] - the item-level `layerDatetime`, if the build wants it
 * @param {string} [currentStep] - the item's own step
 * @returns {Record<string, unknown> | undefined}
 */
export const getGeoZarrLayerDatetime = (
  asset,
  stacObject,
  layerDatetime,
  currentStep,
) => {
  if (layerDatetime && !isGeoZarrCube(asset, stacObject)) return layerDatetime;
  return currentStep ? { currentStep } : undefined;
};

/**
 * Whether the datacube extension declares none of the asset's bands a `data` variable.
 *
 * @param {import("../types").STACAsset} asset
 * @param {import("../types").STACItem | import("../types").STACCollection} stacObject
 * @returns {boolean}
 */
function hasOnlyAuxiliaryBands(asset, stacObject) {
  const variables =
    asset["cube:variables"] ??
    (stacObject.type === "Feature"
      ? stacObject.properties["cube:variables"]
      : undefined);
  if (!variables || !Array.isArray(asset.bands)) return false;
  const byName = new Map(Object.entries(variables));
  return asset.bands.every(({ name }) => {
    const variable = byName.get(name);
    // EOPF names the datacube `type` field `variable_type`
    const type = variable?.type ?? variable?.variable_type;
    return !!type && type !== "data";
  });
}

/**
 * Whether the asset's href lies inside another zarr asset's group, i.e. it points at one
 * of that group's arrays. The store root (`rel: store`) is not such a group.
 *
 * @param {import("../types").STACAsset} asset
 * @param {import("../types").STACItem | import("../types").STACCollection} stacObject
 * @returns {boolean}
 */
function isInsideZarrGroup(asset, stacObject) {
  /** @param {string} href */
  const trim = (href) => href.replace(/\/$/, "");
  const store = stacObject.links.find((link) => link.rel === "store")?.href;
  return Object.values(stacObject.assets ?? {}).some(
    (group) =>
      ZARR_MEDIA_TYPE.test(group.type ?? "") &&
      Array.isArray(group.bands) &&
      group.bands.length > 0 &&
      !!group.href &&
      trim(group.href) !== (store && trim(store)) &&
      asset.href.startsWith(`${trim(group.href)}/`),
  );
}
