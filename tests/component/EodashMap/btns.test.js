import { beforeEach, describe, expect, test, vi } from "vitest";
import { mdiCompare, mdiCompareRemove } from "@mdi/js";
import EodashMapBtns from "^/EodashMap/EodashMapBtns.vue";
import {
  activeTemplate,
  availableMapProjection,
  comparePoi,
  isGlobe,
  mapEl,
  mapPosition,
  poi,
} from "@/store/states";
import { provideEodashInstance } from "@/composables";
import { mockEodash } from "../../support/eodash";
import { stubCustomElement } from "../../support/elements";
import { mountAsyncComponent } from "../../support/mount";

vi.mock("@eox/geosearch", () => ({}));
vi.mock("@eox/feedback", () => ({}));

stubCustomElement("eox-feedback");

const actions = vi.hoisted(() => ({
  getLayers: vi.fn(() => []),
  getCompareLayers: vi.fn(() => []),
  registerProjection: vi.fn(),
  changeMapProjection: vi.fn(),
  setActiveTemplate: vi.fn(),
  includesProcess: vi.fn(() => false),
  shouldShowChartWidget: vi.fn(() => false),
}));
vi.mock("@/store/actions", () => actions);

// Handlers are map/DOM-coupled — only their wiring is tested here.
const btns = vi.hoisted(() => ({
  onMapZoomIn: vi.fn(),
  onMapZoomOut: vi.fn(),
  onCompareClick: vi.fn(),
  onSelectCompareIndicator: vi.fn(),
  switchGlobe: vi.fn(),
  showCompareIndicators: { value: false },
}));
vi.mock("^/EodashMap/methods/btns", () => btns);

const loadPOiIndicator = vi.hoisted(() => vi.fn());
vi.mock("^/EodashProcess/methods/handling", () => ({ loadPOiIndicator }));

// Plain value holders, not refs — set BEFORE mounting; computeds bake them in at render.
const mosaicState = vi.hoisted(() => ({
  latestLayer: { value: /** @type {any} */ (null) },
  isItemView: { value: false },
  visibilityThreshold: { value: 8 },
  hasDataInView: { value: true },
  returnToOverview: { emit: vi.fn() },
}));
vi.mock("@/eodashSTAC/mosaic", () => ({
  useMosaicState: () => mosaicState,
  normalizeGlobeZoom: (/** @type {number} */ z) => z,
}));

const stubs = { ExportState: true, PopUp: true, EodashItemFilter: true };

/** @param {import("../../support/mount").MountOptions} [options] */
const mountBtns = (options = {}) =>
  mountAsyncComponent(EodashMapBtns, {
    ...options,
    stubs,
    // The widget reads the useEodash() singleton at setup.
    rootSetup: () => provideEodashInstance(),
  });

/** @returns {HTMLElement | undefined} The map button whose tooltip includes `text`. */
const btnByTooltip = (/** @type {string} */ text) =>
  /** @type {HTMLElement[]} */ ([
    ...document.querySelectorAll(".map-buttons button"),
  ]).find((b) => b.textContent?.includes(text));

const feedbackEodash = () =>
  mockEodash({ brand: { feedback: { endpoint: "https://fb", schema: {} } } });

