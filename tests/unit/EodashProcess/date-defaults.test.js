import { describe, expect, test } from "vitest";
import { prefillProcessDates } from "^/EodashProcess/methods/date-defaults.js";

/** @typedef {Parameters<typeof prefillProcessDates>[0]} FormSchema */
/** @typedef {Parameters<typeof prefillProcessDates>[1]} Collection */

const START = "2024-01-01T00:00:00.000Z";
const SELECTED = "2024-01-05T12:34:56.000Z";
const END = "2024-01-10T00:00:00.000Z";

/** @param {FormSchema} [overrides] @returns {FormSchema} */
const dateField = (overrides = {}) => ({
  type: "string",
  format: "date",
  ...overrides,
});

/** @param {Record<string, FormSchema>} properties @returns {FormSchema} */
const objectForm = (properties) => ({ type: "object", properties });

/** @param {FormSchema} [start] @param {FormSchema} [end] */
const rangeForm = (start = dateField(), end = dateField()) =>
  objectForm({ start_date: start, end_date: end });

/** @param {string | null} [start] @param {string | null} [end] @returns {Collection} */
const collection = (start = START, end = END) => ({
  extent: { temporal: { interval: [[start, end]] } },
});

/** @param {string[]} dates @returns {Collection} */
const itemCollection = (dates) => ({
  links: dates.map((datetime) => ({
    rel: "item",
    href: "item.json",
    datetime,
  })),
});

/** @param {FormSchema} actual @param {string} start @param {string} end */
const expectRange = (actual, start, end) =>
  expect(actual).toMatchObject({
    properties: { start_date: { default: start }, end_date: { default: end } },
  });

describe("prefillProcessDates field recognition", () => {
  test.each([
    ["start_date", "end_date"],
    ["startDate", "endDate"],
    ["START_DATE", "END_DATE"],
    ["begin_time", "finish_time"],
    ["beginningDate", "stopDate"],
    ["from", "to"],
    ["from-date", "to-date"],
  ])("recognizes the %s / %s date pair", (startName, endName) => {
    const result = prefillProcessDates(
      objectForm({ [startName]: dateField(), [endName]: dateField() }),
      collection(),
      SELECTED,
    );
    expect(result).toMatchObject({
      properties: {
        [startName]: { default: "2024-01-05" },
        [endName]: { default: "2024-01-10" },
      },
    });
  });

  test.each([
    ["date", "2024-01-05", "2024-01-10"],
    ["date-time", SELECTED, END],
    ["datetime-local", "2024-01-05T12:34:56", "2024-01-10T00:00:00"],
  ])("formats %s defaults", (format, start, end) => {
    expectRange(
      prefillProcessDates(
        rangeForm(dateField({ format }), dateField({ format })),
        collection(),
        SELECTED,
      ),
      start,
      end,
    );
  });

  test("infers date-only defaults for unformatted date-named fields", () => {
    expectRange(
      prefillProcessDates(
        rangeForm({ type: "string" }, { type: "string" }),
        collection(),
        SELECTED,
      ),
      "2024-01-05",
      "2024-01-10",
    );
  });

  test.each([
    "2000-01-01",
    "2000-01-01T00:00",
    "2000-01-01T00:00:00",
    "2000-01-01T01:00:00+01:00",
  ])(
    "preserves an explicit unformatted date default exactly: %s",
    (original) => {
      const schema = rangeForm(
        { type: "string", default: original },
        { type: "string", default: original },
      );
      const result = prefillProcessDates(schema, collection(), SELECTED);
      expect(result).toEqual(schema);
      expectRange(result, original, original);
    },
  );

  test("uses a recognized single date field without requiring a range", () => {
    expect(
      prefillProcessDates(
        objectForm({ acquisition: dateField() }),
        collection(),
        SELECTED,
      ),
    ).toMatchObject({ properties: { acquisition: { default: "2024-01-05" } } });
  });

  test.each(["runtime", "timeout", "weekend", "candidate", "start", "end"])(
    "does not infer an unformatted date from %s",
    (name) => {
      const schema = objectForm({
        [name]: { type: "string" },
      });
      expect(prefillProcessDates(schema, collection(), SELECTED)).toEqual(
        schema,
      );
    },
  );

  test.each([
    { type: "number" },
    { format: "email" },
    { format: "uri" },
    { readOnly: true },
    { const: "2000-01-01" },
    { enum: ["2000-01-01", "2000-01-02"] },
    { template: "{{other}}" },
    { watch: { other: "root.date" } },
  ])("leaves fixed, computed, and non-date fields alone: %j", (overrides) => {
    const schema = objectForm({
      date: dateField(/** @type {FormSchema} */ (overrides)),
    });
    expect(prefillProcessDates(schema, collection(), SELECTED)).toEqual(schema);
  });

  test.each([
    { start_date: dateField(), from_date: dateField(), end_date: dateField() },
    {
      start_date: dateField(),
      end_date: dateField(),
      finish_date: dateField(),
    },
    { first_date: dateField(), second_date: dateField() },
    { start_end_date: dateField() },
    { start_date: dateField() },
    { end_date: dateField() },
  ])(
    "leaves ambiguous or incomplete date roles unchanged: %j",
    (properties) => {
      const schema = objectForm(properties);
      expect(prefillProcessDates(schema, collection(), SELECTED)).toEqual(
        schema,
      );
    },
  );
});

