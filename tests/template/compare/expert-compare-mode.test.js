import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { activeTemplate, compareIndicator } from "@/store/states";
import { analysisGroup, dataLayer } from "../../support/layers";
import { bootExpert, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
const MAIN_ID = "N1_NO2_monthly";
const MAIN_TITLE = "Nitrogen Dioxide (Monthly)";
const COMPARE_ID = "N2_CO2_mean";
const COMPARE_TITLE = "Carbon Dioxide from OMI (daily)";

// One boot, one user journey; each test is a step.
describe("expert template - compare mode", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;
  // `eox-map` dispatches `layerschanged` once per `set layers`, so this counts
  // how many times the app wrote the map.
  let mapWrites = 0;

  /** The map button whose tooltip text matches (icon buttons have no name). */
  const btnByTooltip = (/** @type {string} */ text) =>
    /** @type {HTMLElement | undefined} */ (
      [...document.querySelectorAll(".map-buttons button")].find((b) =>
        b.textContent?.includes(text),
      )
    );

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    ctx.query("eox-map").addEventListener("layerschanged", () => mapWrites++);
  });

  afterAll(() => ctx?.app.unmount());

  test("boots in expert with no compare selection", () => {
    expect(ctx.store.selectedCompareStac).toBeFalsy();
    expect(ctx.query(".v-alert")).toBeNull();
  });

  test("selecting a main indicator reveals the compare button", async () => {
    await userEvent.click(
      page.getByRole("button", { name: "Select indicator" }),
    );
    await expect
      .poll(() => document.querySelector("eox-itemfilter"), {
        timeout: TIMEOUT,
      })
      .toBeTruthy();
    mapWrites = 0;
    await userEvent.click(page.getByText(MAIN_TITLE, { exact: true }));

    await expect
      .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(MAIN_ID);
    await expect
      .poll(() => btnByTooltip("Compare mode"), { timeout: TIMEOUT })
      .toBeTruthy();

    // the render lands after the store settles
    await expect.poll(() => mapWrites, { timeout: TIMEOUT }).toBeGreaterThan(0);
    expect(mapWrites).toBe(1);
  });

  test("the Compare button opens the picker and loads a second indicator", async () => {
    // Both pickers list the same collections, so the main one must be gone
    // before opening the compare one or the title would be ambiguous.
    await expect
      .poll(() => document.querySelectorAll("eox-itemfilter").length, {
        timeout: TIMEOUT,
      })
      .toBe(0);

    const btn = btnByTooltip("Compare mode");
    if (!btn) throw new Error("compare button not shown");
    await userEvent.click(btn);

    await expect
      .poll(() => document.querySelectorAll("eox-itemfilter").length, {
        timeout: TIMEOUT,
      })
      .toBe(1);
    mapWrites = 0;
    await userEvent.click(page.getByText(COMPARE_TITLE, { exact: true }));

    await vi.waitFor(
      () => {
        if (ctx.store.selectedCompareStac?.id !== COMPARE_ID) {
          throw new Error("compare indicator not loaded");
        }
      },
      { timeout: TIMEOUT },
    );
    // Switched to the compare template; the main indicator stays put.
    expect(activeTemplate.value).toBe("compare");
    expect(compareIndicator.value).toBeTruthy();
    expect(ctx.store.selectedStac?.id).toBe(MAIN_ID);

    expect(mapWrites).toBe(1);
  });

  test("the compare pane renders the second indicator's layer and control", async () => {
    // eox-map#compare always exists; a built data layer is the real proof.
    await vi.waitFor(
      () => {
        const layer = dataLayer(analysisGroup(ctx.query("eox-map#compare")));
        if (!layer?.properties?.id || !layer.properties?.title) {
          throw new Error("compare data layer not built");
        }
      },
      { timeout: TIMEOUT },
    );
    // Main + compare = two eox-layercontrol.
    await expect
      .poll(() => document.querySelectorAll("eox-layercontrol").length, {
        timeout: TIMEOUT,
      })
      .toBeGreaterThan(1);
    expect(ctx.query(".v-alert")).toBeNull();
  });
});
