import { describe, expect, test } from "vitest";
import {
  diffFormValues,
  sanitizeFormValue,
} from "@/utils/process-state-helpers";

describe("process-state-helpers", () => {
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
});
