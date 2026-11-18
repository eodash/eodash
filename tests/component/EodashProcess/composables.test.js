import { afterEach, describe, expect, test, vi } from "vitest";
import { h, nextTick, ref } from "vue";
import { flushPromises } from "@vue/test-utils";
import {
  useAutoExec,
  useInitProcess,
} from "^/EodashProcess/methods/composables";
import { mountComponent } from "../../support/mount";

const spies = vi.hoisted(() => ({ initProcess: vi.fn() }));
vi.mock("^/EodashProcess/methods/handling", () => ({
  initProcess: spies.initProcess,
  updateJsonformIdentifier: vi.fn(),
}));

/**
 * Mount the real composable with a DOM event target and a minimal editor stub.
 * Readiness is set before the schema enables the change listener.
 * @param {boolean} ready
 */
async function mountAutoExecForm(ready) {
  const autoExec = ref(false);
  const jsonformSchema = ref(
    /** @type {Record<string, unknown> | null} */ (null),
  );
  const formEl = ref(
    /** @type {import("@eox/jsonform").EOxJSONForm | null} */ (null),
  );
  const startProcess = vi.fn().mockResolvedValue(undefined);
  const change = vi.fn();
  const Host = {
    setup() {
      useAutoExec(autoExec, formEl, jsonformSchema, startProcess);
      return () => h("form", { ref: formEl, onChange: change });
    },
  };

  await mountComponent(Host);
  const form = formEl.value;
  if (!form) throw new Error("form not mounted");
  Object.defineProperty(form, "editor", { value: { ready } });
  return { jsonformSchema, startProcess, change, form };
}

describe("useAutoExec", () => {
  afterEach(() => vi.useRealTimers());

  test("auto-runs for an already ready editor without a change event", async () => {
    const { jsonformSchema, startProcess, change } =
      await mountAutoExecForm(true);
    vi.useFakeTimers();

    jsonformSchema.value = { options: { execute: true } };
    await nextTick();
    await nextTick();
    await vi.advanceTimersByTimeAsync(199);
    expect(startProcess).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    expect(startProcess).toHaveBeenCalledExactlyOnceWith();
    expect(change).not.toHaveBeenCalled();
  });

  test("waits for a change event when the editor is not ready", async () => {
    const { jsonformSchema, startProcess, change, form } =
      await mountAutoExecForm(false);
    vi.useFakeTimers();

    jsonformSchema.value = { options: { execute: true } };
    await nextTick();
    await nextTick();
    await vi.advanceTimersByTimeAsync(200);
    expect(startProcess).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();

    form.dispatchEvent(new Event("change"));
    await vi.advanceTimersByTimeAsync(200);

    expect(startProcess).toHaveBeenCalledExactlyOnceWith();
    expect(change).toHaveBeenCalledOnce();
  });

  test("runs startProcess on a form change once execute is enabled", async () => {
    const autoExec = ref(false);
    const jsonformSchema = ref(/** @type {any} */ (null));
    const formEl = ref(/** @type {any} */ (null));
    const startProcess = vi.fn();
    const Host = {
      setup() {
        useAutoExec(autoExec, formEl, jsonformSchema, startProcess);
        return () => h("div", { ref: formEl, class: "form-el" });
      },
    };

    await mountComponent(Host);

    // execute flag arrives after mount (as initProcess would deliver it)
    jsonformSchema.value = { options: { execute: true } };
    await flushPromises();

    formEl.value?.dispatchEvent(new Event("change")); // the listener is debounced, so the burst a form emits runs the process once
    await expect.poll(() => startProcess).toHaveBeenCalled();
  });

  test("does not run startProcess when execute is not set", async () => {
    const jsonformSchema = ref(/** @type {any} */ ({ options: {} }));
    const formEl = ref(/** @type {any} */ (null));
    const startProcess = vi.fn();
    const Host = {
      setup() {
        useAutoExec(ref(false), formEl, jsonformSchema, startProcess);
        return () => h("div", { ref: formEl });
      },
    };

    await mountComponent(Host);
    await flushPromises();

    formEl.value?.dispatchEvent(new Event("change"));
    expect(startProcess).not.toHaveBeenCalled();
  });
});

describe("useInitProcess", () => {
  test("calls initProcess on mount with the primary map and derived compare flag", async () => {
    spies.initProcess.mockClear();
    const refs = {
      selectedStac: ref(/** @type {any} */ (null)),
      jsonformSchema: ref(/** @type {any} */ (null)),
      isProcessed: ref(false),
      processResults: ref([]),
      loading: ref(false),
      isPolling: ref(false),
      mapElement: ref(/** @type {any} */ ({ id: "main" })),
    };
    const Host = {
      setup() {
        useInitProcess(refs);
        return () => h("div");
      },
    };

    await mountComponent(Host);
    await flushPromises();

    expect(spies.initProcess).toHaveBeenCalledWith(
      expect.objectContaining({
        enableCompare: false,
        mapElement: refs.mapElement.value,
      }),
    );
  });

  test("derives enableCompare from a compare map element", async () => {
    spies.initProcess.mockClear();
    const refs = {
      selectedStac: ref(/** @type {any} */ (null)),
      jsonformSchema: ref(/** @type {any} */ (null)),
      isProcessed: ref(false),
      processResults: ref([]),
      loading: ref(false),
      isPolling: ref(false),
      mapElement: ref(/** @type {any} */ ({ id: "compare" })),
    };
    const Host = {
      setup() {
        useInitProcess(refs);
        return () => h("div");
      },
    };

    await mountComponent(Host);
    await flushPromises();

    expect(spies.initProcess).toHaveBeenCalledWith(
      expect.objectContaining({ enableCompare: true }),
    );
  });
});
