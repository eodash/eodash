/**
 * Benchmark helpers, imported by `tests/bench/**` and nothing else.
 */
import { expect, inject, vi } from "vitest";
import { CATALOG_URL } from "./catalog";
import { analysisGroup, getLayerIdentity } from "./layers";
import { serveByPath } from "./fixtures";
import { bootTemplate, MAP_ONLY, TIMEOUT } from "./template";

/** Booting an app and repeating a flow twenty-two times outlasts the default. */
export const TEST_TIMEOUT = 5 * 60 * 1000;

/** Nominal. Chromium clamps it to ~4.5ms, so no timed window polls. */
const POLL_MS = 1;

/** The reporter sees every annotation in the run, so ours says what it is. */
export const METRICS_ANNOTATION = "bench-metrics";

/** Two warmups: the iteration after a single one was still slower. */
const RUN_OPTIONS = {
  iterations: 20,
  time: 0,
  warmup: true,
  warmupIterations: 2,
  warmupTime: 0,
  retainSamples: true,
};

/** From the config: `bench.from` throws on a missing file, and this cannot stat. */
const reference = inject("benchReference");

/** @param {string} name */
const getResultFile = (name) => `${name.replace(/\W+/g, "-")}.json`;

/** @param {string} name */
const getResultPath = (name) =>
  `${reference.resultsDir}/${getResultFile(name)}`;

/** @param {string} name */
const getBaselinePath = (name) => `${reference.dir}/${getResultFile(name)}`;

/**
 * Set by {@link bootBench}; each benchmark marks its own reset against them.
 * @type {() => string[]}
 */
let getRequestUrls = () => [];

/**
 * Set by {@link bootBench}; what a timed window waits on unless a row overrides it.
 * @type {import("@eox/map").EOxMap | null}
 */
let mapElement = null;

/**
 * Stock templates as the benches boot them, quieted. Expert's 1200ms fly-to
 * and explore's live OSM tiles both start after the window closes, and both
 * are still running through the next iteration.
 */
const BENCH_TEMPLATES = {
  expert: { background: { widget: { properties: { zoomToExtent: false } } } },
  explore: {
    background: {
      widget: {
        properties: {
          baseLayers: MAP_ONLY.background.widget.properties.baseLayers,
        },
      },
    },
  },
};

/**
 * An app booted against a synthetic catalog, plus the readings every benchmark needs.
 *
 * @param {{get: import("vitest").Mock}} axiosMock the file's hoisted mock
 * @param {{routes: Record<string, any>, hrefOf: (id: string) => string}} catalog
 * @param {{template?: string, rasterEndpoint?: string, over?: Record<string, any>}} [boot]
 */
export const bootBench = async (axiosMock, { routes, hrefOf }, boot = {}) => {
  const served = serveByPath(axiosMock, routes);
  const { app, query, store } = await bootTemplate({
    endpoint: CATALOG_URL,
    ...boot,
    over: {
      ...boot.over,
      templates: { ...BENCH_TEMPLATES, ...boot.over?.templates },
    },
  });
  /** @type {import("@eox/map").EOxMap} */
  const mapEl = query("eox-map");

  /** O(1): finds among three top-level groups, then indexes position zero. */
  const getLayerId = () => analysisGroup(mapEl)?.layers?.[0]?.properties?.id;

  getRequestUrls = () => axiosMock.get.mock.calls.map(([url]) => String(url));
  mapElement = mapEl;
  // The boot's own module loads fill the default 250-entry buffer on their own.
  performance.setResourceTimingBufferSize(5000);
  performance.clearResourceTimings();

  /**
   * Where the window stops: eodash wrote the layer into the map's config.
   * eox-map applies that write synchronously, so the OpenLayers lookup only
   * adds something where the config is mutated in place ahead of the write,
   * which the mosaic does.
   *
   * A drawn frame would be the fuller answer, but it also holds the tile
   * fetch, OpenLayers' 250ms fade and any view animation — measured, 90% of a
   * ten-layer window, none of it eodash's work. Each act is a real state
   * change, so the check cannot already be true when it starts.
   *
   * @param {() => boolean} isLanded
   */
  const isOnMap = (isLanded) =>
    isLanded() && Boolean(mapEl.getLayerById(getLayerId()));

  /**
   * The map's own signal, for setup and resets. Arm it before whatever causes
   * the write, then await it.
   * @param {() => boolean} isLanded
   * @param {string} reason
   */
  const whenWritten = (isLanded, reason) =>
    settleOn(mapEl, "layerschanged", isLanded, reason).settled;

  /**
   * Land on a different indicator. Clearing `selectedStac` is not a reset — the
   * map watcher ignores an empty value, so nothing is torn down.
   * @param {string} id
   */
  const resetTo = async (id) => {
    const written = whenWritten(
      () => isOnMap(() => Boolean(getLayerId()?.startsWith(id))),
      `the reset has not landed on ${id}`,
    );
    await store.loadSelectedSTAC(hrefOf(id));
    await written;
  };

  /** Untimed, so it can afford to resolve an OL layer. */
  const readLedgerEntry = () => {
    const id = getLayerId();
    const baseLayers = mapEl.getLayerById("BaseLayersGroup");
    return {
      id,
      layers: analysisGroup(mapEl)?.layers?.length ?? 0,
      identity: getLayerIdentity(mapEl.getLayerById(id)),
      // A group nothing touched has to survive untouched. No timing sees a
      // needless rebuild of it: base layers are cheap, so it reads as drift.
      baseLayers: baseLayers && getLayerIdentity(baseLayers),
    };
  };

  /**
   * Reset elsewhere, select this, wait for its layer.
   * @param {string} id
   * @param {{from: string}} options where to reset to
   */
  const createSelectionSpec = (id, { from }) => ({
    reset: () => resetTo(from),
    act: () => store.loadSelectedSTAC(hrefOf(id)),
    isFinished: () => isOnMap(() => Boolean(getLayerId()?.startsWith(id))),
    record: readLedgerEntry,
  });

  return {
    app,
    query,
    store,
    served,
    getLayerId,
    isOnMap,
    readLedgerEntry,
    createSelectionSpec,
    whenWritten,
  };
};

