import {
  createSlotStyles,
  createSlot,
  fillSlotWithBand,
  addDraggableBands,
} from "./dom";

/**
 * Build the traditional RGB bands interface
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {Array<string>} colors - Array of color strings
 * @param {Array<string>} bands - Array of band identifiers
 * @param {Array<string>} bandTitles - Array of band titles
 */
export function buildRGBInterface(editor, colors, bands, bandTitles) {
  // Use unified styles instead of creating separate styles
  const style = createSlotStyles(bands, colors);
  editor.control?.appendChild(style);

  // Add draggable bands
  addDraggableBands(editor, bands, bandTitles);

  editor.control?.appendChild(document.createElement("hr"));

  // Add RGB slots using unified slot system
  addRGBSlots(editor, bands, bandTitles);
}

/**
 * Add RGB slots for traditional bands interface using unified slot system
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {Array<string>} bands - Array of band identifiers
 * @param {Array<string>} bandTitles - Array of band titles
 */
export function addRGBSlots(editor, bands, bandTitles) {
  // Create a container for RGB slots
  const rgbContainer = document.createElement("div");
  rgbContainer.classList.add("slots-container");

  ["R", "G", "B"].forEach((slot, index) => {
    const onDrop = (/** @type {DragEvent} */ e) => {
      e.preventDefault();
      const enumValue = e.dataTransfer?.getData("band");
      if (!enumValue) return;

      const enumIndex = bands.indexOf(enumValue);
      const title = bandTitles[enumIndex] || enumValue;

      fillSlotWithBand(editor, slotDiv, enumValue, title, "rgb");

      // Get current value as array or create new one
      const currentValue = editor.getValue() || [];
      currentValue[index] = enumValue;
      editor.setValue(currentValue);
      editor.onChange(true);
    };

    const slotDiv = createSlot("rgb", slot, onDrop);
    rgbContainer.appendChild(slotDiv);

    // Initialize with existing value
    setTimeout(() => {
      const currentValue = editor.getValue();
      if (currentValue?.[index]) {
        const enumValue = currentValue[index];
        const enumIndex = bands.indexOf(enumValue);
        const title = bandTitles[enumIndex] || enumValue;
        if (enumValue) {
          fillSlotWithBand(editor, slotDiv, enumValue, title, "rgb");
        }
      }
    });
  });

  editor.control?.appendChild(rgbContainer);
}
