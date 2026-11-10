import { describe, expect, test } from "vitest";
import { prefillProcessDates } from "^/EodashProcess/methods/date-defaults.js";

/** @typedef {Parameters<typeof prefillProcessDates>[0]} FormSchema */

const SELECTED = "2024-06-01T12:34:56.789Z";
const COLLECTION = {
  extent: {
    temporal: { interval: [["2024-01-01T00:00:00Z", "2024-12-31T00:00:00Z"]] },
  },
};

/** @param {string} [name] @param {FormSchema} [date] @returns {FormSchema} */
function shipForm(name = "start_date", date = {}) {
  // The ship-detection form's relevant structure, with its date type corrected.
  return {
    type: "object",
    properties: {
      bbox: { type: "array", format: "bounding-box" },
      [name]: { title: "Select date", type: "string", format: "date", ...date },
      threshold: { type: "number", default: 0.5, minimum: 0, maximum: 1 },
    },
  };
}

/** @param {FormSchema} schema @param {string} [selected] */
function prefill(schema, selected = SELECTED) {
  const original = structuredClone(schema);
  const result = prefillProcessDates(schema, COLLECTION, selected);
  expect(schema).toEqual(original);
  return result;
}

describe("standalone processing date inputs", () => {
  test.each([
    "start_date",
    "end_date",
    "beginDate",
    "finish_time",
    "from",
    "to",
  ])(
    "uses the dashboard date for a standalone %s rather than requiring a range",
    (name) => {
      expect(prefill(shipForm(name))).toMatchObject({
        properties: {
          [name]: { default: "2024-06-01" },
          bbox: { type: "array", format: "bounding-box" },
          threshold: { default: 0.5 },
        },
      });
    },
  );

  test.each(["start_date", "end_date"])(
    "recognizes an unformatted standalone date-named field: %s",
    (name) => {
      const schema = { properties: { [name]: { type: "string" } } };
      expect(prefill(schema)).toMatchObject({
        properties: { [name]: { default: "2024-06-01" } },
      });
    },
  );

  test.each([
    ["date-time", SELECTED],
    ["datetime-local", "2024-06-01T12:34:56.789"],
  ])("retains %s precision for a standalone endpoint", (format, expected) => {
    expect(prefill(shipForm("end_date", { format }))).toMatchObject({
      properties: { end_date: { default: expected } },
    });
  });

  test.each([
    ["2023-12-01T00:00:00Z", "2024-01-01"],
    ["2025-01-01T00:00:00Z", "2024-12-31"],
  ])(
    "clamps a standalone date %s to the collection extent",
    (selected, expected) => {
      expect(prefill(shipForm(), selected)).toMatchObject({
        properties: { start_date: { default: expected } },
      });
    },
  );

  test("can prefill a standalone endpoint without collection metadata", () => {
    expect(prefillProcessDates(shipForm(), null, SELECTED)).toMatchObject({
      properties: { start_date: { default: "2024-06-01" } },
    });
  });

  test.each(["2000-01-01", "", null])(
    "preserves an explicit standalone endpoint default: %j",
    (value) => {
      const schema = shipForm("start_date", { default: value });
      expect(prefill(schema)).toEqual(schema);
    },
  );

  test.each(["start_date", "end_date"])(
    "preserves a parent-object default for standalone %s",
    (name) => {
      const schema = { ...shipForm(name), default: { [name]: "2000-01-01" } };
      expect(prefill(schema)).toEqual(schema);
    },
  );

  test("respects native bounds for a standalone endpoint", () => {
    expect(
      prefill(
        shipForm("start_date", {
          options: { inputAttributes: { min: "2024-07-01" } },
        }),
      ),
    ).toMatchObject({
      properties: { start_date: { default: "2024-07-01" } },
    });
  });

  test("does not fill a standalone endpoint when its constraints cannot be satisfied", () => {
    const schema = shipForm("start_date", { pattern: "^2000-" });
    expect(prefill(schema)).toEqual(schema);
  });

  test.each([
    { readOnly: true },
    { const: "2024-01-01" },
    { enum: ["2024-01-01"] },
    { template: "{{other}}" },
    { watch: { other: "root.other" } },
  ])("leaves a fixed/computed standalone date untouched: %j", (fixed) => {
    const schema = shipForm("start_date", fixed);
    expect(prefill(schema)).toEqual(schema);
  });

  test.each([
    { readOnly: true },
    { const: "2024-01-01" },
    { enum: ["2024-01-01"] },
    { template: "{{other}}" },
    { watch: { other: "root.other" } },
  ])(
    "does not mistake a form with another fixed date for a singleton: %j",
    (fixed) => {
      const schema = {
        properties: {
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date", ...fixed },
        },
      };
      expect(prefill(schema)).toEqual(schema);
    },
  );

  test("does not mistake a form with another ambiguous date for a singleton", () => {
    const schema = {
      properties: {
        start_date: { type: "string", format: "date" },
        start_end_date: { type: "string" },
      },
    };
    expect(prefill(schema)).toEqual(schema);
  });

  test("does not collapse a range split across allOf fragments into two singleton defaults", () => {
    const schema = {
      allOf: [
        { properties: { start_date: { type: "string", format: "date" } } },
        { properties: { end_date: { type: "string", format: "date" } } },
      ],
    };
    expect(prefill(schema)).toEqual(schema);
  });

  test("does not count repeated declarations of the same date as different inputs", () => {
    const schema = {
      properties: { start_date: { type: "string", format: "date" } },
      allOf: [
        { properties: { start_date: { type: "string", format: "date" } } },
      ],
    };
    expect(prefill(schema)).toMatchObject({
      properties: { start_date: { default: "2024-06-01" } },
      allOf: [{ properties: { start_date: { default: "2024-06-01" } } }],
    });
  });
});