describe("prefillProcessDates schema traversal", () => {
  test("preserves root and nested object defaults instead of inferring conflicting property defaults", () => {
    const schema = {
      ...rangeForm(),
      default: {
        start_date: "2001-01-01",
        end_date: "2001-01-02",
        label: "root label",
        nested: {
          start_date: "2002-01-01",
          end_date: "2002-01-02",
          label: "parent nested label",
        },
      },
      properties: {
        ...rangeForm().properties,
        label: { type: "string", default: "property label" },
        nested: {
          ...rangeForm(),
          default: {
            start_date: "2003-01-01",
            end_date: "2003-01-02",
            label: "nested label",
          },
        },
      },
    };
    const original = structuredClone(schema);
    const result = prefillProcessDates(
      /** @type {FormSchema} */ (schema),
      collection(),
      SELECTED,
    );

    expect(result).toEqual(original);
    expect(schema).toEqual(original);
  });

  test("treats nested objects independently and preserves unrelated fields", () => {
    const schema = objectForm({
      primary: rangeForm(),
      secondary: rangeForm(),
      label: { type: "string", default: "keep" },
    });
    expect(prefillProcessDates(schema, collection(), SELECTED)).toMatchObject({
      properties: {
        primary: {
          properties: {
            start_date: { default: "2024-01-05" },
            end_date: { default: "2024-01-10" },
          },
        },
        secondary: {
          properties: {
            start_date: { default: "2024-01-05" },
            end_date: { default: "2024-01-10" },
          },
        },
        label: { default: "keep" },
      },
    });
  });

  test.each(["allOf", "anyOf", "oneOf"])(
    "handles %s branches independently",
    (keyword) => {
      const schema = { [keyword]: [rangeForm(), rangeForm(), true] };
      const result = prefillProcessDates(schema, collection(), SELECTED);
      expect(result).toMatchObject({
        [keyword]: [
          {
            properties: {
              start_date: { default: "2024-01-05" },
              end_date: { default: "2024-01-10" },
            },
          },
          {
            properties: {
              start_date: { default: "2024-01-05" },
              end_date: { default: "2024-01-10" },
            },
          },
          true,
        ],
      });
    },
  );

  test("does not expand references, definitions, array items, or boolean properties", () => {
    const schema = {
      type: "object",
      properties: {
        allowed: true,
        blocked: false,
        referenced: { $ref: "#/definitions/range" },
        entries: { type: "array", items: rangeForm() },
      },
      definitions: { range: rangeForm() },
    };
    expect(
      prefillProcessDates(
        /** @type {FormSchema} */ (schema),
        collection(),
        SELECTED,
      ),
    ).toEqual(schema);
  });
});