describe("EodashMapBtns", () => {
  beforeEach(() => {
    isGlobe.value = false;
    activeTemplate.value = "";
    availableMapProjection.value = "EPSG:3857";
    poi.value = "";
    comparePoi.value = "";
    mapPosition.value = [0, 0, 10];
    mosaicState.latestLayer.value = null;
    mosaicState.isItemView.value = false;
    mosaicState.visibilityThreshold.value = 8;
    mosaicState.hasDataInView.value = true;
    mosaicState.returnToOverview.emit.mockClear();
    mapEl.value = /** @type {any} */ ({
      id: "main",
      setAttribute: vi.fn(),
      getAttribute: vi.fn(() => null),
    });
    for (const fn of [
      btns.onMapZoomIn,
      btns.onMapZoomOut,
      btns.onCompareClick,
      btns.switchGlobe,
      loadPOiIndicator,
      actions.changeMapProjection,
    ]) {
      fn.mockClear();
    }
  });

  describe("render gating", () => {
    test("renders the core buttons with default props", async () => {
      poi.value = "some-poi";
      await mountBtns({ eodash: feedbackEodash() });

      expect(btnByTooltip("Zoom in")).toBeTruthy();
      expect(btnByTooltip("Zoom out")).toBeTruthy();
      expect(btnByTooltip("Compare mode")).toBeTruthy();
      expect(btnByTooltip("switch to 3D")).toBeTruthy();
      expect(btnByTooltip("Change map projection")).toBeTruthy();
      expect(btnByTooltip("Back to POIs")).toBeTruthy();
      expect(btnByTooltip("Provide Feedback")).toBeTruthy();
    });

    test("hides the zoom buttons when enableZoom is false", async () => {
      await mountBtns({ props: { enableZoom: false } });

      expect(btnByTooltip("Zoom in")).toBeFalsy();
    });

    test("hides zoom, compare and shows the 2D label in globe mode", async () => {
      isGlobe.value = true;
      await mountBtns();

      expect(btnByTooltip("Zoom in")).toBeFalsy();
      expect(btnByTooltip("Compare mode")).toBeFalsy();
      expect(btnByTooltip("switch to 2D")).toBeTruthy();
    });

    test("hides the projection button without an available projection", async () => {
      availableMapProjection.value = "";
      await mountBtns();

      expect(btnByTooltip("Change map projection")).toBeFalsy();
    });

    test("hides the globe button when enableGlobe is false", async () => {
      await mountBtns({ props: { enableGlobe: false } });

      expect(btnByTooltip("switch to")).toBeFalsy();
    });

    test("hides the globe button in compare mode", async () => {
      activeTemplate.value = "compare";
      await mountBtns();

      expect(btnByTooltip("switch to")).toBeFalsy();
    });

    test("hides back-to-POIs without a poi or comparePoi", async () => {
      await mountBtns();

      expect(btnByTooltip("Back to POIs")).toBeFalsy();
    });

    test("hides the feedback button without a feedback config", async () => {
      await mountBtns();

      expect(btnByTooltip("Provide Feedback")).toBeFalsy();
    });
  });

  describe("click wiring", () => {
    test("zoom in delegates to onMapZoomIn", async () => {
      await mountBtns();
      btnByTooltip("Zoom in")?.click();
      expect(btns.onMapZoomIn).toHaveBeenCalled();
    });

    test("zoom out delegates to onMapZoomOut", async () => {
      await mountBtns();
      btnByTooltip("Zoom out")?.click();
      expect(btns.onMapZoomOut).toHaveBeenCalled();
    });

    test("compare delegates to onCompareClick with the compareIndicators prop", async () => {
      await mountBtns({
        props: { compareIndicators: { compareTemplate: "cmp" } },
      });
      btnByTooltip("Compare mode")?.click();
      expect(btns.onCompareClick).toHaveBeenCalledWith({
        compareTemplate: "cmp",
      });
    });

    test("globe delegates to switchGlobe", async () => {
      await mountBtns();
      btnByTooltip("switch to 3D")?.click();
      expect(btns.switchGlobe).toHaveBeenCalled();
    });

    test("projection delegates to changeMapProjection", async () => {
      await mountBtns();
      btnByTooltip("Change map projection")?.click();
      expect(actions.changeMapProjection).toHaveBeenCalledWith("EPSG:3857");
    });

    test("back-to-POIs delegates to loadPOiIndicator", async () => {
      poi.value = "some-poi";
      await mountBtns();
      btnByTooltip("Back to POIs")?.click();
      expect(loadPOiIndicator).toHaveBeenCalled();
    });
  });

  describe("mosaic hints", () => {
    const hint = () => document.querySelector(".mosaic-hint");

    test("shows no hint without a mosaic layer", async () => {
      await mountBtns();
      expect(hint()).toBeNull();
    });

    test("shows the item-view hint and returns to overview on click", async () => {
      mosaicState.latestLayer.value = { id: "mosaic" };
      mosaicState.isItemView.value = true;
      await mountBtns();

      expect(hint()?.textContent).toContain("Viewing individual item");
      /** @type {HTMLElement | null} */ (
        document.querySelector(".mosaic-hint-link")
      )?.click();
      expect(mosaicState.returnToOverview.emit).toHaveBeenCalled();
    });

    test("shows the zoom hint below the visibility threshold", async () => {
      mosaicState.latestLayer.value = { id: "mosaic" };
      mapPosition.value = [0, 0, 4];
      await mountBtns();

      expect(hint()?.textContent).toContain("Zoom in to explore the data");
    });

    test("shows the no-data hint when the view has no assets", async () => {
      mosaicState.latestLayer.value = { id: "mosaic" };
      mosaicState.hasDataInView.value = false;
      await mountBtns();

      expect(hint()?.textContent).toContain("No data here");
    });
  });

  describe("compare icon", () => {
    /** @returns {string | null | undefined} */
    const compareIconPath = () =>
      btnByTooltip("Compare mode")
        ?.querySelector("svg path")
        ?.getAttribute("d");

    test("shows the compare icon when not in compare mode", async () => {
      await mountBtns();
      expect(compareIconPath()).toBe(mdiCompare);
    });

    test("shows the compare-remove icon in compare mode", async () => {
      activeTemplate.value = "compare";
      await mountBtns({
        props: { compareIndicators: { compareTemplate: "compare" } },
      });
      expect(compareIconPath()).toBe(mdiCompareRemove);
    });
  });
});
