import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { chartSpec, datetime } from "@/store/states";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";
import { analysisGroup } from "../../support/layers";

const STAC_ENDPOINT =
  "https://GTIF-Austria.github.io/public-catalog/GTIF-Austria/catalog.json";
const INDICATOR_ID = "predictive_maintenance";
const BOOT_TIMEOUT = 1000 * 15;
// Process execution fetches the timeseries/reference services over the network.
const TIMEOUT = 1000 * 20;

describe("expert template - process execution (predictive maintenance)", () => {
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);
  const store = useSTAcStore(pinia);

  /** The layerId injected into the process drawtools (its selection target). */
  const drawtoolsLayerId = () =>
    query("eox-jsonform")?.shadowRoot?.querySelector("eox-drawtools")?.layerId;

  /** The features of the drawtools' target layer on the map. */
  const targetFeatures = () =>
    query("eox-map")
      ?.getLayerById(drawtoolsLayerId())
      ?.getSource?.()
      ?.getFeatures?.() ?? [];

  /** Select a feature the way a map click does: the click interaction
   * dispatches "select" on the map, which the drawtools' selectHandler
   * consumes (copy to draw layer -> form value -> auto-exec). */
  const selectFeature = (/** @type {number} */ index) => {
    const feature = targetFeatures()[index];
    expect(feature, `feature #${index} on the target layer`).toBeTruthy();
    query("eox-map").dispatchEvent(
      new CustomEvent("select", {
        detail: { id: "SelectLayerClickInteraction", feature },
      }),
    );
  };

  /** A process result layer rendered into the analysis group. */
  const hasResultLayer = () =>
    analysisGroup(query("eox-map"))?.layers.some((l) =>
      l.properties?.id.includes("_process"),
    );

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
    // Selectable once the drawtools re-synced and the layer's features loaded.
    await vi.waitFor(
      () => {
        if (!targetFeatures().length) throw new Error("features not loaded");
      },
      { timeout: TIMEOUT },
    );
  });

  afterAll(() => app?.unmount());

  test("clicking a feature executes the process and renders the chart and result features", async () => {
    selectFeature(0);
    await vi.waitFor(
      () => {
        if (!query("eox-chart")) throw new Error("chart not rendered");
      },
      { timeout: TIMEOUT },
    );
    await vi.waitFor(
      () => {
        if (!hasResultLayer()) throw new Error("result layer not rendered");
      },
      { timeout: TIMEOUT },
    );
    expect(query(".v-alert")).toBeNull();
  });

  test("clicking another feature re-executes the process", async () => {
    const specBefore = chartSpec.value;
    selectFeature(1);
    await vi.waitFor(
      () => {
        if (chartSpec.value === specBefore) {
          throw new Error("chart not recreated");
        }
      },
      { timeout: TIMEOUT },
    );
    expect(query("eox-chart")).toBeTruthy();
    expect(hasResultLayer()).toBe(true);
    expect(query(".v-alert")).toBeNull();
  });

  test("clicking the chart throws no error and keeps the time", async () => {
    const before = datetime.value;
    await userEvent.click(query("eox-chart"));
    expect(query(".v-alert")).toBeNull();
    expect(datetime.value).toBe(before);
  });
});
