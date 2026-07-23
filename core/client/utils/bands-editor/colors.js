/**
 * Generate band colors for the editor
 * @param {Record<string,any>} schema - JSON schema
 * @param {string} format - Format type ("bands" or "bands-arithmetic")
 * @returns {string[]} Array of color strings
 */
export function generateBandColors(schema, format) {
  /** @type {string[]} */
  const bands =
    format === "bands"
      ? (schema.items?.enum ?? [])
      : (schema.options?.enum ?? schema.enum ?? []);
  const colors =
    format === "bands"
      ? schema.items?.options?.colors
      : schema.options?.colors || [];
  if (colors && colors.length === bands.length) {
    return colors;
  }

  // Stable hex per band so chips keep their color across rebuilds/tab
  // switches; channels clamped to the light half so black text stays legible.
  return bands.map((band) => {
    let hash = 0;
    for (let i = 0; i < band.length; i++) {
      hash = band.charCodeAt(i) + ((hash << 5) - hash);
    }
    return [16, 8, 0]
      .map((shift) => (((hash >>> shift) & 0xff) | 0x80).toString(16))
      .reduce((hex, channel) => hex + channel, "#");
  });
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
