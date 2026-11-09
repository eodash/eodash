/**
 * @typedef {import("json-schema").JSONSchema7 & {
 *   options?: { inputAttributes?: { min?: string; max?: string } };
 *   template?: unknown;
 *   watch?: unknown;
 * }} DateSchema
 * @typedef {object} TemporalCollection
 * @property {import("@eodash/stac").STACLink[]} [links]
 * @property {{ temporal?: { interval?: (string | null)[][] } }} [extent]
 * @typedef {"start" | "end" | "single" | "ambiguous"} DateRole
 * @typedef {{ name: string; schema: DateSchema; role: DateRole }} DateField
 */

const DATE_FORMATS = new Set(["date", "date-time", "datetime-local"]);
const START_WORDS = new Set(["start", "begin", "beginning", "from"]);
const END_WORDS = new Set(["end", "finish", "stop", "to"]);
const DATE_WORDS = new Set(["date", "time", "datetime"]);

/**
 * Parse ISO dates only. Zone-less datetime-local inputs use the same UTC
 * components as the dashboard, rather than the browser's local timezone.
 * @param {unknown} value
 * @returns {number | undefined}
 */
function parseDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
      value,
    )
  ) {
    return undefined;
  }
  const normalized =
    value.includes("T") && !/(?:Z|[+-]\d{2}:\d{2})$/.test(value)
      ? `${value}Z`
      : value;
  const time = Date.parse(normalized);
  // Date.parse silently rolls impossible calendar dates into the next month.
  const day = Date.parse(`${value.slice(0, 10)}T00:00:00Z`);
  if (
    !Number.isFinite(time) ||
    !Number.isFinite(day) ||
    new Date(day).toISOString().slice(0, 10) !== value.slice(0, 10)
  ) {
    return undefined;
  }
  return time;
}

/**
 * Only whole words count: runtime, timeout and weekend are not date hints.
 * Classify fixed inputs too, so they still count when detecting a single date.
 * @param {string} name
 * @param {DateSchema} schema
 * @returns {DateRole | undefined}
 */
function inferRole(name, schema) {
  if (
    schema.type !== "string" ||
    (schema.format && !DATE_FORMATS.has(schema.format))
  ) {
    return undefined;
  }
  const words = name
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const start = words.some((word) => START_WORDS.has(word));
  const end = words.some((word) => END_WORDS.has(word));
  const date = words.some((word) => DATE_WORDS.has(word));
  if (!schema.format && !date) return undefined;
  if (start && end) return "ambiguous";
  if (start) return "start";
  if (end) return "end";
  return "single";
}

/**
 * Count distinct date inputs at a data path across composed schema fragments.
 * Fixed and ambiguous date fields still prevent an apparent singleton.
 * @param {DateSchema} node
 * @param {string[]} path
 * @returns {Set<string>}
 */
function dateInputNames(node, path) {
  /** @type {Set<string>} */
  const names = new Set();
  const [name, ...rest] = path;
  if (name === undefined) {
    for (const [key, field] of Object.entries(node.properties ?? {})) {
      if (typeof field !== "boolean" && inferRole(key, field)) names.add(key);
    }
  } else {
    const field = node.properties?.[name];
    if (field && typeof field !== "boolean") {
      for (const key of dateInputNames(field, rest)) names.add(key);
    }
  }
  for (const alternatives of [node.allOf, node.anyOf, node.oneOf]) {
    for (const alternative of alternatives ?? []) {
      if (typeof alternative !== "boolean") {
        for (const key of dateInputNames(alternative, path)) names.add(key);
      }
    }
  }
  return names;
}

/**
 * @param {number} time
 * @param {DateSchema} schema
 * @returns {string}
 */
function formatDate(time, schema) {
  const iso = new Date(time).toISOString();
  if (schema.format === "datetime-local") {
    return iso.endsWith(".000Z") ? iso.slice(0, 19) : iso.slice(0, -1);
  }
  if (schema.format === "date-time") return iso;
  return iso.slice(0, 10);
}

/**
 * Respect native date input bounds and string constraints. A failed constraint
 * leaves the missing default unset, rather than generating an invalid form.
 * @param {DateSchema} schema
 * @param {number} time
 * @param {number | undefined} start
 * @param {number | undefined} end
 * @returns {string | undefined}
 */
