/**
 * Main-thread time and DOM counts, which need no observer of their own, plus
 * the heap the action kept. Durations come back in seconds.
 *
 * @param {any} session a vitest `cdp()` session
 */
export const observeMetrics = async (session) => {
  await session.send("Performance.enable", { timeDomain: "timeTicks" });
  await session.send("HeapProfiler.enable");
  const read = async () =>
    Object.fromEntries(
      //@ts-expect-error todo
      (await session.send("Performance.getMetrics")).metrics.map((metric) => [
        metric.name,
        metric.value,
      ]),
    );

  await session.send("HeapProfiler.collectGarbage");
  const before = await read();

  return {
    collect: async () => {
      const after = await read();
      // Collected first, so this is memory the action kept, not its garbage.
      await session.send("HeapProfiler.collectGarbage");
      const settled = await read();
      return {
        taskMs: (after.TaskDuration - before.TaskDuration) * 1000,
        heapKeptBytes: settled.JSHeapUsedSize - before.JSHeapUsedSize,
      };
    },
    dispose: async () => {
      await session.send("HeapProfiler.disable");
      await session.send("Performance.disable");
    },
  };
};
