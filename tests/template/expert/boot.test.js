import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { analysisGroup } from "../../support/layers";
import { bootExpert, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
const INDICATOR_ID = "NO2_daily";
const INDICATOR_TITLE = "Air Quality (tropospheric NO2 concetrations)";
// Configured in expert.js as the sole base layer.
const BASE_LAYER_ID = "terrain-light;:;EPSG:3857";

/**
 * Depth-first search for a layer id across nested eox-map layer groups.
 * @param {any[]} layers
 * @param {string} id
 * @returns {boolean}
 */
const hasLayer = (layers, id) =>
  (layers ?? []).some(
    (l) => l?.properties?.id === id || hasLayer(l?.layers, id),
  );

// One boot per file; the tests form an ordered scenario against a single app
// instance (fresh boot -> open the picker -> select -> interact).
describe("expert template", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
  });

  afterAll(() => ctx?.app.unmount());

  test("boots without an error alert", () => {
    expect(ctx.query(".v-alert")).toBeNull();
  });

  test("renders the map and btns", () => {
    expect(ctx.query("eox-map")).toBeTruthy();
    expect(ctx.query(".v-btn")).toBeTruthy();
  });

  test("fills the page height", () => {
    expect(
      ctx.query("eox-map").getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(window.innerHeight);
  });

  test("assigns the configured base layer", async () => {
    await expect
      .poll(() => hasLayer(ctx.query("eox-map")?.layers, BASE_LAYER_ID), {
        timeout: TIMEOUT,
      })
      .toBe(true);
  });

  test("renders the layout switcher", () => {
    expect(ctx.query("#eodash-layout-switcher")).toBeTruthy();
  });

  test("clicking select indicator opens the item filter popup", async () => {
    await userEvent.click(
      page.getByRole("button", { name: "Select indicator" }),
    );
    // The popup teleports to document.body, so query the document.
    await expect
      .poll(() => document.querySelector("eox-itemfilter"), {
        timeout: TIMEOUT,
      })
      .toBeTruthy();
  });

  test("lists every collection in the item filter", async () => {
    /** @type {import("stac-ts").StacCatalog} */
    const catalog = await fetch(STAC_ENDPOINT).then((r) => r.json());
    const childCount = catalog.links.filter((l) => l.rel === "child").length;
    await expect
      .poll(
        () =>
          /** @type {any} */ (document.querySelector("eox-itemfilter"))?.items
            ?.length,
        { timeout: TIMEOUT },
      )
      .toBe(childCount);
  });

  test("selecting an indicator renders its layers and gated widgets", async () => {
    // The popup is still open from the previous test.
    await userEvent.click(page.getByText(INDICATOR_TITLE, { exact: true }));

    await expect
      .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(INDICATOR_ID);
    await expect
      .poll(() => ctx.query("eox-layercontrol"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => ctx.query("eox-stacinfo"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => analysisGroup(ctx.query("eox-map"))?.layers.length ?? 0, {
        timeout: TIMEOUT,
      })
      .toBeGreaterThan(0);
  });

  test("scrolling on the map zooms and syncs to the url", async () => {
    const getZ = () =>
      Number(new URLSearchParams(window.location.search).get("z"));
    const before = getZ();

    // Wheel zoom -> moveend -> url z. Direction-agnostic.
    await userEvent.wheel(ctx.query("eox-map"), { delta: { x: 0, y: 200 } });

    await expect
      .poll(
        () => {
          const z = getZ();
          return Number.isFinite(z) && z !== before;
        },
        { timeout: TIMEOUT },
      )
      .toBe(true);
  });
});
