import { SEPARATOR } from "./baseline.js";

/**
 * Two significant figures. Measurements jitter by a few percent between runs of
 * the same code, so carrying more digits would make every report differ from
 * the last one everywhere, and hide the places that genuinely moved.
 * @param {number} value
 */
const twoFigures = (value) => {
  const scale = 10 ** Math.max(0, Math.floor(Math.log10(value)) - 1);
  return Math.round(value / scale) * scale;
};

/**
 * A rounded value in a larger unit, keeping one decimal below ten so that
 * dividing does not cost a figure: 9,600,000 reads as 9.6 MB, not 10 MB.
 * @param {number} value
 * @param {string} unit
 */
const inUnit = (value, unit) => `${value.toFixed(value < 10 ? 1 : 0)} ${unit}`;

/** @param {number} [ms] */
export const time = (ms) => {
  if (!ms || ms < 1) return "0";
  const rounded = twoFigures(ms);
  return rounded >= 1000 ? inUnit(rounded / 1000, "s") : `${rounded} ms`;
};

/** @param {number} [bytes] Negative where a test released more than it kept. */
export const size = (bytes) => {
  if (!bytes) return "0";
  const rounded = twoFigures(Math.abs(bytes));
  const printed =
    rounded >= 1e6
      ? inUnit(rounded / 1e6, "MB")
      : rounded >= 1e3
        ? inUnit(rounded / 1e3, "KB")
        : `${rounded} B`;
  return bytes < 0 ? `-${printed}` : printed;
};

/** Folded away under a note, since only one line of a trace is ever the answer.
 * @param {string[]} [lines] */
export const foldout = (lines = []) =>
  lines.length > 1
    ? `\n  <details><summary>trace</summary>\n\n${lines
        .map((line) => `  - \`${line}\``)
        .join("\n")}\n\n  </details>`
    : "";

/** @param {string[]} cells */
const row = (cells) => `| ${cells.join(" | ")} |`;

/** @param {import("./index.js").Sample} sample */
const titleOf = (sample) =>
  sample.key.split(SEPARATOR).slice(1).join(SEPARATOR);

/**
 * Samples grouped by the file they came from, in the order they arrived.
 * @param {import("./index.js").Sample[]} samples
 */
const filesOf = (samples) => {
  /** @type {Map<string, import("./index.js").Sample[]>} */
  const files = new Map();
  for (const sample of samples) {
    const [file] = sample.key.split(SEPARATOR);
    files.set(file, [...(files.get(file) ?? []), sample]);
  }
  return files;
};

/**
 * A section per test file: a table of its tests, then whatever the config has
 * to say about them underneath. Notes are only rendered where a config produces
 * them, so a table standing alone means nothing was found in that file.
 *
 * @param {import("./index.js").Sample[]} samples
 * @param {Map<string, any>} previous
 * @param {import("./index.js").PerformanceReportConfig} config
 * @param {Map<string, any>} warmup
 */
export const render = (samples, previous, config, warmup) => {
  const { columns, notes = [], sections = [], invalidReason } = config;
  // A sample the config calls invalid has no comparable predecessor, so nothing
  // downstream can diff it by accident.
  const comparable = new Map(
    samples
      .filter((sample) => !invalidReason?.(sample))
      .map(
        (sample) =>
          /** @type {[string, any]} */ ([sample.key, previous.get(sample.key)]),
      )
      .filter(([, perf]) => perf),
  );

  const intro =
    typeof config.intro === "function" ? config.intro(samples) : config.intro;
  const lines = [`# ${config.title}`, "", intro];

  for (const [file, group] of filesOf(samples)) {
    lines.push(
      "",
      `## ${file}`,
      "",
      row(["test", ...columns.map(({ label }) => label)]),
      row(Array(columns.length + 1).fill("---")),
      ...group.map((sample) =>
        row([
          titleOf(sample),
          ...columns.map(({ value }) => value(sample.perf)),
        ]),
      ),
    );

    for (const sample of group) {
      const reason = invalidReason?.(sample);
      const remarks = [
        ...(reason ? [`Not compared: ${reason}.`] : []),
        ...notes.flatMap((note) => note(sample, comparable.get(sample.key))),
      ];
      if (remarks.length) {
        lines.push(
          "",
          `**${titleOf(sample)}**`,
          "",
          ...remarks.map((r) => `- ${r}`),
        );
      }
    }
  }

  for (const section of sections) {
    const block = section(samples, comparable, warmup);
    if (block) lines.push("", block);
  }
  if (config.glossary) lines.push("", "## Glossary", "", config.glossary);
  return [...lines, ""].join("\n");
};
