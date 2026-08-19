/**
 * Keeps jsonform and raster editors from overwriting one another. A collection
 * that exposes two layers of the same kind shares one slot.
 *
 * Was a vue `ref` in the app; the shape is the same so call sites are unchanged.
 * @type {{value: Record<string, Record<string, Record<string, any>>>}}
 */
export const layerConfigFormState = { value: {} };
