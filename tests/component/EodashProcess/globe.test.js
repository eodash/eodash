import { afterEach, describe, expect, test, vi } from "vitest";
import EodashProcess from "^/EodashProcess/index.vue";
import { isGlobe } from "@/store/states";
import { mountComponent } from "../../support/mount";

// Processing is disabled in 3D: drawing and feature picking only work on the
// 2D map. The panel shows a note instead and keeps the form for the way back.
vi.mock("@eox/jsonform", () => ({}));
vi.mock("@eox/chart", () => ({}));
vi.mock("@eox/drawtools", () => ({}));
vi.mock("^/EodashChart.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("^/EodashProcess/ProcessList.vue", () => ({
  default: { template: "<div />" },
}));

const NOTE = "Processing is available in the 2D map.";

const container = () => document.querySelector(".eodash-process-container");

describe("EodashProcess in 3D", () => {
  afterEach(() => {
    isGlobe.value = false;
  });

  test("shows a note instead of the form", async () => {
    isGlobe.value = true;
    const { screen } = await mountComponent(EodashProcess);

    await expect.element(screen.getByText(NOTE)).toBeVisible();
    expect(container()).not.toBeVisible();
  });

  test("brings the same form back when leaving 3D", async () => {
    isGlobe.value = true;
    const { screen } = await mountComponent(EodashProcess);
    const form = container();

    isGlobe.value = false;

    await expect.element(screen.getByText(NOTE)).not.toBeInTheDocument();
    expect(container()).toBe(form);
    expect(form).toBeVisible();
  });
});
