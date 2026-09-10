/**
 * Measures every template test under `npm run test:performance`. Samples are
 * attached to `task.meta` and `tests/performance/reporter` renders them. The
 * plain `test:template` run stays the pass/fail gate, because waiting for the
 * app to go quiet ages it between tests.
 */
import { afterEach, beforeEach } from "vitest";
import { instrument } from "./performance/index";

/** @type {Awaited<ReturnType<typeof instrument>> | null} */
let probe = null;

if (import.meta.env.VITE_PERF) {
  beforeEach(async (ctx) => {
    probe = ctx.task.file?.name?.includes("tests/template")
      ? await instrument()
      : null;
  });

  afterEach(async (ctx) => {
    if (!probe) return;
    try {
      //@ts-expect-error todo
      ctx.task.meta.perf = await probe.collect();
    } finally {
      await probe.dispose();
      probe = null;
    }
  });
}
