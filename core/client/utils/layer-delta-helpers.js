import { getFlatLayers, toShortLayerKey } from "./layer-state-helpers";
import { getLayerCollectionPrefix } from "@eodash/stac/helpers";
import { diffFormValues } from "./process-state-helpers";

/**
 * Computes layer control property deltas for a map compared to default values.
 * Only records properties that differ from defaults:
 * - visible: boolean if not default
 * - opacity: number if not 1
 * - datetime: string if different from layer's default step
 * - config: Record<string, any> (form values for layerConfig, diffed against baselines)
 *
 * @param {import("@eox/map").EOxMap | null} mapElement
 * @param {Record<string, Record<string, any>>} [layerFormValues={}]
 * @param {Record<string, Record<string, any>>} [baselineDefaults={}]
 * @returns {Record<string, { visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }>}
 */
export function computeMapLayersDelta(
  mapElement,
  layerFormValues = {},
  baselineDefaults = {},
) {
  /** @type {Record<string, { visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }>} */
  const delta = {};
  if (!mapElement?.layers) {
    return delta;
  }

  const layers = getFlatLayers(mapElement.layers);
  for (const layerDef of layers) {
    const id = layerDef?.properties?.id;
    if (!id) continue;
    const shortKey = toShortLayerKey(id);
    const prefix = getLayerCollectionPrefix(id);

    /** @type {{ visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }} */
    const layerEntry = {};

    const olLayer = mapElement.getLayerById?.(id);

    // 1. Visibility: compare with default roles or original properties
    const currentVisible =
      olLayer?.getVisible?.() ??
      layerDef.visible ??
      layerDef.properties?.visible;
    const defaultVisible =
      layerDef.properties?.defaultVisible ??
      (layerDef.properties?.roles?.includes("invisible")
        ? false
        : !layerDef.properties?.roles?.includes("invisible"));
    if (currentVisible !== undefined && currentVisible !== defaultVisible) {
      layerEntry.visible = currentVisible;
    }

    // 2. Opacity: default is 1
    const opacity = olLayer?.getOpacity?.() ?? layerDef.opacity;
    if (
      opacity !== undefined &&
      opacity !== null &&
      Math.abs(opacity - 1) > 0.01
    ) {
      layerEntry.opacity = Number(opacity.toFixed(2));
    }

    // 3. Datetime
    const currentStep = layerDef.properties?.layerDatetime?.currentStep;
    const controlValues = layerDef.properties?.layerDatetime?.controlValues;
    if (
      currentStep &&
      controlValues?.length &&
      currentStep !== controlValues[controlValues.length - 1]
    ) {
      layerEntry.datetime = currentStep;
    }

    // 4. Config: diff against baseline defaults and strip watched template properties
    const rawConfig =
      layerFormValues[id] ||
      layerFormValues[shortKey] ||
      layerFormValues[prefix];
    const baseConfig =
      baselineDefaults[id] ||
      baselineDefaults[shortKey] ||
      baselineDefaults[prefix] ||
      {};

    if (rawConfig && Object.keys(rawConfig).length > 0) {
      // Exclude template-derived properties defined on the schema (e.g. rescale from vminmax)
      const schemaProps =
        layerDef.properties?.layerConfig?.schema?.properties || {};
      const configVal = { ...rawConfig };
      for (const [key, propDef] of Object.entries(schemaProps)) {
        if (
          propDef &&
          typeof propDef === "object" &&
          "template" in propDef &&
          "watch" in propDef
        ) {
          delete configVal[key];
        }
      }

      const diff = diffFormValues(configVal, baseConfig);
      if (diff && Object.keys(diff).length > 0) {
        layerEntry.config = diff;
      }
    }

    if (Object.keys(layerEntry).length > 0) {
      delta[shortKey] = layerEntry;
    }
  }

  return delta;
}
