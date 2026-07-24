import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";
import { analysisGroup } from "../../support/layers";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
const INDICATOR_ID = "NO2_daily";
const INDICATOR_TITLE = "Air Quality (tropospheric NO2 concetrations)";
// Configured in expert.js as the sole base layer.
const BASE_LAYER_ID = "terrain-light;:;EPSG:3857";
const BOOT_TIMEOUT = 1000 * 15;
const TIMEOUT = 1000 * 10;

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
      { timeout: BOOT_TIMEOUT },
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

  test("fills the page height", () => {
    expect(
      query("eox-map").getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(window.innerHeight);
  });

  test("assigns the configured base layer", async () => {
    await expect
      .poll(() => hasLayer(query("eox-map")?.layers, BASE_LAYER_ID), {
        timeout: TIMEOUT,
      })
      .toBe(true);
  });

  test("renders the layout switcher", () => {
    expect(query("#eodash-layout-switcher")).toBeTruthy();
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
    // Popup open from the previous test;
    await userEvent.click(page.getByText(INDICATOR_TITLE, { exact: true }));

    await expect
      .poll(() => store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(INDICATOR_ID);
    await expect
      .poll(() => query("eox-layercontrol"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => query("eox-stacinfo"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => analysisGroup(query("eox-map"))?.layers.length ?? 0, {
        timeout: TIMEOUT,
      })
      .toBeGreaterThan(0);
  });

  test("scrolling on the map zooms and syncs to the url", async () => {
    const getZ = () =>
      Number(new URLSearchParams(window.location.search).get("z"));
    const before = getZ();

    // Wheel over the map canvas zooms (OL MouseWheelZoom) -> moveend -> url z.
    await userEvent.wheel(query("eox-map"), { delta: { x: 0, y: 200 } });

    // Direction-agnostic: the zoom level changed and is written to the url.
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
