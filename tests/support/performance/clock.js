/**
 * The measurement window: one clock, shared by every collector, so their spans
 * are comparable. Collectors report activity through `touch` and liveness
 * through `busy`; the window closes when nothing has been busy for IDLE_MS.
 */

/**
 * Longer than the application's own debounces, which are 500ms in both
 * `EodashLayerControl.vue` and `EodashItemCatalog/methods/map.js`, so a rebuild
 * they scheduled is measured in the test that caused it, not the one after.
 */
const IDLE_MS = 1000;
const CAP_MS = 20_000;
const POLL_MS = 25;

export const createClock = () => {
  const startedAt = performance.now();
  let lastActivityAt = startedAt;
  let blockedPolls = 0;
  /** @type {string | undefined} */
  let heldBy;

  /** @param {[string, () => boolean][]} busy */
  const settle = async (busy) => {
    const deadline = performance.now() + CAP_MS;
    let polledAt = performance.now();
    while (performance.now() < deadline) {
      const now = performance.now();
      // A late poll was held up by the main thread. No collector can report
      // that, so without this a busy CPU looks like an idle app.
      const blocked = now - polledAt > POLL_MS * 2;
      polledAt = now;
      if (blocked) blockedPolls += 1;
      const claimed = busy.find(([, isBusy]) => isBusy())?.[0];
      if (blocked || claimed) {
        lastActivityAt = now;
        heldBy = claimed ?? "main thread";
      } else if (now - lastActivityAt >= IDLE_MS) return true;
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
    return false;
  };

  return {
    touch: () => (lastActivityAt = performance.now()),
    /**
     * The whole window, including the quiet check at the end. Collectors report
     * totals over this same span, so wall time bounds every one of them.
     */
    wallMs: () => performance.now() - startedAt,
    settle,
    /**
     * What kept the window open last, and how often the poll loop itself was
     * delayed. A window that hit the cap is only interpretable with these.
     */
    held: () => ({ heldBy, blockedPolls }),
  };
};

/**
 * Time covered by at least one span. Requests overlap, so the sum of durations
 * exceeds the wall clock and only the union is a cost.
 * @param {{start: number, end: number}[]} spans
 */
export const unionMs = (spans) => {
  let total = 0;
  let reached = -Infinity;
  for (const { start, end } of [...spans].sort((a, b) => a.start - b.start)) {
    total += Math.max(0, end - Math.max(start, reached));
    reached = Math.max(reached, end);
  }
  return total;
};
