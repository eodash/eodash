import { describe, expect, test } from "vitest";
import {
  diffFormValues,
  extractSchemaDefaults,
  mergeFormDelta,
  sanitizeFormValue,
} from "@/utils/process-state-helpers";

describe("process-state-helpers", () => {
  const schema = {
    type: "object",
    properties: {
      date_start: { type: "string", default: "2024-01-01" },
      num: { type: "number", default: 5 },
      nested: {
        type: "object",
        properties: {
          inner: { type: "string", default: "init" },
        },
      },
    },
  };

  test("extracts schema defaults correctly", () => {
    const defaults = extractSchemaDefaults(schema);
    expect(defaults).toEqual({
      date_start: "2024-01-01",
      num: 5,
      nested: { inner: "init" },
    });
  });

  test("preserves exact coordinates in form values without rounding", () => {
    const coords = [12.34567891234, 45.67891234567];
    expect(sanitizeFormValue(coords)).toEqual([12.34567891234, 45.67891234567]);
  });

  test("computes delta between form values and baseline", () => {
    const baseline = {
      date_start: "2024-01-01",
      num: 5,
    };
    const current = {
      date_start: "2024-01-01", // unchanged
      num: 10, // changed
      bbox: [10.123456789, 20.123456789, 11.123456789, 21.123456789],
    };

    const delta = diffFormValues(current, baseline);
    expect(delta).toEqual({
      num: 10,
      bbox: [10.123456789, 20.123456789, 11.123456789, 21.123456789],
    });
  });

  test("merges delta into target", () => {
    const target = { a: 1, b: { c: 2 } };
    const delta = { b: { d: 3 }, e: 4 };
    expect(mergeFormDelta(target, delta)).toEqual({
      a: 1,
      b: { c: 2, d: 3 },
      e: 4,
    });
  });
});
