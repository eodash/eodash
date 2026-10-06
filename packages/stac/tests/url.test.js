import { describe, expect, test } from "vitest";
import { extractUrlKeys } from "../src/helpers/url.js";

describe("extractUrlKeys", () => {
  test("collects url_key values through nested and flat properties and combinators", () => {
    const schema = {
      properties: {
        flood: { url_key: "flood_percent" },
        style: {
          properties: {
            color: { url_key: "color_param" },
          },
        },
      },
      oneOf: [
        {
          properties: {
            extra: { url_key: "extra_param" },
          },
        },
      ],
    };

    const value = {
      flood: 30,
      style: {
        color: "blue",
      },
      extra: "yes",
    };

    const extracted = extractUrlKeys(schema, value);
    expect(extracted).toEqual({
      flood_percent: 30,
      color_param: "blue",
      extra_param: "yes",
    });
  });

  test("returns an empty map for non-object schemas or missing values", () => {
    expect(extractUrlKeys(null, {})).toEqual({});
    expect(extractUrlKeys({}, null)).toEqual({});
    expect(extractUrlKeys(/** @type {any} */ ("nope"), {})).toEqual({});
  });
});
