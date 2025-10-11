/**
 * Generate band colors for the editor
 * @param {Record<string,any>} schema - JSON schema
 * @param {string} format - Format type ("bands" or "bands-arithmetic")
 * @returns {string[]} Array of color strings
 */
export function generateBandColors(schema, format) {
  const bands = format === "bands" ? schema.items?.enum : schema.enum || [];
  const colors =
    format === "bands"
      ? schema.items?.options?.colors
      : schema.options?.colors || [];
  if (colors && colors.length === bands.length) {
    return colors;
  }

  return bands.map(
    () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0"),
  );
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
