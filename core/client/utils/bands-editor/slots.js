import { getBandColor } from "./colors.js";
import { createBandDiv } from "./dom.js";

/**
 * Create unified styles for all slot types
 * @param {string[]} bands - Array of band identifiers
 * @param {string[]} colors - Array of color strings
 * @returns {HTMLStyleElement} Style element with unified slot styles
 */
export function createUnifiedSlotStyles(bands, colors) {
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
      height: 50px;
      padding: 1px;
      border: 2px dashed lightgrey;
      background: #f0f0f0;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 2px;
      position: relative;
    }
    [data-slot]::before {
      content: attr(data-slot);
      position: absolute;
      font-size: 12px;
      font-weight: bold;
      color: #666;
      z-index: 0;
    }
    [data-slot=R] {
      border-color: #f88;
      background: #fee;
    }
    [data-slot=G] {
      border-color: #8f8;
      background: #efe;
    }
    [data-slot=B] {
      border-color: #88f;
      background: #eef;
    }

    /* Arithmetic formula container */
    .formula-container {
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

    /* Arithmetic variable slots - inherit from base slot styles */
    .formula-variable-slot {
      display: inline-flex;
      width: 50px;
      height: 50px;
      border: 2px dashed #666;
      border-radius: 50%;
      background: #fff;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: #666;
      cursor: pointer;
      margin: 0 2px;
      position: relative;
      padding: 2px;
    }
    .formula-variable-slot:hover {
      border-color: #333;
      background: #f9f9f9;
    }
    .formula-variable-slot.filled {
      border: 2px solid #4CAF50;
      background: #E8F5E8;
      color: #2E7D32;
      padding: 2px;
    }
    .formula-variable-slot.filled::before {
      content: none; /* Hide the variable letter when filled */
    }
    .formula-variable-slot.empty::before {
      content: attr(data-variable);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: bold;
      color: #666;
      z-index: 0;
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
 * @param {string} type - "rgb" or "arithmetic"
 * @param {string} identifier - RGB letter ("R", "G", "B") or variable name for arithmetic
 * @param {(e: DragEvent) => void} onDrop - Drop handler function
 * @returns {HTMLDivElement} Slot element
 */
export function createUnifiedSlot(type, identifier, onDrop) {
  const slotDiv = document.createElement("div");

  if (type === "rgb") {
    slotDiv.dataset.slot = identifier;
  } else if (type === "arithmetic") {
    slotDiv.classList.add("formula-variable-slot", "empty");
    slotDiv.dataset.variable = identifier;
    // No need for band container since we'll fill the slot directly
  }

  // Add unified drop functionality
  slotDiv.ondrop = onDrop;
  slotDiv.ondragover = (e) => e.preventDefault();

  return slotDiv;
}

/**
 * Fill a slot with a band - works for both RGB and arithmetic slots
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {HTMLElement} slot - Slot element
 * @param {string} enumValue - Band value
 * @param {string} title - Band title
 * @param {string} type - "rgb" or "arithmetic"
 */
export function fillSlotWithBand(editor, slot, enumValue, title, type) {
  if (type === "rgb") {
    // For RGB slots, clear existing band and add new one
    const existingBand = slot.querySelector("[data-band]");
    if (existingBand) {
      existingBand.remove();
    }

    const bandDiv = createBandDiv(enumValue, title);
    slot.appendChild(bandDiv);
  } else if (type === "arithmetic") {
    // For arithmetic slots, update the filled state and make band fill entire slot
    slot.classList.add("filled");
    slot.classList.remove("empty");
    slot.title = title;

    // Clear existing content and fill the slot completely with the band
    slot.innerHTML = "";

    // Apply band styling directly to the slot to fill it completely
    const color = getBandColor(enumValue, editor.bands, editor.colors);
    slot.style.background = color;
    slot.style.color = "black";
    slot.style.border = "2px solid #4CAF50";
    slot.style.fontSize = "10px";
    slot.style.fontWeight = "bold";

    // Add the band data attribute and text directly to the slot
    slot.dataset.band = enumValue;
    slot.textContent = title;

    // Remove the dashed border style when filled
    slot.style.borderStyle = "solid";
  }
}

/**
 * Initialize a slot with existing value - works for both RGB and arithmetic slots
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {HTMLElement} slot - Slot element
 * @param {string} enumValue - Band value
 * @param {string} title - Band title
 * @param {string} type - "rgb" or "arithmetic"
 */
export function initializeSlotWithValue(editor, slot, enumValue, title, type) {
  if (enumValue) {
    fillSlotWithBand(editor, slot, enumValue, title, type);
  }
}
