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

/**
 * A block the reader opens only if the summary interests them. Left unindented
 * so that markdown inside it, tables above all, still renders.
 * @param {string} summary
 * @param {string[]} lines
 */
export const folded = (summary, lines) =>
  [
    `<details><summary>${summary}</summary>`,
    "",
    ...lines,
    "",
    "</details>",
  ].join("\n");

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
 * A section per test file: its findings, over a folded table of every test it
 * ran. Most tests have nothing to say, so the numbers are kept one click away
 * and the summary line says how many are worth opening the table for.
 *
 * @param {import("./index.js").Sample[]} samples
 * @param {Map<string, any>} comparable each sample's predecessor, where it has one
 * @param {import("./index.js").PerformanceReportConfig} config
 * @param {Map<string, any>} warmup
 */
export const render = (samples, comparable, config, warmup) => {
  const { columns, notes = [], sections = [], invalidReason } = config;

  const intro =
    typeof config.intro === "function" ? config.intro(samples) : config.intro;
  const lines = [`# ${config.title}`, "", intro];

  const remarks = new Map(
    samples.map((sample) => {
      const reason = invalidReason?.(sample);
      return [
        sample.key,
        [
          ...(reason ? [`Not compared: ${reason}.`] : []),
          ...notes.flatMap((note) => note(sample, comparable.get(sample.key))),
        ],
      ];
    }),
  );

  for (const [file, group] of filesOf(samples)) {
    lines.push(
      "",
      `## ${file}`,
      "",
      folded(`metrics for ${group.length} tests`, [
        row(["test", ...columns.map(({ label }) => label)]),
        row(Array(columns.length + 1).fill("---")),
        ...group.map((sample) =>
          row([
            titleOf(sample),
            ...columns.map(({ value }) => value(sample.perf)),
          ]),
        ),
      ]),
    );

    for (const sample of group) {
      const said = remarks.get(sample.key) ?? [];
      if (!said.length) continue;
      lines.push(
        "",
        `**${titleOf(sample)}**`,
        "",
        ...said.map((r) => `- ${r}`),
      );
    }
  }

  for (const section of sections) {
    const block = section(samples, comparable, warmup);
    if (block) lines.push("", block);
  }
  if (config.glossary) lines.push("", folded("Glossary", [config.glossary]));
  return [...lines, ""].join("\n");
};
