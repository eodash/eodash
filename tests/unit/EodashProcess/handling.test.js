import { beforeEach, describe, expect, test, vi } from "vitest";
import { ref, watch } from "vue";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {
  handleProcesses,
  initProcess,
  onChartClick,
} from "^/EodashProcess/methods/handling";
import {
  chartData,
  chartSpec,
  compareChartData,
  compareChartSpec,
  comparePoi,
  datetime,
  mapCompareEl,
  mapEl,
  poi,
} from "@/store/states";
import {
  S_DRAWTOOLS,
  S_DRAWTOOLS_MULTI,
  S_GEOJSON,
  S_LARGE,
  S_SCALAR,
} from "./fixtures";
import axios from "@/plugins/axios";
import { useSTAcStore } from "@/store/stac";

const outputs = vi.hoisted(() => ({
  processCharts: vi.fn(),
  processLayers: vi.fn(),
  processSTAC: vi.fn(),
  applyProcessLayersToMap: vi.fn(),
  assignDataLayers: vi.fn(),
}));
// stubbed whole: spreading the original cycles back through `@/store/stac`
vi.mock("@/eodashSTAC/layers", () => ({
  assignDataLayers: outputs.assignDataLayers,
  updateIndicatorLayers: vi.fn(),
  assignGroupLayers: vi.fn(),
  PROCESS_GROUP: "ProcessGroup",
}));
vi.mock("^/EodashProcess/methods/outputs", () => ({
  processCharts: outputs.processCharts,
  processLayers: outputs.processLayers,
  processSTAC: outputs.processSTAC,
}));
vi.mock("^/EodashProcess/methods/utils", async (orig) => ({
  .../** @type {any} */ (await orig()),
  applyProcessLayersToMap: outputs.applyProcessLayersToMap,
}));

// Runs in the browser project: DOM/localStorage/eox chain resolve for real, so only the request is stubbed.

/** @param {any} schema */
const mockFetch = (schema) =>
  vi.spyOn(axios, "get").mockResolvedValue({ data: schema });

/** A non-Vector layer stub — waitForLayerRender resolves for it immediately. */
const layerStub = {
  get: (/** @type {string} */ k) => (k === "type" ? "Tile" : undefined),
};

/** @param {(id: string) => any} getLayerById @param {any[]} [layers] */
const mapStub = (getLayerById, layers = []) => ({ layers, getLayerById });

/** initProcess params with sensible ref defaults; override per test. */
const params = (/** @type {any} */ over = {}) => ({
  selectedStac: ref(/** @type {any} */ ({})),
  jsonformSchema: ref(/** @type {any} */ (null)),
  isProcessed: ref(true),
  processResults: ref([1]),
  loading: ref(true),
  isPolling: ref(true),
  enableCompare: false,
  mapElement: /** @type {any} */ (null),
  ...over,
});

/** @param {any} schema */
const withForm = (schema, over = {}) =>
  params({
    selectedStac: ref(
      /** @type {any} */ ({ "eodash:jsonform": "https://x/form.json" }),
    ),
    ...over,
  });

