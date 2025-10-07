/**
 * Custom band combination editor interface for eox-jsonform
 */
import { AbstractEditor } from "@json-editor/json-editor/src/editor";
import { generateBandColors } from "./colors";
import { buildBandsInterface } from "./rgb.js";
import { buildArithmeticInterface } from "./arithmetic.js";
import { exampleSchema } from "./schema.js";

export class BandsEditor extends AbstractEditor {
  /** @type {Record<string, HTMLElement[]>} */
  variableSlots = {};
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
    // Determine the format type
    const format = this.schema.format || "bands";

    this.bands =
      format === "bands" ? this.schema.items?.enum : this.schema.enum || [];
    this.bandTitles =
      format === "bands"
        ? this.schema.items?.options?.enum_titles
        : this.schema.options.enum_titles || this.bands;
    this.colors = generateBandColors(this.schema, format);

    // control
    this.control = document.createElement("div");
    this.control.classList.add("form-control");

    if (format === "bands") {
      buildBandsInterface(this, this.colors, this.bands, this.bandTitles);
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

// Re-export the example schema for external use
export { exampleSchema };
