/**
 * Custom band combination editor interface for eox-jsonform
 */
//@ts-expect-error TODO
import { JSONEditor } from "@json-editor/json-editor/src/core.js";

export class BandsEditor extends JSONEditor.AbstractEditor {
  build() {
    super.build();
    console.log("BandsEditor build", this.schema);

    const colors =
      this.schema.items.options.colors ??
      this.schema.items.enum.map(
        () =>
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0"),
      );
    /**
     * Get the color associated with a specific band.
     * @param {string} band
     */
    const getBandColor = (band) => {
      const idx =
        /** @type {string[]} */
        (this.schema.items.enum).indexOf(band);
      return colors[idx] || "#f0f0f0";
    };

    // control
    this.control = document.createElement("div");
    this.control.classList.add("form-control");
    const bands = this.schema.items.enum;
    const bandTitles = this.schema.items.options?.enum_titles || bands;

    const style = document.createElement("style");
    style.innerHTML = `
    [data-band], [data-slot] {
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
    ${bands
      .map(
        (band) =>
          `[data-band="${band}"] { background: ${getBandColor(
            band,
          )}; color: black; }`,
      )
      .join("\n")}

    [data-slot] {
      height: 50px;
      padding: 1px;
      border: 2px dashed lightgrey;
      background: #f0f0f0;
    }
    [data-slot]::before {
      content: attr(data-slot);
      position: absolute;
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

  `;
    this.control.appendChild(style);

    // Bands
    const createBandDiv = (enumValue, title) => {
      const div = document.createElement("div");
      div.dataset.band = enumValue;
      div.textContent = title;
      div.draggable = true;
      div.ondragstart = (e) => {
        e.dataTransfer.setData("band", e.target.dataset.band);
      };
      return div;
    };
    bands.forEach((band, index) => {
      const title = bandTitles[index];
      const bandDiv = createBandDiv(band, title);
      this.control.appendChild(bandDiv);
    });

    this.control.appendChild(document.createElement("hr"));

    // Band slots
    ["R", "G", "B"].forEach((slot, index) => {
      const slotDiv = document.createElement("div");
      slotDiv.dataset.slot = slot;
      slotDiv.ondrop = (e) => {
        e.preventDefault();
        const target = e.target.closest("[data-slot]");
        const existingBand = target?.querySelector("[data-band]");
        const enumValue = e.dataTransfer.getData("band");
        const enumIndex = bands.indexOf(enumValue);
        const title = bandTitles[enumIndex] || enumValue;
        const bandDiv = createBandDiv(enumValue, title);

        // Remove existing band if present
        if (existingBand) {
          existingBand.remove();
        }

        // Append new band to slot
        target?.appendChild(bandDiv);

        this.value[index] = enumValue;
        this.onChange(true);
      };
      slotDiv.ondragover = (e) => e.preventDefault();
      this.control.appendChild(slotDiv);
      setTimeout(() => {
        if (this.value?.[index]) {
          const enumValue = this.value[index];
          const enumIndex = bands.indexOf(enumValue);
          const title = bandTitles[enumIndex] || enumValue;
          const bandDiv = createBandDiv(enumValue, title);
          slotDiv.appendChild(bandDiv);
        }
      });
    });

    // label
    this.label = document.createElement("span");
    this.label.classList.add("je-header");
    this.label.textContent = this.schema.title;

    // appends
    this.container.appendChild(this.label);
    this.container.appendChild(this.control);
  }
}

