import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";
import { analysisGroup, dataLayer } from "../../support/layers";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";

const IMAGE_LEGEND_ID = "ndvi_deepESDL";
const COLOR_LEGEND_ID =
  "Absorbing Aerosol Index (AAI) by Sentinel-5P TROPOMI (Monthly)";
const BOOT_TIMEOUT = 1000 * 15;
const TIMEOUT = 1000 * 10;

// Boot once, switch selection through the store, inspect the rendered state.
describe("expert template - rendered state", () => {
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);
  const store = useSTAcStore(pinia);

  /** Select an indicator and wait for its layers to replace the previous. */
  const select = async (/** @type {string} */ id) => {
    const prevId = dataLayer(analysisGroup(query("eox-map")))?.properties?.id;
    const child = store.stac?.find((l) => l.id === id);
    if (!child) throw new Error(`indicator "${id}" not in catalog`);
    await store.loadSelectedSTAC(child.href);
    await vi.waitFor(
      () => {
        if (store.selectedStac?.id !== id) throw new Error("not selected");
        const dl = dataLayer(analysisGroup(query("eox-map")));
        if (!dl || dl.properties?.id === prevId) {
          throw new Error("layers not rebuilt");
        }
      },
      { timeout: TIMEOUT },
    );
  };

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

  /** The selected indicator's data-layer properties on the map. */
  const dataLayerProperties = () => {
    const layer = dataLayer(analysisGroup(query("eox-map")));
    if (!layer?.properties) throw new Error("no data layer on the map");
    return layer.properties;
  };

  test("stac info shows the title and description", async () => {
    await select(IMAGE_LEGEND_ID);
    const title = store.selectedStac?.title ?? "";
    const description = store.selectedStac?.description ?? "";
    // eox-stacinfo renders into shadow DOM; page locators pierce it.
    await expect.element(page.getByText(title).first()).toBeVisible();

    const body = description.replace(/^#+ .*(\n|$)/, "");
    const probe = (body.match(/[A-Za-z][A-Za-z ]{18,}/) ?? [""])[0].trim();
    await expect.element(page.getByText(probe).first()).toBeInTheDocument();
  });

  test("the analysis group is expanded", () => {
    expect(
      analysisGroup(query("eox-map"))?.properties?.layerControlExpand,
    ).toBe(true);
  });

  test("an image-legend layer carries the layer-control properties", () => {
    // ndvi_deepESDL selected above.
    const properties = dataLayerProperties();
    expect(properties.id).toBeTruthy();
    expect(properties.title).toBeTruthy();
    expect(properties.description).toBeTruthy(); // image legend
    expect(properties.layerDatetime).toBeTruthy();
    expect(properties.timeControlValues).toBeTruthy();
    expect(properties.timeControlProperty).toBe("TIME");
    expect(properties.layerControlExpand).toBe(true);
    expect(properties.layerControlToolsExpand).toBe(true);
  });

  test("a colour-legend layer carries layerLegend", async () => {
    await select(COLOR_LEGEND_ID);
    const properties = dataLayerProperties();
    expect(properties.layerLegend).toBeTruthy(); // eox:colorlegend scale
    expect(properties.description).toBeUndefined(); // mutually exclusive
    expect(properties.timeControlProperty).toBe("TIME");
    expect(properties.layerControlExpand).toBe(true);
    expect(properties.layerControlToolsExpand).toBe(true);
  });
});