function constrainedDate(schema, time, start, end) {
  const attributes = schema.options?.inputAttributes;
  const min = parseDate(attributes?.min);
  const max = parseDate(attributes?.max);
  if (
    (attributes?.min !== undefined && min === undefined) ||
    (attributes?.max !== undefined && max === undefined)
  ) {
    return undefined;
  }
  const lower = Math.max(start ?? -Infinity, min ?? -Infinity);
  const upper = Math.min(end ?? Infinity, max ?? Infinity);
  if (lower > upper) return undefined;
  const value = formatDate(Math.max(lower, Math.min(upper, time)), schema);
  const formattedTime = parseDate(value);
  // Formatting may reduce precision, so clamping alone cannot guarantee that
  // a generated value still satisfies the native input's date/time bounds.
  if (
    formattedTime === undefined ||
    (min !== undefined && formattedTime < min) ||
    (max !== undefined && formattedTime > max) ||
    (schema.minLength !== undefined && value.length < schema.minLength) ||
    (schema.maxLength !== undefined && value.length > schema.maxLength)
  ) {
    return undefined;
  }
  if (schema.pattern) {
    try {
      if (!new RegExp(schema.pattern).test(value)) return undefined;
    } catch {
      return undefined;
    }
  }
  return value;
}

/**
 * Find configured values at a data path, including defaults in composed schemas.
 * Parent-object defaults take precedence.
 * @param {DateSchema} node
 * @param {string[]} path
 * @returns {(import("json-schema").JSONSchema7Type | undefined)[]}
 */
function configuredDefaults(node, path) {
  if (Object.hasOwn(node, "default")) {
    let value = node.default;
    let missing = false;
    for (const name of path) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return [undefined];
      }
      if (!Object.hasOwn(value, name)) {
        missing = true;
        break;
      }
      value = value[name];
    }
    if (!missing) return [value];
  }

  /** @type {(import("json-schema").JSONSchema7Type | undefined)[]} */
  const values = [];
  const [name, ...rest] = path;
  const property = name === undefined ? undefined : node.properties?.[name];
  if (property && typeof property !== "boolean") {
    values.push(...configuredDefaults(property, rest));
  }
  for (const alternatives of [node.allOf, node.anyOf, node.oneOf]) {
    for (const alternative of alternatives ?? []) {
      if (typeof alternative !== "boolean") {
        values.push(...configuredDefaults(alternative, path));
      }
    }
  }
  return values;
}

/**
 * Object-level defaults can mask individual property defaults in JSONEditor.
 * Fill only missing entries, never replace a configured value or subtree.
 * @param {import("json-schema").JSONSchema7Object} defaults
 * @param {import("json-schema").JSONSchema7Object} dates
 * @returns {import("json-schema").JSONSchema7Object}
 */
function fillMissingDefaults(defaults, dates) {
  for (const [name, value] of Object.entries(dates)) {
    if (!Object.hasOwn(defaults, name)) {
      defaults[name] = value;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const previous = defaults[name];
      if (
        previous &&
        typeof previous === "object" &&
        !Array.isArray(previous)
      ) {
        fillMissingDefaults(previous, value);
      }
    }
  }
  return defaults;
}

/**
 * Prefill missing processing date defaults on a cloned schema. Explicit schema
 * defaults and ambiguous sibling fields are untouched. Nested objects and
 * explicit alternative schemas are examined; references and array item defaults
 * are not expanded.
 *
 * @param {DateSchema} schema
 * @param {TemporalCollection | null | undefined} collection
 * @param {string} selectedDatetime
 * @returns {DateSchema}
 */
