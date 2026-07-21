import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useEventBus } from "@vueuse/core";
import EodashLayerControl from "^/EodashLayerControl.vue";
import { mapCompareEl, mapEl } from "@/store/states";
import {
  eodashCollections,
  eodashCompareCollections,
  layerControlFormValue,
  layerControlFormValueCompare,
} from "@/utils/states";
import { eoxLayersKey } from "@/utils/keys";
import { fakeOlLayer, vtDefinition } from "../fixtures/ol";
import { stubCustomElement } from "../support/elements";
import { mountAsyncComponent } from "../support/mount";

vi.mock("@eox/layercontrol", () => ({
  updateVectorLayerStyle: (/** @type {Record<string, unknown>} */ s) => s,
}));
vi.mock("@eox/jsonform", () => ({}));
vi.mock("@eox/timecontrol", () => ({}));
vi.mock("color-legend-element", () => ({}));

// Declared fields let the Vue binding heuristic assign `for`/`tools` as
// properties, not attributes.
stubCustomElement(
  "eox-layercontrol",
  class extends HTMLElement {
    /** @type {unknown} */
    for;
    /** @type {string[] | undefined} */
    tools;
  },
);
stubCustomElement("eox-jsonform");

/** @param {import("../support/mount").MountOptions} [options] */
const mountControl = (options) =>
  mountAsyncComponent(EodashLayerControl, options);

/** @returns {(HTMLElement & Record<string, any>) | null} */
const layercontrolEl = () => document.querySelector("eox-layercontrol");

/**
 * Satisfies useEmitLayersUpdate: Lit updateComplete, a truthy AnalysisGroup,
 * and a map whose "loadend" fires immediately so the bus emit can resolve.
 * @param {string} [id] Element id.
 * @returns {Record<string, any>} The eox-map stand-in.
 */
const mapStub = (id = "main") => ({
  id,
  layers: /** @type {Record<string, unknown>[]} */ ([]),
  updateComplete: Promise.resolve(),
  getLayerById: () => ({}),
  map: {
    once: (/** @type {string} */ _evt, /** @type {() => void} */ cb) => cb(),
  },
});

const withStac = { stac: { selectedStac: { id: "coll" } } };

const analysisResult = () => {
  const analysisLayers = [
    { type: "Tile", properties: { id: "coll;:;i2;:;3857" } },
  ];
  return [
    {
      type: "Group",
      properties: { id: "AnalysisGroup" },
      layers: analysisLayers,
    },
    { type: "Tile", properties: { id: "osm" } },
  ];
};

/**
 * Register a fake eodash collection that getColFromLayer resolves by id.
 * @param {Record<string, any>[] | undefined} updatedLayers updateLayerJson result.
 * @param {any[]} [collections] Singleton to seed (main or compare).
 * @returns {import("vitest").Mock} The updateLayerJson spy.
 */
const seedCollection = (updatedLayers, collections = eodashCollections) => {
  const updateLayerJson = vi.fn().mockResolvedValue(updatedLayers);
  collections.push(
    /** @type {any} */ ({ collectionStac: { id: "coll" }, updateLayerJson }),
  );
  return updateLayerJson;
};

/**
 * Dispatch datetime:updated and run out the 500ms debounce + handler.
 * @param {string} datetime
 */
const emitDatetime = async (datetime) => {
  layercontrolEl()?.dispatchEvent(
    new CustomEvent("datetime:updated", {
      detail: { layer: fakeOlLayer({ id: "coll;:;i1;:;3857" }), datetime },
    }),
  );
  await vi.advanceTimersByTimeAsync(600);
};

