import { describe, expect, test } from "vitest";
import { bootTemplate, TIMEOUT } from "../../support/template";
import { analysisGroup, dataLayer } from "../../support/layers";
import { decodeParam, encodeParam } from "@/utils/url-param-codec";

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
const INDICATOR_ID = "N1_NO2_monthly";

describe("url-state-sync: layers and process parameters", () => {
  test("restores layer visibility and opacity from url", async () => {
    const layersDelta = {
      [INDICATOR_ID]: {
        v: false,
        o: 0.45,
      },
    };
    const encodedLayers = encodeParam(layersDelta);
    const initialUrl = `?template=expert&indicator=${INDICATOR_ID}&layers=${encodedLayers}`;

    const ctx = await bootTemplate({
      endpoint: STAC_ENDPOINT,
      initialUrl,
    });

    try {
      await expect
        .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
        .toBe(INDICATOR_ID);

      const mapEl = ctx.query("eox-map#main");
      await expect
        .poll(() => dataLayer(analysisGroup(mapEl))?.properties?.id, {
          timeout: TIMEOUT,
        })
        .toBeTruthy();

      const dl = dataLayer(analysisGroup(mapEl));
      const fullId = dl?.properties?.id;
      const olLayer = mapEl.getLayerById(fullId);

      expect(olLayer?.getVisible()).toBe(false);
      expect(olLayer?.getOpacity()).toBeCloseTo(0.45, 2);
    } finally {
      ctx.app.unmount();
    }
  });

  test("restores compare process and compare layers from url in compare mode", async () => {
    const MAIN_ID = "N1_NO2_monthly";
    const COMPARE_ID = "N2_CO2_mean";

    const compareLayersDelta = {
      [COMPARE_ID]: {
        v: false,
        o: 0.6,
      },
    };
    const compareProcessDelta = {
      example_parameter_1: 7,
    };

    const initialUrl = `?template=compare&indicator=${MAIN_ID}&compareindicator=${COMPARE_ID}&comparelayers=${encodeParam(
      compareLayersDelta,
    )}&compareprocess=${encodeParam(compareProcessDelta)}`;

    const ctx = await bootTemplate({
      endpoint: STAC_ENDPOINT,
      initialUrl,
    });

    try {
      await expect
        .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
        .toBe(MAIN_ID);
      await expect
        .poll(() => ctx.store.selectedCompareStac?.id, { timeout: TIMEOUT })
        .toBe(COMPARE_ID);

      const compareMapEl = ctx.query("eox-map#compare");
      await expect
        .poll(() => dataLayer(analysisGroup(compareMapEl))?.properties?.id, {
          timeout: TIMEOUT,
        })
        .toBeTruthy();

      const dl = dataLayer(analysisGroup(compareMapEl));
      const fullId = dl?.properties?.id;
      const olLayer = compareMapEl.getLayerById(fullId);

      expect(olLayer?.getVisible()).toBe(false);
      expect(olLayer?.getOpacity()).toBeCloseTo(0.6, 2);

      // Assert compare process jsonform value restored
      await expect
        .poll(
          () => {
            const forms = document.querySelectorAll("eox-jsonform");
            for (const form of forms) {
              const val = /** @type {any} */ (form).value;
              if (val?.example_parameter_1 === 7) return 7;
            }
            return null;
          },
          { timeout: TIMEOUT },
        )
        .toBe(7);
    } finally {
      ctx.app.unmount();
    }
  });

  test("syncs layercontrol changes and process updates into url parameters", async () => {
    const ctx = await bootTemplate({
      endpoint: STAC_ENDPOINT,
      initialUrl: `?template=expert&indicator=${INDICATOR_ID}`,
    });

    try {
      await expect
        .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
        .toBe(INDICATOR_ID);

      const mapEl = ctx.query("eox-map#main");
      await expect
        .poll(() => dataLayer(analysisGroup(mapEl))?.properties?.id, {
          timeout: TIMEOUT,
        })
        .toBeTruthy();

      const dl = dataLayer(analysisGroup(mapEl));
      const fullId = dl?.properties?.id;
      const olLayer = mapEl.getLayerById(fullId);

      // Change visibility and opacity
      olLayer.setVisible(false);
      olLayer.setOpacity(0.3);

      const lc = ctx.query("eox-layercontrol");
      lc?.dispatchEvent(
        new CustomEvent("layerchange", { detail: olLayer, bubbles: true }),
      );

      await expect
        .poll(() => new URLSearchParams(window.location.search).has("layers"), {
          timeout: TIMEOUT,
        })
        .toBe(true);

      const encoded = new URLSearchParams(window.location.search).get("layers");
      const decoded = decodeParam(encoded);
      const matchKey = Object.keys(decoded).find(
        (k) => k.startsWith(INDICATOR_ID) || INDICATOR_ID.startsWith(k),
      );
      expect(decoded[matchKey]).toMatchObject({ v: false, o: 0.3 });
    } finally {
      ctx.app.unmount();
    }
  });
});
