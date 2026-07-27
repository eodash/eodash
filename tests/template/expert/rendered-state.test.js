import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { analysisGroup, dataLayer, dataLayerId } from "../../support/layers";
import { bootExpert, selectIndicator, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
const IMAGE_LEGEND_ID = "ndvi_deepESDL";
const COLOR_LEGEND_ID =
  "Absorbing Aerosol Index (AAI) by Sentinel-5P TROPOMI (Monthly)";

// Boot once, switch selection through the store, inspect the rendered state.
describe("expert template - rendered state", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  /** Select an indicator and wait for its layers to replace the previous. */
  const select = async (/** @type {string} */ id) => {
    const prevId = dataLayerId(ctx.query("eox-map"));
    await selectIndicator(ctx.store, id);
    await vi.waitFor(
      () => {
        const dl = dataLayerId(ctx.query("eox-map"));
        if (!dl || dl === prevId) throw new Error("layers not rebuilt");
      },
      { timeout: TIMEOUT },
    );
  };

  /** The selected indicator's data-layer properties on the map. */
  const dataLayerProperties = () => {
    const layer = dataLayer(analysisGroup(ctx.query("eox-map")));
    if (!layer?.properties) throw new Error("no data layer on the map");
    return layer.properties;
  };

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
  });

  afterAll(() => ctx?.app.unmount());

  test("stac info shows the title and description", async () => {
    await select(IMAGE_LEGEND_ID);
    const title = ctx.store.selectedStac?.title ?? "";
    const description = ctx.store.selectedStac?.description ?? "";
    // eox-stacinfo renders into shadow DOM; page locators pierce it.
    await expect.element(page.getByText(title).first()).toBeVisible();

    const body = description.replace(/^#+ .*(\n|$)/, "");
    const probe = (body.match(/[A-Za-z][A-Za-z ]{18,}/) ?? [""])[0].trim();
    await expect.element(page.getByText(probe).first()).toBeInTheDocument();
  });

  test("the analysis group is expanded", () => {
    expect(
      analysisGroup(ctx.query("eox-map"))?.properties?.layerControlExpand,
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
