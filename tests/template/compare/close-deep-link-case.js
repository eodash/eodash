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
const POSITION = { x: 12.3967, y: 47.477, z: 7.9424 };

/** @param {"expert" | "lite"} template */
export function testCloseDeepLink(template) {
  describe(`closing a comparison deep link in ${template}`, () => {
    /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
    let ctx;

    beforeAll(async () => {
      ctx = await bootTemplate({
        endpoint: ENDPOINT,
        initialUrl: `?template=${template}&indicator=${MAIN_ID}&compareindicator=${COMPARE_ID}&comparepoi=${POI_ID}&x=${POSITION.x}&y=${POSITION.y}&z=${POSITION.z}`,
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
        .poll(
          () =>
            ctx.query("eox-map#compare")?.map.getView() ===
            mainMap.map.getView(),
          { timeout: TIMEOUT },
        )
        .toBe(true);
      await expect
        .poll(
          () => {
            const view = mainMap.map.getView();
            const [x, y] = mainMap.lonLatCenter;
            return { x, y, z: view.getZoom(), animating: view.getAnimating() };
          },
          { timeout: TIMEOUT },
        )
        .toEqual({
          x: expect.closeTo(POSITION.x, 4),
          y: expect.closeTo(POSITION.y, 4),
          z: expect.closeTo(POSITION.z, 4),
          animating: false,
        });
      const center = mainMap.map.getView().getCenter()?.slice();
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
  });
}