const enums = [
  "/conditions/geometry:sun_angles",
  "/measurements/reflectance/r60m:b01",
  "/measurements/reflectance/r60m:b02",
  "/measurements/reflectance/r60m:b03",
  "/measurements/reflectance/r60m:b04",
  "/measurements/reflectance/r60m:b05",
  "/measurements/reflectance/r60m:b06",
  "/measurements/reflectance/r60m:b07",
  "/measurements/reflectance/r60m:b09",
  "/measurements/reflectance/r60m:b11",
  "/measurements/reflectance/r60m:b12",
  "/measurements/reflectance/r60m:b8a",
  "/measurements/reflectance/r20m:b01",
  "/measurements/reflectance/r20m:b02",
  "/measurements/reflectance/r20m:b03",
  "/measurements/reflectance/r20m:b04",
  "/measurements/reflectance/r20m:b05",
  "/measurements/reflectance/r20m:b06",
  "/measurements/reflectance/r20m:b07",
  "/measurements/reflectance/r20m:b11",
  "/measurements/reflectance/r20m:b12",
  "/measurements/reflectance/r20m:b8a",
  "/measurements/reflectance/r10m:b02",
  "/measurements/reflectance/r10m:b03",
  "/measurements/reflectance/r10m:b04",
  "/measurements/reflectance/r10m:b08",
  "/quality/l2a_quicklook/r10m:tci",
];

const enum_titles = [
  "Sun Angles",
  "R60M B01",
  "R60M B02",
  "R60M B03",
  "R60M B04",
  "R60M B05",
  "R60M B06",
  "R60M B07",
  "R60M B09",
  "R60M B11",
  "R60M B12",
  "R60M B8A",
  "R20M B01",
  "R20M B02",
  "R20M B03",
  "R20M B04",
  "R20M B05",
  "R20M B06",
  "R20M B07",
  "R20M B11",
  "R20M B12",
  "R20M B8A",
  "R10M B02",
  "R10M B03",
  "R10M B04",
  "R10M B08",
  "R10M TCI",
];

export const bandsEditorInterface = [
  {
    type: "array",
    format: "bands",
    func: BandsEditor,
  },
];

export default bandsEditorInterface;

const schema = {
  type: "object",
  options: {
    removeProperties: ["bidx", "variables"],
  },
  properties: {
    variables: {
      title: "Custom Band Combination (drag&drop)",
      type: "array",
      format: "bands",
      default: [
        "/measurements/reflectance/r20m:b04",
        "/measurements/reflectance/r20m:b03",
        "/measurements/reflectance/r20m:b02",
      ],
      items: {
        type: "string",
        title: "Slot",
        enum: enums,
        options: {
          enum_titles,
          colors: [
            "#FFD700", // /conditions/geometry:sun_angles
            "#6ECFF6", // r60m:b01
            "#4F81BD", // r60m:b02
            "#9BBB59", // r60m:b03
            "#C0504D", // r60m:b04
            "#C4D79B", // r60m:b05
            "#76923C", // r60m:b06
            "#375623", // r60m:b07
            "#8064A2", // r60m:b09
            "#F79646", // r60m:b11
            "#7F6000", // r60m:b12
            "#E26B8A", // r60m:b8a
            "#6ECFF6", // r20m:b01
            "#4F81BD", // r20m:b02
            "#9BBB59", // r20m:b03
            "#C0504D", // r20m:b04
            "#C4D79B", // r20m:b05
            "#76923C", // r20m:b06
            "#375623", // r20m:b07
            "#F79646", // r20m:b11
            "#7F6000", // r20m:b12
            "#E26B8A", // r20m:b8a
            "#4F81BD", // r10m:b02
            "#9BBB59", // r10m:b03
            "#C0504D", // r10m:b04
            "#E26B8A", // r10m:b08
            "#A0A0A0", // l2a_quicklook:r10m:tci
          ],
        },
      },
    },
    bidx: {
      type: "string",
      default: "1",
      const: "1",
      options: {
        hidden: true,
      },
    },
    rescaleminmax: {
      type: "object",
      properties: {
        min: {
          type: "number",
          minimum: -2,
          maximum: 2,
          default: 0,
          format: "range",
        },
        max: {
          type: "number",
          minimum: -2,
          maximum: 2,
          default: 0.25,
          format: "range",
        },
      },
      title: "RescaleMinMax",
      format: "minmax",
      // keep_values: false,
      // not_included_in_result: true,
    },
    rescale: {
      type: "string",
      watch: {
        rescaleminmax: "rescaleminmax",
      },
      template: "{{rescaleminmax.min}},{{rescaleminmax.max}}",
      options: {
        hidden: true,
      },
    }
  },
};

export const exampleSchema = {
  jsonform: JSON.parse(JSON.stringify(schema)),
};
