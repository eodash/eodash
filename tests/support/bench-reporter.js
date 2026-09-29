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
/** Beside the results, so `bench:baseline` copies them with the rows. */
const PROVENANCE_FILE = "provenance.json";
const METRICS_FILE = "metrics.json";

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

/** @param {number} value */
const kilobytes = (value) => (value ? `${Math.round(value / 1024)}K` : "0");

const METRIC_COLUMNS = [
  {
    field: "requests",
    format: String,
    means:
      "requests the application issued through its HTTP client per run; the tests resolve them from fixtures (`mocked`), so nothing is transferred",
  },
  {
    field: "fetches",
    format: String,
    means:
      "requests the browser issued over the network per run: tiles, data files, anything the tests do not intercept",
  },
  {
    field: "bytes",
    format: kilobytes,
    means:
      "encoded body size of the responses; 0 where the origin sends no `timing-allow-origin` header",
  },
];
const METRICS_HEAD = ["benchmark", ...METRIC_COLUMNS.map(({ field }) => field)];
const URLS_HEAD = [
  "benchmark",
  "url",
  "requests",
  "fetches",
  "bytes",
  "status",
];
const UNSEEN = "new";
const SAME = "=";

/**
 * Blob and data urls are unique per object, so they group under their scheme.
 * @param {string} url
 */
const urlKey = (url) =>
  /^(blob|data):/.test(url)
    ? url.slice(0, 5)
    : new URL(url, "http://bench").pathname;

/** @param {number[]} values */
const range = (values) => ({
  min: Math.min(...values),
  max: Math.max(...values),
});

/**
 * @param {{min: number, max: number}} range
 * @param {(value: number) => string} format
 */
const formatRange = ({ min, max }, format) =>
  min === max ? format(min) : `${format(min)}–${format(max)}`;

/**
 * @typedef {{requested: number, fetched: number, bytes: number, statuses: number[]}} UrlTally
 * @typedef {{name: string, does: string, runs: number, perRun: Record<string, {min: number, max: number}>, urls: Record<string, UrlTally>}} RowMetrics
 */

/**
 * Per run for the row, totals per url: a url short of the run count is what
 * made a row vary.
 * @param {string} does the test's title, the interaction under measurement
 * @param {{name: string, iterations: {requested: string[], fetched: {url: string, bytes: number, status: number}[]}[]}} row
 * @returns {RowMetrics}
 */
const summariseMetrics = (does, { name, iterations }) => {
  /** @type {Record<string, UrlTally>} */
  const urls = {};
  const tally = (/** @type {string} */ url) =>
    (urls[urlKey(url)] ??= {
      requested: 0,
      fetched: 0,
      bytes: 0,
      statuses: [],
    });
  for (const { requested, fetched } of iterations) {
    for (const url of requested) tally(url).requested += 1;
    for (const { url, bytes, status } of fetched) {
      const entry = tally(url);
      entry.fetched += 1;
      entry.bytes += bytes;
      if (!entry.statuses.includes(status)) entry.statuses.push(status);
    }
  }
  return {
    name,
    does,
    runs: iterations.length,
    perRun: {
      requests: range(iterations.map(({ requested }) => requested.length)),
      fetches: range(iterations.map(({ fetched }) => fetched.length)),
      bytes: range(
        iterations.map(({ fetched }) =>
          fetched.reduce((sum, { bytes }) => sum + bytes, 0),
        ),
      ),
    },
    urls,
  };
};

/**
 * @param {RowMetrics} live
 * @param {RowMetrics} [previous]
 */
const metricRow = ({ name, perRun }, previous) => {
  // A baseline written before this shape has no `perRun`.
  const before = previous?.perRun;
  return {
    // The runs differ, or this run did more than the baseline.
    flagged: METRIC_COLUMNS.some(
      ({ field }) =>
        perRun[field].min !== perRun[field].max ||
        (before !== undefined &&
          (perRun[field].min > before[field].min ||
            perRun[field].max > before[field].max)),
    ),
    cells: [
      name,
      ...METRIC_COLUMNS.map(({ field, format }) =>
        before
          ? `${formatRange(before[field], format)} → ${formatRange(perRun[field], format)}`
          : formatRange(perRun[field], format),
      ),
    ],
  };
};

