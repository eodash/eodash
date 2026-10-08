export const COLORMAPS_URL =
  "https://raw.githubusercontent.com/eurodatacube/eodash-assets/refs/heads/main/defaults/colormaps.json";

/**
 * Fallback palettes for offline execution or tests
 */
export const FALLBACK_PALETTES = {
  viridis: [
    "#440154",
    "#482878",
    "#3e4a89",
    "#31688e",
    "#26828e",
    "#1f9e89",
    "#35b779",
    "#6ece58",
    "#b5de2b",
    "#fde725",
  ],
  magma: [
    "#000004",
    "#180f3d",
    "#440f76",
    "#721f81",
    "#9e2f7f",
    "#cd4071",
    "#f1605d",
    "#fd9668",
    "#feca8d",
    "#fcfdbf",
  ],
  plasma: [
    "#0d0887",
    "#46039f",
    "#7201a8",
    "#9c179e",
    "#bd3786",
    "#d8576b",
    "#ed7953",
    "#fb9f3a",
    "#fdca26",
    "#f0f921",
  ],
};

/** @type {Record<string, string[]> | null} */
export let cachedColormaps = null;

/**
 * Fetch full colormaps list from GitHub or fallback
 * @returns {Promise<Record<string, string[]>>}
 */
export async function fetchColormaps() {
  if (cachedColormaps) return cachedColormaps;
  try {
    const res = await fetch(COLORMAPS_URL);
    if (res.ok) {
      cachedColormaps = await res.json();
      return cachedColormaps;
    }
  } catch {
    // Network fallback
  }
  return FALLBACK_PALETTES;
}

/**
 * Backward compatibility alias for PALETTES
 */
export const PALETTES = FALLBACK_PALETTES;

/**
 * Get color ramp array for a colormap name
 * @param {string} name
 * @returns {Promise<string[]>}
 */
export async function getColormapRamp(name) {
  const maps = await fetchColormaps();
  if (maps && maps[name]) {
    return maps[name];
  }
  return FALLBACK_PALETTES[name] || FALLBACK_PALETTES.viridis;
}
