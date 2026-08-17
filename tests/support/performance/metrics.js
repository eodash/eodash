/** The metrics worth keeping, renamed to what they mean here. */
const KEEP = {
  ScriptDuration: "scriptMs",
  LayoutDuration: "layoutMs",
  RecalcStyleDuration: "styleMs",
  TaskDuration: "taskMs",
  LayoutCount: "layouts",
  RecalcStyleCount: "styleRecalcs",
  JSHeapUsedSize: "heapBytes",
  Nodes: "nodes",
  JSEventListeners: "listeners",
  DetachedScriptStates: "detachedScripts",
  ArrayBufferContents: "arrayBuffers",
};

/**
 * One protocol call covers main-thread time, layout, heap and DOM counts, so
 * none of these need their own observer. Durations come back in seconds, and
 * sizes in exact bytes rather than `performance.memory`'s rounded figure.
 *
 * @param {any} session a vitest `cdp()` session
 */
export const observeMetrics = async (session) => {
  await session.send("Performance.enable");
  const read = async () =>
    Object.fromEntries(
      //@ts-expect-error todo
      (await session.send("Performance.getMetrics")).metrics.map((metric) => [
        metric.name,
        metric.value,
      ]),
    );
  const before = await read();

  return {
    collect: async () => {
      const after = await read();
      return Object.fromEntries(
        Object.entries(KEEP).map(([name, as]) => [
          as,
          name.endsWith("Duration")
            ? (after[name] - before[name]) * 1000
            : // Heap is the level the action left behind; the rest are reported
              // as their change across the window.
              name === "JSHeapUsedSize"
              ? after[name]
              : after[name] - before[name],
        ]),
      );
    },
    dispose: () => session.send("Performance.disable"),
  };
};
