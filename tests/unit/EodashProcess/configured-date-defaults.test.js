import { describe, expect, test } from "vitest";
import { prefillProcessDates } from "^/EodashProcess/methods/date-defaults.js";

/** @typedef {Parameters<typeof prefillProcessDates>[0]} FormSchema */

const SELECTED = "2024-01-05T12:34:56Z";
const COLLECTION = {
  extent: {
    temporal: { interval: [["2024-01-01T00:00:00Z", "2024-01-10T00:00:00Z"]] },
  },
};

/** @param {FormSchema} [overrides] @returns {FormSchema} */
const date = (overrides = {}) => ({
  type: "string",
  format: "date",
  ...overrides,
});

/** @param {FormSchema} [start] @param {FormSchema} [end] @returns {FormSchema} */
const range = (start = date(), end = date()) => ({
  type: "object",
  properties: { date_start: start, date_end: end },
});

/** @param {FormSchema} schema @returns {FormSchema} */
function prefill(schema) {
  const original = structuredClone(schema);
  const result = prefillProcessDates(schema, COLLECTION, SELECTED);
  expect(schema).toEqual(original);
  return result;
}

/** @param {FormSchema} schema @param {string} name @returns {FormSchema} */
const property = (schema, name) =>
  /** @type {FormSchema} */ (schema.properties?.[name]);

describe("configured processing dates take precedence", () => {
  test.each([
    "2000-01-01",
    "2000-01-01T01:02:03.456+02:00",
    "",
    "invalid",
    null,
    false,
    0,
  ])("preserves an explicit single-date default verbatim: %j", (value) => {
    const schema = { properties: { date: date({ default: value }) } };
    expect(prefill(schema)).toEqual(schema);
  });

  test("does not repair defaults that violate temporal or string constraints", () => {
    const schema = range(
      date({ default: "2000-01-01", minLength: 30 }),
      date({ default: "1999-01-01", pattern: "^2024" }),
    );
    expect(prefill(schema)).toEqual(schema);
  });

  test.each([{ date: "2000-01-01" }, { date: null }, { date: "" }])(
    "preserves single dates provided by the object default: %j",
    (defaults) => {
      const schema = { default: defaults, properties: { date: date() } };
      expect(prefill(schema)).toEqual(schema);
    },
  );

  test("preserves nested defaults while still initializing unrelated missing dates", () => {
    const schema = {
      default: { nested: { date: "2000-01-01" }, label: "keep" },
      properties: {
        nested: { properties: { date: date() } },
        other: { properties: { date: date() } },
      },
    };
    const result = prefill(schema);
    expect(property(property(result, "nested"), "date")).not.toHaveProperty(
      "default",
    );
    expect(property(property(result, "other"), "date").default).toBe(
      "2024-01-05",
    );
    expect(result.default).toEqual({
      nested: { date: "2000-01-01" },
      label: "keep",
      other: { date: "2024-01-05" },
    });
  });

  test.each([null, false, 0, "", [], "fixed"])(
    "does not replace an explicitly configured ancestor with a generated object: %j",
    (value) => {
      const schema = {
        default: { nested: value },
        properties: { nested: range() },
      };
      expect(prefill(schema)).toEqual(schema);
    },
  );

  test("can fill missing dates in an explicitly empty object without replacing it", () => {
    const result = prefill({ default: {}, ...range() });
    expect(result.default).toEqual({
      date_start: "2024-01-05",
      date_end: "2024-01-10",
    });
  });

  test.each(["allOf", "anyOf", "oneOf"])(
    "protects defaults in sibling %s branches at the same data path",
    (keyword) => {
      const schema = {
        [keyword]: [range(date({ default: "2024-01-02" })), range()],
      };
      const result = prefill(schema);
      const branches = /** @type {FormSchema[]} */ (
        result[/** @type {"allOf" | "anyOf" | "oneOf"} */ (keyword)]
      );
      expect(property(branches[0], "date_start").default).toBe("2024-01-02");
      expect(property(branches[1], "date_start")).not.toHaveProperty("default");
      for (const branch of branches) {
        expect(property(branch, "date_end").default).toBe("2024-01-10");
      }
    },
  );

  test.each(["allOf", "anyOf", "oneOf"])(
    "protects an outer property from a conflicting inferred default in %s",
    (keyword) => {
      const schema = {
        properties: { date: date() },
        [keyword]: [{ properties: { date: date({ default: "2000-01-01" }) } }],
      };
      expect(prefill(schema)).toEqual(schema);
    },
  );

  test.each(["allOf", "anyOf", "oneOf"])(
    "passes parent-object defaults into %s without changing either declaration",
    (keyword) => {
      const schema = {
        default: { date_start: "2000-01-01", date_end: "2000-12-31" },
        [keyword]: [range()],
      };
      expect(prefill(schema)).toEqual(schema);
    },
  );
});

