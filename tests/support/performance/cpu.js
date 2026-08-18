import { frameLabel } from "./frames";

/** Synthetic frames the profiler emits for non-JS time. */
const SYNTHETIC = /^\((idle|program|garbage collector|root)\)$/;

/**
 * Self time per call frame, so cost can be attributed to code rather than to a
 * test. `Performance.getMetrics` gives the totals; only the profiler says where.
 *
 * @param {any} session a vitest `cdp()` session
 */
export const observeCpu = async (session) => {
  await session.send("Profiler.enable");
  // Pinned rather than left to the default: how small a frame the report is
  // willing to name depends on this interval.
  await session.send("Profiler.setSamplingInterval", { interval: 1000 });
  await session.send("Profiler.start");

  return {
    collect: async () => {
      const { profile } = await session.send("Profiler.stop");
      //@ts-expect-error todo
      const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
      /** @type {Map<number, number>} */
      const parentOf = new Map();
      //@ts-expect-error todo
      for (const node of profile.nodes)
        for (const child of node.children ?? []) parentOf.set(child, node.id);

      /** The path back to the root, so a native frame names its caller. */
      const ancestry = (/** @type {number} */ id) => {
        const trace = [];
        for (let at = id; at && trace.length < 6; at = parentOf.get(at)) {
          const label = frameLabel(nodes.get(at)?.callFrame);
          if (label) trace.push(label);
        }
        return trace;
      };

      /** @param {number} node */
      const hits = (node) => nodes.get(node)?.hitCount ?? 0;

      /** @type {Map<string, {ms: number, hottest: number}>} */
      const self = new Map();
      //@ts-expect-error todo
      profile.samples.forEach((id, index) => {
        const frame = nodes.get(id)?.callFrame;
        if (!frame) return;
        const key = frameLabel(frame) || frame.functionName;
        const entry = self.get(key) ?? { ms: 0, hottest: id };
        if (hits(id) > hits(entry.hottest)) entry.hottest = id;
        entry.ms += (profile.timeDeltas[index] ?? 0) / 1000;
        self.set(key, entry);
      });

      const frames = [...self]
        .map(([label, { ms, hottest }]) => ({
          label,
          ms: Math.round(ms),
          trace: ancestry(hottest),
        }))
        .sort((a, b) => b.ms - a.ms);
      /** @param {string} name */
      const synthetic = (name) =>
        frames.find((frame) => frame.label === name)?.ms ?? 0;

      return {
        sampledMs: Math.round(frames.reduce((n, f) => n + f.ms, 0)),
        idleMs: synthetic("(idle)"),
        programMs: synthetic("(program)"),
        topFrames: frames
          .filter(({ label }) => !SYNTHETIC.test(label))
          .slice(0, 10),
      };
    },
    dispose: () => session.send("Profiler.disable"),
  };
};
