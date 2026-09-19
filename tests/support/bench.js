/**
 * Benchmark helpers, imported by `tests/bench/**` and nothing else.
 */
import { expect, inject, vi } from "vitest";
import { CATALOG_URL } from "./catalog";
import { analysisGroup, getLayerIdentity } from "./layers";
import { serveByPath } from "./fixtures";
import { bootTemplate, MAP_ONLY, TIMEOUT } from "./template";

/** Booting an app and repeating a flow thirty-two times outlasts the default. */
export const TEST_TIMEOUT = 5 * 60 * 1000;

/** Nominal. Chromium's nesting clamp makes the real interval ~4.5ms. */
const POLL_MS = 1;

/**
 * Below this a reading is mostly poll granularity. Nominal polls, not real ones:
 * the real 4.5ms would set 45ms and reject flows that reproduce to under 1%.
 */
const FLOOR_MS = 10 * POLL_MS;

/** Two warmups: the iteration after a single one was still slower. */
const RUN_OPTIONS = {
  iterations: 20,
  time: 0,
  warmup: true,
  warmupIterations: 2,
  warmupTime: 0,
  retainSamples: true,
};

/** Short, not zero: widgets that fetch during setup must not beat the map. */
const FIXTURE_DELAY_MS = 5;

/** From the config: `bench.from` throws on a missing file, and this cannot stat. */
const reference = inject("benchReference");

/** @param {string} name */
const getResultFile = (name) => `${name.replace(/\W+/g, "-")}.json`;

/** @param {string} name */
const getResultPath = (name) =>
  `${reference.resultsDir}/${getResultFile(name)}`;

/** @param {string} name */
const getBaselinePath = (name) => `${reference.dir}/${getResultFile(name)}`;

/** Set by {@link bootBench}; each benchmark marks its own reset against it. */
let getRequestCount = () => 0;

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
  const served = serveByPath(axiosMock, routes, { delay: FIXTURE_DELAY_MS });
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

  getRequestCount = () => axiosMock.get.mock.calls.length;

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
   * Land on a different indicator. Clearing `selectedStac` is not a reset — the
   * map watcher ignores an empty value, so nothing is torn down.
   * @param {string} id
   */
  const resetTo = async (id) => {
    await store.loadSelectedSTAC(hrefOf(id));
    await vi.waitFor(
      () => {
        if (!isOnMap(() => Boolean(getLayerId()?.startsWith(id)))) {
          throw new Error(`the reset has not landed on ${id}`);
        }
      },
      { timeout: TIMEOUT, interval: 50 },
    );
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
  };
};

/**
 * Wait for a condition inside a timed callback.
 *
 * A timer poll on purpose. Chromium takes a timer's nesting level from the task
 * that created it and clamps a repeating timer to 4ms past level 5, so the last
 * await in a hook decides whether this polls clamped, and unclamps the app's own
 * `setTimeout(fn, 0)` with it. Measured, awaiting a `MessagePort`, a websocket
 * message or `requestAnimationFrame` there halves the reading.
 *
 * @param {() => boolean} check must be O(1) in whatever the benchmark varies
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
 * @template T
 * @typedef {object} Benchmark one benchmark of a ranked table
 * @property {string} name
 * @property {import("vitest").Bench} bench
 * @property {import("vitest").BenchRegistration<string>} registration
 * @property {T[]} ledger one entry per invocation, warmups included
 * @property {boolean} isFloored whether the result must clear {@link FLOOR_MS}
 */

/**
 * @template T
 * @typedef {object} BenchmarkSpec
 * @property {() => Promise<void>} reset untimed; a real state change, not a
 *   cleared ref, or the next iteration rebuilds nothing and reports it as fast
 * @property {() => unknown} act the single in-page action, timed
 * @property {() => boolean} isFinished O(1) completion test, timed
 * @property {() => T} record what proves this iteration matched its siblings
 * @property {boolean} [isFloored] false for a deliberate control benchmark
 */

/**
 * A registration plus the ledger that proves its iterations matched. `record`
 * runs outside the timed window, so it can afford to walk the map.
 *
 * @template T
 * @param {import("vitest").Bench} bench the fixture from the test context
 * @param {string} name
 * @param {BenchmarkSpec<T>} spec
 * @returns {Benchmark<T>}
 */
export const defineBenchmark = (
  bench,
  name,
  { reset, act, isFinished, record, isFloored = true },
) => {
  /** @type {T[]} */
  const ledger = [];
  let requestsAtReset = 0;
  const registration = bench(
    name,
    {
      writeResult: getResultPath(name),
      beforeEach: async () => {
        await reset();
        // Synchronous: see the nesting-level rule on `waitUntil`. Per benchmark,
        // or a ranked table has them all share one mark.
        requestsAtReset = getRequestCount();
      },
      afterEach: () => {
        ledger.push({
          ...record(),
          requests: getRequestCount() - requestsAtReset,
        });
      },
    },
    async () => {
      await act();
      await waitUntil(isFinished, `${name}: never finished`);
    },
  );
  return { name, bench, registration, ledger, isFloored };
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
 * Every invocation ran, and the reading is not mostly granularity. `min` so a
 * benchmark cannot clear the floor on noise it happened to collect.
 *
 * @param {Benchmark<unknown>} benchmark
 * @param {{min: number}} latency
 */
const assertValid = ({ name, ledger, isFloored }, latency) => {
  expect(ledger, `${name}: an invocation recorded nothing`).toHaveLength(
    RUN_OPTIONS.warmupIterations + RUN_OPTIONS.iterations,
  );
  if (isFloored && latency.min < FLOOR_MS) {
    throw new Error(
      `${name}: ${Math.round(latency.min)}ms is under the ${FLOOR_MS}ms floor, so it measures the poll interval rather than the app.\nledger: ${JSON.stringify(ledger)}`,
    );
  }
};

/**
 * Run one benchmark, against the previous run's result where there is one.
 * @param {Benchmark<unknown>} benchmark
 */
export const runBenchmark = async (benchmark) => {
  const [previous] = getReferenceBenchmark(benchmark);
  // `bench.compare` needs two registrations, so a first run just runs.
  if (!previous) {
    assertValid(
      benchmark,
      (await benchmark.registration.run(RUN_OPTIONS)).latency,
    );
    return;
  }
  const storage = await benchmark.bench.compare(
    benchmark.registration,
    previous,
    RUN_OPTIONS,
  );
  assertValid(benchmark, storage.get(benchmark.name).latency);
};

/**
 * Run several as one ranked table. tinybench runs the tasks one after another
 * in registration order, never interleaved, so drift over the run lands on the
 * last rows. The baseline ran in the same order.
 * @param {import("vitest").Bench} bench
 * @param {Benchmark<unknown>[]} benchmarks
 */
export const compareBenchmarks = async (bench, benchmarks) => {
  const storage = await bench.compare(
    ...benchmarks.map((benchmark) => benchmark.registration),
    ...benchmarks.flatMap(getReferenceBenchmark),
    RUN_OPTIONS,
  );
  for (const benchmark of benchmarks) {
    assertValid(benchmark, storage.get(benchmark.name).latency);
  }
};

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