describe("initProcess", () => {
  beforeEach(() => {
    poi.value = "";
    comparePoi.value = "";
    chartSpec.value = null;
    compareChartSpec.value = null;
    mapEl.value = null;
    mapCompareEl.value = null;
    vi.restoreAllMocks();
  });

  test("fetches the schema and resets process state before assigning it", async () => {
    mockFetch(S_SCALAR);
    mapEl.value = /** @type {any} */ (mapStub(() => null));
    const p = withForm(S_SCALAR, { mapElement: mapEl.value });

    await initProcess(p);

    expect(p.jsonformSchema.value).toEqual(S_SCALAR);
    expect(p.loading.value).toBe(false);
    expect(p.isProcessed.value).toBe(false);
    expect(p.isPolling.value).toBe(false);
    expect(p.processResults.value).toEqual([]);
  });

  test("assigns the schema unchanged when the drawtools layerId is already on the map", async () => {
    const schema = S_DRAWTOOLS("collA;:;item;:;3857");
    mockFetch(schema);
    mapEl.value = /** @type {any} */ (
      mapStub((id) => (id === "collA;:;item;:;3857" ? layerStub : null))
    );
    const p = withForm(schema, { mapElement: mapEl.value });

    await initProcess(p);

    expect(
      p.jsonformSchema.value?.properties.aoi.options.drawtools.layerId,
    ).toBe("collA;:;item;:;3857");
  });

  test("rewrites the drawtools layerId via a prefix match in the current layers", async () => {
    mockFetch(S_DRAWTOOLS("collA;:;item;:;3857"));
    // getLayerById misses the exact id; prefix "collA" matches a live layer.
    mapEl.value = /** @type {any} */ (
      mapStub(() => null, [{ properties: { id: "collA;:;resolved;:;3857" } }])
    );
    const p = withForm(S_DRAWTOOLS("collA;:;item;:;3857"), {
      mapElement: mapEl.value,
    });

    await initProcess(p);

    expect(
      p.jsonformSchema.value?.properties.aoi.options.drawtools.layerId,
    ).toBe("collA;:;resolved;:;3857");
  });

  test("keeps the stale schema and bails when a drawtools layerId cannot be resolved", async () => {
    mockFetch(S_DRAWTOOLS("missing;:;x;:;y"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mapEl.value = /** @type {any} */ (mapStub(() => null));
    const p = withForm(S_DRAWTOOLS("missing;:;x;:;y"), {
      jsonformSchema: ref(/** @type {any} */ ({ stale: true })),
      mapElement: mapEl.value,
    });

    await initProcess(p);

    expect(p.jsonformSchema.value).toEqual({ stale: true });
  });

  test("aborts on the first unresolvable drawtools property without trying the rest", async () => {
    mockFetch(S_DRAWTOOLS_MULTI);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const getLayerById = vi.fn(() => null);
    mapEl.value = /** @type {any} */ (mapStub(getLayerById));
    const p = withForm(S_DRAWTOOLS_MULTI, {
      jsonformSchema: ref(/** @type {any} */ ({ stale: true })),
      mapElement: mapEl.value,
    });

    await initProcess(p);

    expect(p.jsonformSchema.value).toEqual({ stale: true });
    // Only the first property's id was looked up before bailing.
    expect(getLayerById).toHaveBeenCalledTimes(1);
    expect(getLayerById).toHaveBeenCalledWith("missing;:;a;:;b");
  });

  test("rewrites drawtools.for to the compare map when enableCompare is set", async () => {
    const schema = S_DRAWTOOLS("collA;:;item;:;3857", { for: "eox-map" });
    mockFetch(schema);
    mapCompareEl.value = /** @type {any} */ (mapStub(() => layerStub));
    const p = withForm(schema, {
      enableCompare: true,
      mapElement: mapCompareEl.value,
    });

    await initProcess(p);

    expect(p.jsonformSchema.value?.properties.aoi.options.drawtools.for).toBe(
      "eox-map#compare",
    );
  });

  test("clears only the schema (no full reset) when a POI is alive and there is no schema", async () => {
    poi.value = "some-poi";
    const p = params({
      jsonformSchema: ref(/** @type {any} */ ({ old: true })),
    });

    await initProcess(p);

    expect(p.jsonformSchema.value).toBeNull();
    expect(p.loading.value).toBe(true); // untouched — no resetProcess in this branch
  });

  test("fully resets when there is neither a schema nor a POI", async () => {
    poi.value = "";
    const p = params({
      jsonformSchema: ref(/** @type {any} */ ({ old: true })),
    });

    await initProcess(p);

    expect(p.jsonformSchema.value).toBeNull();
    expect(p.loading.value).toBe(false);
    expect(p.isPolling.value).toBe(false);
  });

  test("ignores a schema response after the selected collection changes", async () => {
    /** @type {() => void} */
    let finishFetch = () => {};
    vi.spyOn(axios, "get").mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishFetch = () => resolve({ data: S_SCALAR });
        }),
    );
    const p = withForm(S_SCALAR);
    const pending = initProcess(p);
    p.selectedStac.value = { id: "another-collection" };
    finishFetch();
    await pending;

    expect(p.jsonformSchema.value).toBeNull();
    expect(p.processResults.value).toEqual([1]);
    expect(p.loading.value).toBe(true);
  });

  test("only the latest initialization for the same collection can assign a schema", async () => {
    /** @type {() => void} */
    let finishFirstFetch = () => {};
    vi.spyOn(axios, "get")
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirstFetch = () =>
              resolve({ data: { ...S_SCALAR, title: "old" } });
          }),
      )
      .mockResolvedValueOnce({ data: { ...S_SCALAR, title: "current" } });
    mapEl.value = /** @type {any} */ (mapStub(() => null));
    const p = withForm(S_SCALAR, { mapElement: mapEl.value });
    const first = initProcess(p);
    await initProcess(p);
    const currentSchema = p.jsonformSchema.value;
    p.processResults.value = [2];
    finishFirstFetch();
    await first;

    expect(p.jsonformSchema.value).toBe(currentSchema);
    expect(p.jsonformSchema.value?.title).toBe("current");
    expect(p.processResults.value).toEqual([2]);
  });

  test("ignores initialization when the collection changes while its layer loads", async () => {
    const source = new VectorSource();
    const layer = new VectorLayer({ source });
    layer.setProperties({ id: "pending-layer", type: "Vector" });
    const schema = S_DRAWTOOLS("pending-layer");
    mockFetch(schema);
    mapEl.value = /** @type {any} */ (mapStub(() => layer));
    const p = withForm(schema, { mapElement: mapEl.value });
    const pending = initProcess(p);
    await vi.waitFor(() =>
      expect(source.hasListener("featuresloadend")).toBe(true),
    );
    p.selectedStac.value = { id: "another-collection" };
    source.dispatchEvent("featuresloadend");
    await pending;

    expect(p.jsonformSchema.value).toBeNull();
    expect(p.processResults.value).toEqual([1]);
  });

  test("remounts an unchanged form only when its selection binding is missing", async () => {
    const layer = new TileLayer();
    layer.setProperties({ id: "selection-layer", type: "Tile" });
    const schema = S_DRAWTOOLS("selection-layer");
    mockFetch(schema);
    const map = {
      ...mapStub(() => layer),
      selectInteractions: {
        SelectLayerClickInteraction: { selectLayer: layer },
      },
    };
    mapEl.value = /** @type {any} */ (map);
    const p = withForm(schema, { mapElement: mapEl.value });
    await initProcess(p);
    const currentSchema = p.jsonformSchema.value;
    p.processResults.value = [2];
    await initProcess(p);
    expect(p.jsonformSchema.value).toBe(currentSchema);
    expect(p.processResults.value).toEqual([2]);

    /** @type {(object | null)[]} */
    const schemas = [];
    const stop = watch(p.jsonformSchema, (value) => schemas.push(value), {
      flush: "sync",
    });
    Reflect.deleteProperty(
      map.selectInteractions,
      "SelectLayerClickInteraction",
    );
    await initProcess(p);
    stop();

    expect(schemas[0]).toBeNull();
    expect(p.jsonformSchema.value).toEqual(currentSchema);
    expect(p.jsonformSchema.value).not.toBe(currentSchema);
  });

  test("preserves the form and process results on redundant initialization", async () => {
    mockFetch(S_SCALAR);
    mapEl.value = /** @type {any} */ (mapStub(() => null));
    const p = withForm(S_SCALAR, { mapElement: mapEl.value });
    await initProcess(p);
    const currentSchema = p.jsonformSchema.value;
    p.processResults.value = [2];
    p.isProcessed.value = true;
    chartSpec.value = { mark: "point" };
    const currentChart = chartSpec.value;

    await initProcess(p);

    expect(p.jsonformSchema.value).toBe(currentSchema);
    expect(p.processResults.value).toEqual([2]);
    expect(p.isProcessed.value).toBe(true);
    expect(chartSpec.value).toBe(currentChart);
  });

  test("does not mutate a large input schema (deep clone)", async () => {
    const original = structuredClone(S_LARGE);
    mockFetch(S_LARGE);
    mapEl.value = /** @type {any} */ (mapStub(() => layerStub));
    const p = withForm(S_LARGE, { mapElement: mapEl.value });

    await initProcess(p);

    expect(S_LARGE).toEqual(original);
    expect(p.jsonformSchema.value).not.toBe(S_LARGE);
  });
});