describe("prefillProcessDates temporal context", () => {
  test.each([undefined, null])(
    "adds no defaults for missing selected datetime %j",
    (selected) => {
      const schema = rangeForm();
      // @ts-expect-error Missing runtime inputs must be ignored despite the required signature.
      expect(prefillProcessDates(schema, collection(), selected)).toEqual(
        schema,
      );
    },
  );

  test.each([
    "",
    "invalid",
    "2024-02-30",
    "2024-13-01",
    "2024-01-01T25:00:00Z",
  ])("adds no defaults for invalid selected datetime %s", (selected) => {
    const schema = rangeForm();
    expect(prefillProcessDates(schema, collection(), selected)).toEqual(schema);
  });

  test.each([
    undefined,
    null,
    {},
    { extent: { temporal: { interval: [[null, null]] } } },
  ])("leaves a range unchanged without usable bounds: %j", (context) => {
    const schema = rangeForm();
    expect(prefillProcessDates(schema, context, SELECTED)).toEqual(schema);
  });

  test("can prefill a single date without a collection", () => {
    expect(
      prefillProcessDates(objectForm({ date: dateField() }), null, SELECTED),
    ).toMatchObject({
      properties: { date: { default: "2024-01-05" } },
    });
  });

  test("rejects a reversed extent", () => {
    const schema = rangeForm();
    expect(
      prefillProcessDates(schema, collection(END, START), SELECTED),
    ).toEqual(schema);
  });

  test.each([
    ["2023-12-01", "2024-01-01"],
    [END, "2024-01-01"],
    ["2024-02-01", "2024-01-01"],
    ["2024-01-09", "2024-01-09"],
  ])(
    "clamps or expands the range for selected %s",
    (selected, expectedStart) => {
      expectRange(
        prefillProcessDates(rangeForm(), collection(), selected),
        expectedStart,
        "2024-01-10",
      );
    },
  );

  test.each([
    [null, null],
    ["invalid", "invalid"],
    ["2024-02-30", "2024-13-01"],
  ])(
    "falls back from missing or invalid bounds %j / %j to item links",
    (start, end) => {
      const context = {
        ...collection(start, end),
        ...itemCollection([START, SELECTED, END]),
      };
      expectRange(
        prefillProcessDates(rangeForm(), context, SELECTED),
        "2024-01-05",
        "2024-01-10",
      );
    },
  );

  test.each([
    [null, END],
    [START, null],
  ])("fills the open side of extent %j / %j from links", (start, end) => {
    const context = {
      ...collection(start, end),
      ...itemCollection([START, SELECTED, END]),
    };
    expectRange(
      prefillProcessDates(rangeForm(), context, SELECTED),
      "2024-01-05",
      "2024-01-10",
    );
  });

  test("sorts item dates and ignores invalid dates and non-item links", () => {
    const context = itemCollection([
      END,
      "invalid",
      SELECTED,
      START,
      "2024-02-30",
    ]);
    context?.links?.push({
      rel: "child",
      href: "child.json",
      datetime: "2050-01-01",
    });
    expectRange(
      prefillProcessDates(rangeForm(), context, SELECTED),
      "2024-01-05",
      "2024-01-10",
    );
  });

  test("uses start_datetime and end_datetime item-link metadata", () => {
    const context = {
      links: [
        { rel: "item", href: "first.json", start_datetime: START },
        { rel: "item", href: "last.json", end_datetime: END },
      ],
    };
    expectRange(
      prefillProcessDates(rangeForm(), context, START),
      "2024-01-01",
      "2024-01-10",
    );
  });

  test("deduplicates equivalent item timestamps before deciding fewer than two remain", () => {
    const context = itemCollection([
      START,
      END,
      "2024-01-10T01:00:00+01:00",
      END,
    ]);
    expectRange(
      prefillProcessDates(rangeForm(), context, SELECTED),
      "2024-01-01",
      "2024-01-10",
    );
  });

  test("retains the selected start when exactly two observations remain", () => {
    expectRange(
      prefillProcessDates(
        rangeForm(),
        itemCollection([END, SELECTED, START]),
        SELECTED,
      ),
      "2024-01-05",
      "2024-01-10",
    );
  });

  test("ignores observations outside the declared extent for near-end detection", () => {
    const context = {
      ...collection(),
      ...itemCollection([START, "2024-01-20", END]),
    };
    expectRange(
      prefillProcessDates(rangeForm(), context, SELECTED),
      "2024-01-01",
      "2024-01-10",
    );
  });

  test("does not invent a near-end threshold without observations", () => {
    expectRange(
      prefillProcessDates(rangeForm(), collection(), "2024-01-09T23:59:00Z"),
      "2024-01-09",
      "2024-01-10",
    );
  });

  test("normalizes timezone offsets and zone-less selected datetimes", () => {
    const schema = rangeForm(
      dateField({ format: "date-time" }),
      dateField({ format: "date-time" }),
    );
    expectRange(
      prefillProcessDates(schema, collection(), "2024-01-05T13:34:56+01:00"),
      SELECTED,
      END,
    );
    expectRange(
      prefillProcessDates(schema, collection(), "2024-01-05T12:34:56"),
      SELECTED,
      END,
    );
  });
});

