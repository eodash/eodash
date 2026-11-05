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
