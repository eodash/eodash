import { beforeEach, describe, expect, test, vi } from "vitest";
import { mdiViewDashboard } from "@mdi/js";
import EodashItemCatalog from "^/EodashItemCatalog/index.vue";
import { useSTAcStore } from "@/store/stac";
import { indicator, mapCompareEl, mapEl } from "@/store/states";
import { mountAsyncComponent } from "../support/mount";

vi.mock("@eox/itemfilter", () => ({}));


const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const QUERYABLES = {
  "eo:cloud_cover": { type: "number", minimum: 0, maximum: 100 },
};

const serveCatalogApi = () =>
  axiosMock.get.mockImplementation((/** @type {string} */ url) => {
    if (url.includes("/queryables"))
      return Promise.resolve({ data: { properties: QUERYABLES } });
    if (url.includes("/collections/"))
      return Promise.resolve({ data: { summaries: {} } });
    return Promise.resolve({ data: { features: [] } });
  });

// Map/mosaic seams are template-tier; spy on them so wiring and arguments stay
// testable here. Factories return stable inner spies so dispatched events trace.
const spies = vi.hoisted(() => {
  const onSelect = vi.fn();
  const onFilter = vi.fn();
  const onMouseEnter = vi.fn();
  const onMouseLeave = vi.fn();
  return {
    onSelect,
    onFilter,
    createOnSelectHandler: vi.fn(() => onSelect),
    createOnFilterHandler: vi.fn(() => onFilter),
    createOnMouseEnterResult: vi.fn(() => onMouseEnter),
    createOnMouseLeaveResult: vi.fn(() => onMouseLeave),
    useSearchOnMapMove: vi.fn(),
    useRenderItemsFeatures: vi.fn(),
    useHoverTooltip: vi.fn(),
    useRenderOnFeatureClick: vi.fn(),
    renderItemsFeatures: vi.fn(),
    useInitMosaic: vi.fn(),
  };
});
vi.mock("^/EodashItemCatalog/methods/handlers", () => ({
  createOnSelectHandler: spies.createOnSelectHandler,
  createOnFilterHandler: spies.createOnFilterHandler,
  createOnMouseEnterResult: spies.createOnMouseEnterResult,
  createOnMouseLeaveResult: spies.createOnMouseLeaveResult,
}));
vi.mock("^/EodashItemCatalog/methods/map", () => ({
  useSearchOnMapMove: spies.useSearchOnMapMove,
  useRenderItemsFeatures: spies.useRenderItemsFeatures,
  useHoverTooltip: spies.useHoverTooltip,
  useRenderOnFeatureClick: spies.useRenderOnFeatureClick,
  renderItemsFeatures: spies.renderItemsFeatures,
}));
vi.mock("@/eodashSTAC/mosaic", () => ({
  useMosaicState: () => ({
    isItemView: { value: false },
    latestLayer: { value: null },
    visibilityThreshold: { value: 0 },
    returnToOverview: { on: () => () => {} },
    mosaicEndpoint: { value: null },
  }),
  useInitMosaic: spies.useInitMosaic,
  renderLatestMosaic: vi.fn(),
  useScheduleMosaicUpdate: () => vi.fn(),
}));

/** @returns {(Element & Record<string, any>) | null} The eox-itemfilter element. */
const filterEl = () => document.querySelector("eox-itemfilter");

/** Layout switcher icon is an SVG path (sort uses a font-class icon). @returns {boolean} */
const hasLayoutSwitcher = () =>
  [...document.querySelectorAll(".v-icon svg path")].some(
    (p) => p.getAttribute("d") === mdiViewDashboard,
  );

/** Store seeded with two collections so createFilterProperties has content. */
const withCollections = {
  stac: {
    stac: [{ id: "collA" }, { id: "collB" }],
    stacEndpoint: "https://stac",
  },
};
const HOVER = ["datetime", "eo:cloud_cover"];