/**
 * One line per scenario: rows measured by the same test share its title.
 * @param {RowMetrics[]} metrics
 */
const legend = (metrics) => {
  /** @type {Map<string, string[]>} */
  const byScenario = new Map();
  for (const { name, does } of metrics) {
    byScenario.set(does, [...(byScenario.get(does) ?? []), name]);
  }
  return [...byScenario].map(
    ([does, names]) => `- ${names.join(", ")}: ${does}`,
  );
};

/**
 * One table for every row, the row's name on its first url only.
 * @param {RowMetrics[]} metrics
 */
const urlRows = (metrics) =>
  metrics.flatMap(({ name, urls }) => {
    const entries = Object.entries(urls);
    if (!entries.length) return [`| ${name} | none | | | | |`];
    return entries.map(
      ([url, { requested, fetched, bytes, statuses }], index) =>
        `| ${index ? "" : name} | \`${url}\` | ${requested} | ${fetched} | ${kilobytes(bytes)} | ${[...(requested ? ["mocked"] : []), ...statuses].join(", ")} |`,
    );
  });

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
    this.baselineMetrics = `${dir}/${METRICS_FILE}`;
    this.resultsMetrics = `${resultsDir}/${METRICS_FILE}`;
    /** @type {RowMetrics[]} */
    this.metrics = [];
  }

  /**
   * Rows report their metrics rather than asserting them, so they arrive here
   * as annotations instead of as failures.
   * @param {import("vitest/node").TestCase} testCase
   * @param {{message: string}} annotation
   */
  onTestCaseAnnotate(testCase, annotation) {
    if (!annotation.message.includes(METRICS_ANNOTATION)) return;
    this.metrics.push(
      summariseMetrics(testCase.name, JSON.parse(annotation.message)),
    );
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

    /** @type {Record<string, RowMetrics>} */
    const previousMetrics = existsSync(this.baselineMetrics)
      ? JSON.parse(readFileSync(this.baselineMetrics, "utf8"))
      : {};
    writeFileSync(
      this.resultsMetrics,
      JSON.stringify(
        Object.fromEntries(this.metrics.map((row) => [row.name, row])),
      ),
    );
    // The timing table's order, so a reader finds a row in the same place twice.
    const order = rows.map(({ cells }) => cells[0]);
    const metrics = this.metrics.toSorted(
      (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
    );
    const metricRows = metrics.map((row) =>
      metricRow(row, previousMetrics[row.name]),
    );
    if (metricRows.length) {
      const metricWidths = measure([
        METRICS_HEAD,
        ...metricRows.map(({ cells }) => cells),
      ]);
      this.ctx.logger.log("");
      this.ctx.logger.log(renderLine(METRICS_HEAD, metricWidths));
      for (const { cells, flagged } of metricRows) {
        const line = renderLine(cells, metricWidths);
        this.ctx.logger.log(flagged ? colors.red(line) : line);
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
        ...legend(metrics),
        "",
        `| ${HEAD.join(" | ")} |`,
        `| ${HEAD.map(() => "---").join(" | ")} |`,
        ...rows.map((row) => `| ${toCells(row).join(" | ")} |`),
        "",
        ...(metricRows.length
          ? [
              "Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.",
              "",
              `| ${METRICS_HEAD.join(" | ")} |`,
              `| ${METRICS_HEAD.map(() => "---").join(" | ")} |`,
              ...metricRows.map(
                ({ cells, flagged }) =>
                  `| ${cells.map((cell) => (flagged ? `**${cell}**` : cell)).join(" | ")} |`,
              ),
              "",
              `<details><summary>urls, totals over ${metrics[0].runs} runs</summary>`,
              "",
              `| ${URLS_HEAD.join(" | ")} |`,
              `| ${URLS_HEAD.map(() => "---").join(" | ")} |`,
              ...urlRows(metrics),
              "",
              "</details>",
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
        "| status | `mocked` where the tests resolved the request; HTTP codes where the browser fetched it; both where the application did both |",
        "",
        "</details>",
        "",
      ].join("\n"),
    );
    this.ctx.logger.log(colors.dim(`  report written to ${REPORT_FILE}`));
    this.ctx.logger.log("");
  }
}
