import { describe, expect, test, vi } from "vitest";
import { h, ref } from "vue";
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

describe("useAutoExec", () => {
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

    formEl.value?.dispatchEvent(new Event("change"));
    expect(startProcess).toHaveBeenCalled();
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
