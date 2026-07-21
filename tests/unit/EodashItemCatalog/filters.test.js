import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  buildSearchUrl,
  createExternalFilter,
  createFilterProperties,
  createSubtitleProperty,
} from "^/EodashItemCatalog/methods/filters";
import { indicator, mapEl } from "@/store/states";
import { useSTAcStore } from "@/store/stac";
import { ref } from "vue";

// Node-hostile, transitively pulled in by the store/helpers chain.
vi.mock("@eox/layercontrol", () => ({
  updateVectorLayerStyle: (/** @type {Record<string, unknown>} */ s) => s,
}));
vi.mock("webfontloader", () => ({ default: { load: () => {} } }));

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

/** @param {(HTMLElement & Record<string, any>) | null} value */
const setMap = (value) => {
  mapEl.value = /** @type {any} */ (value);
};

describe("createSubtitleProperty", () => {
  test("concatenates icon, value and unit label per configured property", () => {
    const subtitle = createSubtitleProperty(
      /** @type {any} */ ([
        { property: "eo:cloud_cover", unitLabel: "%" },
        { property: "platform", icon: "SAT " },
      ]),
    );
    expect(
      subtitle({ properties: { "eo:cloud_cover": 12, platform: "S2A" } }),
    ).toBe("12%SAT S2A");
  });

  test("rounds non-integer numeric values to one decimal", () => {
    const subtitle = createSubtitleProperty(
      /** @type {any} */ ([{ property: "eo:cloud_cover", unitLabel: "%" }]),
    );
    expect(subtitle({ properties: { "eo:cloud_cover": 12.345 } })).toBe(
      "12.3%",
    );
  });

  test("skips filters with no icon/unit label or a missing property", () => {
    const subtitle = createSubtitleProperty(
      /** @type {any} */ ([
        { property: "noLabel" },
        { property: "missing", unitLabel: "%" },
      ]),
    );
    expect(subtitle({ properties: { noLabel: "x" } })).toBe("");
  });
});

describe("buildSearchUrl", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setMap(null);
    axiosMock.get.mockReset();
  });

  test("appends collections, bbox, datetime, CQL filter, sort and limit", () => {
    const store = useSTAcStore();
    store.stacEndpoint = "https://stac";
    setMap({ lonLatExtent: [-10, -5, 20, 15] });

    const url = buildSearchUrl(
      /** @type {any} */ ({
        collection: { stringifiedState: "collA, collB" },
        datetime: {
          min: "2023-01-01",
          max: "2023-12-31",
          state: { min: "2023-06-01", max: "2023-06-30" },
        },
        cloud: {
          key: "eo:cloud_cover",
          type: "range",
          state: { max: 20 },
          min: 0,
          max: 100,
        },
      }),
      true,
      true,
      50,
      "datetime",
      null,
    );

    const params = new URL(url).searchParams;
    expect(url.startsWith("https://stac/search?")).toBe(true);
    expect(params.get("collections")).toBe("collA,collB");
    expect(params.get("bbox")).toBe("-10,-5,20,15");
    expect(params.get("datetime")).toBe(
      "2023-06-01T00:00:00.000Z/2023-06-30T00:00:00.000Z",
    );
    expect(params.get("filter")).toBe('"eo:cloud_cover" <= 20');
    expect(params.get("sortby")).toBe("datetime");
    expect(params.get("limit")).toBe("50");
  });

  test("omits bbox when bboxFilter is off", () => {
    useSTAcStore().stacEndpoint = "https://stac";
    setMap({ lonLatExtent: [-10, -5, 20, 15] });

    const url = buildSearchUrl(/** @type {any} */ ({}), false, false, 10);
    expect(new URL(url).searchParams.has("bbox")).toBe(false);
  });

  test("prefers the explicit endpoint over the store endpoint", () => {
    useSTAcStore().stacEndpoint = "https://store-endpoint";

    const url = buildSearchUrl(
      /** @type {any} */ ({}),
      false,
      false,
      10,
      undefined,
      "https://override",
    );
    expect(url.startsWith("https://override/search?")).toBe(true);
  });

  test("leaves out an open datetime range with no effective bounds", () => {
    useSTAcStore().stacEndpoint = "https://stac";

    const url = buildSearchUrl(
      /** @type {any} */ ({
        datetime: {
          min: "2023-01-01",
          max: "2023-12-31",
          state: { min: "2023-01-01", max: "2023-12-31" },
        },
      }),
      false,
      true,
      10,
    );
    expect(new URL(url).searchParams.has("datetime")).toBe(false);
  });

  test("emits an open end when only the start bound is narrowed", () => {
    useSTAcStore().stacEndpoint = "https://stac";

    const url = buildSearchUrl(
      /** @type {any} */ ({
        datetime: {
          min: "2023-01-01",
          max: "2023-12-31",
          state: { min: "2023-06-01" },
        },
      }),
      false,
      true,
      10,
    );
    expect(new URL(url).searchParams.get("datetime")).toBe(
      "2023-06-01T00:00:00.000Z/..",
    );
  });

  test("emits an open start when only the end bound is narrowed", () => {
    useSTAcStore().stacEndpoint = "https://stac";

    const url = buildSearchUrl(
      /** @type {any} */ ({
        datetime: {
          min: "2023-01-01",
          max: "2023-12-31",
          state: { max: "2023-06-30" },
        },
      }),
      false,
      true,
      10,
    );
    expect(new URL(url).searchParams.get("datetime")).toBe(
      "../2023-06-30T00:00:00.000Z",
    );
  });

  test("omits the collections param when none are selected", () => {
    useSTAcStore().stacEndpoint = "https://stac";

    const url = buildSearchUrl(/** @type {any} */ ({}), false, false, 10);
    expect(new URL(url).searchParams.has("collections")).toBe(false);
  });
});

