import { getBandColor } from "./colors.js";

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
  const palette = document.createElement("div");
  palette.classList.add("bands-palette");
  bands.forEach((band, index) => {
    const title = bandTitles[index];
    // createBandDiv already sets up drag functionality
    palette.appendChild(createBandDiv(band, title));
  });
  editor.control?.appendChild(palette);
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
      border: 1px solid var(--outline, darkgrey);
      border-radius: 50%;
      height: 40px;
      aspect-ratio: 1/1;
      padding: 4px;
      margin: 2px;
      align-items: center;
      justify-content: center;
      cursor: move;
      font-size: 10px;
      font-weight: 500;
      transition: box-shadow 150ms ease;
    }
    [data-band]:hover {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    /* One card holding the palette and the slots */
    .bands-editor {
      background: var(--surface-container, #f0f0f0);
      border: 1px solid var(--outline-variant, #ccc);
      border-radius: 4px;
      padding: 12px;
      margin: 8px 0;
    }
    .bands-editor hr {
      border: none;
      border-top: 1px solid var(--outline-variant, #ccc);
      margin: 8px 0;
    }

    /* Centered palette of draggable bands */
    .bands-palette {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
      padding: 8px 0;
    }

    /* Band color styles */
    ${bands
      .map(
        (band) =>
          `[data-band="${band}"] { background: ${getBandColor(band, bands, colors)}; color: black; }`,
      )
      .join("\n")}

    /* Drop slot styles */
    [data-slot] {
      display: inline-flex;
      width: 50px;
      height: 50px;
      aspect-ratio: 1/1;
      padding: 1px;
      border: 2px solid var(--outline, #666);
      background: var(--surface-container-low, #f0f0f0);
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 2px;
      position: relative;
      box-sizing: border-box;
      transition: border-color 150ms ease, background 150ms ease;
    }
    [data-slot]:hover {
      border-color: var(--primary, #333);
      background: var(--surface-container-high, #f9f9f9);
    }
    [data-slot]::before {
      content: attr(data-slot);
      position: absolute;
      font-size: 12px;
      font-weight: bold;
      color: var(--on-surface-variant, #666);
      z-index: 0;
    }

    /* slots row inside the card */
    .slots-container {
      font-family: monospace;
      font-size: 18px;
      color: var(--on-surface, inherit);
      padding: 8px 0;
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

    /* RGB channel affordance */
    .rgb-slots [data-slot] {
      border-style: dashed;
    }
    .rgb-slots [data-slot="R"] { border-color: #e57373; }
    .rgb-slots [data-slot="G"] { border-color: #81c784; }
    .rgb-slots [data-slot="B"] { border-color: #64b5f6; }
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
  clearSlot(slot);
  slot.appendChild(createBandDiv(enumValue, title));
}

/**
 * Remove the band from a slot, if any
 * @param {HTMLElement} slot - Slot element
 */
export function clearSlot(slot) {
  slot.querySelector("[data-band]")?.remove();
}
