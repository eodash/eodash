import { describe, expect, test } from "vitest";
import { extractUrlKeys } from "../src/helpers/url.js";

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
