import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";
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

// Served from files because the upstream host sends no CORS header.
const MIRRORS = {
  "/stac/geoparquet": "tests/support/assets/stormtracker.parquet",
  "/data/geojson": "tests/support/assets/stormtracker.geojson",
  "/data/filtered_parquet":
    "tests/support/assets/stormtracker-refpoints.geojson",
};
const FEATURES = 1793;

describe("expert template - feature selection in large geojsons", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;

  const layerId = () => dataLayerId(ctx.query("eox-map"));

  /** Reads the rendered layer, so an unloaded source cannot pass as selectable. */
  const featureCount = (/** @type {string} */ id) =>
    ctx.query("eox-map").getLayerById(id)?.getSource()?.getFeatures()?.length ??
    0;

  /** The drawtools and both select interactions all target the given layer id. */
  const expectSelectable = (/** @type {string} */ id) => {
    const si = ctx.query("eox-map")?.selectInteractions ?? {};
    expect(si[CLICK]?.selectLayer.get("id")).toBe(id);
    expect(si[HOVER]?.selectLayer.get("id")).toBe(id);
    expect(drawtoolsLayerId(ctx.container)).toBe(id);
    expect(featureCount(id)).toBe(FEATURES);
  };

  beforeAll(async () => {
    await commands.serveFiles(MIRRORS);
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    await selectIndicator(ctx.store, INDICATOR_ID);
  });

  afterAll(async () => {
    await commands.stopServingFiles();
    ctx?.app.unmount();
  });

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
        if (featureCount(id) !== FEATURES)
          throw new Error("features not loaded");
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
    if (!next) throw new Error("the layer has only one datetime to switch to");

    // What eox-layercontrol's timecontrol emits when the user changes the date.
    const changeDatetime = () =>
      ctx.query("eox-layercontrol").dispatchEvent(
        new CustomEvent("datetime:updated", {
          detail: { layer: mapEl.getLayerById(initialId), datetime: next },
        }),
      );

    // The handler is debounced and drops the event while the app is still
    // settling, so redispatch on each attempt, slower than that debounce.
    await vi.waitFor(
      () => {
        const id = layerId();
        if (!id || id === initialId) {
          changeDatetime();
          throw new Error("layer not rebuilt");
        }
        if (drawtoolsLayerId(ctx.container) !== id) {
          throw new Error("drawtools not re-synced to the new layer");
        }
        if (featureCount(id) !== FEATURES) {
          throw new Error("rebuilt features not loaded");
        }
      },
      { timeout: TIMEOUT, interval: 1000 },
    );
    const rebuiltId = layerId();
    if (!rebuiltId) throw new Error("no data layer after rebuild");
    expectSelectable(rebuiltId);
  });

  test("clicking a feature selects it", async () => {
    const mapEl = ctx.query("eox-map");
    const id = layerId();
    if (!id) throw new Error("no data layer on the map");
    const [feature] = mapEl.getLayerById(id).getSource().getFeatures();
    const coordinate = feature.getGeometry().getCoordinates();

    // Centre the feature so a click on the map centre lands on it.
    mapEl.map.getView().setCenter(coordinate);
    mapEl.map.getView().setZoom(10);
    await new Promise((resolve) => mapEl.map.once("rendercomplete", resolve));
    await userEvent.click(mapEl);

    // The geojson features carry no id, so eox-map identifies them by ol uid.
    await expect
      .poll(() => mapEl.selectInteractions[CLICK]?.selectedFids ?? [], {
        timeout: TIMEOUT,
      })
      .toContain(feature.ol_uid);
    expect(ctx.query(".v-alert")).toBeNull();
  });
});
