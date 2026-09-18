/**
 * One table for the whole run, every statistic shown as previous then current.
 * Vitest prints a table per file and ranks within it, but never compares a
 * benchmark to anything outside its own group.
 */
import { writeFileSync } from "node:fs";
import colors from "tinyrainbow";

/** Written on every run; CI appends it to the step summary. */
const REPORT_FILE = "bench-report.md";

const oneDecimal = (value) => value.toFixed(1);

const COLUMNS = [
  {
    title: "hz",
    read: (t) => t.throughput.mean,
    format: oneDecimal,
    means: "runs per second",
  },
  {
    title: "min",
    read: (t) => t.latency.min,
    format: oneDecimal,
    means: "fastest sample; what the floor is checked against",
  },
  {
    title: "p50",
    read: (t) => t.latency.p50,
    format: oneDecimal,
    means: "median; what the last column compares",
  },
  {
    title: "mean",
    read: (t) => t.latency.mean,
    format: oneDecimal,
    means: "average",
  },
  {
    title: "p75",
    read: (t) => t.latency.p75,
    format: oneDecimal,
    means: "75th percentile",
  },
  {
    title: "p99",
    read: (t) => t.latency.p99,
    format: oneDecimal,
    means: "99th percentile",
  },
  {
    title: "rme",
    read: (t) => t.latency.rme,
    format: (v) => `±${v.toFixed(2)}%`,
    means: "relative margin of error",
  },
  {
    title: "samples",
    read: (t) => t.latency.samplesCount,
    format: String,
    means: "timed iterations",
  },
];

const HEAD = ["benchmark", ...COLUMNS.map(({ title }) => title), "median Δ"];
const UNSEEN = "new";
const SAME = "=";

/**
 * The live median against the middle two thirds of the baseline's samples. A
 * margin of error narrows with every added iteration; this band is the row's
 * own spread and holds still.
 * @param {any} live
 * @param {any} [previous]
 */
const summarise = (live, previous) => {
  const samples = previous?.latency.samples;
  if (!samples?.length) return UNSEEN;
  const sorted = [...samples].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length / 6)];
  const high = sorted[Math.ceil((5 * sorted.length) / 6) - 1];
  const { p50 } = live.latency;
  if (p50 >= low && p50 <= high) return SAME;
  const percent = ((p50 - previous.latency.p50) / previous.latency.p50) * 100;
  if (!Number.isFinite(percent)) return UNSEEN;
  return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
};

/**
 * A stored `Infinity` round-trips through JSON as `null`, so the same degenerate
 * benchmark prints live and throws when read back.
 * @param {any} task
 * @param {{read: (task: any) => number, format: (value: number) => string}} column
 */
const toCell = (task, { read, format }) => {
  const value = read(task);
  return Number.isFinite(value) ? format(value) : "—";
};

/**
 * @param {any} live
 * @param {any} previous
 * @param {boolean} isUnderFloor no verdict: the reading is poll granularity
 */
const compareRow = (live, previous, isUnderFloor) => ({
  min: live.latency.min,
  overall: isUnderFloor ? "" : summarise(live, previous),
  cells: [
    live.name,
    ...COLUMNS.map((column) =>
      previous
        ? `${toCell(previous, column)} → ${toCell(live, column)}`
        : toCell(live, column),
    ),
  ],
});

/**
 * Every live benchmark beside the stored one of the same name, fastest first.
 * @param {ReadonlyArray<import("vitest/node").TestModule>} modules
 * @param {{referenceSuffix: string, underFloorSuffix: string}} suffixes
 */
const compareRuns = (modules, { referenceSuffix, underFloorSuffix }) => {
  const rows = [];
  for (const module of modules) {
    for (const test of module.children.allTests()) {
      for (const { tasks } of test.benchmarks()) {
        const previous = new Map(
          tasks
            .filter((task) => task.fromStore)
            .map((task) => [task.name.slice(0, -referenceSuffix.length), task]),
        );
        for (const task of tasks) {
          if (task.fromStore) continue;
          rows.push(
            compareRow(
              task,
              previous.get(task.name),
              task.name.endsWith(underFloorSuffix),
            ),
          );
        }
      }
    }
  }
  return rows.sort((a, b) => a.min - b.min);
};

/** @param {{cells: string[], overall: string}} row */
const toCells = ({ cells, overall }) => [...cells, overall];

/** @param {string[][]} table */
const measure = (table) =>
  HEAD.map((_, index) =>
    Math.max(...table.map((cells) => cells[index].length)),
  );

/** @param {string} overall */
const paint = (overall) => {
  if (overall.startsWith("+")) return colors.red(overall);
  if (overall.startsWith("-")) return colors.green(overall);
  return overall;
};

/**
 * Padded before painting, because escape codes count toward `length` and would
 * silently narrow the column.
 * @param {string[]} cells
 * @param {number[]} widths
 * @param {string} [overall] the last cell, coloured
 */
const renderLine = (cells, widths, overall) => {
  const padded = cells.map((cell, index) =>
    index === 0 ? cell.padEnd(widths[index]) : cell.padStart(widths[index]),
  );
  const last = padded.length - 1;
  if (overall) padded[last] = padded[last].replace(overall, paint(overall));
  return `  ${padded.join("  ").trimEnd()}`;
};

export class BenchReporter {
  /** @param {{referenceSuffix: string, underFloorSuffix: string}} reference */
  constructor({ referenceSuffix, underFloorSuffix }) {
    this.suffixes = { referenceSuffix, underFloorSuffix };
  }

  /** @param {import("vitest/node").Vitest} vitest */
  onInit(vitest) {
    this.ctx = vitest;
  }

  /**
   * @param {ReadonlyArray<import("vitest/node").TestModule>} modules
   * @param {ReadonlyArray<any>} _errors
   * @param {string} reason
   */
  onTestRunEnd(modules, _errors, reason) {
    if (reason === "interrupted") return;
    const rows = compareRuns(modules, this.suffixes);
    if (!rows.length) return;

    const widths = measure([HEAD, ...rows.map(toCells)]);

    this.ctx.logger.log("");
    this.ctx.logger.log(renderLine(HEAD, widths));
    for (const row of rows) {
      this.ctx.logger.log(renderLine(toCells(row), widths, row.overall));
    }

    writeFileSync(
      REPORT_FILE,
      [
        "### Benchmarks",
        "",
        "Previous run → this run.",
        "",
        `| ${HEAD.join(" | ")} |`,
        `| ${HEAD.map(() => "---").join(" | ")} |`,
        ...rows.map((row) => `| ${toCells(row).join(" | ")} |`),
        "",
        "<details><summary>Glossary</summary>",
        "",
        "| column | meaning |",
        "| --- | --- |",
        ...COLUMNS.map(({ title, means }) => `| ${title} | ${means} |`),
        "| median Δ | change in the median when it leaves the middle two thirds of the baseline's samples; `=` inside; blank under the floor |",
        "",
        "</details>",
        "",
      ].join("\n"),
    );
    this.ctx.logger.log(colors.dim(`  report written to ${REPORT_FILE}`));
    this.ctx.logger.log("");
  }
}
