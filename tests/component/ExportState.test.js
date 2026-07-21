import { beforeEach, describe, expect, test, vi } from "vitest";
import { nextTick } from "vue";
import ExportState from "^/ExportState.vue";
import { availableMapProjection, chartSpec, mapPosition } from "@/store/states";
import { layerControlFormValue } from "@/utils/states";
import { mountComponent } from "../support/mount";

// Avoid pulling in the heavy @eox/chart bundle; export just needs a deterministic encoding.
vi.mock("@eox/chart", () => ({
  base64EncodeSpec: (/** @type {unknown} */ spec) =>
    `b64:${JSON.stringify(spec)}`,
}));

const layers = () => [
  {
    type: "Tile",
    properties: {
      id: "layer-1",
      title: "My Layer",
      visible: true,
      // noise under properties
      internalToken: "should-not-leak",
      debugState: { foo: "bar" },
      renderConfig: { tileCache: true },
    },
  },
];

describe("ExportState", () => {
  /** @type {import("vitest").MockInstance} */
  let writeText;

  beforeEach(() => {
    // Module-singleton state read by the export code generators.
    mapPosition.value = [10, 20, 5];
    availableMapProjection.value = "EPSG:3857";
    chartSpec.value = null;
    layerControlFormValue.value = {};

    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
      });
    }
    writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
  });

  test("hides the chart export button while there is no chart spec", async () => {
    const { screen } = await mountComponent(ExportState, {
      props: { modelValue: true, getLayers: layers },
    });

    await expect.element(screen.getByText("copy as simple map")).toBeVisible();
    await expect
      .element(screen.getByText("copy as layers configuration"))
      .toBeVisible();
    await expect
      .element(screen.getByText("copy as map tour section"))
      .toBeVisible();
    await expect.element(screen.getByText("copy as chart")).not.toBeVisible();
  });

  test("shows the chart export section when a chart spec is present", async () => {
    chartSpec.value = /** @type {import("vega-embed").VisualizationSpec} */ ({
      mark: "line",
    });
    const { screen } = await mountComponent(ExportState, {
      props: { modelValue: true, getLayers: layers },
    });

    await expect.element(screen.getByText("copy as chart")).toBeVisible();
    await expect
      .element(screen.getByText("Chart Spec (for export)"))
      .toBeInTheDocument();
  });

  test("renders the cleaned layers configuration from getLayers", async () => {
    await mountComponent(ExportState, {
      props: { modelValue: true, getLayers: layers },
    });

    await expect
      .poll(() => document.querySelector(".code-block")?.textContent)
      .toContain("layer-1");

    const config = document.querySelector(".code-block")?.textContent ?? "";
    // kept: id/title/visible
    expect(config).toContain("My Layer");
    expect(config).toContain("visible");
    // stripped: everything else under properties
    expect(config).not.toContain("internalToken");
    expect(config).not.toContain("debugState");
    expect(config).not.toContain("renderConfig");
  });

  test("copies the map entry code to the clipboard", async () => {
    const { screen } = await mountComponent(ExportState, {
      props: { modelValue: true, getLayers: layers },
    });

    await screen.getByText("copy as simple map").click();

    await expect.poll(() => writeText).toHaveBeenCalled();
    const [text] = writeText.mock.calls[0];
    expect(text).toContain('zoom="5"');
    expect(text).toContain("center=[10,20]");
    expect(text).toContain('projection="EPSG:3857"');
    expect(text).toContain("layer-1");

    await expect.element(screen.getByText("copied!")).toBeInTheDocument();
  });

  test("reverts the copied indicator after two seconds", async () => {
    const { screen } = await mountComponent(ExportState, {
      props: { modelValue: true, getLayers: layers },
    });

    // Fake timers only after mounting: mount's flushPromises and retriable assertions need real timers.
    vi.useFakeTimers();
    try {
      await screen.getByText("copy as simple map").click();
      await vi.advanceTimersByTimeAsync(0);
      expect(screen.getByText("copied!").query()).toBeTruthy();

      await vi.advanceTimersByTimeAsync(2000);
      await nextTick();
      expect(screen.getByText("copied!").query()).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
