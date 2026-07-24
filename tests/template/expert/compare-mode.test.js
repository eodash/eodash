import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { activeTemplate, compareIndicator } from "@/store/states";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";
import { analysisGroup, dataLayer } from "../../support/layers";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
const MAIN_ID = "NO2_daily";
const MAIN_TITLE = "Air Quality (tropospheric NO2 concetrations)";
const COMPARE_ID = "methane_monitoring";
const COMPARE_TITLE = "Methane monitoring";
const BOOT_TIMEOUT = 1000 * 15;
const TIMEOUT = 1000 * 15;

// One boot, one user journey: expert -> pick a main indicator -> Compare button
// -> pick a second indicator -> the compare pane renders. Each test is a step.
describe("expert template - compare mode", () => {
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);
  const store = useSTAcStore(pinia);

  /** The map button whose tooltip text matches (icon buttons have no name). */
  const btnByTooltip = (/** @type {string} */ text) =>
    /** @type {HTMLElement | undefined} */ (
      [...document.querySelectorAll(".map-buttons button")].find((b) =>
        b.textContent?.includes(text),
      )
    );

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
      { timeout: BOOT_TIMEOUT },
    );
  });

  afterAll(() => app?.unmount());

  test("boots in expert with no compare selection", () => {
    expect(store.selectedCompareStac).toBeFalsy();
    expect(query(".v-alert")).toBeNull();
  });

  test("selecting a main indicator reveals the compare button", async () => {
    await userEvent.click(
      page.getByRole("button", { name: "Select indicator" }),
    );
    await expect
      .poll(() => document.querySelector("eox-itemfilter"), { timeout: TIMEOUT })
      .toBeTruthy();
    await userEvent.click(page.getByText(MAIN_TITLE, { exact: true }));

    await expect
      .poll(() => store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(MAIN_ID);
    await expect
      .poll(() => btnByTooltip("Compare mode"), { timeout: TIMEOUT })
      .toBeTruthy();
  });

  test("the Compare button opens the picker and loads a second indicator", async () => {
    // Both pickers list the same collections, so the main picker must be gone
    // before opening the compare one or COMPARE_TITLE would be ambiguous.
    await expect
      .poll(() => document.querySelectorAll("eox-itemfilter").length)
      .toBe(0);

    const btn = btnByTooltip("Compare mode");
    if (!btn) throw new Error("compare button not shown");
    await userEvent.click(btn);

    await expect
      .poll(() => document.querySelectorAll("eox-itemfilter").length, {
        timeout: TIMEOUT,
      })
      .toBe(1);
    await userEvent.click(page.getByText(COMPARE_TITLE, { exact: true }));

    await vi.waitFor(
      () => {
        if (store.selectedCompareStac?.id !== COMPARE_ID) {
          throw new Error("compare indicator not loaded");
        }
      },
      { timeout: TIMEOUT },
    );
    // Switched to the compare template; the main indicator stays put.
    expect(activeTemplate.value).toBe("compare");
    expect(compareIndicator.value).toBeTruthy();
    expect(store.selectedStac?.id).toBe(MAIN_ID);
  });

  test("the compare pane renders the second indicator's layer and control", async () => {
    // The compare collection built a real data layer (id + title), not an empty
    // group; eox-map#compare always exists, so the layer content is the proof.
    await vi.waitFor(
      () => {
        const layer = dataLayer(analysisGroup(query("eox-map#compare")));
        if (!layer?.properties?.id || !layer.properties?.title) {
          throw new Error("compare data layer not built");
        }
      },
      { timeout: TIMEOUT },
    );
    // The compare template rendered its own layer control for the second map
    // (main + compare = two eox-layercontrol).
    expect(
      document.querySelectorAll("eox-layercontrol").length,
    ).toBeGreaterThan(1);
    expect(query(".v-alert")).toBeNull();
  });
});
