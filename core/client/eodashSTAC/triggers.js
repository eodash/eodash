/*
 * eodashSTAC helpers that utilizes the app states or actions
 */
import { changeMapProjection, registerProjection } from "@/store/actions";
import log from "loglevel";
import { getProjectionCode } from "./helpers";
import { availableMapProjection, mapEl } from "@/store/states";

/**
 * checks if there's a projection on the Collection and
 * updates {@link availableMapProjection}
 * @param {import('stac-ts').StacCollection} [STAcCollection]
 */
export const setMapProjFromCol = async (STAcCollection) => {
  // if a projection exists on the collection level
  log.debug("Checking for available map projection in indicator");
  const projection =
    /** @type {number | string | {name: string, def: string} | undefined} */
    (
      STAcCollection?.["eodash:mapProjection"] ||
        STAcCollection?.["proj:epsg"] ||
        STAcCollection?.["eodash:proj4_def"]
    );
  if (projection) {
    log.debug("Projection found", projection);
    await registerProjection(projection);
    const projectionCode = getProjectionCode(projection);
    if (availableMapProjection.value !== projectionCode) {
      log.debug(
        "Changing map projection",
        availableMapProjection.value,
        projectionCode,
      );
      await changeMapProjection(projection);
    }
    // set it for `EodashMapBtns`
    availableMapProjection.value = /** @type {string} */ (projectionCode);
  } else {
    // reset to default projection
    log.debug("Resetting projection to default EPSG:3857");
    await changeMapProjection((availableMapProjection.value = ""));
  }
};
/**
 *
 * @param {string} collectionId
 * @param {import("@/types").EodashStyleJson["variables"]} variables
 */
export function getStyleVariablesState(collectionId, variables) {
  const mapElement = /** @type {import("@eox/map").EOxMap} */ (mapEl.value);
  if (!mapElement || !mapElement.layers.length || !variables) {
    return variables;
  }

  const analysisGroup = mapElement.layers.find(
    (layer) => layer.properties?.id === "AnalysisGroup",
  );
  if (!analysisGroup) {
    return variables;
  }
  const matchingLayer = analysisGroup.layers?.find((layer) => {
    const [collection, ..._other] = layer.properties?.id.split(";:;") ?? [
      "",
      "",
      "",
    ];
    return (
      collection === collectionId &&
      ["Vector", "WebGLTile"].includes(layer?.type ?? "")
    );
  });

  if (!matchingLayer) {
    return variables;
  }

  const olLayer = mapElement.getLayerById(matchingLayer.properties?.id ?? "");
  const oldVariablesState = /** @type {import("ol/layer").WebGLTile} */ (
    olLayer
    //@ts-expect-error todo
  ).getStyle()?.variables;
  if (!oldVariablesState) {
    return variables;
  }
  const styleVariablesKeys = Object.keys(variables);
  const matchingKeys =
    Object.keys(oldVariablesState).every((key) =>
      styleVariablesKeys.includes(key),
    ) &&
    styleVariablesKeys.every((key) =>
      Object.keys(oldVariablesState).includes(key),
    );
  return matchingKeys ? oldVariablesState : variables;
}
