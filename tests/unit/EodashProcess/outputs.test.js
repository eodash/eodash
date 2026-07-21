import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  processCharts,
  processImage,
  processLayers,
} from "^/EodashProcess/methods/outputs";
import {
  L_CHART_CSV,
  L_CHART_JSON_GET,
  L_CHART_JSON_POST,
  L_CUSTOM_LAYERS,
  L_LAYERS_MIXED,
  S_MULTIQUERY,
  serviceLink,
} from "./fixtures";

const axiosMock = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

describe("processImage", () => {
  test("builds a static image layer per image/png service link", () => {
    const layers = processImage(
      [serviceLink("image/png", "scene", "https://x/{{token}}.png")],
      { token: "abc" },
      [0, 0, 10, 10],
    );

    expect(layers).toEqual([
      {
        type: "Image",
        properties: { id: "scene_process", title: "Results scene" },
        source: {
          type: "ImageStatic",
          imageExtent: [0, 0, 10, 10],
          url: "https://x/abc.png",
        },
      },
    ]);
  });

  test("returns an empty list when no png links match", () => {
    expect(
      processImage([serviceLink("image/tiff", "t", "https://x/t.tif")], {}, []),
    ).toEqual([]);
  });
});

describe("processLayers", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
  });

  test("assembles vector, image and geotiff layers in a fixed order", async () => {
    const layers = await processLayers({
      links: L_LAYERS_MIXED,
      jsonformValue: {},
      layerId: "coll",
      origBbox: [0, 0, 10, 10],
    });

    expect(layers.map((/** @type {any} */ l) => l.type)).toEqual([
      "Vector",
      "Image",
      "WebGLTile",
    ]);
    expect(layers.map((/** @type {any} */ l) => l.properties.id)).toEqual([
      "vec_process",
      "img_process",
      "tif_process",
    ]);
  });

  test("returns an empty list when there are no links", async () => {
    expect(
      await processLayers({ links: undefined, jsonformValue: {} }),
    ).toEqual([]);
  });

  test("prepends custom-endpoint layers before the standard ones", async () => {
    const customLayersHandler = vi
      .fn()
      .mockResolvedValue([
        { type: "Tile", properties: { id: "custom" }, source: { url: "c" } },
      ]);

    const layers = await processLayers({
      links: [
        serviceLink("application/geo+json", "vec", "https://x/vec.json"),
        ...L_CUSTOM_LAYERS,
      ],
      jsonformValue: {},
      selectedStac: { id: "coll" },
      jsonformSchema: {},
      customLayersHandler,
    });

    expect(customLayersHandler).toHaveBeenCalled();
    expect(layers.map((/** @type {any} */ l) => l.properties.id)).toEqual([
      "custom",
      "vec_process",
    ]);
  });
});

