import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
const INDICATOR_ID = "NO2_daily";
const INDICATOR_TITLE = "Air Quality (tropospheric NO2 concetrations)";

// One boot per file; the tests form an ordered scenario against a single app
// instance (clean boot first, then a real user selection mutates it).
describe("expert template", () => {
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);
  const store = useSTAcStore(pinia);

  beforeAll(async () => {
    app = mountApp({
      template: "expert",
      config: () =>
        getBaseConfig({ stacEndpoint: { endpoint: STAC_ENDPOINT } }),
    });
    await vi.waitFor(
      () => {
        if (!(query("eox-map") && store.stac?.length)) {
          throw new Error("map was not initialised");
        }
      },
      { timeout: 1000 * 15 },
    );
  });

  afterAll(() => app?.unmount());

  test("boots without an error alert", () => {
    expect(query(".v-alert")).toBeNull();
  });

  test("renders the map and btns", () => {
    expect(query("eox-map")).toBeTruthy();
    expect(query(".v-btn")).toBeTruthy();
  });

  test("selecting an indicator renders its layers and gated widgets", async () => {
    await userEvent.click(page.getByRole("button", { name: "Select indicator" }));
    await userEvent.fill(page.getByRole("textbox").first(), INDICATOR_TITLE);
    await userEvent.click(page.getByText(INDICATOR_TITLE, { exact: true }));

    // The selection propagated to the store.
    await expect
      .poll(() => store.selectedStac?.id, { timeout: 1000 * 15 })
      .toBe(INDICATOR_ID);

    // Selection gates these widgets into the DOM.
    await expect
      .poll(() => query("eox-layercontrol"), { timeout: 1000 * 15 })
      .toBeTruthy();
    await expect
      .poll(() => query("eox-stacinfo"), { timeout: 1000 * 15 })
      .toBeTruthy();

    // The indicator's data layers land in the map's AnalysisGroup.
    await expect
      .poll(
        () =>
          query("eox-map")?.layers?.find(
            (/** @type {any} */ l) => l?.properties?.id === "AnalysisGroup",
          )?.layers?.length ?? 0,
        { timeout: 1000 * 15 },
      )
      .toBeGreaterThan(0);
  });
});
