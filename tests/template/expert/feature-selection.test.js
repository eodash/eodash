import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";
import { analysisGroup, dataLayer } from "../../support/layers";

const STAC_ENDPOINT =
  "https://esa-earthcode.github.io/science-hub-catalog/science-hub/catalog.json";
const INDICATOR_ID = "stormtracker";
const HOVER = "SelectLayerHoverInteraction";
const CLICK = "SelectLayerClickInteraction";
const BOOT_TIMEOUT = 1000 * 15;
const TIMEOUT = 1000 * 15;

describe("expert template - feature selection in large geojsons", () => {
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);
  const store = useSTAcStore(pinia);

  /** @returns {Record<string, any>} the map's select interactions. */
  const selects = () => query("eox-map")?.selectInteractions ?? {};
  /** The layerId injected into the process drawtools (its selection target). */
  const drawtoolsLayerId = () =>
    query("eox-jsonform")?.shadowRoot?.querySelector("eox-drawtools")?.layerId;
  /** The current analysis data-layer id on the map. */
  const dataLayerId = () =>
    dataLayer(analysisGroup(query("eox-map")))?.properties?.id;

  /** The drawtools and both select interactions all target the given layer id. */
  const expectSelectable = (/** @type {string} */ id) => {
    const si = selects();
    expect(si[CLICK]?.selectLayer.get("id")).toBe(id);
    expect(si[HOVER]?.selectLayer.get("id")).toBe(id);
    expect(drawtoolsLayerId()).toBe(id);
  };

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
  });

  afterAll(() => app?.unmount());

  test("the layer's features are selectable on intial load", async () => {
    await vi.waitFor(
      () => {
        const id = dataLayerId();
        if (!id || id.split(";:;")[0] !== INDICATOR_ID) {
          throw new Error("data layer not ready");
        }
        if (drawtoolsLayerId() !== id) {
          throw new Error("features are not selectable");
        }
      },
      { timeout: TIMEOUT },
    );
    const id = dataLayerId();
    if (!id) throw new Error("no data layer on the map");
    expectSelectable(id);
  });

  test("features stay selectable after changing the layer datetime", async () => {
    const mapEl = query("eox-map");
    const initialId = dataLayerId();
    if (!initialId) throw new Error("no data layer on the map");
    const layer = analysisGroup(mapEl)?.layers.find(
      (l) => l.properties?.id === initialId,
    );
    if (!layer?.properties) throw new Error(`layer "${initialId}" not on map`);
    /** @type {{ controlValues: string[]; currentStep: string }} */
    const { controlValues, currentStep } = layer.properties.layerDatetime;
    const next = controlValues.find((d) => d !== currentStep);

    // What eox-layercontrol's timecontrol emits when the user changes the date.
    query("eox-layercontrol").dispatchEvent(
      new CustomEvent("datetime:updated", {
        detail: { layer: mapEl.getLayerById(initialId), datetime: next },
      }),
    );

    // The layer rebuilds under a new id; drawtools + select interactions re-sync
    // to it (read from the map, not a hardcoded id).
    await vi.waitFor(
      () => {
        const id = dataLayerId();
        if (!id || id === initialId) throw new Error("layer not rebuilt");
        if (drawtoolsLayerId() !== id) {
          throw new Error("drawtools not re-synced to the new layer");
        }
      },
      { timeout: TIMEOUT },
    );
    const rebuiltId = dataLayerId();
    if (!rebuiltId) throw new Error("no data layer after rebuild");
    expectSelectable(rebuiltId);
  });
});