describe("processCharts", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
  });

  test("injects fetched data into the vega spec's inline values", async () => {
    axiosMock.get.mockImplementation((/** @type {string} */ url) =>
      Promise.resolve(
        url.includes("spec")
          ? { data: { mark: "line", data: { values: [] } } }
          : { data: [{ x: 1, y: 2 }] },
      ),
    );

    const [spec] = await processCharts({
      links: L_CHART_JSON_GET,
      jsonformValue: {},
      specUrl: "https://x/spec.json",
    });

    expect(spec.data.values).toEqual([{ x: 1, y: 2 }]);
  });

  test("POSTs the rendered body template and injects the response", async () => {
    axiosMock.get.mockImplementation((/** @type {string} */ url) =>
      Promise.resolve(
        url.includes("spec")
          ? { data: { mark: "line", data: { values: [] } } }
          : { data: '{"metric":"{{metric}}"}' },
      ),
    );
    axiosMock.post.mockResolvedValue({ data: [{ x: 9 }] });

    const [spec] = await processCharts({
      links: L_CHART_JSON_POST,
      jsonformValue: { metric: "ndvi" },
      specUrl: "https://x/spec.json",
    });

    expect(axiosMock.post).toHaveBeenCalledWith("https://x/data.json", {
      metric: "ndvi",
    });
    expect(spec.data.values).toEqual([{ x: 9 }]);
  });

  test("aborts a POST link without a body template, leaving the spec as is", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    axiosMock.get.mockResolvedValue({
      data: { mark: "line", data: { values: [{ stale: true }] } },
    });

    const [spec] = await processCharts({
      links: [
        serviceLink("application/json", "series", "https://x/data.json", {
          method: "POST",
        }),
      ],
      jsonformValue: {},
      specUrl: "https://x/spec.json",
    });

    expect(axiosMock.post).not.toHaveBeenCalled();
    expect(spec.data.values).toEqual([{ stale: true }]);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("body template"),
    );
    consoleError.mockRestore();
  });

  test("fans a multiQuery GET out per value and aggregates the responses", async () => {
    axiosMock.get.mockImplementation((/** @type {string} */ url) => {
      if (url.includes("spec"))
        return Promise.resolve({
          data: { mark: "line", data: { values: [] } },
        });
      if (url.includes("aoi=a")) return Promise.resolve({ data: [{ v: 1 }] });
      return Promise.resolve({ data: [{ v: 2 }] });
    });

    const [spec] = await processCharts({
      links: [
        serviceLink(
          "application/json",
          "series",
          "https://x/data.json?aoi={{aoi}}",
          {
            method: "GET",
          },
        ),
      ],
      jsonformValue: { aoi: ["a", "b"] },
      jsonformSchema: S_MULTIQUERY,
      specUrl: "https://x/spec.json",
    });

    expect(axiosMock.get).toHaveBeenCalledWith("https://x/data.json?aoi=a");
    expect(axiosMock.get).toHaveBeenCalledWith("https://x/data.json?aoi=b");
    expect(spec.data.values).toEqual([{ v: 1 }, { v: 2 }]);
  });

  test("clears the inline values when a multiQuery POST matches nothing", async () => {
    axiosMock.get.mockImplementation((/** @type {string} */ url) =>
      Promise.resolve(
        url.includes("spec")
          ? { data: { mark: "line", data: { values: [{ stale: true }] } } }
          : { data: '{"a":1}' },
      ),
    );

    const [spec] = await processCharts({
      links: L_CHART_JSON_POST,
      jsonformValue: { metric: "x" },
      jsonformSchema: S_MULTIQUERY,
      specUrl: "https://x/spec.json",
    });

    expect(axiosMock.post).not.toHaveBeenCalled();
    expect(spec.data.values).toEqual([]);
  });

  test("points the spec at the rendered url for csv links", async () => {
    axiosMock.get.mockResolvedValue({
      data: { mark: "line", data: { values: [] } },
    });

    const [spec] = await processCharts({
      links: L_CHART_CSV,
      jsonformValue: {},
      specUrl: "https://x/spec.json",
    });

    expect(spec.data.url).toBe("https://x/data.csv");
  });

  test("returns [null, null] when there is no spec url", async () => {
    expect(
      await processCharts({
        links: [serviceLink("application/json", "s", "https://x/d.json")],
        jsonformValue: {},
      }),
    ).toEqual([null, null]);
  });

  test("keys inline values by link id when there are multiple json links", async () => {
    axiosMock.get.mockImplementation((/** @type {string} */ url) => {
      if (url.includes("spec"))
        return Promise.resolve({
          data: { mark: "line", data: { values: {} } },
        });
      if (url.includes("a.json")) return Promise.resolve({ data: [{ a: 1 }] });
      return Promise.resolve({ data: [{ b: 2 }] });
    });

    const [spec, dataValues] = await processCharts({
      links: [
        serviceLink("application/json", "A", "https://x/a.json"),
        serviceLink("application/json", "B", "https://x/b.json"),
      ],
      jsonformValue: {},
      specUrl: "https://x/spec.json",
    });

    expect(spec.data.values).toEqual({ A: [{ a: 1 }], B: [{ b: 2 }] });
    // The raw per-link data is returned alongside the spec (becomes chartData).
    expect(dataValues).toEqual({ A: [{ a: 1 }], B: [{ b: 2 }] });
  });

  test("uses custom-endpoint data when the handler returns some", async () => {
    axiosMock.get.mockResolvedValue({
      data: { mark: "line", data: { values: [] } },
    });
    const customEndpointsHandler = vi.fn().mockResolvedValue([{ custom: 1 }]);

    const [spec] = await processCharts({
      links: [
        serviceLink("application/json", "A", "https://x/a.json", {
          endpoint: "sentinelhub",
        }),
      ],
      jsonformValue: { foo: 1 },
      specUrl: "https://x/spec.json",
      customEndpointsHandler,
    });

    expect(customEndpointsHandler).toHaveBeenCalled();
    expect(spec.data.values).toEqual([{ custom: 1 }]);
  });
});