describe("partially configured date ranges", () => {
  test("infers only the missing end", () => {
    const result = prefill(range(date({ default: "2024-01-02" })));
    expect(property(result, "date_start").default).toBe("2024-01-02");
    expect(property(result, "date_end").default).toBe("2024-01-10");
  });

  test("infers only the missing start", () => {
    const result = prefill(range(date(), date({ default: "2024-01-08" })));
    expect(property(result, "date_start").default).toBe("2024-01-05");
    expect(property(result, "date_end").default).toBe("2024-01-08");
  });

  test("fills a missing end in a partial object default without copying over the configured start", () => {
    const result = prefill({
      ...range(),
      default: { date_start: "2024-01-02", label: "keep" },
    });
    expect(property(result, "date_start")).not.toHaveProperty("default");
    expect(property(result, "date_end").default).toBe("2024-01-10");
    expect(result.default).toEqual({
      date_start: "2024-01-02",
      date_end: "2024-01-10",
      label: "keep",
    });
  });

  test.each(["2024-01-04", "2024-01-05", "invalid", "", null])(
    "does not infer a start that conflicts with the configured end: %j",
    (end) => {
      const schema = range(date(), date({ default: end }));
      expect(prefill(schema)).toEqual(schema);
    },
  );

  test("does not infer an end before a configured start outside the collection extent", () => {
    const schema = range(date({ default: "2025-01-01" }));
    expect(prefill(schema)).toEqual(schema);
  });

  test("does not infer an endpoint whose constraints invalidate the effective pair", () => {
    const schema = range(
      date({ default: "2024-01-05" }),
      date({ options: { inputAttributes: { max: "2024-01-04" } } }),
    );
    expect(prefill(schema)).toEqual(schema);
  });

  test("uses the higher-priority parent value to reject an invalid inferred endpoint", () => {
    const nested = range(date(), date({ default: "2024-01-08" }));
    nested.default = { date_end: "2024-01-09" };
    const schema = {
      default: { nested: { date_end: "2024-01-04" } },
      properties: { nested },
    };
    expect(prefill(schema)).toEqual(schema);
  });

  test("preserves all nested default declarations while filling a missing endpoint", () => {
    const nested = range(date({ default: "2024-01-01" }));
    nested.default = { date_start: "2024-01-03" };
    const result = prefill({
      default: { nested: { date_start: "2024-01-02" } },
      properties: { nested },
    });
    const resultNested = property(result, "nested");
    expect(property(resultNested, "date_start").default).toBe("2024-01-01");
    expect(resultNested.default).toEqual({
      date_start: "2024-01-03",
      date_end: "2024-01-10",
    });
    expect(result.default).toEqual({
      nested: { date_start: "2024-01-02", date_end: "2024-01-10" },
    });
  });

  test("keeps configured unformatted precision without imposing it on the missing endpoint", () => {
    const result = prefill(
      range(
        { type: "string", default: "2024-01-02T12:34:56.123+02:00" },
        { type: "string" },
      ),
    );
    expect(property(result, "date_start").default).toBe(
      "2024-01-02T12:34:56.123+02:00",
    );
    expect(property(result, "date_end").default).toBe("2024-01-10");
  });
});
