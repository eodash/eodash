import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { datetime } from "@/store/states";
import { analysisGroup } from "../../support/layers";
import { bootExpert, TIMEOUT } from "../../support/template";

const GTIF =
  "https://GTIF-Austria.github.io/public-catalog/GTIF-Austria/catalog.json";

// A deep link with only x/y/z restores the map view. No indicator, so nothing
// zoom-to-extents over the restored position.
describe("expert template - deep link restores the map position", () => {
  const DEEP_LINK = "?x=12.3967&y=47.4770&z=7.9424&template=expert";
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: GTIF, initialUrl: DEEP_LINK });
  });

  afterAll(() => ctx?.app.unmount());

  test("applies the zoom and center from the url", () => {
    expect(ctx.query("eox-map").map.getView().getZoom()).toBeCloseTo(7.9424, 1);
    const [x, y] = ctx.query("eox-map").lonLatCenter;
    expect(x).toBeCloseTo(12.3967, 1);
    expect(y).toBeCloseTo(47.477, 1);
  });
});

// Booting with `?indicator=&datetime=` restores that selection on load with no
// interaction. GTIME is a process-free multi-child indicator: no drawtools
// initialises during the boot race (a process indicator throws inside
// eox-drawtools), and each child renders its own analysis layer.
describe("expert template - deep link restores indicator, datetime and layers", () => {
  const INDICATOR_ID = "GTIME";
  const DEEP_LINK = `?template=expert&indicator=${INDICATOR_ID}&datetime=2024-01-01`;
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: GTIF, initialUrl: DEEP_LINK });
  });

  afterAll(() => ctx?.app.unmount());

  test("restores the indicator and datetime from the url", async () => {
    await expect
      .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(INDICATOR_ID);
    expect(datetime.value.startsWith("2024-01-01")).toBe(true);
  });

  test("renders one analysis layer per child collection and gated widgets", async () => {
    await expect
      .poll(() => ctx.query("eox-layercontrol"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => ctx.query("eox-stacinfo"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => analysisGroup(ctx.query("eox-map"))?.layers.length ?? 0, {
        timeout: TIMEOUT,
      })
      .toBeGreaterThan(1);
  });
});
