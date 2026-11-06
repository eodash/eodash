import { flattenLayers, toShortLayerKey } from "./layer-state-helpers";

/**
 * Computes layer control property deltas for a map compared to default values.
 * Only records properties that differ from defaults:
 * - visible: boolean if not default
 * - opacity: number if not 1
 * - datetime: string if different from layer's default step
 * - config: Record<string, any> (form values for layerConfig)
 *
 * @param {import("@eox/map").EOxMap | null} mapElement
 * @param {Record<string, Record<string, any>>} [layerFormValues={}]
 * @returns {Record<string, { visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }>}
 */
export function computeMapLayersDelta(mapElement, layerFormValues = {}) {
  /** @type {Record<string, { visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }>} */
  const delta = {};
  if (!mapElement?.layers) {
    return delta;
  }

  const layers = flattenLayers(mapElement.layers);
  for (const layerDef of layers) {
    const id = layerDef?.properties?.id;
    if (!id) continue;
    const shortKey = toShortLayerKey(id);

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
      !layerDef.properties?.roles?.includes("invisible");
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

    // 4. Config: match by full layer id or shortKey
    const configVal = layerFormValues[id] || layerFormValues[shortKey];
    if (configVal && Object.keys(configVal).length > 0) {
      layerEntry.config = configVal;
    }

    if (Object.keys(layerEntry).length > 0) {
      delta[shortKey] = layerEntry;
    }
  }

  return delta;
}
