import { beforeEach, describe, expect, test, vi } from "vitest";
import { useEventBus } from "@vueuse/core";
import TileLayer from "ol/layer/Tile";
import { flushPromises } from "@vue/test-utils";
import EodashProcess from "^/EodashProcess/index.vue";
import {
  areChartsSeparateLayout,
  chartSpec,
  compareChartSpec,
  comparePoi,
  datetime,
  mapCompareEl,
  mapEl,
  poi,
} from "@/store/states";
import { useSTAcStore } from "@/store/stac";
import { eoxLayersKey } from "@/utils/keys";
import axios from "@/plugins/axios";
import { handleProcesses } from "^/EodashProcess/methods/handling";
import { mountComponent } from "../../support/mount";

// Keep eodash schema fetching and lifecycle real, but assert at the external
// component boundary rather than exercising JSONEditor or drawing internals.
vi.mock("@eox/jsonform", () => ({}));
vi.mock("@eox/chart", () => ({}));
vi.mock("@eox/drawtools", () => ({}));
vi.mock("^/EodashChart.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("^/EodashProcess/ProcessList.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("^/EodashProcess/methods/handling", async (importOriginal) => ({
  ...(await importOriginal()),
  handleProcesses: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/eodashSTAC/layers", () => ({
  assignDataLayers: vi.fn(),
  updateIndicatorLayers: vi.fn(),
  assignGroupLayers: vi.fn(),
  PROCESS_GROUP: "ProcessGroup",
}));

/** @returns {import("json-schema").JSONSchema7} */
function dateSchema() {
  return {
    type: "object",
    properties: {
      date_start: { type: "string", format: "date" },
      date_end: { type: "string", format: "date" },
    },
  };
}

/**
 * @param {string} location
 * @returns {import("json-schema").JSONSchema7}
 */
function configuredDateSchema(location) {
  const defaults = { date_start: "2000-01-01", date_end: "2000-12-31" };
  if (location === "single field") {
    return {
      type: "object",
      properties: {
        date: { type: "string", format: "date", default: "2000-06-01" },
      },
    };
  }
  if (location === "nested parent") {
    return {
      type: "object",
      properties: { period: { ...dateSchema(), default: defaults } },
    };
  }
  const schema = dateSchema();
  schema.properties = {
    date_start: {
      type: "string",
      format: "date",
      default: defaults.date_start,
    },
    date_end: { type: "string", format: "date", default: defaults.date_end },
  };
  if (location === "parent") {
    // Parent values deliberately differ from field defaults: both must survive.
    schema.default = { date_start: "2001-01-01", date_end: "2001-12-31" };
  }
  return schema;
}

const configuredCases = [
  "field",
  "single field",
  "parent",
  "nested parent",
].flatMap((location) =>
  [false, true].map((compare) => ({ location, compare })),
);

/**
 * Simulate only the external form's schema -> value boundary. The component
 * receives configured defaults without loading or validating JSONEditor.
 * @param {import("json-schema").JSONSchema7} schema
 * @returns {import("json-schema").JSONSchema7Type | undefined}
 */
function configuredFormValue(schema) {
  if (schema.default !== undefined) return schema.default;
  if (schema.type !== "object") return undefined;
  return Object.fromEntries(
    Object.entries(schema.properties ?? {}).flatMap(([name, property]) => {
      if (typeof property === "boolean") return [];
      const value = configuredFormValue(property);
      return value === undefined ? [] : [[name, value]];
    }),
  );
}

/** @param {string} start @param {string} end */
function collection(start, end) {
  return {
    id: `${start}/${end}`,
    links: [],
    "eodash:jsonform": "/process-form.json",
    extent: { temporal: { interval: [[start, end]] } },
  };
}

/**
 * Only orchestration calls this map stub; layer instances remain real OL
 * objects, without mounting a map or starting any network tile requests.
 * @param {boolean} compare
 */
function processMap(compare) {
  const layer = new TileLayer({ properties: { type: "Tile" } });
  const state = { id: "observations;:;old" };
  const map = {
    id: compare ? "compare" : "main",
    get layers() {
      return [{ type: "Tile", properties: { id: state.id } }];
    },
    getLayerById: (/** @type {string} */ id) =>
      id === state.id ? layer : null,
    selectInteractions: { SelectLayerClickInteraction: {} },
  };
  return { map, state };
}

/** @returns {import("@eox/jsonform").EOxJSONForm | null} */
function form() {
  return document.querySelector("eox-jsonform");
}

async function readyForm() {
  await expect.poll(() => form()?.schema).toBeTruthy();
  return /** @type {import("@eox/jsonform").EOxJSONForm} */ (form());
}

describe("processing date prefill wiring", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(handleProcesses).mockClear();
    datetime.value = "2024-06-01T00:00:00Z";
    poi.value = "";
    comparePoi.value = "";
    chartSpec.value = null;
    compareChartSpec.value = null;
    areChartsSeparateLayout.value = true;
    mapEl.value = null;
    mapCompareEl.value = null;
  });

  test.each([false, true])(
    "passes date defaults from its own collection to the form (compare=%s)",
    async (compare) => {
      const schema = dateSchema();
      const original = structuredClone(schema);
      vi.spyOn(axios, "get").mockResolvedValue({ data: schema });
      const { map } = processMap(compare);
      (compare ? mapCompareEl : mapEl).value =
        /** @type {import("@eox/map").EOxMap} */ (/** @type {unknown} */ (map));

      await mountComponent(EodashProcess, {
        props: { enableCompare: compare },
        initialState: {
          stac: {
            selectedStac: collection("2024-01-01", "2024-12-31"),
            selectedCompareStac: collection("2023-01-01", "2023-12-31"),
          },
        },
      });

      const element = await readyForm();
      expect(element.schema).toMatchObject({
        properties: {
          date_start: { default: compare ? "2023-01-01" : "2024-06-01" },
          date_end: { default: compare ? "2023-12-31" : "2024-12-31" },
        },
      });
      expect(schema).toEqual(original);
    },
  );

  test("prefills a single date from the shared dashboard datetime", async () => {
    const schema = {
      type: "object",
      properties: {
        date: { type: "string", format: "date" },
      },
    };
    vi.spyOn(axios, "get").mockResolvedValue({ data: schema });
    const { map } = processMap(false);
    mapEl.value = /** @type {import("@eox/map").EOxMap} */ (
      /** @type {unknown} */ (map)
    );
    await mountComponent(EodashProcess, {
      initialState: {
        stac: { selectedStac: collection("2024-01-01", "2024-12-31") },
      },
    });
    const element = await readyForm();
    expect(element.schema).toMatchObject({
      properties: { date: { default: "2024-06-01" } },
    });
    expect(schema.properties.date).not.toHaveProperty("default");
  });

  test.each(
    ["start_date", "end_date"].flatMap((name) =>
      [false, true].flatMap((compare) =>
        ["missing", "field", "parent"].map((preset) => ({
          name,
          compare,
          preset,
        })),
      ),
    ),
  )(
    "handles standalone $name in a ship-detection form with a $preset default (compare=$compare)",
    async ({ name, compare, preset }) => {
      const schema = {
        type: "object",
        properties: {
          bbox: {
            type: "array",
            format: "bounding-box",
            options: {
              drawtools: { for: "eox-map#main", projection: "EPSG:4326" },
            },
          },
          [name]: { title: "Select date", type: "string", format: "date" },
          threshold: { type: "number", default: 0.5, minimum: 0, maximum: 1 },
        },
        ...(preset === "parent" ? { default: { [name]: "2000-01-01" } } : {}),
      };
      if (preset === "field")
        Object.assign(schema.properties[name], { default: "2000-01-01" });
      const original = structuredClone(schema);
      vi.spyOn(axios, "get").mockResolvedValue({ data: schema });
      const { map } = processMap(compare);
      (compare ? mapCompareEl : mapEl).value =
        /** @type {import("@eox/map").EOxMap} */ (/** @type {unknown} */ (map));
      await mountComponent(EodashProcess, {
        props: { enableCompare: compare },
        initialState: {
          stac: {
            selectedStac: collection("2024-01-01", "2024-12-31"),
            selectedCompareStac: collection("2023-01-01", "2023-12-31"),
          },
        },
      });
      const element = await readyForm();
      if (preset === "parent") {
        expect(element.schema.default).toEqual({ [name]: "2000-01-01" });
        expect(element.schema.properties[name]).not.toHaveProperty("default");
      } else {
        expect(element.schema.properties[name].default).toBe(
          preset === "field"
            ? "2000-01-01"
            : compare
              ? "2023-12-31"
              : "2024-06-01",
        );
      }
      expect(element.schema.properties.threshold.default).toBe(0.5);
      expect(schema).toEqual(original);
    },
  );

  test.each([false, true])(
    "infers only the missing endpoint when the start is configured (compare=%s)",
    async (compare) => {
      const schema = dateSchema();
      schema.properties.date_start = {
        type: "string",
        format: "date",
        default: "2000-01-01",
      };
      const original = structuredClone(schema);
      vi.spyOn(axios, "get").mockResolvedValue({ data: schema });
      const { map } = processMap(compare);
      (compare ? mapCompareEl : mapEl).value =
        /** @type {import("@eox/map").EOxMap} */ (/** @type {unknown} */ (map));
      await mountComponent(EodashProcess, {
        props: { enableCompare: compare },
        initialState: {
          stac: {
            selectedStac: collection("2024-01-01", "2024-12-31"),
            selectedCompareStac: collection("2023-01-01", "2023-12-31"),
          },
        },
      });

      expect((await readyForm()).schema).toMatchObject({
        properties: {
          date_start: { default: "2000-01-01" },
          date_end: { default: compare ? "2023-12-31" : "2024-12-31" },
        },
      });
      expect(schema).toEqual(original);
    },
  );

  test.each(configuredCases)(
    "retains configured $location defaults in the form schema (compare=$compare)",
    async ({ location, compare }) => {
      const schema = configuredDateSchema(location);
      const original = structuredClone(schema);
      vi.spyOn(axios, "get").mockResolvedValue({ data: schema });
      const { map } = processMap(compare);
      (compare ? mapCompareEl : mapEl).value =
        /** @type {import("@eox/map").EOxMap} */ (/** @type {unknown} */ (map));
      await mountComponent(EodashProcess, {
        props: { enableCompare: compare },
        initialState: {
          stac: {
            selectedStac: collection("2024-01-01", "2024-12-31"),
            selectedCompareStac: collection("2023-01-01", "2023-12-31"),
          },
        },
      });

      expect((await readyForm()).schema).toEqual(original);
      expect(schema).toEqual(original);
    },
  );

  test.each(configuredCases)(
    "preserves configured $location defaults across re-initialization (compare=$compare)",
    async ({ location, compare }) => {
      const schema = configuredDateSchema(location);
      const original = structuredClone(schema);
      vi.spyOn(axios, "get").mockResolvedValue({ data: schema });
      const { map } = processMap(compare);
      (compare ? mapCompareEl : mapEl).value =
        /** @type {import("@eox/map").EOxMap} */ (/** @type {unknown} */ (map));
      await mountComponent(EodashProcess, {
        props: { enableCompare: compare },
        initialState: {
          stac: {
            selectedStac: collection("2024-01-01", "2024-12-31"),
            selectedCompareStac: collection("2023-01-01", "2023-12-31"),
          },
        },
      });
      expect((await readyForm()).schema).toEqual(original);

      const store = useSTAcStore();
      store[compare ? "selectedCompareStac" : "selectedStac"] =
        /** @type {import("@eodash/stac").STACCollection} */ (
          /** @type {unknown} */ (collection("2022-01-01", "2022-12-31"))
        );
      datetime.value = "2022-07-01T00:00:00Z";
      useEventBus(eoxLayersKey).emit(
        compare ? "compareLayers:updated" : "layers:updated",
      );
      await expect.poll(() => axios.get).toHaveBeenCalledTimes(2);
      await flushPromises();
      expect((await readyForm()).schema).toEqual(original);
      expect(schema).toEqual(original);
    },
  );

  test.each(configuredCases)(
    "auto-executes with configured $location values (compare=$compare)",
    async ({ location, compare }) => {
      const schema = {
        ...configuredDateSchema(location),
        options: { execute: true },
      };
      const expectedValues = configuredFormValue(schema);
      vi.spyOn(axios, "get").mockResolvedValue({ data: schema });
      const { map } = processMap(compare);
      (compare ? mapCompareEl : mapEl).value =
        /** @type {import("@eox/map").EOxMap} */ (/** @type {unknown} */ (map));
      await mountComponent(EodashProcess, {
        props: { enableCompare: compare },
        initialState: {
          stac: {
            selectedStac: collection("2024-01-01", "2024-12-31"),
            selectedCompareStac: collection("2023-01-01", "2023-12-31"),
          },
        },
      });
      const element = await readyForm();
      // This is the external jsonform boundary, not JSONEditor's implementation.
      Object.assign(element, {
        value: configuredFormValue(element.schema),
        editor: { validate: vi.fn(() => []) },
      });
      await flushPromises();
      expect(handleProcesses).not.toHaveBeenCalled();
      element.dispatchEvent(new Event("change"));
      await expect.poll(() => handleProcesses).toHaveBeenCalledTimes(1);
      const [options] = vi.mocked(handleProcesses).mock.calls[0];
      expect(options.jsonformEl.value?.value).toEqual(expectedValues);
      expect(options.jsonformSchema.value).toEqual(schema);
      expect(options.selectedStac.value?.id).toBe(
        compare ? "2023-01-01/2023-12-31" : "2024-01-01/2024-12-31",
      );
      expect(options.mapElement).toBe(map);
      expect(axios.get).toHaveBeenCalledExactlyOnceWith("/process-form.json");
    },
  );

  test("recalculates defaults when the selected collection changes", async () => {
    vi.spyOn(axios, "get").mockResolvedValue({ data: dateSchema() });
    const { map } = processMap(false);
    mapEl.value = /** @type {import("@eox/map").EOxMap} */ (
      /** @type {unknown} */ (map)
    );
    await mountComponent(EodashProcess, {
      initialState: {
        stac: { selectedStac: collection("2024-01-01", "2024-12-31") },
      },
    });
    const original = await readyForm();
    original.value = { date_start: "2024-02-01", date_end: "2024-03-01" };

    useSTAcStore().selectedStac =
      /** @type {import("@eodash/stac").STACCollection} */ (
        /** @type {unknown} */ (collection("2022-01-01", "2022-12-31"))
      );
    useEventBus(eoxLayersKey).emit("layers:updated");
    await expect.poll(() => form() !== original).toBe(true);
    const updated = await readyForm();
    expect(updated.schema).toMatchObject({
      properties: {
        date_start: { default: "2022-01-01" },
        date_end: { default: "2022-12-31" },
      },
    });
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test.each([false, true])(
    "preserves edits on ordinary time updates (compare=%s)",
    async (compare) => {
      vi.spyOn(axios, "get").mockResolvedValue({ data: dateSchema() });
      const { map } = processMap(compare);
      (compare ? mapCompareEl : mapEl).value =
        /** @type {import("@eox/map").EOxMap} */ (/** @type {unknown} */ (map));
      await mountComponent(EodashProcess, {
        props: { enableCompare: compare },
        initialState: {
          stac: {
            selectedStac: collection("2024-01-01", "2024-12-31"),
            selectedCompareStac: collection("2024-01-01", "2024-12-31"),
          },
        },
      });
      const original = await readyForm();
      const edited = { date_start: "2024-02-01", date_end: "2024-03-01" };
      original.value = edited;
      datetime.value = "2024-09-01T00:00:00Z";
      const events = compare
        ? ["compareTime:updated", "compareLayertime:updated"]
        : ["time:updated", "layertime:updated"];
      for (const event of events) {
        useEventBus(eoxLayersKey).emit(
          /** @type {import("@/types").LayersEventBusKeys} */ (event),
        );
        await flushPromises();
        expect(form()?.value).toEqual(edited);
      }
      expect(form()).toBe(original);
      expect(axios.get).toHaveBeenCalledTimes(1);
    },
  );

  test.each(["identifier", "selection"])(
    "preserves edits across a time-driven %s remount",
    async (reason) => {
      const schema = dateSchema();
      // A hidden string field exercises identifier resolution and selection-loss
      // remounts without involving geometry drawing in this date regression.
      schema.properties.layer = {
        type: "string",
        default: "unchanged",
        options: { hidden: true, drawtools: { layerId: "observations;:;old" } },
      };
      vi.spyOn(axios, "get").mockResolvedValue({ data: schema });
      const { map, state } = processMap(false);
      mapEl.value = /** @type {import("@eox/map").EOxMap} */ (
        /** @type {unknown} */ (map)
      );
      await mountComponent(EodashProcess, {
        initialState: {
          stac: { selectedStac: collection("2024-01-01", "2024-12-31") },
        },
      });
      const original = await readyForm();
      const edited = {
        date_start: "2024-02-01",
        date_end: "2024-03-01",
        layer: "unchanged",
      };
      original.value = edited;
      if (reason === "identifier") state.id = "observations;:;new";
      else delete map.selectInteractions.SelectLayerClickInteraction;
      datetime.value = "2024-09-01T00:00:00Z";
      useEventBus(eoxLayersKey).emit("time:updated");
      await expect.poll(() => form() !== original).toBe(true);
      const remounted = await readyForm();
      expect(remounted.schema.default).toEqual(edited);
      expect(axios.get).toHaveBeenCalledTimes(1);
    },
  );
});
