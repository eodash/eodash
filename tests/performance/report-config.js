/**
 * What the performance report says about eodash. The reporter itself is generic;
 * every metric name, claim and word below lives here.
 */
import { SEPARATOR } from "./reporter/baseline.js";
import { foldout, size, time } from "./reporter/markdown.js";

/** Fifty samples at the 1ms profiler interval: below this a frame is noise. */
const FRAME_FLOOR_MS = 50;

/** Below this share of wall time, main-thread work needs no explanation. */
const BUSY_SHARE = 25;

/**
 * Repeated fetches folded to one entry per file. Stylesheets are excluded:
 * fonts imported into a shadow root are requested once per root and read as
 * duplicates without anything being wrong.
 *
 * @param {any} perf
 */
const repeatsByFile = (perf) => {
  /** @type {Map<string, {times: number, ranges: number, via: string}>} */
  const files = new Map();
  for (const request of perf.repeatedRequests ?? []) {
    if (request.via === "Stylesheet") continue;
    const name = shortPath(request.url);
    const entry = files.get(name) ?? {
      times: 0,
      ranges: 0,
      via: request.via,
      trace: request.trace,
    };
    entry.times = Math.max(entry.times, request.times);
    entry.ranges += 1;
    files.set(name, entry);
  }
  return files;
};

/** Fields with no observed variance between identical runs, so worth diffing. */
const STABLE = [
  ["layers rebuilt", "replacedLayers"],
  ["sources swapped", "churnedSources"],
  ["ol layers", "olLayers"],
];

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

    const slowest = [...samples]
      .sort((a, b) => b.perf.wallMs - a.perf.wallMs)
      .slice(0, 3)
      .map(({ key, perf }) => `- ${time(perf.wallMs)} ${key}`)
      .join("\n");
    return [
      preamble,
      "",
      "Longest actions in this run:",
      "",
      slowest,
      "",
      `Network: ${requests} requests, ${failed} failed, ${sum(samples, "canceledRequests")} abandoned by the application.`,
    ].join("\n");
  },

  columns: [
    { label: "wall", value: (perf) => time(perf.wallMs) },
    { label: "main thread", value: (perf) => time(perf.taskMs) },
    { label: "network", value: (perf) => time(perf.networkMs) },
    { label: "failed", value: (perf) => `\`${perf.failedRequests ?? 0}\`` },
    { label: "heap", value: (perf) => size(perf.heapBytes) },
    { label: "rebuilt", value: (perf) => `\`${count(perf.replacedLayers)}\`` },
  ],

  invalidReason: ({ state, perf }) =>
    state !== "passed"
      ? `the test ${state}, so its action may have been cut short`
      : perf.settled === false
        ? "the application was still working when the window closed, so these figures are lower bounds"
        : null,

  notes: [
    // Named only where the main thread did enough work to be worth explaining.
    ({ perf }) => {
      const frame = perf.topFrames?.[0];
      return frame?.ms >= FRAME_FLOOR_MS &&
        share(perf.taskMs, perf.wallMs) >= BUSY_SHARE
        ? [
            `Main thread busy for ${time(perf.taskMs)} of ${time(perf.wallMs)}, longest frame \`${frame.label}\` at ${time(frame.ms)} self time.`,
          ]
        : [];
    },

    // One file read at many ranges is one finding, not one per range.
    ({ perf }) =>
      [...repeatsByFile(perf).entries()].map(
        ([file, { times, ranges, via, trace }]) =>
          (ranges > 1
            ? `\`${file}\`: ${ranges} byte ranges re-read, up to ${times} times each, from \`${via}\`.`
            : `\`${file}\` fetched ${times} times, from \`${via}\`.`) +
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

    // Writes are counted on the first map and bus events page-wide, so only a
    // shortfall is evidence; compare mode can legitimately produce a surplus.
    ({ perf }) =>
      perf.layerWrites > perf.busEvents
        ? [
            `${perf.layerWrites} layer write(s) against ${perf.busEvents} \`layers:updated\` event(s).`,
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
    // The two quantities a layer-pipeline refactor is meant to move. Both are
    // volatile run to run, so they are shown as standings rather than diffed.
    (samples) => {
      /** @type {Map<string, number>} */
      const byFile = new Map();
      for (const { key, perf } of samples) {
        const [file] = key.split(SEPARATOR);
        byFile.set(
          file,
          Math.max(byFile.get(file) ?? 0, perf.payloadBytes ?? 0),
        );
      }
      const heaviest = [...byFile]
        .filter(([, bytes]) => bytes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      if (!heaviest.length) return null;
      const orphaned = samples.filter(
        ({ perf }) => perf.addedInteractions?.length,
      );
      return [
        "## Layer pipeline",
        "",
        `Largest layer arrays passed to the map: ${heaviest
          .map(([file, bytes]) => `${size(bytes)} in ${file}`)
          .join(", ")}.`,
        ...(orphaned.length
          ? [
              "",
              `Map interactions added during ${orphaned.length} test(s): ` +
                `${[...new Set(orphaned.flatMap(({ perf }) => perf.addedInteractions))].map((id) => `\`${id}\``).join(", ")}. ` +
                "Whether they are removed afterwards is not measured.",
            ]
          : []),
      ].join("\n");
    },

    (samples) => {
      const sampled = sum(samples, "sampledMs");
      if (!sampled) return null;
      const idle = sum(samples, "idleMs");
      const program = sum(samples, "programMs");
      return [
        "## Profile",
        "",
        `Summed across every measured test, which overlap, so this exceeds ` +
          `elapsed time, the profiler sampled ${time(sampled)}: ` +
          `${share(idle, sampled)}% idle, ` +
          `${share(program, sampled)}% compilation and browser work, ` +
          `${share(sampled - idle - program, sampled)}% named JavaScript frames. ` +
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
| failed | Requests that returned a status of 400 or above, or never connected. They consume time and bytes like any other request and are counted as such. Requests the application abandoned deliberately are counted separately and are not failures. |
| heap | JavaScript heap in use when the action finished. A level rather than a leak: growth across the tests in one file is the meaningful signal. |
| rebuilt | Layers destroyed and recreated instead of updated in place. A raster layer rebuilt this way also loses its tile cache; a vector layer has none to lose. |
| self time | Time sampled inside a frame itself, excluding the frames it called, so a slow caller does not mask a slow callee. |`,
};
