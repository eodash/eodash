import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { analysisGroup, dataLayerId } from "../../support/layers";
import {
  bootExpert,
  drawtoolsLayerId,
  selectIndicator,
  TIMEOUT,
} from "../../support/template";

const STAC_ENDPOINT =
  "https://esa-earthcode.github.io/science-hub-catalog/science-hub/catalog.json";
const INDICATOR_ID = "stormtracker";
const HOVER = "SelectLayerHoverInteraction";
const CLICK = "SelectLayerClickInteraction";

describe("expert template - feature selection in large geojsons", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  const layerId = () => dataLayerId(ctx.query("eox-map"));

  /** The drawtools and both select interactions all target the given layer id. */
  const expectSelectable = (/** @type {string} */ id) => {
    const si = ctx.query("eox-map")?.selectInteractions ?? {};
    expect(si[CLICK]?.selectLayer.get("id")).toBe(id);
    expect(si[HOVER]?.selectLayer.get("id")).toBe(id);
    expect(drawtoolsLayerId(ctx.container)).toBe(id);
  };

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    await selectIndicator(ctx.store, INDICATOR_ID);
  });

  afterAll(() => ctx?.app.unmount());

  test("the layer's features are selectable on intial load", async () => {
    await vi.waitFor(
      () => {
        const id = layerId();
        if (!id || id.split(";:;")[0] !== INDICATOR_ID) {
          throw new Error("data layer not ready");
        }
        if (drawtoolsLayerId(ctx.container) !== id) {
          throw new Error("features are not selectable");
        }
      },
      { timeout: TIMEOUT },
    );
    const id = layerId();
    if (!id) throw new Error("no data layer on the map");
    expectSelectable(id);
  });

  test("features stay selectable after changing the layer datetime", async () => {
    const mapEl = ctx.query("eox-map");
    const initialId = layerId();
    if (!initialId) throw new Error("no data layer on the map");
    const layer = analysisGroup(mapEl)?.layers.find(
      (l) => l.properties?.id === initialId,
    );
    if (!layer?.properties) throw new Error(`layer "${initialId}" not on map`);
    /** @type {{ controlValues: string[]; currentStep: string }} */
    const { controlValues, currentStep } = layer.properties.layerDatetime;
    const next = controlValues.find((d) => d !== currentStep);

    // What eox-layercontrol's timecontrol emits when the user changes the date.
    ctx.query("eox-layercontrol").dispatchEvent(
      new CustomEvent("datetime:updated", {
        detail: { layer: mapEl.getLayerById(initialId), datetime: next },
      }),
    );

    // The layer rebuilds under a new id; drawtools + selects re-sync to it.
    await vi.waitFor(
      () => {
        const id = layerId();
        if (!id || id === initialId) throw new Error("layer not rebuilt");
        if (drawtoolsLayerId(ctx.container) !== id) {
          throw new Error("drawtools not re-synced to the new layer");
        }
      },
      { timeout: TIMEOUT },
    );
    const rebuiltId = layerId();
    if (!rebuiltId) throw new Error("no data layer after rebuild");
    expectSelectable(rebuiltId);
  });
});
