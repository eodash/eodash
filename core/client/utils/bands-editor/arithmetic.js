import { addDraggableBands } from "./dom.js";
import { createSlotStyles, createSlot, fillSlotWithBand } from "./dom";
const MUSTACHE_REGEX = /\{\{([^}]+)\}\}/g;
/**
 * Build the arithmetic expression interface
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {Array<string>} colors - Array of color strings
 * @param {Array<string>} bands - Array of band identifiers
 * @param {Array<string>} bandTitles - Array of band titles
 */
export function buildArithmeticInterface(editor, colors, bands, bandTitles) {
  const formulaTemplate = editor.schema.formulaTemplate || "{{A}}";

  const style = createSlotStyles(bands, colors);
  editor.control?.appendChild(style);

  addDraggableBands(editor, bands, bandTitles);

  editor.control?.appendChild(document.createElement("hr"));

  // Add formula display with embedded slots after the bands
  addFormulaSlots(editor, formulaTemplate, bands, bandTitles);
}

/**
 * Generate the final formula string with band values substituted
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @returns {string} Formula string with substituted values
 */
function generateFormulaString(editor) {
  /** @type {string} */
  const formulaTemplate = editor.schema.formulaTemplate || "{{A}}";

  const variableValues = editor.variableValues || {};

  return formulaTemplate.replace(MUSTACHE_REGEX, (match, variable) => {
    const bandValue = variableValues[variable.trim()];
    return bandValue || match; // Keep placeholder if no value assigned
  });
}

/**
 * Add formula display with embedded circular slots
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {string} template - Formula template string
 * @param {Array<string>} bands - Array of band identifiers
 * @param {Array<string>} bandTitles - Array of band titles
 */
function addFormulaSlots(editor, template, bands, bandTitles) {
  const formulaContainer = document.createElement("div");
  formulaContainer.classList.add("slots-container");

  // Initialize slots tracking
  editor.variableSlots = {};

  // Split the template into parts and create elements
  const parts = template.split(/(\{\{[^}]+\}\})/);

  parts.forEach((part) => {
    if (!part) {
      return;
    }

    if (!part.match(MUSTACHE_REGEX)) {
      // This is formula text
      part = part.trim();
      if (part) {
        const textElement = document.createElement("span");
        textElement.classList.add("formula-text");
        textElement.textContent = part;
        formulaContainer.appendChild(textElement);
      }
      return;
    }

    // This is a variable placeholder
    const variable = part.replace(/[{}]/g, "").trim();
    const slotElement = createSlot(variable, (e) => {
      e.preventDefault();
      const enumValue = e.dataTransfer?.getData("band");
      if (!enumValue) return;

      const enumIndex = bands.indexOf(enumValue);
      const title = bandTitles[enumIndex] || enumValue;

      editor.variableValues[variable] = enumValue;

      // Update ALL slots for this variable using unified system
      updateAllSlotsForVariable(editor, variable, enumValue, title);

      // final formula string as the value
      //@ts-expect-error todo
      editor.value = generateFormulaString(editor);
      editor.onChange(true);
    });
    formulaContainer.appendChild(slotElement);

    // Track all slots for this variable
    if (!editor.variableSlots[variable]) {
      editor.variableSlots[variable] = [];
    }
    editor.variableSlots[variable].push(slotElement);
  });

  editor.control?.appendChild(formulaContainer);

  // Initialize slots with existing values after all slots are created
  setTimeout(() => {
    initializeSlots(editor);
  });
}

/**
 * Initialize all slots with existing values
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 */
function initializeSlots(editor) {
  if (editor.variableValues && editor.variableSlots) {
    Object.keys(editor.variableValues).forEach((variable) => {
      const enumValue = editor.variableValues[variable];
      const bands = editor.bands || editor.schema.enum || [];
      const bandTitles =
        editor.bandTitles || editor.schema.options?.enum_titles || bands;
      const enumIndex = bands.indexOf(enumValue);
      const title = bandTitles[enumIndex] || enumValue;
      updateAllSlotsForVariable(editor, variable, enumValue, title);
    });
  }
}

/**
 * Update all slots for a specific variable with band circle
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {string} variable - Variable name
 * @param {string} enumValue - Band value
 * @param {string} title - Band title
 */
function updateAllSlotsForVariable(editor, variable, enumValue, title) {
  if (editor.variableSlots && editor.variableSlots[variable]) {
    editor.variableSlots[variable].forEach((slot) => {
      fillSlotWithBand(slot, enumValue, title);
    });
  }
}
