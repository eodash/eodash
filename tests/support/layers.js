/**
 * The "AnalysisGroup" layer group holding the selected indicator's data layers.
 * @param {import("@eox/map").EOxMap | undefined} mapEl
 */
export const analysisGroup = (mapEl) =>
  /** @type {import("@eox/map/src/layers").EOxLayerTypeGroup | undefined} */ (
    mapEl?.layers?.find((l) => l.properties?.id === "AnalysisGroup")
  );

/**
 * The group's time-enabled data layer, falling back to its first layer.
 * @param {import("@eox/map/src/layers").EOxLayerTypeGroup | undefined} group
 */
export const dataLayer = (group) =>
  group?.layers.find((l) => l.properties?.layerDatetime) ?? group?.layers[0];
