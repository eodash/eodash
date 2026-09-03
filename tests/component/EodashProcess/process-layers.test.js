import { beforeEach, describe, expect, test, vi } from "vitest";
import { ref } from "vue";
import { useEventBus } from "@vueuse/core";
import { handleProcesses } from "^/EodashProcess/methods/handling";
import { eoxLayersKey } from "@/utils/keys";
import {
  ANALYSIS_GROUP,
  PROCESS_GROUP,
  assignGroupLayers,
} from "@/eodashSTAC/layers";

// only what a process produces is stubbed; the write path runs for real, so
// these cases are about where the outputs end up on the map
const outputs = vi.hoisted(() => ({
  processCharts: vi.fn(),
  processLayers: vi.fn(),
  processSTAC: vi.fn(),
}));
vi.mock("^/EodashProcess/methods/outputs", () => outputs);

/** An eox-map with just enough surface for the write and its event. @returns {any} */
const stubMap = () => {
  /** @type {any[]} */
  let layers = [];
  return {
    id: "main",
    get layers() {
      return layers;
    },
    set layers(value) {
      layers = value;
    },
    updateComplete: Promise.resolve(true),
    getLayerById: () => ({}),
    map: { once: (/** @type {any} */ _e, /** @type {any} */ cb) => cb() },
  };
};

/** @param {string} id @returns {any} */
const outputLayer = (id) => ({ type: "Tile", properties: { id } });

/** @param {any} map @param {string} id */
const groupIds = (map, id) =>
  map.layers
    .find((/** @type {any} */ l) => l.properties?.id === id)
    ?.layers.map((/** @type {any} */ l) => l.properties.id);

/** @param {any} map @returns {any} */
const runProcess = (map) =>
  handleProcesses({
    loading: ref(false),
    selectedStac: ref({ id: "coll", links: [] }),
    jsonformEl: ref({ value: {} }),
    jsonformSchema: ref({ type: "object", properties: {} }),
    isPolling: ref(false),
    processResults: ref([]),
    mapElement: map,
    jobs: ref([]),
  });

describe("process results on the map", () => {
  /** @type {any} */
  let map;

  beforeEach(async () => {
    outputs.processCharts.mockReset().mockResolvedValue([null, {}]);
    outputs.processLayers.mockReset().mockResolvedValue([]);
    outputs.processSTAC.mockReset().mockResolvedValue(undefined);

    map = stubMap();
    await assignGroupLayers(map, ANALYSIS_GROUP, [outputLayer("data")]);
  });

  test("puts a run's output in its own group, above the data layers", async () => {
    outputs.processLayers.mockResolvedValue([outputLayer("run-a")]);

    await runProcess(map);

    expect(groupIds(map, PROCESS_GROUP)).toEqual(["run-a"]);
    expect(groupIds(map, ANALYSIS_GROUP)).toEqual(["data"]);
    expect(map.layers.map((/** @type {any} */ l) => l.properties.id)).toEqual([
      ANALYSIS_GROUP,
      PROCESS_GROUP,
    ]);
  });

  test("replaces the result when the same process is run again", async () => {
    outputs.processLayers.mockResolvedValue([outputLayer("run-a")]);
    await runProcess(map);
    await runProcess(map);

    expect(groupIds(map, PROCESS_GROUP)).toEqual(["run-a"]);
  });

  test("keeps both when a run produces a differently named output", async () => {
    outputs.processLayers.mockResolvedValue([outputLayer("run-a")]);
    await runProcess(map);

    outputs.processLayers.mockResolvedValue([outputLayer("run-b")]);
    await runProcess(map);

    expect(groupIds(map, PROCESS_GROUP)).toEqual(["run-a", "run-b"]);
  });

  test("keeps every output of a run that produces several", async () => {
    outputs.processLayers.mockResolvedValue([
      outputLayer("out-1"),
      outputLayer("out-2"),
    ]);

    await runProcess(map);

    expect(groupIds(map, PROCESS_GROUP)).toEqual(["out-1", "out-2"]);
  });

  test("announces on the compare channel for the compare map", async () => {
    const compareMap = stubMap();
    compareMap.id = "compare";
    const announced = vi.fn();
    const stop = useEventBus(eoxLayersKey).on(announced);
    outputs.processLayers.mockResolvedValue([outputLayer("run-a")]);

    await runProcess(compareMap);
    await vi.waitFor(() => expect(announced).toHaveBeenCalled());

    expect(announced.mock.calls[0][0]).toBe("compareProcess:updated");
    stop();
  });

  test("survives the data layers being cleared", async () => {
    outputs.processLayers.mockResolvedValue([outputLayer("run-a")]);
    await runProcess(map);

    await assignGroupLayers(map, ANALYSIS_GROUP, []);

    expect(groupIds(map, ANALYSIS_GROUP)).toEqual([]);
    expect(groupIds(map, PROCESS_GROUP)).toEqual(["run-a"]);
  });
});
