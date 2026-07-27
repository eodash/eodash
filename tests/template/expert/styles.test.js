import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { analysisGroup, dataLayer } from "../../support/layers";
import { bootExpert, selectIndicator, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://GTIF-Austria.github.io/public-catalog/GTIF-Austria/catalog.json";
// Collection with a `style` link: flat style + variables, tooltip and jsonform.
const INDICATOR_ID = "UEPI_visualizer_2";

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
    // A style with `variables` is managed through the layercontrol form, so it
    // is attached as layerConfig.style instead of the layer's top-level style.
    const { layerConfig } = layer.properties;
    expect(layerConfig.style["fill-color"]).toBeTruthy();
    expect(layerConfig.style.variables).toBeTruthy();
    expect(layerConfig.schema).toBeTruthy(); // the style's jsonform
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
