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

  // Seed initial slot values from configured defaults.
  const defaultVariables = editor.schema.options?.defaultVariables;
  if (defaultVariables && !Object.keys(editor.variableValues ?? {}).length) {
    editor.variableValues = { ...defaultVariables };
  }

  const style = createSlotStyles(bands, colors);
  editor.control?.appendChild(style);

  addDraggableBands(editor, bands, bandTitles);

  editor.control?.appendChild(document.createElement("hr"));

  // Render the formula with variable drop slots.
  addFormulaSlots(editor, formulaTemplate, bands, bandTitles);

  // Rebuild and emit the expression when dependent values change.
  editor.regenerate = () => {
    //@ts-expect-error custom editor value
    editor.value = generateFormulaString(editor);
    editor.onChange(true);
  };
}

/**
 * Resolve {{placeholders}} using watched field values.
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {string} str - String that may contain {{watched}} placeholders
 * @returns {string} String with watched placeholders resolved
 */
function resolveWatchedPlaceholders(editor, str) {
  const watched = editor.getWatchedFieldValues?.() ?? {};
  return str.replace(MUSTACHE_REGEX, (match, name) => {
    const value = watched[name.trim()];
    return typeof value === "string" ? value : match;
  });
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

  const withBands = formulaTemplate.replace(
    MUSTACHE_REGEX,
    (match, variable) => {
      const bandValue = variableValues[variable.trim()];
      return bandValue || match;
    },
  );

  return resolveWatchedPlaceholders(editor, withBands);
}

/**
 * Add the formula display with drop slots for variables.
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
      part = part.trim();
      if (part) {
        const textElement = document.createElement("span");
        textElement.classList.add("formula-text");
        textElement.textContent = part;
        formulaContainer.appendChild(textElement);
      }
      return;
    }

    const variable = part.replace(/[{}]/g, "").trim();
    const slotElement = createSlot(variable, (e) => {
      e.preventDefault();
      const enumValue = e.dataTransfer?.getData("band");
      if (!enumValue) return;

      const enumIndex = bands.indexOf(enumValue);
      const title = bandTitles[enumIndex] || enumValue;

      editor.variableValues[variable] = enumValue;

      // Keep all instances of the same variable in sync.
      updateAllSlotsForVariable(editor, variable, enumValue, title);

      // Store the current rendered formula as the field value.
      //@ts-expect-error todo
      editor.value = generateFormulaString(editor);
      editor.onChange(true);
    });
    formulaContainer.appendChild(slotElement);

    // A variable can appear multiple times in the template.
    if (!editor.variableSlots[variable]) {
      editor.variableSlots[variable] = [];
    }
    editor.variableSlots[variable].push(slotElement);
  });

  editor.control?.appendChild(formulaContainer);

  // Hydrate slots after DOM nodes are mounted.
  setTimeout(() => {
    initializeSlots(editor);
  });
}

/**
 * Initialize slot UI from current variable values.
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
 * Update all slot instances for one variable.
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