describe("createFilterProperties", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    indicator.value = "";
  });

  test("builds the collection base filter from the store collections", () => {
    const store = useSTAcStore();
    store.stac = /** @type {any} */ ([{ id: "collA" }, { id: "collB" }]);

    const [collection] = createFilterProperties([], false);
    expect(collection.key).toBe("collection");
    expect(collection.type).toBe("multiselect");
    expect(collection.filterKeys).toEqual(["collA", "collB"]);
  });

  test("adds a datetime range filter when datetimeFilter is enabled", () => {
    useSTAcStore().stac = /** @type {any} */ ([]);

    const result = createFilterProperties([], true);
    expect(result.some((f) => f.key === "datetime" && f.type === "range")).toBe(
      true,
    );
  });

  test("prefixes dynamic property keys and maps the range filter", () => {
    useSTAcStore().stac = /** @type {any} */ ([]);

    const result = createFilterProperties(
      /** @type {any} */ ([
        { property: "eo:cloud_cover", type: "range", min: 0, max: 100 },
      ]),
      false,
    );
    const cloud = result.find((f) => f.key === "properties.eo:cloud_cover");
    expect(cloud).toMatchObject({
      key: "properties.eo:cloud_cover",
      title: "eo:cloud_cover",
      type: "range",
      expanded: true,
      filterKeys: [0, 100],
      state: { min: 0, max: 100 },
    });
  });

  test("maps a multiselect filter with a default placeholder", () => {
    useSTAcStore().stac = /** @type {any} */ ([]);

    const [platform] = createFilterProperties(
      /** @type {any} */ ([
        { property: "platform", type: "multiselect", filterKeys: ["S2A"] },
      ]),
      false,
    ).filter((f) => f.key === "properties.platform");
    expect(platform).toMatchObject({
      key: "properties.platform",
      type: "multiselect",
      placeholder: "Select platform",
      inline: false,
      filterKeys: ["S2A"],
    });
  });

  test("maps a select filter with a default placeholder", () => {
    useSTAcStore().stac = /** @type {any} */ ([]);

    const [orbit] = createFilterProperties(
      /** @type {any} */ ([
        { property: "orbit", type: "select", filterKeys: ["asc", "desc"] },
      ]),
      false,
    ).filter((f) => f.key === "properties.orbit");
    expect(orbit).toMatchObject({
      key: "properties.orbit",
      type: "select",
      placeholder: "Select orbit",
      filterKeys: ["asc", "desc"],
    });
  });

  test("adds the datetime filter from a custom datetime config even when disabled", () => {
    useSTAcStore().stac = /** @type {any} */ ([]);

    const result = createFilterProperties(
      /** @type {any} */ ([{ property: "datetime", type: "range" }]),
      false,
    );
    // custom datetime lands in the base filters, not `properties.datetime`
    expect(result.some((f) => f.key === "datetime")).toBe(true);
    expect(result.some((f) => f.key === "properties.datetime")).toBe(false);
  });

  test("omits the datetime filter when disabled and no custom config", () => {
    useSTAcStore().stac = /** @type {any} */ ([]);

    const result = createFilterProperties(
      /** @type {any} */ ([{ property: "eo:cloud_cover", type: "range" }]),
      false,
    );
    expect(result.some((f) => f.key === "datetime")).toBe(false);
  });

  test("preselects the collection matching the active indicator", () => {
    indicator.value = "collA";
    useSTAcStore().stac = /** @type {any} */ ([{ id: "collA" }]);

    const [collection] = createFilterProperties([], false);
    expect(collection.state).toEqual({ collA: true });
  });
});

