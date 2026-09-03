/**
 * What the performance report says about eodash. The reporter itself is generic;
 * every metric name, claim and word below lives here.
 */
import { folded, foldout, size, time } from "./reporter/markdown.js";

/** A hundred samples at the 1ms profiler interval: below this a frame is noise. */
const FRAME_FLOOR_MS = 100;

/** Below this share of wall time, main-thread work needs no explanation. */
const BUSY_SHARE = 25;

/**
 * Repeats folded to one finding per caller. Stylesheets are excluded: a font
 * imported into a shadow root is requested once per root. How many repeats the
 * cache absorbed is left out: it depends on which file warmed the browser
 * context, which is a property of the schedule rather than of the application.
 * @param {any} perf
 */
const repeatsByCaller = (perf) => {
  /** @type {Map<string, {files: Set<string>, waste: number, times: number, trace: string[]}>} */
  const callers = new Map();
  for (const request of perf.repeatedRequests ?? []) {
    if (request.via === "Stylesheet") continue;
    const entry = callers.get(request.via) ?? {
      files: new Set(),
      waste: 0,
      times: 0,
      trace: request.trace,
    };
    entry.files.add(shortPath(request.url));
    entry.waste += request.times - 1;
    entry.times = Math.max(entry.times, request.times);
    callers.set(request.via, entry);
  }
  return callers;
};

/** @param {Set<string>} names */
const listed = (names) =>
  [...names]
    .slice(0, 3)
    .map((name) => `\`${name}\``)
    .join(", ") + (names.size > 3 ? ` and ${names.size - 3} more` : "");

/** Fields with no observed variance between identical runs, so worth diffing. */
const STABLE = [["layers rebuilt", "replacedLayers"]];

/** @param {any} value */
const count = (value) => (Array.isArray(value) ? value.length : (value ?? 0));

/**
 * What a stable field has to match to count as unchanged. Comparing lengths
 * would call one layer rebuilt in place of another no change at all.
 * @param {any} value
 */
const identity = (value) =>
  Array.isArray(value) ? [...value].sort().join(", ") : String(value ?? 0);

/** @param {import("./reporter/index.js").Sample[]} samples @param {string} field */
const sum = (samples, field) =>
  samples.reduce((total, { perf }) => total + count(perf[field]), 0);

/** Enough of a url to recognise the asset. @param {string} [url] */
const shortPath = (url) =>
  (url ?? "").split("?")[0].split("/").slice(-2).join("/");

/** @param {number} part @param {number} whole */
const share = (part, whole) => (whole ? Math.round((100 * part) / whole) : 0);

/** @param {import("./reporter/index.js").Sample} sample */
const invalidReason = ({ state, perf }) =>
  state !== "passed"
    ? `test ${state}`
    : perf.settled === false
      ? `timed out while ${perf.heldBy ?? "the app"} was busy` +
        (perf.blockedPolls
          ? ` (${perf.blockedPolls} checks blocked by main thread)`
          : "") +
        "; numbers are lower bounds"
      : null;

