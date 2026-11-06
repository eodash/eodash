import { describe, expect, test } from "vitest";
import { decodeParam, encodeParam } from "@/utils/url-param-codec";

describe("url-param-codec", () => {
  test("encodes and decodes simple objects", () => {
    const data = { v: false, o: 0.5 };
    const encoded = encodeParam(data);
    expect(typeof encoded).toBe("string");
    expect(encoded).not.toContain("=");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(decodeParam(encoded)).toEqual(data);
  });

  test("handles empty values by returning empty string or null", () => {
    expect(encodeParam(null)).toBe("");
    expect(encodeParam({})).toBe("");
    expect(encodeParam([])).toBe("");
    expect(decodeParam("")).toBeNull();
    expect(decodeParam(null)).toBeNull();
  });

  test("handles complex nested structures and unicode", () => {
    const complex = {
      bbox: [10.12345, 45.67891, 11.23456, 46.78912],
      text: "München, Österreich",
      num: 42,
    };
    const encoded = encodeParam(complex);
    expect(decodeParam(encoded)).toEqual(complex);
  });
});