describe("createExternalFilter", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setMap(null);
    axiosMock.get.mockReset();
  });

  test("returns a request whose url is built from the current filters", () => {
    useSTAcStore().stacEndpoint = "https://stac";
    const request = createExternalFilter(
      [],
      false,
      false,
      ref([]),
      ref(""),
      25,
    );
    const { url } = request([], {});
    expect(url).toBe("https://stac/search?limit=25");
  });

  test("treats a prop-level custom datetime as an active datetime filter", () => {
    useSTAcStore().stacEndpoint = "https://stac";
    const request = createExternalFilter(
      /** @type {any} */ ([{ property: "datetime" }]),
      false,
      false,
      ref([]),
      ref(""),
      10,
      undefined,
      "https://stac",
    );

    const { url } = request([], {
      datetime: {
        min: "2023-01-01",
        max: "2023-12-31",
        state: { min: "2023-06-01" },
      },
    });
    expect(new URL(url).searchParams.get("datetime")).toBe(
      "2023-06-01T00:00:00.000Z/..",
    );
  });

  test("prepends the selected item when it is absent from the results", async () => {
    axiosMock.get.mockResolvedValue({
      data: { features: [{ id: "b" }, { id: "c" }] },
    });
    const selected = ref(/** @type {any} */ ({ id: "a" }));
    const request = createExternalFilter(
      [],
      false,
      false,
      ref([]),
      ref(""),
      25,
      selected,
      "https://stac",
    );

    const items = await request([], {}).fetchFn("https://stac/search");
    expect(items.map((/** @type {any} */ i) => i.id)).toEqual(["a", "b", "c"]);
  });

  test("does not duplicate the selected item when already present", async () => {
    axiosMock.get.mockResolvedValue({
      data: { features: [{ id: "a" }, { id: "b" }] },
    });
    const selected = ref(/** @type {any} */ ({ id: "a" }));
    const request = createExternalFilter(
      [],
      false,
      false,
      ref([]),
      ref(""),
      25,
      selected,
      "https://stac",
    );

    const items = await request([], {}).fetchFn("https://stac/search");
    expect(items.map((/** @type {any} */ i) => i.id)).toEqual(["a", "b"]);
  });

  test("returns the current items when the request is aborted", async () => {
    axiosMock.get.mockRejectedValue({ name: "AbortError" });
    const currentItems = ref(/** @type {any} */ ([{ id: "prev" }]));
    const request = createExternalFilter(
      [],
      false,
      false,
      currentItems,
      ref(""),
      25,
      undefined,
      "https://stac",
    );

    const items = await request([], {}).fetchFn("https://stac/search");
    expect(items).toEqual([{ id: "prev" }]);
  });

  test("aborts the in-flight request when a new one starts", async () => {
    /** @type {AbortSignal[]} */
    const signals = [];
    axiosMock.get.mockImplementation(
      (/** @type {string} */ _url, /** @type {any} */ config) => {
        signals.push(config.signal);
        return new Promise(() => {}); // stays in flight
      },
    );
    const request = createExternalFilter(
      [],
      false,
      false,
      ref([]),
      ref(""),
      25,
      undefined,
      "https://stac",
    );

    void request([], {}).fetchFn("https://stac/search?page=1");
    void request([], {}).fetchFn("https://stac/search?page=2");

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  test("returns an empty list on a non-abort error", async () => {
    axiosMock.get.mockRejectedValue({ name: "ServerError" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const request = createExternalFilter(
      [],
      false,
      false,
      ref([]),
      ref(""),
      25,
      undefined,
      "https://stac",
    );

    const items = await request([], {}).fetchFn("https://stac/search");
    expect(items).toEqual([]);
  });
});
