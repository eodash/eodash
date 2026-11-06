import { flattenLayers, toShortLayerKey } from "./layer-state-helpers";

/**
 * Computes layer control property deltas for a map compared to default values.
 * Only records properties that differ from defaults:
 * - v: boolean (visibility) if not true
 * - o: number (opacity) if not 1
 * - t: string (datetime) if different from layer's default step
 *
 * @param {import("@eox/map").EOxMap | null} mapElement
 * @param {Record<string, any>} [formValue]
 * @returns {Record<string, { v?: boolean; o?: number; t?: string; c?: Record<string, any> }>}
 */
export function computeMapLayersDelta(mapElement, formValue = {}) {
  /** @type {Record<string, { v?: boolean; o?: number; t?: string; c?: Record<string, any> }>} */
  const delta = {};
  if (!mapElement?.layers) {
    return delta;
  }

  const layers = flattenLayers(mapElement.layers);
  for (const layerDef of layers) {
    const id = layerDef?.properties?.id;
    if (!id) continue;
    const shortKey = toShortLayerKey(id);

    /** @type {{ v?: boolean; o?: number; t?: string; c?: Record<string, any> }} */
    const layerEntry = {};

    // 1. Visibility: default is typically true unless explicitly marked false or role invisible
    if (layerDef.properties?.visible === false || layerDef.visible === false) {
      layerEntry.v = false;
    }

    // 2. Opacity: default is 1
    const olLayer = mapElement.getLayerById?.(id);
    const opacity = olLayer?.getOpacity?.() ?? layerDef.opacity;
    if (
      opacity !== undefined &&
      opacity !== null &&
      Math.abs(opacity - 1) > 0.01
    ) {
      layerEntry.o = Number(opacity.toFixed(2));
    }

    // 3. Datetime
    const currentStep = layerDef.properties?.layerDatetime?.currentStep;
    const controlValues = layerDef.properties?.layerDatetime?.controlValues;
    if (
      currentStep &&
      controlValues?.length &&
      currentStep !== controlValues[controlValues.length - 1]
    ) {
      layerEntry.t = currentStep;
    }

    if (Object.keys(layerEntry).length > 0) {
      delta[shortKey] = layerEntry;
    }
  }

  // Include layerConfig formValues if any
  if (formValue && Object.keys(formValue).length > 0) {
    for (const [_key, val] of Object.entries(delta)) {
      val.c = formValue;
      break;
    }
  }

  return delta;
}
