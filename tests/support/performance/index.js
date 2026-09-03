import { cdp } from "vitest/browser";
import { createClock } from "./clock";
import { observeCpu } from "./cpu";
import { observeMap } from "./map";
import { observeMetrics } from "./metrics";
import { observeNetwork } from "./network";

/**
 * @typedef {object} Collector
 * @property {() => boolean} [busy] keeps the window open while true
 * @property {string} [name] names this collector in the report when `busy` held
 *   the window open
 * @property {() => object | Promise<object>} collect fields for the sample
 * @property {() => void | Promise<void>} dispose
 */

/**
 * Measure one action. Collectors share a clock so their totals cover the same
 * span, and the window closes once all of them are quiet. The map is only
 * another collector, so a page without one still measures.
 */
export const instrument = async () => {
  const clock = createClock();
  const session = cdp();
  const mapEl = /** @type {any} */ (document.querySelector("eox-map"));

  /** @type {Collector[]} */
  const collectors = [
    ...(mapEl?.map ? [observeMap(mapEl, clock)] : []),
    await observeMetrics(session),
    await observeNetwork(session, clock),
    await observeCpu(session),
  ];
  /** @type {[string, () => boolean][]} */
  const busy = collectors.flatMap(({ name, busy }) =>
    busy ? [[name ?? "the application", busy]] : [],
  );

  return {
    collect: async () => {
      const settled = await clock.settle(busy);
      const wallMs = clock.wallMs();
      // In order, not in parallel: the heap reading is taken before the profile
      // is fetched and walked, which would otherwise be counted as retained.
      const parts = [];
      for (const collector of collectors) parts.push(await collector.collect());
      return Object.assign({ settled, wallMs, ...clock.held() }, ...parts);
    },
    dispose: () => Promise.all(collectors.map((c) => c.dispose())),
  };
};
