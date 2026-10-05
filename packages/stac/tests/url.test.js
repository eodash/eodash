import { describe, expect, test } from "vitest";
import { extractUrlKeys, extractUrlKeyValues } from "../src/helpers/url.js";

describe("extractUrlKeys", () => {
  test("collects url_key through nested properties and combinators", () => {
    const keys = extractUrlKeys({
      properties: {
        a: { url_key: "ka", properties: { b: { url_key: "kb" } } },
        noKey: {},
      },
      oneOf: [{ properties: { c: { url_key: "kc" } } }],
      allOf: [{ properties: { d: { url_key: "kd" } } }],
      anyOf: [{ properties: { e: { url_key: "ke" } } }],
    });

    expect(keys).toEqual({ a: "ka", b: "kb", c: "kc", d: "kd", e: "ke" });
  });

  test("returns an empty map for non-object schemas", () => {
    expect(extractUrlKeys(null)).toEqual({});
    expect(extractUrlKeys(/** @type {any} */ ("nope"))).toEqual({});
  });
});

describe("extractUrlKeyValues", () => {
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

    const extracted = extractUrlKeyValues(schema, value);
    expect(extracted).toEqual({
      flood_percent: 30,
      color_param: "blue",
      extra_param: "yes",
    });
  });

  test("handles missing or null values gracefully", () => {
    expect(extractUrlKeyValues(null, {})).toEqual({});
    expect(extractUrlKeyValues({}, null)).toEqual({});
    expect(extractUrlKeyValues(/** @type {any} */ ("nope"), {})).toEqual({});
  });
});
