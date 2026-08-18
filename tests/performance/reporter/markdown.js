import { SEPARATOR } from "./baseline.js";

/**
 * Two significant figures. Timings jitter by a few percent between runs and the
 * file is committed, so printing every millisecond would make each run a diff.
 * @param {number} [ms]
 */
export const time = (ms) => {
  if (!ms || ms < 1) return "0";
  const scale = 10 ** Math.max(0, Math.floor(Math.log10(ms)) - 1);
  const rounded = Math.round(ms / scale) * scale;
  return rounded >= 1000
    ? `${(rounded / 1000).toFixed(rounded < 10_000 ? 1 : 0)} s`
    : `${rounded} ms`;
};

/** Rounded for the same reason as {@link time}. @param {number} [bytes] */
export const size = (bytes) => {
  if (!bytes) return "0";
  const magnitude = Math.abs(bytes);
  const rounded =
    magnitude >= 1e6
      ? `${Math.round(magnitude / 1e6)} MB`
      : `${Math.round(magnitude / 1e3)} KB`;
  return bytes < 0 ? `-${rounded}` : rounded;
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
 */
export const render = (samples, previous, config) => {
  const { columns, notes = [], sections = [], invalidReason } = config;
  // A sample the config calls invalid has no comparable predecessor, so nothing
  // downstream can diff it by accident.
  const comparable = new Map(
    //@ts-expect-error todo
    samples
      .filter((sample) => !invalidReason?.(sample))
      .map((sample) => [sample.key, previous.get(sample.key)])
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
    const block = section(samples, comparable);
    if (block) lines.push("", block);
  }
  if (config.glossary) lines.push("", "## Glossary", "", config.glossary);
  return [...lines, ""].join("\n");
};
