/**
 * Get the color associated with a specific band.
 * @param {string} band
 * @param {string[]} bands
 * @param {string[]} colors
 */
function getBandColor(band, bands, colors) {
  const idx = bands.indexOf(band);
  return colors[idx] || "#f0f0f0";
}

/**
 * Create band styles
 * @param {string[]} bands - Array of band identifiers
 * @param {string[]} colors - Array of color strings
 * @param {string} additionalStyles - Additional CSS styles
 * @returns {HTMLStyleElement} Style element
 */
export function createBandStyles(bands, colors, additionalStyles = "") {
  const style = document.createElement("style");
  style.innerHTML = `
    [data-band], [data-slot] {
      display: inline-flex;
      border: 1px solid darkgrey;
      border-radius: 50%;
      height: 40px;
      aspect-ratio: 1/1;
      padding: 4px;
      margin: 2px;
      align-items: center;
      justify-content: center;
      cursor: move;
      font-size: 10px;
    }
    ${bands
      .map(
        (band) =>
          `[data-band="${band}"] { background: ${getBandColor(
            band,
            bands,
            colors,
          )}; color: black; }`,
      )
      .join("\n")}
    ${additionalStyles}
  `;
  return style;
}

/**
 * Create a draggable band element.
 * @param {string} enumValue
 * @param {string} title
 */
export function createBandDiv(enumValue, title) {
  const div = document.createElement("div");
  div.dataset.band = enumValue;
  div.textContent = title;
  div.draggable = true;
  div.ondragstart = (e) => {
    e.dataTransfer?.setData("band", enumValue);
  };
  return div;
}

/**
 * Add draggable band elements
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {Array<string>} bands - Array of band identifiers
 * @param {Array<string>} bandTitles - Array of band titles
 */
export function addDraggableBands(editor, bands, bandTitles) {
  bands.forEach((band, index) => {
    const title = bandTitles[index];
    const bandDiv = createBandDiv(band, title);

    // createBandDiv already sets up drag functionality
    editor.control?.appendChild(bandDiv);
  });
}
