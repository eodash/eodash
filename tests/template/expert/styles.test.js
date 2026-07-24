import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";
import { analysisGroup, dataLayer } from "../../support/layers";

const STAC_ENDPOINT =
  "https://GTIF-Austria.github.io/public-catalog/GTIF-Austria/catalog.json";
// Collection with a `style` link: flat style + variables, tooltip and jsonform.
const INDICATOR_ID = "UEPI_visualizer_2";
const BOOT_TIMEOUT = 1000 * 15;
const TIMEOUT = 1000 * 15;

describe("expert template - eodash styles", () => {
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
    const child = store.stac?.find((l) => l.id === INDICATOR_ID);
    if (!child) throw new Error(`indicator "${INDICATOR_ID}" not in catalog`);
    await store.loadSelectedSTAC(child.href);
    await vi.waitFor(
      () => {
        if (!dataLayer(analysisGroup(query("eox-map")))) {
          throw new Error("data layer not rendered");
        }
      },
      { timeout: TIMEOUT },
    );
  });

  afterAll(() => app?.unmount());

  test("applies the style to the data layer", () => {
    const layer = /** @type {any} */ (
      dataLayer(analysisGroup(query("eox-map")))
    );
    // A style with `variables` is managed through the layercontrol form, so it
    // is attached as layerConfig.style instead of the layer's top-level style.
    const { layerConfig } = layer.properties;
    expect(layerConfig.style["fill-color"]).toBeTruthy();
    expect(layerConfig.style.variables).toBeTruthy();
    expect(layerConfig.schema).toBeTruthy(); // the style's jsonform
  });

  test("sets the tooltip from the style", async () => {
    // Style tooltip definitions flow into tooltipProperties, which toggles the
    // map tooltip's visibility. The main map's tooltip is adopted into the
    // eox-map shadow DOM (OL overlay), so query it there.
    await vi.waitFor(
      () => {
        const tooltip =
          query("eox-map")?.shadowRoot?.querySelector("eox-map-tooltip");
        if (tooltip?.style.visibility !== "visible") {
          throw new Error("tooltip not enabled");
        }
      },
      { timeout: TIMEOUT },
    );
  });
});
