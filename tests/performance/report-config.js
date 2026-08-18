/**
 * What the performance report says about eodash. The reporter itself is generic;
 * every metric name, claim and word below lives here.
 */
import { foldout, size, time } from "./reporter/markdown.js";

/** Fifty samples at the 1ms profiler interval: below this a frame is noise. */
const FRAME_FLOOR_MS = 50;

/** Below this share of wall time, main-thread work needs no explanation. */
const BUSY_SHARE = 25;

/**
 * Repeats folded to one finding per caller. Stylesheets are excluded: a font
 * imported into a shadow root is requested once per root.
 * @param {any} perf
 */
const repeatsByCaller = (perf) => {
  /** @type {Map<string, {files: Set<string>, waste: number, cached: number, times: number, trace: string[]}>} */
  const callers = new Map();
  for (const request of perf.repeatedRequests ?? []) {
    if (request.via === "Stylesheet") continue;
    const entry = callers.get(request.via) ?? {
      files: new Set(),
      waste: 0,
      cached: 0,
      times: 0,
      trace: request.trace,
    };
    entry.files.add(shortPath(request.url));
    entry.waste += request.times - 1;
    entry.cached += request.cachedRepeats ?? 0;
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
    ? `the test ${state}, so its action may have been cut short`
    : perf.settled === false
      ? "the application was still working when the window closed, so these figures are lower bounds"
      : null;

/** @param {import("./reporter/index.js").Sample[]} samples */
const failuresByHost = (samples) => {
  /** @type {Map<string, number>} */
  const hosts = new Map();
  for (const { perf } of samples) {
    for (const host of perf.hosts ?? []) {
      hosts.set(host.host, (hosts.get(host.host) ?? 0) + host.failed);
    }
  }
  return [...hosts]
    .filter(([, failed]) => failed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
};

/** @type {import("./reporter/index.js").PerformanceReportConfig} */
export const config = {
  scope: "tests/template/",
  metaKey: "perf",
  markdownFile: "tests/performance/report.md",
  title: "Application performance",

  intro: (samples) => {
    const requests =
      sum(samples, "requests") - sum(samples, "canceledRequests");
    const failed = sum(samples, "failedRequests");
    const preamble = [
      "One section per test file, measured by `npm run test:performance` from the",
      "test starting until the application went quiet.",
      "",
      "Notes appear under a table only where a test warrants attention, so a table",
      "on its own means nothing was found in that file. Layer counts are exact and",
      "are the only figures compared against the previous run. Times and heap vary",
      "by a few percent between runs of identical code and are reported for",
      "magnitude, not as thresholds. `report.json` holds the full per-test record,",
      "and the glossary at the end defines each column.",
    ].join("\n");

    const slowest = samples
      .filter((sample) => !invalidReason(sample))
      .sort((a, b) => b.perf.wallMs - a.perf.wallMs)
      .slice(0, 3)
      .map(({ key, perf }) => `- ${time(perf.wallMs)} ${key}`)
      .join("\n");
    const waiting = samples.filter(
      ({ perf }) => perf.networkMs > perf.wallMs / 2,
    ).length;
    const hosts = failuresByHost(samples)
      .map(([host, n]) => `\`${host}\` ${n}`)
      .join(", ");
    return [
      preamble,
      "",
      "Longest actions in this run:",
      "",
      slowest,
      "",
      `Network: ${requests} requests, ${failed} failed, ${sum(samples, "canceledRequests")} abandoned by the application.` +
        (hosts ? ` Most failures came from ${hosts}.` : ""),
      "",
      `${waiting} of ${samples.length} actions had a request in flight for over half their wall time.`,
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
                `\`${frame.label}\` at ${time(frame.ms)} self time.` +
                foldout(frame.trace),
            ),
          ]
        : [];
    },

    ({ perf }) =>
      [...repeatsByCaller(perf)].map(
        ([via, { files, waste, cached, times, trace }]) =>
          `${listed(files)}: ${waste} redundant request(s)${cached ? `, ${cached} served from cache` : ""}, up to ${times}x, from \`${via}\`.` +
          foldout(trace),
      ),

    ({ perf }) =>
      count(perf.replacedLayers)
        ? [
            `Rebuilt rather than updated in place: ${perf.replacedLayers
              .map((id) => `\`${id}\``)
              .join(", ")}.`,
          ]
        : [],

    (sample, previous) =>
      previous
        ? STABLE.filter(
            ([, field]) => count(previous[field]) !== count(sample.perf[field]),
          ).map(
            ([label, field]) =>
              `Changed since the previous run: ${label} ${count(previous[field])} to ${count(sample.perf[field])}.`,
          )
        : [],
  ],

  sections: [
    (samples) => {
      const sampled = sum(samples, "sampledMs");
      if (!sampled) return null;
      const idle = sum(samples, "idleMs");
      const program = sum(samples, "programMs");
      return [
        "## Profile",
        "",
        `Across the measured tests: ${share(idle, sampled)}% idle, ` +
          `${share(program, sampled)}% compilation and browser work, ` +
          `${share(sampled - idle - program, sampled)}% running code. ` +
          "Measurement runs against the development server, which compiles on " +
          "demand, so the middle figure is higher here than in a built application.",
      ].join("\n");
    },
  ],

  glossary: `| Column | Meaning |
| --- | --- |
| wall | Time from the test starting until the application went quiet, including the fixed quiet check at the end. Every other figure is a total over this same window, so wall bounds them all. |
| main thread | Time the main thread spent inside tasks: script, layout and style. Includes the measurement's own poll loop, which is why it never reads zero. |
| network | Wall time with at least one request in flight. Overlapping requests count once, so this is the critical path rather than the sum of durations, and many fast parallel requests can cost less than a single slow one. |
| transferred | Bytes received over the network for this action. Responses served from cache contribute nothing. |
| heap | Memory the action was still holding after a forced garbage collection. |
| rebuilt | Layers destroyed and recreated instead of updated in place, reported only where it happened. A raster layer rebuilt this way also loses its tile cache.|
| self time | Time sampled inside a frame itself, excluding the frames it called, so a slow caller does not mask a slow callee. |`,
};
