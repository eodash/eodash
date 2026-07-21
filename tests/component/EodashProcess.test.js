import { beforeEach, describe, expect, test, vi } from "vitest";
import EodashProcess from "^/EodashProcess/index.vue";
import ProcessList from "^/EodashProcess/ProcessList.vue";
import { areChartsSeparateLayout, mapCompareEl, mapEl } from "@/store/states";
import { compareJobs, jobs } from "^/EodashProcess/states";
import { mountComponent } from "../support/mount";

// Heavy seams (process orchestration, jobs, eox elements, chart widget) are mocked;
// only this widget's render gating and run flow are under test.
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
    // Simulates initProcess resolving and populating the form schema.
    useInitProcess: vi.fn((/** @type {any} */ opts) => {
      if (state.schema) opts.jsonformSchema.value = state.schema;
    }),
    useAutoExec: vi.fn(),
    handleProcesses: vi.fn(),
    updateJobsStatus: vi.fn(),
    deleteJob: vi.fn(),
    downloadPreviousResults: vi.fn(),
    loadProcess: vi.fn(),
    getJobStatusUrl: vi.fn(() => "https://status"),
  };
});
vi.mock("^/EodashProcess/methods/composables", () => ({
  useInitProcess: spies.useInitProcess,
  useAutoExec: spies.useAutoExec,
}));
vi.mock("^/EodashProcess/methods/handling", () => ({
  handleProcesses: spies.handleProcesses,
}));
vi.mock("^/EodashProcess/methods/async", () => ({
  updateJobsStatus: spies.updateJobsStatus,
  deleteJob: spies.deleteJob,
  downloadPreviousResults: spies.downloadPreviousResults,
  loadProcess: spies.loadProcess,
  getJobStatusUrl: spies.getJobStatusUrl,
}));

const SCHEMA = { type: "object", properties: {} };
const jsonformEl = () => document.querySelector("eox-jsonform");

describe("EodashProcess", () => {
  beforeEach(() => {
    spies.state.schema = null;
    areChartsSeparateLayout.value = false;
    for (const key of ["useInitProcess", "useAutoExec", "handleProcesses"]) {
      vi.mocked(spies[key]).mockClear();
    }
  });

  test("renders no form until a schema is resolved", async () => {
    await mountComponent(EodashProcess);

    expect(jsonformEl()).toBeNull();
  });

  test("renders the jsonform once initProcess resolves a schema", async () => {
    spies.state.schema = SCHEMA;
    await mountComponent(EodashProcess);

    await expect.poll(() => jsonformEl()).toBeTruthy();
    expect(jsonformEl()?.schema).toEqual(SCHEMA);
  });

  test("initializes the process against the primary map by default", async () => {
    await mountComponent(EodashProcess);

    expect(spies.useInitProcess).toHaveBeenCalledWith(
      expect.objectContaining({ mapElement: mapEl }),
    );
  });

  test("initializes the process against the compare map when enabled", async () => {
    await mountComponent(EodashProcess, { props: { enableCompare: true } });

    expect(spies.useInitProcess).toHaveBeenCalledWith(
      expect.objectContaining({ mapElement: mapCompareEl }),
    );
  });

  test("runs the process when Execute is clicked", async () => {
    spies.state.schema = SCHEMA;
    const { screen } = await mountComponent(EodashProcess);
    await expect.poll(() => jsonformEl()).toBeTruthy();

    // startProcess validates via the jsonform editor before running.
    const form = /** @type {any} */ (jsonformEl());
    form.editor = { validate: () => [] };

    await screen.getByText("Execute").click();

    expect(spies.handleProcesses).toHaveBeenCalledWith(
      expect.objectContaining({ mapElement: mapEl.value }),
    );
  });
});

describe("EodashProcess ProcessList", () => {
  beforeEach(() => {
    jobs.value = [];
    compareJobs.value = [];
  });

  const seedJobs = () => {
    jobs.value = [
      {
        jobID: "j1",
        status: "successful",
        job_start_datetime: "2023-01-01T10:00:00Z",
      },
      {
        jobID: "j2",
        status: "running",
        job_start_datetime: "2023-01-02T10:00:00Z",
      },
    ];
  };

  test("renders nothing while there are no jobs", async () => {
    await mountComponent(ProcessList);

    expect(document.querySelector("table")).toBeNull();
  });

  test("renders a row per job", async () => {
    seedJobs();
    await mountComponent(ProcessList);

    await expect
      .poll(() => document.querySelectorAll("tbody tr").length)
      .toBe(2);
  });

  test("enables the load action only for successful jobs", async () => {
    seedJobs();
    await mountComponent(ProcessList);
    await expect
      .poll(() => document.querySelectorAll("tbody tr").length)
      .toBe(2);

    const rows = document.querySelectorAll("tbody tr");
    const loadBtn = (/** @type {Element} */ row) => row.querySelector("button");
    expect(loadBtn(rows[0])?.hasAttribute("disabled")).toBe(false);
    expect(loadBtn(rows[1])?.hasAttribute("disabled")).toBe(true);
  });
});