describe("EodashLayerControl", () => {
  beforeEach(() => {
    mapEl.value = null;
    mapCompareEl.value = null;
    eodashCollections.splice(0);
    eodashCompareCollections.splice(0);
    layerControlFormValue.value = {};
    layerControlFormValueCompare.value = {};
  });

  describe("render gating", () => {
    test("renders nothing without a selected stac", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      await mountControl();

      expect(layercontrolEl()).toBeNull();
    });

    test("renders nothing without a map element", async () => {
      await mountControl({ initialState: withStac });

      expect(layercontrolEl()).toBeNull();
    });

    test("renders with a map element and a selected stac", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      await mountControl({ initialState: withStac });

      expect(layercontrolEl()).toBeTruthy();
    });

    test("the second-map variant gates on the compare map and stac", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      await mountControl({
        props: { map: "second" },
        initialState: withStac,
      });
      expect(layercontrolEl()).toBeNull();

      mapCompareEl.value = /** @type {any} */ (mapStub("compare"));
      await mountControl({
        props: { map: "second" },
        initialState: { stac: { selectedCompareStac: { id: "cmp" } } },
      });
      expect(layercontrolEl()).toBeTruthy();
    });
  });

  describe("wiring", () => {
    test("binds the map element, tools and zoom-state onto eox-layercontrol", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      await mountControl({ initialState: withStac });

      const el = layercontrolEl();
      expect(el?.for).toBe(mapEl.value);
      expect(el?.tools).toEqual([
        "datetime",
        "info",
        "config",
        "legend",
        "opacity",
      ]);
      // Property binding, not attribute — eox-layercontrol reads the JS prop.
      expect(el?.showLayerZoomState).toBe(true);
      expect(el?.getAttribute("toolsAsList")).toBe("true");
    });

    test("remounts the element when the map identity changes", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      await mountControl({ initialState: withStac });
      const first = layercontrolEl();

      mapEl.value = /** @type {any} */ (mapStub());
      await expect
        .poll(() => layercontrolEl() && layercontrolEl() !== first)
        .toBeTruthy();
    });
  });

  describe("datetime:updated", () => {
    /** @type {import("vitest").Mock} */
    let busSpy;
    /** @type {() => void} */
    let offBus;
    /** @type {any[] | null} */
    let mapLayersAtEmit;

    beforeEach(() => {
      mapLayersAtEmit = null;
      busSpy = vi.fn(() => {
        mapLayersAtEmit = /** @type {any} */ (mapEl.value)?.layers;
      });
      offBus = useEventBus(eoxLayersKey).on(busSpy);
    });

    afterEach(() => {
      offBus();
      vi.useRealTimers();
    });

    test("debounces rapid updates, expands the new analysis layers and emits after assignment", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      const updated = analysisResult();
      const updateLayerJson = seedCollection(updated);
      await mountControl({ initialState: withStac });

      vi.useFakeTimers();
      layercontrolEl()?.dispatchEvent(
        new CustomEvent("datetime:updated", {
          detail: {
            layer: fakeOlLayer({ id: "coll;:;i1;:;3857" }),
            datetime: "2023-01-05T00:00:00Z",
          },
        }),
      );
      await emitDatetime("2023-01-10T00:00:00Z");

      // Debounced: only the trailing event reached the collection.
      expect(updateLayerJson).toHaveBeenCalledTimes(1);
      expect(updateLayerJson).toHaveBeenCalledWith(
        "2023-01-10T00:00:00Z",
        "coll;:;i1;:;3857",
        [],
      );
      // Characterization: expansion is forced on every analysis layer.
      const group = /** @type {any} */ (updated[0]);
      expect(group.layers[0].properties.layerControlExpand).toBe(true);
      expect(group.layers[0].properties.layerControlToolsExpand).toBe(true);
      expect(/** @type {any} */ (mapEl.value).layers).toBe(updated);
      expect(busSpy).toHaveBeenCalledWith("layertime:updated", updated);
      // The bus fires only after the map got the new layers.
      expect(mapLayersAtEmit).toBe(updated);
    });

    test("emits the compare event for the second map", async () => {
      mapCompareEl.value = /** @type {any} */ (mapStub("compare"));
      seedCollection(analysisResult(), eodashCompareCollections);
      await mountControl({
        props: { map: "second" },
        initialState: { stac: { selectedCompareStac: { id: "cmp" } } },
      });

      vi.useFakeTimers();
      await emitDatetime("2023-01-10T00:00:00Z");

      expect(busSpy).toHaveBeenCalledWith(
        "compareLayertime:updated",
        expect.any(Array),
      );
    });

    test("does nothing when the update contains no AnalysisGroup", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      const originalLayers = /** @type {any} */ (mapEl.value).layers;
      seedCollection([{ type: "Tile", properties: { id: "osm" } }]);
      await mountControl({ initialState: withStac });

      vi.useFakeTimers();
      await emitDatetime("2023-01-10T00:00:00Z");

      expect(/** @type {any} */ (mapEl.value).layers).toBe(originalLayers);
      expect(busSpy).not.toHaveBeenCalled();
    });

    test("does nothing when the collection resolves no layers", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      seedCollection([]);
      await mountControl({ initialState: withStac });

      vi.useFakeTimers();
      await emitDatetime("2023-01-10T00:00:00Z");

      expect(busSpy).not.toHaveBeenCalled();
    });
  });

  describe("layerConfig:change", () => {
    /**
     * @param {Record<string, any>} detail Event detail (layer + jsonformValue).
     * @returns {boolean | undefined}
     */
    const emitConfigChange = (detail) =>
      layercontrolEl()?.dispatchEvent(
        new CustomEvent("layerConfig:change", { detail }),
      );

    test("stores the form value for the first map", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      await mountControl({ initialState: withStac });

      emitConfigChange({
        layer: fakeOlLayer(),
        jsonformValue: { flood: 30 },
      });

      expect(layerControlFormValue.value).toEqual({ flood: 30 });
      expect(layerControlFormValueCompare.value).toEqual({});
    });

    test("stores the compare form value for the second map", async () => {
      mapCompareEl.value = /** @type {any} */ (mapStub("compare"));
      await mountControl({
        props: { map: "second" },
        initialState: { stac: { selectedCompareStac: { id: "cmp" } } },
      });

      emitConfigChange({
        layer: fakeOlLayer(),
        jsonformValue: { flood: 30 },
      });

      expect(layerControlFormValueCompare.value).toEqual({ flood: 30 });
      expect(layerControlFormValue.value).toEqual({});
    });

    test("routes the change through the real url-injection helper", async () => {
      mapEl.value = /** @type {any} */ (mapStub());
      await mountControl({ initialState: withStac });

      const source = { setUrl: vi.fn() };
      emitConfigChange({
        layer: fakeOlLayer({
          jsonDefinition: vtDefinition("https://vt/tiles"),
          source,
        }),
        jsonformValue: { flood: 30 },
      });

      expect(source.setUrl).toHaveBeenCalledWith(
        "https://vt/tiles?flood_percent=30",
      );
    });
  });
});
