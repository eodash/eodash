/**
 * Generate band colors for the editor
 * @param {Record<string,any>} schema - JSON schema
 * @param {string} format - Format type ("bands" or "bands-arithmetic")
 * @returns {string[]} Array of color strings
 */
export function generateBandColors(schema, format) {
  const bands =
    format === "bands"
      ? schema.items?.enum
      : (schema.options?.enum ?? schema.enum ?? []);
  const colors =
    format === "bands"
      ? schema.items?.options?.colors
      : schema.options?.colors || [];
  if (colors && colors.length === bands.length) {
    return colors;
  }

  // Stable hex per band so chips keep their color across rebuilds/tab switches.
  return bands.map((band) => {
    let hash = 0;
    for (let i = 0; i < band.length; i++) {
      hash = band.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `#${((hash >>> 0) & 0xffffff).toString(16).padStart(6, "0")}`;
  });
}

/**
 * Readable text color (black/white) for a hex chip background, by luminance.
 * @param {string} color
 * @returns {string}
 */
export function contrastText(color) {
  if (typeof color !== "string" || !color.startsWith("#")) return "#000";
  const hex =
    color.length === 4
      ? color.slice(1).replace(/./g, "$&$&")
      : color.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 140 ? "#000" : "#fff";
}

/**
 * Get color for a specific band
 * @param {string} band - Band identifier
 * @param {string[]} bands - Array of band identifiers
 * @param {string[]} colors - Array of color strings
 * @returns {string} Color string
 */
export function getBandColor(band, bands, colors) {
  const index = bands.indexOf(band);
  return index !== -1 ? colors[index] : "#000000";
}
