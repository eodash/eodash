/**
 * One table for the whole run, every statistic shown as previous then current.
 * Vitest prints a table per file and ranks within it, but never compares a
 * benchmark to anything outside its own group.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import colors from "tinyrainbow";

/** Matches `METRICS_ANNOTATION` in `bench.js`, which runs in the browser. */
const METRICS_ANNOTATION = "bench-metrics";

/** Written on every run; CI appends it to the step summary. */
const REPORT_FILE = "bench-report.md";
/** Beside the results, so `bench:baseline` copies it with them. */
const PROVENANCE_FILE = "provenance.json";

/**
 * Empty rather than throwing: a checkout without an `origin` should still get
 * its report.
 * @param {string[]} args
 * @returns {string}
 */
const git = (args) => {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};

/**
 * `git@github.com:owner/repo.git` and the https form both reduce to this.
 * @param {string} sha
 */
const commitUrl = (sha) => {
  const repo = git(["remote", "get-url", "origin"])
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git$/, "");
  return repo ? `${repo}/commit/${sha}` : "";
};

/** Without it a harness change reads as a code change. */
const provenance = () => {
  const sha = process.env.GITHUB_SHA || git(["rev-parse", "--short", "HEAD"]);
  return JSON.stringify({
    sha,
    url: commitUrl(sha),
    at: new Date().toISOString(),
  });
};

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
    means: "fastest sample",
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

const METRIC_COLUMNS = [
  {
    field: "requests",
    format: String,
    means: "axios calls the act made; the app's own fetches, all mocked",
  },
  {
    field: "fetches",
    format: String,
    means:
      "every request the page made, so tiles and native `fetch` count too; a zero means the browser answered from cache",
  },
  {
    field: "bytes",
    format: (value) => (value ? `${Math.round(value / 1024)}K` : "0"),
    means: "transferred over those requests",
  },
];
const METRICS_HEAD = ["benchmark", ...METRIC_COLUMNS.map(({ field }) => field)];
const UNSEEN = "new";
const SAME = "=";

/**
 * One value across every iteration, or all the values it took. A metric that
 * varied means the row did unequal work, which is worth seeing rather than
 * failing on.
 * @param {unknown[]} values
 * @param {(value: any) => string} format
 */
const toMetricCell = (values, format) => values.map(format).join(", ");

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
 */
const compareRow = (live, previous) => ({
  min: live.latency.min,
  overall: summarise(live, previous),
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
 * @param {string} referenceSuffix
 */
const compareRuns = (modules, referenceSuffix) => {
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
          rows.push(compareRow(task, previous.get(task.name)));
        }
      }
    }
  }
  return rows.sort((a, b) => a.min - b.min);
};

/** @param {{cells: string[], overall: string}} row */
const toCells = ({ cells, overall }) => [...cells, overall];

/** @param {string[][]} table its head row decides the column count */
const measure = (table) =>
  table[0].map((_, index) =>
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
  /** @param {{referenceSuffix: string, dir: string, resultsDir: string}} reference */
  constructor({ referenceSuffix, dir, resultsDir }) {
    this.referenceSuffix = referenceSuffix;
    this.baselineProvenance = `${dir}/${PROVENANCE_FILE}`;
    this.resultsProvenance = `${resultsDir}/${PROVENANCE_FILE}`;
    /** @type {{name: string, metrics: Record<string, unknown[]>}[]} */
    this.metrics = [];
  }

  /**
   * Rows report their metrics rather than asserting them, so they arrive here
   * as annotations instead of as failures.
   * @param {unknown} _testCase
   * @param {{message: string}} annotation
   */
  onTestCaseAnnotate(_testCase, annotation) {
    if (!annotation.message.includes(METRICS_ANNOTATION)) return;
    this.metrics.push(JSON.parse(annotation.message));
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
    const rows = compareRuns(modules, this.referenceSuffix);
    if (!rows.length) return;

    const widths = measure([HEAD, ...rows.map(toCells)]);

    this.ctx.logger.log("");
    this.ctx.logger.log(renderLine(HEAD, widths));
    for (const row of rows) {
      this.ctx.logger.log(renderLine(toCells(row), widths, row.overall));
    }

    const metricRows = this.metrics.map(({ name, metrics }) => [
      name,
      ...METRIC_COLUMNS.map(({ field, format }) =>
        toMetricCell(metrics[field] ?? [], format),
      ),
    ]);
    if (metricRows.length) {
      const metricWidths = measure([METRICS_HEAD, ...metricRows]);
      this.ctx.logger.log("");
      this.ctx.logger.log(renderLine(METRICS_HEAD, metricWidths));
      for (const cells of metricRows) {
        // Red where a metric took more than one value across the iterations.
        const varied = cells.slice(1).some((cell) => cell.includes(","));
        this.ctx.logger.log(
          varied
            ? colors.red(renderLine(cells, metricWidths))
            : renderLine(cells, metricWidths),
        );
      }
    }

    writeFileSync(this.resultsProvenance, provenance());
    /** @type {{sha: string, url: string, at: string} | undefined} */
    const baseline = existsSync(this.baselineProvenance)
      ? JSON.parse(readFileSync(this.baselineProvenance, "utf8"))
      : undefined;

    writeFileSync(
      REPORT_FILE,
      [
        "### Benchmarks",
        "",
        baseline
          ? `Previous run → this run. Baseline ${baseline.url ? `[\`${baseline.sha}\`](${baseline.url})` : `\`${baseline.sha}\``}, ${baseline.at}.`
          : "Previous run → this run. The baseline predates provenance, so what it measured is unknown.",
        "",
        `| ${HEAD.join(" | ")} |`,
        `| ${HEAD.map(() => "---").join(" | ")} |`,
        ...rows.map((row) => `| ${toCells(row).join(" | ")} |`),
        "",
        ...(metricRows.length
          ? [
              "Metrics, per iteration. More than one value means the row did",
              "unequal work between iterations.",
              "",
              `| ${METRICS_HEAD.join(" | ")} |`,
              `| ${METRICS_HEAD.map(() => "---").join(" | ")} |`,
              ...metricRows.map((cells) => `| ${cells.join(" | ")} |`),
              "",
            ]
          : []),
        "<details><summary>Glossary</summary>",
        "",
        "| column | meaning |",
        "| --- | --- |",
        ...COLUMNS.map(({ title, means }) => `| ${title} | ${means} |`),
        "| median Δ | change in the median (p50) when it leaves the middle two thirds of the baseline's samples; `=` inside |",
        ...METRIC_COLUMNS.map(({ field, means }) => `| ${field} | ${means} |`),
        "| | More than one value in a metric means the row did unequal work between iterations. |",
        "",
        "</details>",
        "",
      ].join("\n"),
    );
    this.ctx.logger.log(colors.dim(`  report written to ${REPORT_FILE}`));
    this.ctx.logger.log("");
  }
}
