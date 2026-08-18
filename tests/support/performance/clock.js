/**
 * The measurement window: one clock, shared by every collector, so their spans
 * are comparable. Collectors report activity through `touch` and liveness
 * through `busy`; the window closes when nothing has been busy for IDLE_MS.
 */

const IDLE_MS = 500;
const CAP_MS = 20_000;
const POLL_MS = 25;

export const createClock = () => {
  const startedAt = performance.now();
  let lastActivityAt = startedAt;

  /** @param {(() => boolean)[]} busy */
  const settle = async (busy) => {
    const deadline = performance.now() + CAP_MS;
    let polledAt = performance.now();
    while (performance.now() < deadline) {
      const now = performance.now();
      // A late poll was held up by the main thread. No collector can report
      // that, so without this a busy CPU looks like an idle app.
      const blocked = now - polledAt > POLL_MS * 2;
      polledAt = now;
      if (blocked || busy.some((isBusy) => isBusy())) lastActivityAt = now;
      else if (now - lastActivityAt >= IDLE_MS) return true;
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
