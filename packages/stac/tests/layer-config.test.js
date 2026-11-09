import { describe, expect, test } from "vitest";
import { createLayerConfigHelpers } from "../src/helpers/layer-config.js";

describe("layer-config helpers", () => {
  test("auto-creates an empty jsonform schema when style or rasterform contains only a legend", () => {
    const { extractLayerConfig } = createLayerConfigHelpers();
    const legend = {
      type: "continuous",
      title: "Elevation",
    };

    const fromStyle = extractLayerConfig({ legend });
    expect(fromStyle.layerConfig).toEqual({
      schema: {
        type: "object",
        title: "",
        properties: {},
      },
      type: "style",
      legend,
    });
    expect(fromStyle.style).not.toHaveProperty("legend");

    const fromRaster = extractLayerConfig({}, { legend });
    expect(fromRaster.layerConfig).toEqual({
      schema: {
        type: "object",
        title: "",
        properties: {},
      },
      type: "tileUrl",
      legend,
    });
  });
});

describe("the open branch of a persisted raster form", () => {
  const branch = (
    /** @type {string} */ title,
    /** @type {string[]} */ keys,
  ) => ({
    title,
    properties: Object.fromEntries(
      keys.map((key) => [key, { type: "string" }]),
    ),
  });
  const FORM = {
    jsonform: {
      type: "object",
      properties: {},
      oneOf: [
        branch("bands", ["band_selection", "color_formula", "rescale"]),
        branch("expression", ["band_expression", "colormap_name", "rescale"]),
        branch("ratio", ["band_expression", "colormap_name", "rescale"]),
      ],
    },
  };

  /**
   * Builds the form, persists `value` as the editor would, then rebuilds it.
   * @param {Record<string, any>} value
   * @param {Record<string, any>} [form]
   * @returns {Record<string, any> | undefined} the rebuilt schema
   */
  const rebuildSchema = (value, form = FORM) => {
    const { extractLayerConfig, persistLayerConfig } =
      createLayerConfigHelpers();
    const { layerConfig } = extractLayerConfig({}, form);
    if (Object.keys(value).length && layerConfig) {
      persistLayerConfig(layerConfig, value);
    }
    return extractLayerConfig({}, form).layerConfig?.schema;
  };

  /**
   * @param {Record<string, any>} value
   * @param {Record<string, any>} [form]
   * @param {"oneOf" | "anyOf"} [combinator]
   * @returns {string[] | undefined} the branch titles after the rebuild
   */
  const branchesAfterRebuild = (value, form = FORM, combinator = "oneOf") =>
    rebuildSchema(value, form)?.[combinator].map(
      (/** @type {{title: string}} */ b) => b.title,
    );

  const NDI = { band_expression: "(b08)/(b04)", colormap_name: "viridis" };

  test.each([
    ["oneOf", FORM],
    ["anyOf", { jsonform: { type: "object", anyOf: FORM.jsonform.oneOf } }],
  ])(
    "reopens the %s branch the saved value was edited in, since json-editor opens the first one",
    (combinator, form) => {
      expect(branchesAfterRebuild(NDI, form, combinator)).toEqual([
        "expression",
        "bands",
        "ratio",
      ]);
    },
  );

  test("keeps the order without a saved value", () => {
    expect(branchesAfterRebuild({})).toEqual(["bands", "expression", "ratio"]);
  });

  test("leaves a form that opts out of persistence in its order", () => {
    const form = {
      jsonform: { ...FORM.jsonform, options: { persist_state: false } },
    };

    expect(branchesAfterRebuild(NDI, form)).toEqual([
      "bands",
      "expression",
      "ratio",
    ]);
  });

  test("between branches with the same keys, keeps the first one", () => {
    expect(
      branchesAfterRebuild({ ...NDI, rescale: "0,1" }),
    ).toEqual(["expression", "bands", "ratio"]);
  });

  test("on an equal match, prefers the branch with the fewest properties the value lacks", () => {
    const form = {
      jsonform: {
        type: "object",
        oneOf: [branch("wide", ["a", "b", "c"]), branch("narrow", ["a", "b"])],
      },
    };

    expect(branchesAfterRebuild({ a: "1", b: "2" }, form)?.[0]).toBe(
      "narrow",
    );
  });

  test("seeds the saved values into the reopened branch, nested objects included", () => {
    const form = {
      jsonform: {
        type: "object",
        oneOf: [
          branch("bands", ["band_selection"]),
          {
            title: "expression",
            properties: {
              band_expression: { type: "string", default: "b04" },
              rescaleminmax: {
                type: "object",
                properties: {
                  min: { type: "number", default: 0 },
                  max: { type: "number", default: 1 },
                },
              },
            },
          },
        ],
      },
    };

    const schema = rebuildSchema(
      { band_expression: "b08", rescaleminmax: { min: -1, max: 2 } },
      form,
    );

    expect(schema?.oneOf[0]).toMatchObject({
      title: "expression",
      properties: {
        band_expression: { default: "b08" },
        rescaleminmax: {
          properties: { min: { default: -1 }, max: { default: 2 } },
        },
      },
    });
  });
});