/** @type {import("./reporter/index.js").PerformanceReportConfig} */
export const config = {
  scope: "tests/template/",
  metaKey: "perf",
  markdownFile: "tests/performance/report.md",
  title: "Application performance",

  intro: (samples) => {
    const slowest = samples
      .filter((sample) => !invalidReason(sample))
      .sort((a, b) => b.perf.wallMs - a.perf.wallMs)
      .slice(0, 3)
      .map(({ key, perf }) => `- ${time(perf.wallMs)} ${key}`)
      .join("\n");
    return [
      "Measured with `npm run test:performance` from test start until the app went idle.",
      "",
      "Notes appear only for tests with findings. Layer counts are exact and",
      "compared against the previous run; other metrics drift naturally between runs. Read figures",
      "for order of magnitude. Full data in `report.json`; definitions in glossary below.",
      "",
      "Longest tests:",
      "",
      slowest,
    ].join("\n");
  },

  columns: [
    { label: "wall", value: (perf) => time(perf.wallMs) },
    { label: "main thread", value: (perf) => time(perf.taskMs) },
    { label: "network", value: (perf) => time(perf.networkMs) },
    { label: "transferred", value: (perf) => size(perf.bytes) },
    { label: "heap", value: (perf) => size(perf.heapKeptBytes) },
  ],

  invalidReason,

  notes: [
    // Named only where the main thread did enough work to be worth explaining.
    ({ perf }) => {
      const frames = (perf.topFrames ?? [])
        .filter((frame) => frame.ms >= FRAME_FLOOR_MS)
        .slice(0, 3);
      return frames.length && share(perf.taskMs, perf.wallMs) >= BUSY_SHARE
        ? [
            `Main thread busy for ${time(perf.taskMs)} of ${time(perf.wallMs)}.`,
            ...frames.map(
              (frame) =>
                `\`${frame.label}\` spent ${time(frame.ms)} self time.` +
                foldout(frame.trace),
            ),
          ]
        : [];
    },

    ({ perf }) =>
      [...repeatsByCaller(perf)].map(
        ([via, { files, waste, times, trace }]) =>
          `${listed(files)}: ${waste} duplicate request(s), up to ${times}x, from \`${via}\`.` +
          foldout(trace),
      ),

    ({ perf }) =>
      count(perf.replacedLayers)
        ? [
            `Map layers rebuilt instead of updated in place: ${perf.replacedLayers
              .map((id) => `\`${id}\``)
              .join(", ")}.`,
          ]
        : [],

    (sample, previous) =>
      previous
        ? STABLE.filter(
            ([, field]) =>
              identity(previous[field]) !== identity(sample.perf[field]),
          ).map(
            ([label, field]) =>
              `Differs from baseline: ${label} was ${identity(previous[field]) || "none"}, now ${identity(sample.perf[field]) || "none"}.`,
          )
        : [],
  ],

  sections: [
    (_samples, _previous, warmup) => {
      const files = [...warmup]
        .map(([file, d]) => ({
          file,
          imports: d.collectDuration ?? 0,
          setup: d.setupDuration ?? 0,
        }))
        .sort((a, b) => b.imports - a.imports);
      if (!files.length) return null;
      return folded("import and setup time per file", [
        "Time spent importing files and running suite setup. Not counted in",
        "per-test tables. The first file to import a module pays its compile",
        "cost, so numbers shift with run order.",
        "",
        "| file | imports | setup |",
        "| --- | --- | --- |",
        ...files.map(
          ({ file, imports, setup }) =>
            `| ${file} | ${time(imports)} | ${time(setup)} |`,
        ),
      ]);
    },

    (samples) => {
      const counted = samples.filter((sample) => !invalidReason(sample));
      const working = sum(counted, "sampledMs") - sum(counted, "idleMs");
      if (!working) return null;
      const program = sum(counted, "programMs");
      return (
        `Of main-thread work across all tests, ${share(program, working)}% is ` +
        `the dev server compiling on demand and ${share(working - program, working)}% ` +
        "is application code. A production build carries only the second."
      );
    },
  ],

  glossary: `| Term | Meaning |
| --- | --- |
| wall | Total time from test start until the page settles and goes quiet. Bounds all other metrics. |
| main thread | Time spent in JS tasks, styling, and layout. Includes runner polling overhead. |
| network | Wall time with at least one external request in flight (critical path). Excludes dev-server requests. |
| transferred | Bytes received from external origins. |
| heap | Retained memory after forced garbage collection. Best-effort and harness-tracked, so small readings are noisy. |
| rebuilt | Layers recreated instead of updated in place. Rebuilding also drops raster tile cache. |
| self time | Time spent inside a function frame itself, excluding callees. Shown for frames over 100 ms when main thread is busy >= 25% of wall time. |`,
};
