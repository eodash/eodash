import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { compareIndicator, comparePoi } from "@/store/states";
import { bootExpert, TIMEOUT } from "../../support/template";

const ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
const MAIN_ID = "N1_NO2_monthly";
const COMPARE_ID = "N3a2_chl_concentration_tri_esa";
const COMPARE_TITLE = "Chlorophyll-a concentration from Sentinel-3";
const POI_ID = "NorthAdriatic";

/** @param {string} text */
function mapButton(text) {
  const button = [...document.querySelectorAll(".map-buttons button")].find(
    (candidate) => candidate.textContent?.includes(text),
  );
  if (!(button instanceof HTMLElement)) {
    throw new Error(`Map button not found: ${text}`);
  }
  return button;
}

describe("compare POI selection URL wiring", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootExpert({
      endpoint: ENDPOINT,
      initialUrl: `?template=expert&indicator=${MAIN_ID}`,
    });
  });

  afterAll(() => ctx?.app.unmount());

  test("selects a compare location through the map and clears its URL on close", async () => {
    await expect
      .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(MAIN_ID);
    await userEvent.click(mapButton("Compare mode"));
    await userEvent.click(page.getByText(COMPARE_TITLE, { exact: true }));
    await expect
      .poll(() => ctx.store.selectedCompareStac?.id, { timeout: TIMEOUT })
      .toBe(COMPARE_ID);

    /** @type {import("@eox/map").EOxMap} */
    const map = ctx.query("eox-map#compare");
    await expect
      .poll(() => map.selectInteractions?.["SelectLayerClickInteraction"], {
        timeout: TIMEOUT,
      })
      .toBeTruthy();
    const layer = /** @type {import("ol/layer/Vector").default} */ (
      map.getLayerById("geodb-collection")
    );
    const feature = layer
      .getSource()
      ?.getFeatures()
      .find((item) => item.get("id") === POI_ID);
    const geometry =
      /** @type {import("ol/geom/Point").default | undefined} */ (
        feature?.getGeometry()
      );
    if (!geometry) throw new Error("North Adriatic location is missing");
    const coordinate = geometry.getCoordinates();
    const size = map.map.getSize();
    if (!size) throw new Error("Compare map has no size");
    // Place the point inside the exposed comparison pane, away from side panels.
    map.map
      .getView()
      .centerOn(coordinate, size, [size[0] * 0.65, size[1] * 0.5]);
    await new Promise((resolve) => map.map.once("rendercomplete", resolve));
    const [x, y] = map.map.getPixelFromCoordinate(coordinate);
    await userEvent.click(map.map.getViewport(), { position: { x, y } });

    await expect
      .poll(() => ctx.store.selectedCompareStac?.id, { timeout: TIMEOUT })
      .toBe(POI_ID);
    expect(compareIndicator.value).toBe(COMPARE_ID);
    expect(comparePoi.value).toBe(POI_ID);
    await expect
      .poll(() => new URLSearchParams(window.location.search).get("comparepoi"))
      .toBe(POI_ID);
    expect(ctx.store.selectedStac?.id).toBe(MAIN_ID);

    await userEvent.click(mapButton("Close comparison"));
    await expect.poll(() => ctx.store.selectedCompareStac).toBeNull();
    await expect
      .poll(() => new URLSearchParams(window.location.search).has("comparepoi"))
      .toBe(false);
    expect(
      new URLSearchParams(window.location.search).has("compareindicator"),
    ).toBe(false);
    expect(ctx.store.selectedStac?.id).toBe(MAIN_ID);
  });
});

describe("compare POI deep-link restoration", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootExpert({
      endpoint: ENDPOINT,
      initialUrl: `?template=compare&indicator=${MAIN_ID}&compareindicator=${COMPARE_ID}&comparepoi=${POI_ID}`,
    });
  });

  afterAll(() => ctx?.app.unmount());

  test("restores the compare location while preserving both parent indicators", async () => {
    await expect
      .poll(() => ctx.store.selectedCompareStac?.id, { timeout: TIMEOUT })
      .toBe(POI_ID);
    expect(ctx.store.selectedStac?.id).toBe(MAIN_ID);
    expect(compareIndicator.value).toBe(COMPARE_ID);
    expect(comparePoi.value).toBe(POI_ID);
    const params = new URLSearchParams(window.location.search);
    expect(params.get("compareindicator")).toBe(COMPARE_ID);
    expect(params.get("comparepoi")).toBe(POI_ID);
  });
});
