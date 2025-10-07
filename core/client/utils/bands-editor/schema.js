const enums = [
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

const combinedSchema = {
  options: {
    removeProperties: ["bidx", "variables"],
    cleanupIncompatibleProperties: true, // Enable automatic cleanup when switching
  },
  oneOf: [
    // Traditional bands schema
    {
      type: "object",
      title: "RGB Band Combination",
      options: {
        removeProperties: ["expression", "colormap_name"], // Remove arithmetic-specific properties
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
                "#66CCFF", // r60m:b01 (Coastal aerosol)
                "#0070FF", // r60m:b02 (Blue)
                "#00C800", // r60m:b03 (Green)
                "#FF0000", // r60m:b04 (Red)
                "#C00040", // r60m:b05 (Red Edge 1)
                "#A00060", // r60m:b06 (Red Edge 2)
                "#CC0088", // r60m:b07 (Red Edge 3)
                "#9900FF", // r60m:b09 (Water vapor)
                "#FF9900", // r60m:b11 (SWIR 1)
                "#8B4513", // r60m:b12 (SWIR 2)
                "#CC33CC", // r60m:b8a (NIR narrow)
                "#66CCFF", // r20m:b01
                "#0070FF", // r20m:b02
                "#00C800", // r20m:b03
                "#FF0000", // r20m:b04
                "#C00040", // r20m:b05
                "#A00060", // r20m:b06
                "#CC0088", // r20m:b07
                "#FF9900", // r20m:b11
                "#8B4513", // r20m:b12
                "#CC33CC", // r20m:b8a
                "#0070FF", // r10m:b02
                "#00C800", // r10m:b03
                "#FF0000", // r10m:b04
                "#FF66CC", // r10m:b08 (NIR broad)
                "#A0A0A0", // l2a_quicklook:r10m:tci
              ],
            },
          },
        },
        bidx: {
          $ref: "#/definitions/bidx",
        },
        rescaleminmax: {
          $ref: "#/definitions/rescaleminmax",
        },
        rescale: {
          $ref: "#/definitions/rescale",
        },
      },
      required: ["variables", "rescale", "rescaleminmax", "bidx"],
    },
    // Arithmetic expression schema
    {
      type: "object",
      title: "Band Arithmetic Expression",
      options: {
        removeProperties: ["variables"], // Remove RGB-specific properties
      },
      properties: {
        expression: {
          type: "string",
          format: "bands-arithmetic",
          formulaTemplate: "({{A}})/({{B}})",
          title: "Band Arithmetic Expression",
          enum: enums,
          options: {
            enum_titles,
            colors: [
              "#66CCFF", // r60m:b01 (Coastal aerosol)
              "#0070FF", // r60m:b02 (Blue)
              "#00C800", // r60m:b03 (Green)
              "#FF0000", // r60m:b04 (Red)
              "#C00040", // r60m:b05 (Red Edge 1)
              "#A00060", // r60m:b06 (Red Edge 2)
              "#CC0088", // r60m:b07 (Red Edge 3)
              "#9900FF", // r60m:b09 (Water vapor)
              "#FF9900", // r60m:b11 (SWIR 1)
              "#8B4513", // r60m:b12 (SWIR 2)
              "#CC33CC", // r60m:b8a (NIR narrow)
              "#66CCFF", // r20m:b01
              "#0070FF", // r20m:b02
              "#00C800", // r20m:b03
              "#FF0000", // r20m:b04
              "#C00040", // r20m:b05
              "#A00060", // r20m:b06
              "#CC0088", // r20m:b07
              "#FF9900", // r20m:b11
              "#8B4513", // r20m:b12
              "#CC33CC", // r20m:b8a
              "#0070FF", // r10m:b02
              "#00C800", // r10m:b03
              "#FF0000", // r10m:b04
              "#FF66CC", // r10m:b08 (NIR broad)
              "#A0A0A0", // l2a_quicklook:r10m:tci
            ],
          },
        },
        colormap_name: {
          type: "string",
          title: "Colormap Name",
          default: "viridis",
          enum: [
            "solar_r",
            "oxy_r",
            "autumn_r",
            "blues_r",
            "rainbow_r",
            "turbo_r",
            "inferno",
            "tab20_r",
            "bugn",
            "blues",
            "thermal_r",
            "rdbu_r",
            "hsv_r",
            "orrd",
            "rdylbu_r",
            "pubu",
            "haline",
            "wistia",
            "dense_r",
            "gray",
          ],
        },
        rescale: {
          $ref: "#/definitions/rescale",
        },
        rescaleminmax: {
          $ref: "#/definitions/rescaleminmax",
        },
        bidx: {
          $ref: "#/definitions/bidx",
        },
      },
      required: [
        "expression",
        "colormap_name",
        "rescale",
        "rescaleminmax",
        "bidx",
      ],
    },
  ],
  definitions: {
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
    },
  },
};

export const exampleSchema = {
  jsonform: combinedSchema,
};
