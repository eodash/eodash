import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";

  // A process-free indicator
const INDICATOR_ID = "population_density";

// Booting with `?indicator=` should have useURLSearchParametersSync restore that
// selection on load, with no interaction — the same end state as a manual select.
describe("expert template - url state sync", () => {
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel */
  const query = (sel) => /** @type {any} */ (app.container.querySelector(sel));
  const store = useSTAcStore(pinia);

  beforeAll(async () => {
    app = mountApp({
      initialUrl: `?template=expert&indicator=${INDICATOR_ID}`,
      config: () =>
        getBaseConfig({ stacEndpoint: { endpoint: STAC_ENDPOINT } }),
    });
    await vi.waitFor(
      () => {
        if (!query("eox-map")) throw new Error("app did not boot");
      },
      { timeout: 1000 * 15 },
    );
  });

  afterAll(() => app?.unmount());

  test("restores the selected indicator from the url", async () => {
    await expect
      .poll(() => store.selectedStac?.id, { timeout: 1000 * 15 })
      .toBe(INDICATOR_ID);
  });

  test("renders the restored indicator's layers and gated widgets", async () => {
    await expect
      .poll(() => query("eox-layercontrol"), { timeout: 1000 * 15 })
      .toBeTruthy();
    await expect
      .poll(() => query("eox-stacinfo"), { timeout: 1000 * 15 })
      .toBeTruthy();
    // The async layer build lands the indicator's data layers in the AnalysisGroup.
    await expect
      .poll(
        () =>
          /** @type {import("@eox/map").EOxMap} */
          (query("eox-map"))
            ?.layers?.find((l) => l?.properties?.id === "AnalysisGroup")
            //@ts-expect-error todo`
            ?.layers?.length,
        { timeout: 1000 * 15 },
      )
      .toBeGreaterThan(0);
  });
});
