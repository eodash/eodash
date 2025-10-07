import { addDraggableBands } from "./dom.js";
import {
  createUnifiedSlotStyles,
  createUnifiedSlot,
  fillSlotWithBand,
  initializeSlotWithValue,
} from "./slots.js";

/**
 * Build the traditional RGB bands interface
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {Array<string>} colors - Array of color strings
 * @param {Array<string>} bands - Array of band identifiers
 * @param {Array<string>} bandTitles - Array of band titles
 */
export function buildBandsInterface(editor, colors, bands, bandTitles) {
  // Use unified styles instead of creating separate styles
  const style = createUnifiedSlotStyles(bands, colors);
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
  ["R", "G", "B"].forEach((slot, index) => {
    const onDrop = (/** @type {DragEvent} */ e) => {
      e.preventDefault();
      const enumValue = e.dataTransfer?.getData("band");
      if (!enumValue) return;

      const enumIndex = bands.indexOf(enumValue);
      const title = bandTitles[enumIndex] || enumValue;

      // Use unified slot filling
      fillSlotWithBand(editor, slotDiv, enumValue, title, "rgb");

      // Get current value as array or create new one
      const currentValue = editor.getValue() || [];
      currentValue[index] = enumValue;
      editor.setValue(currentValue);
      editor.onChange(true);
    };

    const slotDiv = createUnifiedSlot("rgb", slot, onDrop);
    editor.control?.appendChild(slotDiv);

    // Initialize with existing value
    setTimeout(() => {
      const currentValue = editor.getValue();
      if (currentValue?.[index]) {
        const enumValue = currentValue[index];
        const enumIndex = bands.indexOf(enumValue);
        const title = bandTitles[enumIndex] || enumValue;
        initializeSlotWithValue(editor, slotDiv, enumValue, title, "rgb");
      }
    });
  });
}
