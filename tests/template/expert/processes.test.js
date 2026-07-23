import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
// Indicators whose STAC collection has a `service` link (includesProcess).
const PROCESS_INDICATORS = ["NO2_daily", "methane_monitoring"];

// Boot once (so the map is ready), then switch selection through several process
// indicators via the store. Store-driven switching is intentional here: this
// file covers process rendering across many indicators, not the selection UI.
describe("expert template - processes", () => {
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
      { timeout: 1000 * 15 },
    );
  });

  afterAll(() => app?.unmount());

  test.each(PROCESS_INDICATORS)(
    "renders the process form when %s is selected",
    async (id) => {
      const child = store.stac?.find((link) => link.id === id);
      expect(child, `indicator "${id}" present in catalog`).toBeTruthy();

      await store.loadSelectedSTAC(/** @type {string} */ (child.href));
      await expect
        .poll(() => store.selectedStac?.id, { timeout: 1000 * 15 })
        .toBe(id);

      // includesProcess -> EodashProcess mounts its jsonform + drawtools.
      await expect
        .poll(() => query("eox-jsonform"), { timeout: 1000 * 15 })
        .toBeTruthy();
      expect(query("eox-drawtools")).toBeTruthy();
    },
  );
});