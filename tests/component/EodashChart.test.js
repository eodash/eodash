import { beforeEach, describe, expect, test, vi } from "vitest";
import { mdiArrowCollapse, mdiArrowExpand } from "@mdi/js";
import EodashChart from "^/EodashChart.vue";
import { onChartClick } from "^/EodashProcess/methods/handling";
import {
  areChartsSeparateLayout,
  chartData,
  chartSpec,
  compareChartData,
  compareChartSpec,
} from "@/store/states";
import { mountComponent } from "../support/mount";

vi.mock("@eox/chart", () => ({}));
vi.mock("^/EodashProcess/methods/handling", () => ({ onChartClick: vi.fn() }));

/** @returns {(HTMLElement & { spec?: any, dataValues?: any, opt?: any }) | null} */
const chartEl = () => document.querySelector("eox-chart");

/** @returns {string | undefined} The toggle button's SVG path `d`. */
const toggleIconPath = () =>
  document.querySelector(".chart-toggle svg path")?.getAttribute("d") ??
  undefined;

const SPEC = { mark: "line", description: "main" };
const SPEC_WITH_BINDING = {
  mark: "line",
  params: [{ name: "cutoff", bind: { input: "range", min: 0, max: 10 } }],
};

describe("EodashChart", () => {
  beforeEach(() => {
    // Chart sources are module singletons shared across the app.
    chartData.value = null;
    compareChartData.value = null;
    chartSpec.value = null;
    compareChartSpec.value = null;
    areChartsSeparateLayout.value = false;
    vi.mocked(onChartClick).mockClear();
  });

  test("renders neither the chart nor the toggle without data", async () => {
    await mountComponent(EodashChart);

    await expect.poll(() => chartEl()).toBeNull();
    expect(document.querySelector(".chart-toggle")).toBeNull();
  });

  test("renders the chart and toggle once data and spec are present", async () => {
    chartData.value = [{ x: 1, y: 2 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);

    await expect.poll(() => chartEl()).toBeTruthy();
    expect(document.querySelector(".chart-toggle")).toBeTruthy();
  });

  test("forces the rendered spec to fill its container and keeps other fields", async () => {
    chartData.value = [{ x: 1 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);

    await expect.poll(() => chartEl()?.spec?.height).toBe("container");
    expect(chartEl()?.spec?.width).toBe("container");
    expect(chartEl()?.spec?.mark).toBe("line");
    expect(chartEl()?.spec?.description).toBe("main");
  });

  test("binds the chart data to eox-chart's dataValues", async () => {
    chartData.value = [{ x: 1, y: 2 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);

    await expect.poll(() => chartEl()).toBeTruthy();
    expect(chartEl()?.dataValues).toEqual([{ x: 1, y: 2 }]);
  });

  test("passes the default vega embed options", async () => {
    chartData.value = [{ x: 1 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);

    await expect.poll(() => chartEl()).toBeTruthy();
    expect(chartEl()?.opt).toEqual({ actions: true });
  });

  test("passes custom vega embed options from the prop", async () => {
    chartData.value = [{ x: 1 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart, {
      props: { vegaEmbedOptions: { actions: false, renderer: "svg" } },
    });

    await expect.poll(() => chartEl()).toBeTruthy();
    expect(chartEl()?.opt).toEqual({ actions: false, renderer: "svg" });
  });

  test("uses the compare sources when enableCompare is set", async () => {
    compareChartData.value = [{ y: 9 }];
    compareChartSpec.value = { mark: "bar" };
    await mountComponent(EodashChart, { props: { enableCompare: true } });

    await expect.poll(() => chartEl()?.spec?.mark).toBe("bar");
    expect(chartEl()?.dataValues).toEqual([{ y: 9 }]);
  });

  test("ignores compare-only sources when enableCompare is false", async () => {
    compareChartData.value = [{ y: 9 }];
    compareChartSpec.value = { mark: "bar" };
    await mountComponent(EodashChart);

    await expect.poll(() => chartEl()).toBeNull();
  });

  test("pads the frame when the spec has a UI binding", async () => {
    chartSpec.value = SPEC_WITH_BINDING;
    await mountComponent(EodashChart);

    await expect
      .poll(() => document.querySelector(".chart-frame")?.style.paddingBottom)
      .toBe("25px");
  });

  test("does not pad the frame when the spec has no UI binding", async () => {
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);

    await expect
      .poll(() => document.querySelector(".chart-frame")?.style.paddingBottom)
      .toBe("0px");
  });

  test("toggles areChartsSeparateLayout when the toggle is clicked", async () => {
    chartData.value = [{ x: 1 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);
    await expect
      .poll(() => document.querySelector(".chart-toggle"))
      .toBeTruthy();

    const toggle = /** @type {HTMLElement} */ (
      document.querySelector(".chart-toggle")
    );
    toggle.click();
    await expect.poll(() => areChartsSeparateLayout.value).toBe(true);

    toggle.click();
    await expect.poll(() => areChartsSeparateLayout.value).toBe(false);
  });

  test("shows the expand icon while charts share the layout", async () => {
    chartData.value = [{ x: 1 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);

    await expect.poll(() => toggleIconPath()).toBe(mdiArrowExpand);
  });

  test("shows the collapse icon while charts are in separate layout", async () => {
    areChartsSeparateLayout.value = true;
    chartData.value = [{ x: 1 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);

    await expect.poll(() => toggleIconPath()).toBe(mdiArrowCollapse);
  });

  test("delegates chart item clicks to onChartClick", async () => {
    chartData.value = [{ x: 1 }];
    chartSpec.value = SPEC;
    await mountComponent(EodashChart);
    await expect.poll(() => chartEl()).toBeTruthy();

    chartEl()?.dispatchEvent(
      new CustomEvent("click:item", { detail: { value: 42 } }),
    );

    await expect.poll(() => vi.mocked(onChartClick)).toHaveBeenCalled();
  });

  test("shows the Maximize tooltip on hover while sharing the layout", async () => {
    chartData.value = [{ x: 1 }];
    chartSpec.value = SPEC;
    const { screen } = await mountComponent(EodashChart);
    await expect
      .poll(() => document.querySelector(".chart-toggle"))
      .toBeTruthy();

    await screen.getByRole("button").hover();

    await expect.element(screen.getByText("Maximize")).toBeVisible();
  });
});
