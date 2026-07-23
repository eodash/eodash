import {
  createSlotStyles,
  createSlot,
  fillSlotWithBand,
  clearSlot,
  addDraggableBands,
} from "./dom";
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
  addFormulaSlots(editor, formulaTemplate);
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

/** @param {string} str */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Reverse of {@link generateFormulaString}: derive variable assignments from
 * a formula string by matching it against the template. Unfilled `{{X}}`
 * placeholders are tolerated; repeated variables must hold the same band.
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {string} value - Formula string
 * @returns {Record<string, string> | null} Variable assignments, or null if
 * the value doesn't match the template
 */
function parseFormulaValue(editor, value) {
  const bands = editor.bands ?? [];
  if (!value || !bands.length) return null;

  /** @type {string} */
  const template = editor.schema.formulaTemplate || "{{A}}";
  // Longest-first so a band is never half-matched by a shorter prefix of it
  const bandAlternation = [...bands]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  /** @type {string[]} */
  const variableOrder = [];
  /** @type {Record<string, number>} */
  const groupNumbers = {};

  const pattern = template
    .split(/(\{\{[^}]+\}\})/)
    .map((part) => {
      const placeholder = part.match(/^\{\{([^}]+)\}\}$/);
      if (!placeholder) return escapeRegExp(part);

      const variable = placeholder[1].trim();
      // Repeated variable: must match whatever the first occurrence captured
      if (groupNumbers[variable]) return `\\${groupNumbers[variable]}`;

      variableOrder.push(variable);
      groupNumbers[variable] = variableOrder.length;
      return `(${bandAlternation}|${escapeRegExp(part)})`;
    })
    .join("");

  const match = value.match(new RegExp(`^${pattern}$`));
  if (!match) return null;

  /** @type {Record<string, string>} */
  const values = {};
  variableOrder.forEach((variable, i) => {
    const captured = match[i + 1];
    // Skip captures that are still unfilled placeholders
    if (captured && !captured.startsWith("{{")) values[variable] = captured;
  });
  return values;
}

/**
 * Add formula display with embedded circular slots
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 * @param {string} template - Formula template string
 */
function addFormulaSlots(editor, template) {
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

      editor.variableValues[variable] = enumValue;
      // setValue re-renders the slots from the new value
      editor.setValue(generateFormulaString(editor));
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
}

/**
 * Sync the formula slots with the editor's current value, falling back to
 * `options.defaultVariables` when the value can't be parsed
 * @param {import("./index.js").BandsEditor} editor - The editor instance
 */
export function refreshArithmeticSlots(editor) {
  const parsed =
    parseFormulaValue(editor, /** @type {string} */ (editor.getValue())) ??
    editor.options?.defaultVariables ??
    {};
  editor.variableValues = { ...parsed };

  Object.keys(editor.variableSlots ?? {}).forEach((variable) => {
    const slots = editor.variableSlots[variable];
    const enumValue = editor.variableValues[variable];
    if (!enumValue) {
      slots.forEach(clearSlot);
      return;
    }
    const title =
      editor.bandTitles?.[editor.bands?.indexOf(enumValue)] || enumValue;
    slots.forEach((slot) => fillSlotWithBand(slot, enumValue, title));
  });
}
