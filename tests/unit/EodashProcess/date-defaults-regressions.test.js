import { describe, expect, test } from "vitest";
import { prefillProcessDates } from "^/EodashProcess/methods/date-defaults.js";

/** @typedef {Parameters<typeof prefillProcessDates>[0]} FormSchema */
/** @typedef {Parameters<typeof prefillProcessDates>[1]} Collection */

/** @param {FormSchema} [overrides] @returns {FormSchema} */
const dateField = (overrides = {}) => ({
  type: "string",
  format: "date",
  default: "2000-01-01",
  ...overrides,
});

/** @param {FormSchema} [start] @param {FormSchema} [end] @returns {FormSchema} */
const rangeForm = (start = dateField(), end = dateField()) => ({
  type: "object",
  properties: { start_date: start, end_date: end },
});

/** @param {string | null} [start] @param {string | null} [end] @returns {Collection} */
const intervalCollection = (start = null, end = null) => ({
  extent: { temporal: { interval: [[start, end]] } },
  links: [
    {
      rel: "item",
      href: "first.json",
      start_datetime: "2024-01-01T00:00:00Z",
      end_datetime: "2024-01-03T00:00:00Z",
    },
    {
      rel: "item",
      href: "second.json",
      start_datetime: "2024-01-05T00:00:00Z",
      end_datetime: "2024-01-10T00:00:00Z",
    },
  ],
});

/** @param {FormSchema} result @param {string} start @param {string} end */
const expectRange = (result, start, end) =>
  expect(result).toMatchObject({
    properties: { start_date: { default: start }, end_date: { default: end } },
  });

describe("prefillProcessDates item interval regressions", () => {
  test("uses interval ends as bounds when both extent bounds are open", () => {
    expectRange(
      prefillProcessDates(
        rangeForm(),
        intervalCollection(),
        "2024-01-01T00:00:00Z",
      ),
      "2024-01-01",
      "2024-01-10",
    );
  });

  test("prefills the full interval for a single item instead of collapsing its range", () => {
    /** @type {Collection} */
    const context = {
      extent: { temporal: { interval: [[null, null]] } },
      links: [
        {
          rel: "item",
          href: "single.json",
          start_datetime: "2024-01-01T00:00:00Z",
          end_datetime: "2024-01-10T00:00:00Z",
        },
      ],
    };
    expectRange(
      prefillProcessDates(rangeForm(), context, "2024-01-05T00:00:00Z"),
      "2024-01-01",
      "2024-01-10",
    );
  });

  test("does not count interval ends as additional near-end observations", () => {
    expectRange(
      prefillProcessDates(
        rangeForm(),
        intervalCollection(),
        "2024-01-03T00:00:00Z",
      ),
      "2024-01-01",
      "2024-01-10",
    );
  });

  test("keeps an explicit closed extent inside wider item intervals", () => {
    expectRange(
      prefillProcessDates(
        rangeForm(),
        intervalCollection("2024-01-02T00:00:00Z", "2024-01-08T00:00:00Z"),
        "2024-01-03T00:00:00Z",
      ),
      "2024-01-02",
      "2024-01-08",
    );
  });

  test.each([
    [null, "2024-01-08T00:00:00Z", "2024-01-01", "2024-01-08"],
    ["2024-01-02T00:00:00Z", null, "2024-01-02", "2024-01-10"],
  ])(
    "fills only the missing bound of extent %j / %j from item intervals",
    (start, end, expectedStart, expectedEnd) => {
      expectRange(
        prefillProcessDates(
          rangeForm(),
          intervalCollection(start, end),
          "2024-01-03T00:00:00Z",
        ),
        expectedStart,
        expectedEnd,
      );
    },
  );
});

describe("prefillProcessDates formatted native bound regressions", () => {
  test("preserves fractional datetime-local minimum when clamping an earlier selection", () => {
    /** @type {FormSchema} */
    const schema = {
      type: "object",
      properties: {
        date: dateField({
          format: "datetime-local",
          default: "2000-01-01T00:00:00",
          options: { inputAttributes: { min: "2024-01-05T12:34:56.789" } },
        }),
      },
    };
    const result = prefillProcessDates(schema, null, "2024-01-02T00:00:00Z");
    expect(result).toMatchObject({
      properties: { date: { default: "2024-01-05T12:34:56.789" } },
    });
  });

  test("preserves nonzero selected milliseconds in datetime-local defaults", () => {
    /** @type {FormSchema} */
    const schema = {
      type: "object",
      properties: {
        date: dateField({ format: "datetime-local" }),
      },
    };
    expect(
      prefillProcessDates(schema, null, "2024-01-05T12:34:56.123Z"),
    ).toMatchObject({
      properties: { date: { default: "2024-01-05T12:34:56.123" } },
    });
  });

  test("preserves fractional datetime-local maximum when clamping a later selection", () => {
    /** @type {FormSchema} */
    const schema = {
      type: "object",
      properties: {
        date: dateField({
          format: "datetime-local",
          options: { inputAttributes: { max: "2024-01-05T12:34:56.789" } },
        }),
      },
    };
    const result = prefillProcessDates(schema, null, "2024-01-10T00:00:00Z");
    expect(result).toMatchObject({
      properties: { date: { default: "2024-01-05T12:34:56.789" } },
    });
  });

  test("keeps an unformatted minute-precision default when formatting would fall below min", () => {
    /** @type {FormSchema} */
    const schema = {
      type: "object",
      properties: {
        date: {
          type: "string",
          default: "2000-01-01T00:00",
          options: { inputAttributes: { min: "2024-01-05T12:34:56" } },
        },
      },
    };
    const result = prefillProcessDates(schema, null, "2024-01-02T00:00:00Z");
    expect(result).toEqual(schema);
    expect(result).toMatchObject({
      properties: { date: { default: "2000-01-01T00:00" } },
    });
  });

  test("keeps both range defaults when one formatted bound would fall below min", () => {
    const schema = rangeForm(
      {
        type: "string",
        default: "2000-01-01T00:00",
        options: { inputAttributes: { min: "2024-01-05T12:34:56" } },
      },
      {
        type: "string",
        default: "2000-01-02T00:00",
      },
    );
    /** @type {Collection} */
    const context = {
      extent: {
        temporal: {
          interval: [["2024-01-01T00:00:00Z", "2024-01-10T00:00:00Z"]],
        },
      },
    };
    const result = prefillProcessDates(schema, context, "2024-01-02T00:00:00Z");
    expect(result).toEqual(schema);
    expectRange(result, "2000-01-01T00:00", "2000-01-02T00:00");
  });

  test("preserves date-only formatting and native date bounds", () => {
    const schema = rangeForm(
      dateField({ options: { inputAttributes: { min: "2024-01-05" } } }),
      dateField({ options: { inputAttributes: { max: "2024-01-08" } } }),
    );
    /** @type {Collection} */
    const context = {
      extent: {
        temporal: {
          interval: [["2024-01-01T00:00:00Z", "2024-01-10T00:00:00Z"]],
        },
      },
    };
    expectRange(
      prefillProcessDates(schema, context, "2024-01-02T12:34:56.789Z"),
      "2024-01-05",
      "2024-01-08",
    );
  });
});
