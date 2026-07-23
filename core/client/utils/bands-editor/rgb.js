import {
  createSlotStyles,
  createSlot,
  fillSlotWithBand,
  clearSlot,
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
  const style = createSlotStyles(bands, colors);
  editor.control?.appendChild(style);

  addDraggableBands(editor, bands, bandTitles);

  editor.control?.appendChild(document.createElement("hr"));

  addRGBSlots(editor);
}

/**
 * Add RGB drop slots and keep their references on the editor
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 */
export function addRGBSlots(editor) {
  const rgbContainer = document.createElement("div");
  rgbContainer.classList.add("slots-container", "rgb-slots");

  editor.rgbSlots = ["R", "G", "B"].map((slot, index) => {
    const onDrop = (/** @type {DragEvent} */ e) => {
      e.preventDefault();
      const enumValue = e.dataTransfer?.getData("band");
      if (!enumValue) return;

      // Copy before assigning: mutating the value returned by getValue()
      // in place defeats change detection downstream.
      const currentValue = [...(editor.getValue() || [])];
      currentValue[index] = enumValue;
      // setValue re-renders the slots from the new value
      editor.setValue(currentValue);
      editor.onChange(true);
    };

    const slotDiv = createSlot(slot, onDrop);
    rgbContainer.appendChild(slotDiv);
    return slotDiv;
  });

  editor.control?.appendChild(rgbContainer);
}

/**
 * Sync the RGB slots with the editor's current value
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 */
export function refreshRGBSlots(editor) {
  const value = editor.getValue() || [];
  editor.rgbSlots?.forEach((slot, index) => {
    const enumValue = value[index];
    if (!enumValue) {
      clearSlot(slot);
      return;
    }
    const title =
      editor.bandTitles?.[editor.bands?.indexOf(enumValue)] || enumValue;
    fillSlotWithBand(slot, enumValue, title);
  });
}