describe("handleProcesses", () => {
  /** @param {any} over */
  const hpParams = (over = {}) => ({
    loading: ref(false),
    selectedStac: ref(
      /** @type {any} */ ({
        id: "coll",
        links: [],
        "eodash:vegadefinition": "https://x/spec.json",
      }),
    ),
    jsonformEl: ref(/** @type {any} */ ({ value: {} })),
    jsonformSchema: ref(/** @type {any} */ (S_SCALAR)),
    isPolling: ref(false),
    processResults: ref(/** @type {any[]} */ ([])),
    mapElement: /** @type {any} */ ({ id: "main" }),
    jobs: ref([]),
    ...over,
  });

  beforeEach(() => {
    chartData.value = null;
    compareChartData.value = null;
    chartSpec.value = null;
    compareChartSpec.value = null;
    outputs.processCharts.mockReset().mockResolvedValue([null, {}]);
    outputs.processLayers.mockReset().mockResolvedValue([]);
    outputs.processSTAC.mockReset().mockResolvedValue(undefined);
    outputs.applyProcessLayersToMap.mockReset();
  });

  test("does nothing when the form, schema or stac is missing", async () => {
    const p = hpParams({ jsonformEl: ref(null) });
    p.loading.value = false;

    await handleProcesses(p);

    expect(outputs.processCharts).not.toHaveBeenCalled();
    expect(p.loading.value).toBe(false);
  });

  test("harvests chart data, chart spec and layers into the results", async () => {
    outputs.processCharts.mockResolvedValue([
      { data: { values: [{ x: 1 }] } },
      { series: [1] },
    ]);
    outputs.processLayers.mockResolvedValue([
      {
        type: "WebGLTile",
        source: { type: "GeoTIFF", sources: [{ url: "a.tif" }] },
      },
    ]);
    const p = hpParams();

    await handleProcesses(p);

    expect(chartData.value).toEqual({ series: [1] });
    expect(chartSpec.value).toMatchObject({
      background: "transparent",
      data: { values: [{ x: 1 }] },
    });
    expect(p.processResults.value).toContainEqual({ series: [1] });
    expect(p.processResults.value).toContainEqual([{ x: 1 }]);
    expect(p.processResults.value).toContainEqual({ url: "a.tif" });
    expect(outputs.applyProcessLayersToMap).toHaveBeenCalledWith(
      p.mapElement,
      await outputs.processLayers.mock.results[0].value,
    );
    expect(p.loading.value).toBe(false);
  });

  test("extracts geometries before dispatching to the producers", async () => {
    const p = hpParams({
      jsonformSchema: ref(/** @type {any} */ (S_GEOJSON)),
      jsonformEl: ref(
        /** @type {any} */ ({
          value: {
            aoi: {
              type: "Feature",
              geometry: { type: "Point", coordinates: [1, 2] },
            },
          },
        }),
      ),
    });

    await handleProcesses(p);

    const chartsArg = outputs.processCharts.mock.calls[0][0];
    expect(typeof chartsArg.jsonformValue.aoi).toBe("string");
  });

  test("routes to the compare chart state in compare mode", async () => {
    outputs.processCharts.mockResolvedValue([{ data: {} }, { s: 1 }]);
    const p = hpParams({ mapElement: { id: "compare" } });

    await handleProcesses(p);

    expect(compareChartData.value).toEqual({ s: 1 });
    expect(chartData.value).toBeNull();
    expect(outputs.processLayers).toHaveBeenCalledWith(
      expect.objectContaining({ enableCompare: true }),
    );
  });

  test("resets loading and rethrows when a producer fails", async () => {
    outputs.processLayers.mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const p = hpParams();

    await expect(handleProcesses(p)).rejects.toThrow("boom");
    expect(p.loading.value).toBe(false);
  });
});

