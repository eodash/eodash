import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { datetime } from "@/store/states";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";
import { analysisGroup } from "../../support/layers";

const GTIF =
  "https://GTIF-Austria.github.io/public-catalog/GTIF-Austria/catalog.json";
const BOOT_TIMEOUT = 1000 * 15;
const TIMEOUT = 1000 * 15;

// A deep link with only x/y/z restores the map view. No indicator, so nothing
// zoom-to-extents over the restored position.
describe("expert template - deep link restores the map position", () => {
  const DEEP_LINK = "?x=12.3967&y=47.4770&z=7.9424&template=expert";
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);

  beforeAll(async () => {
    app = mountApp({
      initialUrl: DEEP_LINK,
      config: () => getBaseConfig({ stacEndpoint: { endpoint: GTIF } }),
    });
    await vi.waitFor(
      () => {
        if (!query("eox-map")) throw new Error("map was not initialised");
      },
      { timeout: BOOT_TIMEOUT },
    );
  });

  afterAll(() => app?.unmount());

  test("applies the zoom and center from the url", () => {
    expect(query("eox-map").map.getView().getZoom()).toBeCloseTo(7.9424, 1);
    const [x, y] = query("eox-map").lonLatCenter;
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
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);
  const store = useSTAcStore(pinia);

  beforeAll(async () => {
    app = mountApp({
      initialUrl: DEEP_LINK,
      config: () => getBaseConfig({ stacEndpoint: { endpoint: GTIF } }),
    });
    await vi.waitFor(
      () => {
        if (!query("eox-map")) throw new Error("map was not initialised");
      },
      { timeout: BOOT_TIMEOUT },
    );
  });

  afterAll(() => app?.unmount());

  test("restores the indicator and datetime from the url", async () => {
    await expect
      .poll(() => store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(INDICATOR_ID);
    expect(datetime.value.startsWith("2024-01-01")).toBe(true);
  });

  test("renders one analysis layer per child collection and gated widgets", async () => {
    await expect
      .poll(() => query("eox-layercontrol"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => query("eox-stacinfo"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => analysisGroup(query("eox-map"))?.layers.length ?? 0, {
        timeout: TIMEOUT,
      })
      .toBeGreaterThan(1);
  });
});