describe("EodashItemCatalog", () => {
  beforeEach(() => {
    indicator.value = "";
    mapEl.value = null;
    mapCompareEl.value = null;
    for (const spy of Object.values(spies)) vi.mocked(spy).mockClear();
    axiosMock.get.mockReset();
    serveCatalogApi();
  });

  describe("rendering", () => {
    test("renders the title block, sort control and layout switcher by default", async () => {
      const { screen } = await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      await expect.element(screen.getByText("Catalog Items")).toBeVisible();
      expect(document.querySelector('[aria-label="Sort"]')).toBeTruthy();
      expect(hasLayoutSwitcher()).toBe(true);
    });

    test("hides the title block when showTitleBlock is false", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        props: { showTitleBlock: false },
        initialState: withCollections,
      });

      expect(document.body.textContent).not.toContain("Catalog Items");
    });

    test("hides the sort control when sortBy is empty", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        props: { sortBy: [] },
        initialState: withCollections,
      });

      await expect.poll(() => filterEl()).toBeTruthy();
      expect(document.querySelector('[aria-label="Sort"]')).toBeNull();
    });

    test("hides the layout switcher when no layoutTarget is given", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        props: { layoutTarget: "" },
        initialState: withCollections,
      });

      await expect.poll(() => filterEl()).toBeTruthy();
      expect(hasLayoutSwitcher()).toBe(false);
    });

    test("binds the item filter's title, image and subtitle properties", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      await expect.poll(() => filterEl()).toBeTruthy();
      const el = filterEl();
      expect(el?.getAttribute("titleproperty")).toBe("id");
      expect(el?.imageProperty).toBe("assets.thumbnail.href");
      expect(typeof el?.subTitleProperty).toBe("function");
      expect(
        el?.subTitleProperty({ properties: { "eo:cloud_cover": 12 } }),
      ).toContain("12%");
    });

    test("binds the built filter properties to eox-itemfilter", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      await expect.poll(() => filterEl()?.filterProperties).toBeTruthy();
      const keys = filterEl()?.filterProperties.map(
        (/** @type {any} */ f) => f.key,
      );
      expect(keys).toContain("collection");
      expect(keys).toContain("properties.eo:cloud_cover");
    });

    test("drops declared filters no selected collection exposes", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        props: {
          filters: [
            { property: "eo:cloud_cover", type: "range", title: "Clouds" },
            { property: "sat:orbit_state", type: "multiselect", title: "Orbit" },
          ],
        },
        initialState: withCollections,
      });

      await expect.poll(() => filterEl()?.filterProperties).toBeTruthy();
      const keys = filterEl()?.filterProperties.map(
        (/** @type {any} */ f) => f.key,
      );
      // Resolved against the collections' queryables: cloud cover is exposed,
      // orbit state is not.
      expect(keys).toContain("properties.eo:cloud_cover");
      expect(keys).not.toContain("properties.sat:orbit_state");
    });

    test("renders custom filters and results titles", async () => {
      const { screen } = await mountAsyncComponent(EodashItemCatalog, {
        props: { filtersTitle: "Refine", resultsTitle: "Scenes" },
        initialState: withCollections,
      });

      await expect.element(screen.getByText("Refine")).toBeInTheDocument();
      await expect.element(screen.getByText("Scenes")).toBeInTheDocument();
    });
  });

  describe("seam wiring (default map)", () => {
    test("passes store, compare flag and the primary map to the select handler", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });
      const store = useSTAcStore();

      expect(spies.createOnSelectHandler).toHaveBeenCalledWith(
        store,
        false,
        mapEl,
      );
    });

    test("passes the primary map and hover properties to the filter handler", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      expect(spies.createOnFilterHandler).toHaveBeenCalledWith(
        expect.objectContaining({ mapElement: mapEl }),
      );
      // The collection-resolved hover properties are handed over as a ref.
      const { hoverProperties } =
        spies.createOnFilterHandler.mock.calls[0][0];
      expect(hoverProperties.value).toEqual(HOVER);
    });

    test("passes the primary map to the hover-result handlers", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      expect(spies.createOnMouseEnterResult).toHaveBeenCalledWith(mapEl);
      expect(spies.createOnMouseLeaveResult).toHaveBeenCalledWith(mapEl);
    });

    test("renders items features against the primary map with hover properties", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      expect(spies.useRenderItemsFeatures).toHaveBeenCalledWith(
        expect.anything(),
        mapEl,
        expect.objectContaining({ value: HOVER }),
        undefined,
        undefined,
      );
    });

    test("wires search-on-map-move with the bbox flag and the primary map", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      expect(spies.useSearchOnMapMove).toHaveBeenCalledWith(
        expect.anything(),
        true,
        mapEl,
      );
    });

    test("wires feature-click rendering with the store, map and compare flag", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });
      const store = useSTAcStore();

      expect(spies.useRenderOnFeatureClick).toHaveBeenCalledWith(
        expect.anything(),
        store,
        mapEl,
        false,
      );
    });

    test("wires the hover tooltip with the hover properties", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      expect(spies.useHoverTooltip).toHaveBeenCalledWith(
        expect.objectContaining({ value: HOVER }),
      );
    });

    test("initializes mosaic disabled by default", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });

      expect(spies.useInitMosaic).toHaveBeenCalledWith(
        null,
        undefined,
        undefined,
      );
    });
  });

  describe("seam wiring (compare mode)", () => {
    test("routes the compare map into the handlers and composables", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        props: { enableCompare: true },
        initialState: withCollections,
      });
      const store = useSTAcStore();

      expect(spies.createOnSelectHandler).toHaveBeenCalledWith(
        store,
        true,
        mapCompareEl,
      );
      expect(spies.useSearchOnMapMove).toHaveBeenCalledWith(
        expect.anything(),
        true,
        mapCompareEl,
      );
      expect(spies.useRenderOnFeatureClick).toHaveBeenCalledWith(
        expect.anything(),
        store,
        mapCompareEl,
        true,
      );
    });
  });

  describe("event delegation", () => {
    test("delegates item selection to the select handler with the event", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });
      await expect.poll(() => filterEl()).toBeTruthy();

      filterEl()?.dispatchEvent(
        new CustomEvent("select", { detail: { id: "item-1" } }),
      );

      expect(spies.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { id: "item-1" } }),
      );
    });

    test("delegates filter changes to the filter handler with the event", async () => {
      await mountAsyncComponent(EodashItemCatalog, {
        initialState: withCollections,
      });
      await expect.poll(() => filterEl()).toBeTruthy();

      filterEl()?.dispatchEvent(
        new CustomEvent("filter", { detail: { filters: { a: 1 } } }),
      );

      expect(spies.onFilter).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { filters: { a: 1 } } }),
      );
    });
  });
});