describe("onChartClick", () => {
  const UNCHANGED = "2020-01-01T00:00:00.000Z";
  const CLICKED = "2023-05-04T10:23:00.000Z";
  const TEMPORAL_SPEC = { encoding: { x: { type: "temporal", field: "t" } } };
  const MAIN_MAP = /** @type {any} */ ({ id: "main" });
  const COMPARE_MAP = /** @type {any} */ ({ id: "compare" });

  /** @param {any} [datum] - a vega item's datum, as eox-chart reports it */
  const clickOn = (datum) =>
    /** @type {any} */ ({
      target: { spec: TEMPORAL_SPEC },
      detail: { item: { datum } },
    });

  beforeEach(() => {
    datetime.value = UNCHANGED;
    mapEl.value = MAIN_MAP;
    mapCompareEl.value = COMPARE_MAP;
    const store = useSTAcStore();
    store.selectedStac = /** @type {any} */ ({ id: "main-collection" });
    store.selectedCompareStac = null;
    outputs.assignDataLayers.mockReset();
  });

  test("renders the clicked time on the main map", async () => {
    await onChartClick(clickOn({ t: "2023-05-04T10:23:00Z" }));

    expect(datetime.value).toBe(CLICKED);
    expect(outputs.assignDataLayers).toHaveBeenCalledTimes(1);
    expect(outputs.assignDataLayers).toHaveBeenCalledWith(
      MAIN_MAP,
      expect.objectContaining({ timeOrItem: CLICKED, event: "time:updated" }),
    );
  });

  // the datetime is global, so a click on either chart has to move both panes
  test("also renders the compare map while comparing", async () => {
    useSTAcStore().selectedCompareStac = /** @type {any} */ ({
      id: "compare-collection",
    });

    await onChartClick(clickOn({ t: "2023-05-04T10:23:00Z" }));

    expect(outputs.assignDataLayers).toHaveBeenCalledTimes(2);
    expect(outputs.assignDataLayers).toHaveBeenLastCalledWith(
      COMPARE_MAP,
      expect.objectContaining({
        timeOrItem: CLICKED,
        event: "compareTime:updated",
      }),
    );
  });

  test("leaves the compare map alone when nothing is being compared", async () => {
    await onChartClick(clickOn({ t: "2023-05-04T10:23:00Z" }));

    expect(outputs.assignDataLayers).not.toHaveBeenCalledWith(
      COMPARE_MAP,
      expect.anything(),
    );
  });

  test("reads the date from a nested datum", async () => {
    await onChartClick(clickOn({ datum: { t: "2022-03-01T00:00:00Z" } }));

    expect(datetime.value).toBe("2022-03-01T00:00:00.000Z");
  });

  // clicking past the marks reports an item without a datum, which used to throw
  test("renders nothing when the item carries no datum", async () => {
    await onChartClick(clickOn(undefined));

    expect(datetime.value).toBe(UNCHANGED);
    expect(outputs.assignDataLayers).not.toHaveBeenCalled();
  });

  test("renders nothing when the date cannot be parsed", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await onChartClick(clickOn({ t: "not a date" }));

    expect(datetime.value).toBe(UNCHANGED);
    expect(outputs.assignDataLayers).not.toHaveBeenCalled();
  });
});
