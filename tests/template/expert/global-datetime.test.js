import { afterAll, beforeAll, describe, test, vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { datetime } from "@/store/states";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";
import { analysisGroup } from "../../support/layers";

const STAC_ENDPOINT =
  "https://GTIF-Austria.github.io/public-catalog/GTIF-Austria/catalog.json";
// Three child collections on the same yearly grid (2024/2025). Snapping is
// unit-tested in create-layers.test.js; this covers the wiring: one global
// datetime fans out to every collection's layer.
const INDICATOR_ID = "geothermal_energy_potential";
const TARGET_DATETIME = "2024-03-01";
const EXPECTED_STEP = "2024-01-01T00:00:00.000Z";
const BOOT_TIMEOUT = 1000 * 15;
const TIMEOUT = 1000 * 15;

describe("expert template - global datetime", () => {
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);
  const store = useSTAcStore(pinia);

  /** Time-enabled analysis data layers (one per child collection). */
  const timedLayers = () =>
    analysisGroup(query("eox-map"))?.layers.filter(
      (l) => l.properties?.layerDatetime,
    ) ?? [];

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
    // Wait until the child collections have hydrated their date grids (parquet).
    await vi.waitFor(
      () => {
        if (timedLayers().length < 2) throw new Error("collections not ready");
      },
      { timeout: TIMEOUT },
    );
  });

  afterAll(() => app?.unmount());

  test("snaps every collection's layer to the closest available date", async () => {
    datetime.value = TARGET_DATETIME;

    await vi.waitFor(
      () => {
        const layers = timedLayers();
        const snapped = layers.every(
          (l) => l.properties?.layerDatetime.currentStep === EXPECTED_STEP,
        );
        if (!layers.length || !snapped) {
          throw new Error(`layers did not snap to ${EXPECTED_STEP}`);
        }
      },
      { timeout: TIMEOUT },
    );
  });
});
