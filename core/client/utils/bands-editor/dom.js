import { getBandColor } from "./colors.js";

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

/**
 * Create unified styles for all slot types
 * @param {string[]} bands - Array of band identifiers
 * @param {string[]} colors - Array of color strings
 * @returns {HTMLStyleElement} Style element with unified slot styles
 */
export function createSlotStyles(bands, colors) {
  const style = document.createElement("style");
  style.innerHTML = `
    /* Base styles for all band elements */
    [data-band] {
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

    /* Band color styles */
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

    /* RGB slot styles */
    [data-slot] {
      display: inline-flex;
      width: 50px;
      height: 50px;
      aspect-ratio: 1/1;
      padding: 1px;
      border: 2px solid #666;
      background: #f0f0f0;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 2px;
      position: relative;
      box-sizing: border-box;
    }
    [data-slot]:hover {
      border-color: #333;
      background: #f9f9f9;
    }
    [data-slot]::before {
      content: attr(data-slot);
      position: absolute;
      font-size: 12px;
      font-weight: bold;
      color: #666;
      z-index: 0;
    }

    /* container */
    .slots-container {
      font-family: monospace;
      font-size: 18px;
      padding: 16px;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin: 8px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 4px;
    }

    .formula-text {
      font-size: 18px;
      margin: 0 2px;
    }
  `;
  return style;
}

/**
 * Create a unified slot element for RGB or arithmetic use
 * @param {string} identifier - RGB letter ("R", "G", "B") or variable name for arithmetic
 * @param {(e: DragEvent) => void} onDrop - Drop handler function
 * @returns {HTMLDivElement} Slot element
 */
export function createSlot(identifier, onDrop) {
  const slotDiv = document.createElement("div");
  // Use data-slot
  slotDiv.dataset.slot = identifier;

  // Add drag & drop functionality
  slotDiv.ondrop = onDrop;
  slotDiv.ondragover = (e) => e.preventDefault();

  return slotDiv;
}

/**
 * Fill a slot with a band
 * @param {HTMLElement} slot - Slot element
 * @param {string} enumValue - Band value
 * @param {string} title - Band title
 */
export function fillSlotWithBand(slot, enumValue, title) {
  // clear existing band and add new one
  const existingBand = slot.querySelector("[data-band]");
  if (existingBand) {
    existingBand.remove();
  }

  const bandDiv = createBandDiv(enumValue, title);
  slot.appendChild(bandDiv);
}