describe("prefillProcessDates constraints and immutability", () => {
  test("respects native input bounds on both range fields", () => {
    const schema = rangeForm(
      dateField({ options: { inputAttributes: { min: "2024-01-06" } } }),
      dateField({ options: { inputAttributes: { max: "2024-01-08" } } }),
    );
    expectRange(
      prefillProcessDates(schema, collection(), SELECTED),
      "2024-01-06",
      "2024-01-08",
    );
  });

  test.each([
    { options: { inputAttributes: { min: "invalid" } } },
    { options: { inputAttributes: { max: "invalid" } } },
    { options: { inputAttributes: { min: "2024-01-11" } } },
    { options: { inputAttributes: { min: "2024-01-08", max: "2024-01-06" } } },
    { minLength: 11 },
    { maxLength: 9 },
    { pattern: "^2000-" },
    { pattern: "[" },
  ])(
    "adds neither default when a field constraint cannot be satisfied: %j",
    (constraint) => {
      const schema = rangeForm(dateField(constraint));
      expect(prefillProcessDates(schema, collection(), SELECTED)).toEqual(
        schema,
      );
    },
  );

  test("accepts satisfied string constraints", () => {
    const field = dateField({
      minLength: 10,
      maxLength: 10,
      pattern: "^2024-01-\\d{2}$",
    });
    expectRange(
      prefillProcessDates(rangeForm(field, field), collection(), SELECTED),
      "2024-01-05",
      "2024-01-10",
    );
  });

  test.each(["2024-01-05", "2024-01-04"])(
    "does not collapse or invert a constrained range ending %s",
    (max) => {
      const schema = rangeForm(
        dateField(),
        dateField({ options: { inputAttributes: { max } } }),
      );
      expect(prefillProcessDates(schema, collection(), SELECTED)).toEqual(
        schema,
      );
    },
  );

  test("does not collapse a date-only range when distinct timestamps share a day", () => {
    const schema = rangeForm();
    expect(
      prefillProcessDates(
        schema,
        collection(START, "2024-01-05T23:00:00Z"),
        SELECTED,
      ),
    ).toEqual(schema);
  });

  test("clamps a single date to its input bounds", () => {
    const schema = objectForm({
      date: dateField({ options: { inputAttributes: { max: "2024-01-03" } } }),
    });
    expect(prefillProcessDates(schema, collection(), SELECTED)).toMatchObject({
      properties: { date: { default: "2024-01-03" } },
    });
  });

  test("returns an independent deep clone without mutating either input", () => {
    const schema = rangeForm(
      dateField({ options: { inputAttributes: { min: "2024-01-02" } } }),
    );
    const context = {
      ...collection(),
      ...itemCollection([END, START, SELECTED, END]),
    };
    const originalSchema = structuredClone(schema);
    const originalContext = structuredClone(context);
    const result = prefillProcessDates(schema, context, SELECTED);
    expectRange(result, "2024-01-05", "2024-01-10");
    expect(schema).toEqual(originalSchema);
    expect(context).toEqual(originalContext);
    expect(result).not.toBe(schema);
    expect(result.properties).not.toBe(schema.properties);
    expect(result.properties?.start_date).not.toBe(
      schema.properties?.start_date,
    );
  });

  test("also clones the schema when selected datetime is invalid", () => {
    const schema = rangeForm();
    const result = prefillProcessDates(schema, collection(), "invalid");
    expect(result).toEqual(schema);
    expect(result).not.toBe(schema);
    expect(result.properties).not.toBe(schema.properties);
  });
});
