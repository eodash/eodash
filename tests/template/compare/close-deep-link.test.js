import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { activeTemplate } from "@/store/states";
import { analysisGroup } from "../../support/layers";
import { bootTemplate, TIMEOUT } from "../../support/template";

const ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
const MAIN_ID = "N1_NO2_monthly";
const COMPARE_ID = "N3a2_chl_concentration_tri_esa";
const POI_ID = "NorthAdriatic";

// Lite disables the comparison picker, but must still allow exiting a deep link.
describe.each(["expert", "lite"])(
  "closing a comparison deep link in %s",
  (template) => {
    /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
    let ctx;

    beforeAll(async () => {
      ctx = await bootTemplate({
        endpoint: ENDPOINT,
        initialUrl: `?template=${template}&indicator=${MAIN_ID}&compareindicator=${COMPARE_ID}&comparepoi=${POI_ID}`,
      });
    });

    afterAll(() => ctx?.app.unmount());

    test("closes the comparison without changing the template or main map view", async () => {
      await expect
        .poll(() => ctx.store.selectedCompareStac?.id, { timeout: TIMEOUT })
        .toBe(POI_ID);
      await expect
        .poll(() => ctx.query("eox-map-compare")?.enabled, { timeout: TIMEOUT })
        .toBe("");
      expect(activeTemplate.value).toBe(template);

      /** @type {import("@eox/map").EOxMap} */
      const mainMap = ctx.query("eox-map#main");
      await expect
        .poll(
          () =>
            analysisGroup(mainMap)?.layers.some((layer) =>
              layer.properties?.id?.startsWith(MAIN_ID),
            ),
          { timeout: TIMEOUT },
        )
        .toBe(true);
      await expect
        .poll(() => ctx.query("eox-map#compare").map.getView(), {
          timeout: TIMEOUT,
        })
        .toBe(mainMap.map.getView());
      await expect
        .poll(() => mainMap.map.getView().getAnimating(), { timeout: TIMEOUT })
        .toBe(false);
      const center = [1500000, 6000000];
      // A user pan interrupts any startup fly-to animation.
      mainMap.map.getView().cancelAnimations();
      const moved = new Promise((resolve) =>
        mainMap.map.once("moveend", resolve),
      );
      mainMap.map.getView().setCenter(center);
      await moved;
      expect(mainMap.map.getView().getCenter()).toEqual(center);
      const zoom = mainMap.map.getView().getZoom();

      const closeButton = [
        ...ctx.container.querySelectorAll(".map-buttons button"),
      ].find((button) => button.textContent?.includes("Close comparison"));
      if (!(closeButton instanceof HTMLElement))
        throw new Error("comparison close button missing");
      await userEvent.click(closeButton);

      await expect.poll(() => ctx.store.selectedCompareStac).toBeNull();
      await expect
        .poll(() => ctx.query("eox-map-compare")?.enabled)
        .toBe("first");
      await expect
        .poll(() =>
          new URLSearchParams(window.location.search).has("compareindicator"),
        )
        .toBe(false);
      expect(
        new URLSearchParams(window.location.search).has("comparepoi"),
      ).toBe(false);
      expect(activeTemplate.value).toBe(template);
      expect(new URLSearchParams(window.location.search).get("template")).toBe(
        template,
      );
      expect(ctx.store.selectedStac?.id).toBe(MAIN_ID);
      expect(ctx.query("eox-map#main")).toBe(mainMap);
      expect(mainMap.map.getView().getCenter()).toEqual(center);
      expect(mainMap.map.getView().getZoom()).toBe(zoom);
      expect(ctx.query(".v-overlay--active")).toBeNull();
    });
  },
);
