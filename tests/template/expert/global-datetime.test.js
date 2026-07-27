import { afterAll, beforeAll, describe, test, vi } from "vitest";
import { datetime } from "@/store/states";
import { analysisGroup } from "../../support/layers";
import { bootExpert, selectIndicator, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://GTIF-Austria.github.io/public-catalog/GTIF-Austria/catalog.json";
// Three child collections on the same yearly grid (2024/2025). Snapping is
// unit-tested in create-layers.test.js; this covers the wiring: one global
// datetime fans out to every collection's layer.
const INDICATOR_ID = "geothermal_energy_potential";
const TARGET_DATETIME = "2024-03-01";
const EXPECTED_STEP = "2024-01-01T00:00:00.000Z";

describe("expert template - global datetime", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  /** Time-enabled analysis data layers (one per child collection). */
  const timedLayers = () =>
    analysisGroup(ctx.query("eox-map"))?.layers.filter(
      (l) => l.properties?.layerDatetime,
    ) ?? [];

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    await selectIndicator(ctx.store, INDICATOR_ID);
    // Wait until the child collections have hydrated their date grids (parquet).
    await vi.waitFor(
      () => {
        if (timedLayers().length < 2) throw new Error("collections not ready");
      },
      { timeout: TIMEOUT },
    );
  });

  afterAll(() => ctx?.app.unmount());

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
