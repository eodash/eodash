import { addDraggableBands } from "./dom.js";
import {
  createUnifiedSlotStyles,
  createUnifiedSlot,
  fillSlotWithBand as unifiedFillSlot,
} from "./slots.js";

/**
 * Build the arithmetic expression interface
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {Array<string>} colors - Array of color strings
 * @param {Array<string>} bands - Array of band identifiers
 * @param {Array<string>} bandTitles - Array of band titles
 */
export function buildArithmeticInterface(editor, colors, bands, bandTitles) {
  const formulaTemplate = editor.schema.formulaTemplate || "{{A}}";
  const variables = parseFormulaVariables(formulaTemplate);

  // Use unified styles instead of creating separate styles
  const style = createUnifiedSlotStyles(bands, colors);
  editor.control?.appendChild(style);

  // Add draggable bands first
  addDraggableBands(editor, bands, bandTitles);

  editor.control?.appendChild(document.createElement("hr"));

  // Add formula display with embedded slots after the bands
  addFormulaSlots(editor, formulaTemplate, variables, bands, bandTitles);
}

/**
 * Parse mustache template variables from formula
 * @param {string} formula - Formula template string
 * @returns {Array<string>} Array of variable names
 */
export function parseFormulaVariables(formula) {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables = new Set();
  let match;

  while ((match = variableRegex.exec(formula)) !== null) {
    variables.add(match[1].trim());
  }

  return Array.from(variables);
}

/**
 * Generate the final formula string with band values substituted
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @returns {string} Formula string with substituted values
 */
export function generateFormulaString(editor) {
  /** @type {string} */
  const formulaTemplate = editor.schema.formulaTemplate || "{{A}}";

  const variableValues = editor.variableValues || {};

  return formulaTemplate.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const bandValue = variableValues[variable.trim()];
    return bandValue || match; // Keep placeholder if no value assigned
  });
}

/**
 * Add formula display with embedded circular slots
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {string} template - Formula template string
 * @param {Array<string>} variables - Array of variable names
 * @param {Array<string>} bands - Array of band identifiers
 * @param {Array<string>} bandTitles - Array of band titles
 */
export function addFormulaSlots(
  editor,
  template,
  variables,
  bands,
  bandTitles,
) {
  const formulaContainer = document.createElement("div");
  formulaContainer.classList.add("formula-container");

  // Initialize slots tracking
  editor.variableSlots = {};

  // Split the template into parts and create elements
  const parts = template.split(/(\{\{[^}]+\}\})/);

  parts.forEach((part) => {
    if (part.match(/\{\{([^}]+)\}\}/)) {
      // This is a variable placeholder
      const variable = part.replace(/[{}]/g, "").trim();
      const slotElement = createUnifiedSlot(
        "arithmetic",
        variable,
        (/** @type {DragEvent} */ e) => {
          e.preventDefault();
          const enumValue = e.dataTransfer?.getData("band");
          if (!enumValue) return;

          const enumIndex = bands.indexOf(enumValue);
          const title = bandTitles[enumIndex] || enumValue;

          // Store the value
          if (!editor.variableValues) {
            editor.variableValues = {};
          }
          editor.variableValues[variable] = enumValue;

          // Update ALL slots for this variable using unified system
          updateAllSlotsForVariable(editor, variable, enumValue, title);

          // Generate final formula string as the value
          //@ts-expect-error todo
          editor.value = generateFormulaString(editor);
          editor.onChange(true);
        },
      );
      formulaContainer.appendChild(slotElement);

      // Track all slots for this variable
      if (!editor.variableSlots[variable]) {
        editor.variableSlots[variable] = [];
      }
      editor.variableSlots[variable].push(slotElement);
    } else if (part.trim()) {
      // This is formula text
      const textElement = document.createElement("span");
      textElement.classList.add("formula-text");
      textElement.textContent = part;
      formulaContainer.appendChild(textElement);
    }
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
export function initializeSlots(editor) {
  if (editor.variableValues && editor.variableSlots) {
    Object.keys(editor.variableValues).forEach((variable) => {
      const enumValue = editor.variableValues[variable];
      const bands =
        editor.bands || editor.schema.enum || editor.schema.items?.enum || [];
      const bandTitles =
        editor.bandTitles ||
        editor.schema.options?.enum_titles ||
        editor.schema.items?.options?.enum_titles ||
        bands;
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
export function updateAllSlotsForVariable(editor, variable, enumValue, title) {
  if (editor.variableSlots && editor.variableSlots[variable]) {
    editor.variableSlots[variable].forEach((slot) => {
      unifiedFillSlot(editor, slot, enumValue, title, "arithmetic");
    });
  }
}