export function prefillProcessDates(schema, collection, selectedDatetime) {
  const form = /** @type {DateSchema} */ (JSON.parse(JSON.stringify(schema)));
  const selected = parseDate(selectedDatetime);
  if (selected === undefined) return form;

  const itemLinks = (collection?.links ?? []).filter(
    (link) => link.rel === "item",
  );
  // One representative timestamp per item is used for near-end detection.
  const times = [
    ...new Set(
      itemLinks
        .map((link) =>
          parseDate(link.datetime ?? link.start_datetime ?? link.end_datetime),
        )
        .filter((time) => time !== undefined),
    ),
  ];
  // Extent fallback includes both ends of item intervals, without counting an
  // interval's end as another observation in the near-end heuristic.
  const itemBounds = itemLinks
    .flatMap((link) => [link.datetime, link.start_datetime, link.end_datetime])
    .map(parseDate)
    .filter((time) => time !== undefined)
    .sort((a, b) => a - b);
  const interval = collection?.extent?.temporal?.interval?.[0];
  const start = parseDate(interval?.[0]) ?? itemBounds[0];
  const end = parseDate(interval?.[1]) ?? itemBounds.at(-1);
  if (start !== undefined && end !== undefined && start > end) return form;
  const current = Math.max(
    start ?? -Infinity,
    Math.min(end ?? Infinity, selected),
  );
  const available = times.filter(
    (time) => time >= (start ?? -Infinity) && time <= (end ?? Infinity),
  );
  // Without enumerated observations, only an actually collapsed range is
  // known to be too short; do not invent a frequency or a day-count threshold.
  const nearEnd =
    end !== undefined &&
    (current >= end ||
      (available.length > 0 &&
        available.filter((time) => time >= current).length < 2));

  /**
   * @param {DateSchema} node
   * @param {string[]} path
   * @returns {import("json-schema").JSONSchema7Object}
   */
  function visit(node, path) {
    /** @type {import("json-schema").JSONSchema7Object} */
    const dates = {};
    /** @type {DateField[]} */
    const fields = [];
    for (const [name, property] of Object.entries(node.properties ?? {})) {
      if (typeof property === "boolean") continue;
      const field = /** @type {DateSchema} */ (property);
      const role = inferRole(name, field);
      if (
        role &&
        role !== "ambiguous" &&
        !field.readOnly &&
        field.const === undefined &&
        !field.enum &&
        !field.template &&
        !field.watch
      ) {
        fields.push({ name, schema: field, role });
      }
      const nestedDates = visit(field, [...path, name]);
      if (Object.keys(nestedDates).length) dates[name] = nestedDates;
    }
    const starts = fields.filter((field) => field.role === "start");
    const ends = fields.filter((field) => field.role === "end");
    if (
      starts.length === 1 &&
      ends.length === 1 &&
      start !== undefined &&
      end !== undefined
    ) {
      const firstDefaults = configuredDefaults(schema, [
        ...path,
        starts[0].name,
      ]);
      const lastDefaults = configuredDefaults(schema, [...path, ends[0].name]);
      const first = firstDefaults.length
        ? undefined
        : constrainedDate(
            starts[0].schema,
            nearEnd ? start : current,
            start,
            end,
          );
      const last = lastDefaults.length
        ? undefined
        : constrainedDate(ends[0].schema, end, start, end);
      const firstTimes = (firstDefaults.length ? firstDefaults : [first]).map(
        parseDate,
      );
      const lastTimes = (lastDefaults.length ? lastDefaults : [last]).map(
        parseDate,
      );
      // Validate the effective pair without clamping configured endpoints
      if (
        firstTimes.every(
          (firstTime) =>
            firstTime !== undefined &&
            lastTimes.every(
              (lastTime) => lastTime !== undefined && firstTime < lastTime,
            ),
        )
      ) {
        if (first !== undefined) {
          starts[0].schema.default = first;
          dates[starts[0].name] = first;
        }
        if (last !== undefined) {
          ends[0].schema.default = last;
          dates[ends[0].name] = last;
        }
      }
    } else if (
      fields.length === 1 &&
      dateInputNames(schema, path).size === 1 &&
      !configuredDefaults(schema, [...path, fields[0].name]).length
    ) {
      const value = constrainedDate(fields[0].schema, current, start, end);
      if (value) {
        fields[0].schema.default = value;
        dates[fields[0].name] = value;
      }
    }
    if (
      node.default &&
      typeof node.default === "object" &&
      !Array.isArray(node.default)
    ) {
      fillMissingDefaults(node.default, dates);
    }
    for (const alternatives of [node.allOf, node.anyOf, node.oneOf]) {
      for (const alternative of alternatives ?? []) {
        if (typeof alternative !== "boolean") visit(alternative, path);
      }
    }
    return dates;
  }

  visit(form, []);
  return form;
}