/**
 * Wait for a condition in a setup step or a reset, never in a timed window.
 *
 * The nesting clamp still decides something: Chromium takes a timer's level
 * from the task that created it, so the last await in a reset governs whether
 * the app's own `setTimeout(fn, 0)` runs clamped in the act that follows.
 *
 * @param {() => boolean} check
 * @param {string} reason what to say when it never becomes true
 */
export const waitUntil = (check, reason) =>
  vi.waitFor(
    () => {
      if (!check()) throw new Error(reason);
    },
    { timeout: TIMEOUT, interval: POLL_MS },
  );

/**
 * Wait for the first `event` after which `isLanded` holds.
 *
 * Subscribed before the act: eox-map dispatches `layerschanged` synchronously.
 * OpenLayers decides `rendercomplete` before dispatching it, so the first one
 * after the write can predate it; `landedAt` rejects those and `render()` asks
 * for one that cannot be.
 *
 * @param {EventTarget & {render?: () => void}} target map element or OL map
 * @param {string} event
 * @param {() => boolean} isLanded
 * @param {string} name
 * @returns {{settled: Promise<void>, dispose: () => void}}
 */
export const settleOn = (target, event, isLanded, name) => {
  /** @type {ReturnType<typeof setTimeout>} */
  let timer;
  /** @type {() => void} */
  let handler;
  const dispose = () => {
    clearTimeout(timer);
    target.removeEventListener(event, handler);
  };
  const settled = new Promise((resolve, reject) => {
    let landedAt = 0;
    handler = (/** @type {any} */ frameEvent) => {
      if (!landedAt && isLanded()) {
        // `Date.now`, the clock OpenLayers stamps a frame with.
        landedAt = Date.now();
        if (target.render) {
          target.render?.();
        }
      }
      if (!landedAt) return;
      const drawnAt = frameEvent?.frameState?.time;
      if (drawnAt !== undefined && drawnAt < landedAt) return;
      dispose();
      resolve();
    };
    target.addEventListener(event, handler);
    timer = setTimeout(() => {
      dispose();
      reject(new Error(`${name}: never finished`));
    }, TIMEOUT);
  });
  return { settled, dispose };
};

/**
 * Everything the page fetched natively during one act, by when each request
 * started. Read once per row after the run, so a request that outlived its
 * window is still charged to the act that began it.
 * @param {{startedAt: number, endedAt: number}} window
 */
const fetchedDuring = ({ startedAt, endedAt }) =>
  performance
    .getEntriesByType("resource")
    .filter(
      (entry) =>
        entry instanceof PerformanceResourceTiming &&
        entry.startTime >= startedAt &&
        entry.startTime <= endedAt,
    )
    .map((entry) => ({
      url: entry.name,
      bytes: entry.encodedBodySize,
      status: entry.responseStatus,
    }));

/**
 * @template T
 * @typedef {object} Benchmark one benchmark of a ranked table
 * @property {string} name
 * @property {import("vitest").Bench} bench
 * @property {(message: string) => Promise<unknown>} annotate
 * @property {import("vitest").BenchRegistration<string>} registration
 * @property {T[]} ledger one entry per invocation, warmups included
 */

/**
 * @template T
 * @typedef {object} BenchmarkSpec
 * @property {() => Promise<void>} reset untimed; a real state change, not a
 *   cleared ref, or the next iteration rebuilds nothing and reports it as fast
 * @property {() => unknown} act the single in-page action, timed
 * @property {() => boolean} isFinished O(1) completion test, timed
 * @property {() => T} record what proves this iteration matched its siblings
 * @property {any} [target] what closes the window; the map element by default
 * @property {string} [event] `layerschanged` once eodash has written the layer,
 *   or `rendercomplete` on `mapEl.map` once the frame has drawn
 */

/**
 * A registration plus the ledger that proves its iterations matched. `record`
 * runs outside the timed window, so it can afford to walk the map.
 *
 * @template T
 * @param {{bench: import("vitest").Bench, annotate: (message: string) => Promise<unknown>}} ctx
 *   the test context, for the bench fixture and the metric channel
 * @param {string} name
 * @param {BenchmarkSpec<T>} spec
 * @returns {Benchmark<T>}
 */
