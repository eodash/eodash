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

  const analysisGroup =
    /** @type {import("@eox/map/src/layers").EOxLayerTypeGroup | undefined} */ (
      mapElement.layers.find(
        (layer) => layer.properties?.id === "AnalysisGroup",
      )
    );
  if (!analysisGroup) {
    return variables;
  }
  
  const matchingLayers = (analysisGroup.layers ?? []).filter((layer) => {
    const [collection] = layer.properties?.id.split(";:;") ?? [];
    return collection === collectionId;
  });
  console.log(
    "[DBG-SV] called",
    collectionId,
    "newKeys:",
    Object.keys(variables),
    "matching:",
    matchingLayers.map((l) => l.properties?.id),
  );

  const styleVariablesKeys = Object.keys(variables);
  for (const matchingLayer of matchingLayers) {
    const olLayer = mapElement.getLayerById(matchingLayer.properties?.id ?? "");
    const oldVariablesState =
      /** @type {import("ol/layer").Vector} */ (
        olLayer
        //@ts-expect-error variables doesn't exist in non-flat style
      ).getStyle?.()?.variables ??
      //@ts-expect-error (styleVariables_ is a private property)
      /** @type {import("ol/layer").WebGLTile} */ (olLayer).styleVariables_;

    console.log(
      "[DBG-SV] layer",
      matchingLayer.properties?.id,
      "oldVars:",
      oldVariablesState && JSON.parse(JSON.stringify(oldVariablesState)),
    );
    if (!oldVariablesState) {
      continue;
    }
    // Carry over the values for keys that still apply, keep the rest.
    const sharedKeys = styleVariablesKeys.filter(
      (key) => key in oldVariablesState,
    );
    if (!sharedKeys.length) {
      continue;
    }
    const merged = {
      ...variables,
      ...Object.fromEntries(
        sharedKeys.map((key) => [key, oldVariablesState[key]]),
      ),
    };
    console.log("[DBG-SV] returning merged", merged);
    return merged;
  }
  console.log("[DBG-SV] no match, returning defaults");
  return variables;
}
