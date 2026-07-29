import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { analysisGroup, dataLayer } from "../../support/layers";
import { bootExpert, selectIndicator, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
// Its data layer has a style with variables, a jsonform and a tooltip.
const INDICATOR_ID = "client_side_rendering";

describe("expert template - eodash styles", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    await selectIndicator(ctx.store, INDICATOR_ID);
    await vi.waitFor(
      () => {
        if (!dataLayer(analysisGroup(ctx.query("eox-map")))) {
          throw new Error("data layer not rendered");
        }
      },
      { timeout: TIMEOUT },
    );
  });

  afterAll(() => ctx?.app.unmount());

  test("applies the style to the data layer", () => {
    const layer = /** @type {any} */ (
      dataLayer(analysisGroup(ctx.query("eox-map")))
    );
    // OpenLayers exposes applied variables only privately, so assert the style
    // the layer rendered from.
    expect(ctx.query("eox-map").getLayerById(layer.properties.id)).toBeTruthy();
    expect(layer.style.variables).toMatchObject({ vmin: 0, vmax: 200 });
    expect(layer.style.tooltip).toBeTruthy();
    expect(layer.properties.layerConfig?.schema).toBeTruthy();
  });

  test("sets the tooltip from the style", async () => {
    // The main map's tooltip is adopted into the eox-map shadow DOM.
    await vi.waitFor(
      () => {
        const tooltip = ctx
          .query("eox-map")
          ?.shadowRoot?.querySelector("eox-map-tooltip");
        if (tooltip?.style.visibility !== "visible") {
          throw new Error("tooltip not enabled");
        }
      },
      { timeout: TIMEOUT },
    );
  });
});