export const defineBenchmark = (
  { bench, annotate },
  name,
  {
    reset,
    act,
    isFinished,
    record,
    target = mapElement,
    event = "layerschanged",
  },
) => {
  /** @type {T[]} */
  const ledger = [];
  let requestsAtReset = 0;
  let startedAt = 0;
  const registration = bench(
    name,
    {
      writeResult: getResultPath(name),
      beforeEach: async () => {
        await reset();
        requestsAtReset = getRequestUrls().length;
        startedAt = performance.now();
      },
      afterEach: () => {
        const requested = getRequestUrls().slice(requestsAtReset);
        ledger.push({
          ...record(),
          requests: requested.length,
          requested,
          startedAt,
          endedAt: performance.now(),
        });
      },
    },
    async () => {
      const { settled, dispose } = settleOn(target, event, isFinished, name);
      try {
        await act();
        await settled;
      } finally {
        dispose();
      }
    },
  );
  return { name, bench, annotate, registration, ledger };
};

/**
 * The previous run's result as a registration, or nothing the first time.
 * @param {Benchmark<unknown>} benchmark
 */
const getReferenceBenchmark = ({ name, bench }) =>
  reference.files.includes(getResultFile(name))
    ? [bench.from(`${name}${reference.referenceSuffix}`, getBaselinePath(name))]
    : [];

/**
 * Every invocation recorded an entry, so none silently skipped its ledger.
 * @param {Benchmark<unknown>} benchmark
 */
const assertLedgerComplete = ({ name, ledger }) =>
  expect(ledger, `${name}: an invocation recorded nothing`).toHaveLength(
    RUN_OPTIONS.warmupIterations + RUN_OPTIONS.iterations,
  );

/**
 * Run one benchmark, against the previous run's result where there is one.
 * @param {Benchmark<unknown>} benchmark
 */
export const runBenchmark = async (benchmark) => {
  const [previous] = getReferenceBenchmark(benchmark);
  // `bench.compare` needs two registrations, so a first run just runs.
  await (previous
    ? benchmark.bench.compare(benchmark.registration, previous, RUN_OPTIONS)
    : benchmark.registration.run(RUN_OPTIONS));
  assertLedgerComplete(benchmark);
};

/**
 * Run several as one ranked table. tinybench warms every task first, then times
 * them one after another in registration order, so drift over the run lands on
 * the last rows. The baseline ran in the same order.
 * @param {Benchmark<unknown>[]} benchmarks
 */
export const compareBenchmarks = async (benchmarks) => {
  const [{ bench }] = benchmarks;
  const hasEveryBaseline = benchmarks.every(({ name }) =>
    reference.files.includes(getResultFile(name)),
  );
  await bench.compare(
    ...benchmarks.map((benchmark) => benchmark.registration),
    ...(hasEveryBaseline ? benchmarks.flatMap(getReferenceBenchmark) : []),
    RUN_OPTIONS,
  );
  benchmarks.forEach((benchmark) => assertLedgerComplete(benchmark));
};

/**
 * Hand the run's metrics to the reporter. These never fail a row: a benchmark
 * whose request count drifted still produced a number worth reading, and the
 * drift is the finding rather than the obstacle.
 * @param {Benchmark<any>} benchmark
 */
export const reportMetrics = ({ name, ledger, annotate }) =>
  annotate(
    JSON.stringify({
      kind: METRICS_ANNOTATION,
      name,
      iterations: ledger.slice(RUN_OPTIONS.warmupIterations).map((entry) => ({
        requested: entry.requested,
        fetched: fetchedDuring(entry),
      })),
    }),
  );

/**
 * Every entry of `field` held one value — the shape most "this iteration did
 * less work" bugs take.
 * @param {Benchmark<any>} benchmark
 * @param {string} field
 * @param {unknown} [expected] when the value itself matters, not just its constancy
 */
export const expectConstant = ({ name, ledger }, field, expected) => {
  const seen = new Set(ledger.map((entry) => entry[field]));
  // A field never recorded is one value too, so a typo would pass.
  expect(seen, `${name}: ${field} was never recorded`).not.toContain(undefined);
  expect([...seen], `${name}: ${field} varied between iterations`).toHaveLength(
    1,
  );
  if (expected !== undefined) {
    expect([...seen][0], `${name}: ${field} was not ${expected}`).toEqual(
      expected,
    );
  }
};

/**
 * Every entry of `field` differed — proof the layer was rebuilt each time rather
 * than found already there.
 * @param {Benchmark<any>} benchmark
 * @param {string} field
 */
export const expectDistinct = ({ name, ledger }, field) => {
  const seen = new Set(ledger.map((entry) => entry[field]));
  expect(seen, `${name}: ${field} was never recorded`).not.toContain(undefined);
  expect(seen.size, `${name}: ${field} repeated, so nothing was rebuilt`).toBe(
    ledger.length,
  );
};
