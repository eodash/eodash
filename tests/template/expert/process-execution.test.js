import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { chartSpec, datetime } from "@/store/states";
import { analysisGroup } from "../../support/layers";
import {
  bootExpert,
  selectFeature,
  selectIndicator,
  targetFeatures,
} from "../../support/template";

const STAC_ENDPOINT =
  "https://GTIF-Austria.github.io/public-catalog/GTIF-Austria/catalog.json";
const INDICATOR_ID = "predictive_maintenance";
// Process execution fetches the timeseries/reference services over the network.
const TIMEOUT = 1000 * 20;

describe("expert template - process execution (predictive maintenance)", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  /** Reads the rendered result layer, so an unloaded source cannot pass. */
  const resultFeatureCount = () => {
    const mapEl = ctx.query("eox-map");
    const id = analysisGroup(mapEl)?.layers.find((l) =>
      l.properties?.id.includes("_process"),
    )?.properties?.id;
    return id
      ? (mapEl.getLayerById(id)?.getSource()?.getFeatures()?.length ?? 0)
      : 0;
  };

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    await selectIndicator(ctx.store, INDICATOR_ID);
    // Selectable once the drawtools re-synced and the layer's features loaded.
    await vi.waitFor(
      () => {
        if (!targetFeatures(ctx.container).length) {
          throw new Error("features not loaded");
        }
      },
      { timeout: TIMEOUT },
    );
  });

  afterAll(() => ctx?.app.unmount());

  test("clicking a feature executes the process and renders the chart and result features", async () => {
    selectFeature(ctx.container, 0);
    await vi.waitFor(
      () => {
        if (!ctx.query("eox-chart")) throw new Error("chart not rendered");
      },
      { timeout: TIMEOUT },
    );
    await vi.waitFor(
      () => {
        if (!resultFeatureCount()) {
          throw new Error("result features not loaded");
        }
      },
      { timeout: TIMEOUT },
    );
    expect(ctx.query(".v-alert")).toBeNull();
  });

  test("clicking another feature re-executes the process", async () => {
    const specBefore = chartSpec.value;
    selectFeature(ctx.container, 1);
    await vi.waitFor(
      () => {
        if (chartSpec.value === specBefore) {
          throw new Error("chart not recreated");
        }
      },
      { timeout: TIMEOUT },
    );
    expect(ctx.query("eox-chart")).toBeTruthy();
    // The result layer reloads after the chart, so it settles on its own.
    await vi.waitFor(
      () => {
        if (!resultFeatureCount()) {
          throw new Error("result features not reloaded");
        }
      },
      { timeout: TIMEOUT },
    );
    expect(ctx.query(".v-alert")).toBeNull();
  });

  test("clicking the chart throws no error and keeps the time", async () => {
    const before = datetime.value;
    await userEvent.click(ctx.query("eox-chart"));
    expect(ctx.query(".v-alert")).toBeNull();
    expect(datetime.value).toBe(before);
  });
});
