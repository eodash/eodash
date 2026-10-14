/**
 * Custom band combination editor interface for eox-jsonform
 */
import { AbstractEditor } from "@json-editor/json-editor/src/editor";
import { generateBandColors } from "./colors";
import { buildRGBInterface, refreshRGBSlots } from "./rgb.js";
import {
  buildArithmeticInterface,
  parseFormulaValue,
  refreshArithmeticSlots,
} from "./arithmetic.js";

export class BandsEditor extends AbstractEditor {
  /** @type {Record<string, HTMLElement[]>} */
  variableSlots = {};
  /** @type {HTMLElement[]} */
  rgbSlots = [];
  /** @type {Record<string, string>} */
  variableValues = {};
  /** @type {string[]} */
  bands = [];
  /** @type {string[]} */
  bandTitles = [];
  /** @type {string[]} */
  colors = [];

  build() {
    super.build();
    // bands computed from a watched arithmetic field have nothing to show
    if (this.schema.watch) return;
    // Determine the format type
    const format = this.schema.format || "bands";

    this.bands =
      format === "bands"
        ? this.schema.items?.enum
        : (this.schema.options?.enum ?? this.schema.enum ?? []);
    this.bandTitles =
      format === "bands"
        ? this.schema.items?.options?.enum_titles
        : this.schema.options?.enum_titles || this.bands;
    this.colors = generateBandColors(this.schema, format);

    // control
    this.control = document.createElement("div");
    this.control.classList.add("form-control", "bands-editor");

    if (format === "bands") {
      buildRGBInterface(this, this.colors, this.bands, this.bandTitles);
    } else if (format === "bands-arithmetic") {
      buildArithmeticInterface(this, this.colors, this.bands, this.bandTitles);
    }

    // label
    this.label = document.createElement("span");
    this.label.classList.add("je-header");
    this.label.textContent = this.schema.title ?? "";

    // appends
    this.container?.appendChild(this.label);
    this.container?.appendChild(this.control);
  }

  /**
   * Keep the slot display in sync with every value change, including the
   * initial default applied by postBuild. Never triggers onChange here.
   * @param {unknown} value
   */
  setValue(value) {
    super.setValue(value);
    if ((this.schema.format || "bands") === "bands") {
      refreshRGBSlots(this);
    } else {
      refreshArithmeticSlots(this);
    }
  }

  /**
   * Bands with a `watch` on an arithmetic field follow its formula: the bands
   * it references, in placeholder order.
   */
  onWatchedFieldChange() {
    super.onWatchedFieldChange();
    // json-editor sets both, its typings do not declare them
    const { watched, jsoneditor } = /** @type {any} */ (this);
    const [path] = Object.values(watched ?? {});
    const formulaEditor = path && jsoneditor.getEditor(path);
    if (!(formulaEditor instanceof BandsEditor)) return;

    const variables = parseFormulaValue(
      formulaEditor,
      formulaEditor.getValue(),
    );
    if (!variables) return;
    const bands = [...new Set(Object.values(variables))];
    if (JSON.stringify(bands) === JSON.stringify(this.getValue())) return;
    this.setValue(bands);
    this.onChange(true);
  }
}

export const bandsEditorInterface = [
  {
    type: "array",
    format: "bands",
    func: BandsEditor,
  },
  {
    type: "string",
    format: "bands-arithmetic",
    func: BandsEditor,
  },
];

export default bandsEditorInterface;
