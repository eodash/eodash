import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { datetime } from "@/store/states";
import { analysisGroup } from "../../support/layers";
import { bootExpert, selectIndicator, TIMEOUT } from "../../support/template";

const STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
// Its child collections span the same days on different grids (hourly and
// daily), so one global datetime makes each layer snap to its own closest date.
const INDICATOR_ID = "city_temperature_indicator";
const TARGET_DATETIME = "2019-06-28";

describe("expert template - global datetime", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;
  // `eox-map` dispatches `layerschanged` once per `set layers`, so this counts
  // how many times the app wrote the map.
  let mapWrites = 0;

  /** Time-enabled analysis data layers (one per child collection). */
  const timedLayers = () =>
    analysisGroup(ctx.query("eox-map"))?.layers.filter(
      (l) => l.properties?.layerDatetime,
    ) ?? [];

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    ctx.query("eox-map").addEventListener("layerschanged", () => mapWrites++);
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

  test("snaps every collection's layer to its own closest available date", async () => {
    mapWrites = 0;
    datetime.value = TARGET_DATETIME;
    const target = new Date(TARGET_DATETIME).getTime();
    const distance = (/** @type {string} */ date) =>
      Math.abs(new Date(date).getTime() - target);

    await vi.waitFor(
      () => {
        const layers = timedLayers();
        if (layers.length < 2) throw new Error("collections not ready");
        for (const layer of layers) {
          /** @type {{ controlValues: string[]; currentStep: string }} */
          const { controlValues, currentStep } =
            layer.properties?.layerDatetime ?? {};
          const closest = Math.min(...controlValues.map(distance));
          if (distance(currentStep) > closest) {
            throw new Error(
              `${layer.properties?.id} snapped to a farther date`,
            );
          }
        }
      },
      { timeout: TIMEOUT },
    );

    expect(mapWrites).toBe(1);
  });
});
