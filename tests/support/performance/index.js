import { cdp } from "vitest/browser";
import { createClock } from "./clock";
import { observeCpu } from "./cpu";
import { observeMap } from "./map";
import { observeMetrics } from "./metrics";
import { observeNetwork } from "./network";

/**
 * @typedef {object} Collector
 * @property {() => boolean} [busy] keeps the window open while true
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
  const busy = collectors.flatMap((c) => c.busy ?? []);

  return {
    collect: async () => {
      const settled = await clock.settle(busy);
      const wallMs = clock.wallMs();
      const parts = await Promise.all(collectors.map((c) => c.collect()));
      return Object.assign({ settled, wallMs }, ...parts);
    },
    dispose: () => Promise.all(collectors.map((c) => c.dispose())),
  };
};
