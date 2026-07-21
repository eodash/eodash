import { beforeEach, describe, expect, test, vi } from "vitest";
import EodashMap from "^/EodashMap/index.vue";
import {
  compareIndicator,
  indicator,
  mapEl,
  mapPosition,
  poi,
  tooltipAdapter,
} from "@/store/states";
import { layerControlFormValue } from "@/utils/states";
import { stubCustomElement } from "../../support/elements";
import { mountAsyncComponent } from "../../support/mount";

vi.mock("@eox/map", () => ({}));
vi.mock("@eox/map/src/plugins/advancedLayersAndSources", () => ({}));
vi.mock("@eox/map/src/plugins/globe", () => ({}));

// Map composables (STAC -> layers) are spied; useUpdateTooltipProperties can seed tooltip props.
const seed = vi.hoisted(() => ({ main: /** @type {any[] | null} */ (null) }));
const methods = vi.hoisted(() => ({
  useHandleMapMoveEnd: vi.fn(),
  useInitMap: vi.fn(),
  useMapLoading: vi.fn(),
  useUpdateTooltipProperties: vi.fn(),
}));
vi.mock("^/EodashMap/methods", () => ({
  useHandleMapMoveEnd: methods.useHandleMapMoveEnd,
  useInitMap: methods.useInitMap,
  useMapLoading: methods.useMapLoading,
  useUpdateTooltipProperties: vi.fn(
    (
      /** @type {any} */ _c,
      /** @type {any} */ propsRef,
      /** @type {any} */ isCompare,
    ) => {
      if (seed.main && !isCompare) propsRef.value = seed.main;
    },
  ),
}));

// Capture the props forwarded to the (separately tested) buttons component.
const btnsCapture = vi.hoisted(() => ({ props: /** @type {any} */ (null) }));
vi.mock("^/EodashMap/EodashMapBtns.vue", () => ({
  default: {
    name: "BtnsStub",
    props: [
      "exportMap",
      "changeProjection",
      "compareIndicators",
      "backToPOIs",
      "enableSearch",
      "enableZoom",
      "enableGlobe",
      "enableFeedback",
      "searchParams",
    ],
    setup(/** @type {any} */ props) {
      btnsCapture.props = props;
      return {};
    },
    template: "<div class='btns-stub' />",
  },
}));

// Minimal eox-map so onMounted's `globeConfig.terrain` assignment succeeds (an
// unhandled throw there cascades into unrelated failures).
stubCustomElement(
  "eox-map",
  class extends HTMLElement {
    globeConfig = {};
  },
);

/** @returns {(Element & Record<string, any>) | null} The main eox-map element. */
const mainMap = () => document.querySelector("eox-map#main");
/** @returns {(Element & Record<string, any>) | undefined} The main tooltip element. */
const mainTooltip = () =>
  /** @type {any} */ (document.querySelectorAll("eox-map-tooltip")[0]);

describe("EodashMap", () => {
  beforeEach(() => {
    seed.main = null;
    indicator.value = "";
    compareIndicator.value = "";
    poi.value = "";
    mapEl.value = null;
    mapPosition.value = [];
    tooltipAdapter.value = null;
    layerControlFormValue.value = {};
    for (const fn of Object.values(methods)) vi.mocked(fn).mockClear();
  });

  describe("eox-map property wiring", () => {
    test("clones the base layers onto the map", async () => {
      await mountAsyncComponent(EodashMap, {
        props: {
          baseLayers: [{ type: "Tile", properties: { id: "custom-base" } }],
        },
      });

      await expect.poll(() => mainMap()?.layers).toBeTruthy();
      expect(mainMap()?.layers[0].properties.id).toBe("custom-base");
    });

    test("binds center, zoom, controls and animation options onto eox-map", async () => {
      await mountAsyncComponent(EodashMap, {
        props: { center: [10, 20], zoom: 6 },
      });

      await expect.poll(() => mainMap()).toBeTruthy();
      const el = mainMap();
      expect(el?.center).toEqual([10, 20]);
      expect(el?.zoom).toBe(6);
      expect(el?.controls.Attribution).toBeTruthy();
      // Starts at 0 for the initial jump, bumped post-mount for smooth flyTo.
      await expect.poll(() => el?.animationOptions?.duration).toBe(1200);
    });

    test("formats cursor coordinates through the MousePosition control", async () => {
      await mountAsyncComponent(EodashMap);

      await expect.poll(() => mainMap()?.controls?.MousePosition).toBeTruthy();
      const format = mainMap()?.controls.MousePosition.coordinateFormat;
      expect(format([10, 20])).toBe("20.000 °N, 10.000 °E");
      expect(format([-10.5, -20.5])).toBe("20.500 °S, 10.500 °W");
      expect(format(null)).toBe("");
    });
  });

  describe("tooltip transform", () => {
    test("renames the key to the title and formats the numeric value", async () => {
      seed.main = [
        { id: "temp", title: "Temperature", decimals: 1, appendix: "°C" },
      ];
      await mountAsyncComponent(EodashMap);

      await expect.poll(() => mainTooltip()?.propertyTransform).toBeTruthy();
      expect(
        mainTooltip()?.propertyTransform({ key: "temp", value: "12.345" }),
      ).toEqual({ key: "Temperature", value: "12.3 °C" });
    });

    test("falls back to the tooltip adapter when no property matches", async () => {
      tooltipAdapter.value = () => ({ key: "adapted", value: "x" });
      await mountAsyncComponent(EodashMap);

      await expect.poll(() => mainTooltip()?.propertyTransform).toBeTruthy();
      expect(
        mainTooltip()?.propertyTransform({ key: "unknown", value: "1" }),
      ).toEqual({ key: "adapted", value: "x" });
    });
  });

  describe("buttons gating", () => {
    test("disables the toolbar buttons when nothing is selected", async () => {
      await mountAsyncComponent(EodashMap);

      await expect.poll(() => btnsCapture.props).toBeTruthy();
      expect(btnsCapture.props.exportMap).toBe(false);
      expect(btnsCapture.props.enableZoom).toBe(false);
    });

    test("forwards the toolbar flags once an indicator is selected", async () => {
      indicator.value = "collA";
      await mountAsyncComponent(EodashMap, {
        props: { btns: { enableExportMap: true, enableGlobe: false } },
      });

      await expect.poll(() => btnsCapture.props).toBeTruthy();
      expect(btnsCapture.props.exportMap).toBe(true);
      expect(btnsCapture.props.enableGlobe).toBe(false);
    });
  });

  describe("compare", () => {
    test("enables compare only with a selected compare stac", async () => {
      await mountAsyncComponent(EodashMap, {
        props: { enableCompare: true },
        initialState: { stac: { selectedCompareStac: { id: "c" } } },
      });

      await expect
        .poll(() => document.querySelector("eox-map-compare"))
        .toBeTruthy();
      expect(
        /** @type {any} */ (document.querySelector("eox-map-compare")).enabled,
      ).toBe("");
    });
  });
});
