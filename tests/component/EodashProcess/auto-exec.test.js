import { beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import EodashProcess from "^/EodashProcess/index.vue";
import { mountComponent } from "../../support/mount";

// useAutoExec/useInitProcess stay real (they own the option -> button/auto-run
// behaviour); only the network/orchestration seams are stubbed.
vi.mock("@eox/jsonform", () => ({}));
vi.mock("@eox/chart", () => ({}));
vi.mock("@eox/drawtools", () => ({}));
vi.mock("^/EodashChart.vue", () => ({
  default: { name: "EodashChartStub", template: "<div class='chart-stub' />" },
}));

const spies = vi.hoisted(() => {
  const state = { schema: /** @type {any} */ (null) };
  return {
    state,
    // Set in onMounted, after useAutoExec's schema watch is registered.
    initProcess: vi.fn((/** @type {any} */ opts) => {
      if (state.schema) opts.jsonformSchema.value = state.schema;
    }),
    updateJsonformIdentifier: vi.fn(),
    handleProcesses: vi.fn(),
    updateJobsStatus: vi.fn(),
    deleteJob: vi.fn(),
    downloadPreviousResults: vi.fn(),
    loadProcess: vi.fn(),
    getJobStatusUrl: vi.fn(() => "https://status"),
  };
});
vi.mock("^/EodashProcess/methods/handling", () => ({
  initProcess: spies.initProcess,
  updateJsonformIdentifier: spies.updateJsonformIdentifier,
  handleProcesses: spies.handleProcesses,
}));
vi.mock("^/EodashProcess/methods/async", () => ({
  updateJobsStatus: spies.updateJobsStatus,
  deleteJob: spies.deleteJob,
  downloadPreviousResults: spies.downloadPreviousResults,
  loadProcess: spies.loadProcess,
  getJobStatusUrl: spies.getJobStatusUrl,
}));

// A drawtools-bearing field so startProcess has a property to gate on.
const SCHEMA_MANUAL = {
  type: "object",
  properties: {
    aoi: { type: "geojson", options: { drawtools: { layerId: "x" } } },
  },
};
const SCHEMA_AUTO = { ...SCHEMA_MANUAL, options: { execute: true } };

const jsonformEl = () => document.querySelector("eox-jsonform");
const execButton = () =>
  /** @type {HTMLElement | undefined} */ (
    [...document.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Execute"),
    )
  );

/** Prime the raw jsonform element so startProcess passes its gates. */
const primeForm = () => {
  const form = /** @type {any} */ (jsonformEl());
  form.editor = { validate: () => [] };
  form.value = { aoi: ["feature"] };
};

describe("EodashProcess auto-exec option", () => {
  beforeEach(() => {
    spies.state.schema = null;
    spies.initProcess.mockClear();
    spies.handleProcesses.mockClear();
  });

  test("shows the Execute button and runs only on click when execute is unset", async () => {
    spies.state.schema = SCHEMA_MANUAL;
    await mountComponent(EodashProcess);

    await expect.poll(() => jsonformEl()).toBeTruthy();
    await expect.poll(() => execButton()).toBeTruthy();

    // A form change must NOT auto-run the process without the option.
    primeForm();
    jsonformEl()?.dispatchEvent(new Event("change"));
    await flushPromises();
    expect(spies.handleProcesses).not.toHaveBeenCalled();

    execButton()?.click();
    await expect
      .poll(() => spies.handleProcesses.mock.calls.length)
      .toBeGreaterThan(0);
  });

  test("hides the Execute button and auto-runs on form change when execute is true", async () => {
    spies.state.schema = SCHEMA_AUTO;
    await mountComponent(EodashProcess);

    await expect.poll(() => jsonformEl()).toBeTruthy();
    // autoExec true -> the Execute button is never rendered.
    await expect.poll(() => execButton()).toBeFalsy();

    // Retry the dispatch until the change listener attaches (nextTick), spaced
    // past the listener's debounce so a retry cannot keep resetting it.
    primeForm();
    await vi.waitFor(
      () => {
        jsonformEl()?.dispatchEvent(new Event("change"));
        expect(spies.handleProcesses).toHaveBeenCalled();
      },
      { interval: 400, timeout: 5000 },
    );
  });
});
