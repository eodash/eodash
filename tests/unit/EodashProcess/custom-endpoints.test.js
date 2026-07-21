import { beforeEach, describe, expect, test, vi } from "vitest";

const subs = vi.hoisted(() => ({
  sentinelhub: vi.fn(),
  veda: vi.fn(),
  eoxhub: vi.fn(),
}));
vi.mock(
  "^/EodashProcess/methods/custom-endpoints/chart/sentinelhub-endpoint",
  () => ({ handleSentinelHubProcess: subs.sentinelhub }),
);
vi.mock("^/EodashProcess/methods/custom-endpoints/chart/veda-endpoint", () => ({
  handleVedaEndpoint: subs.veda,
}));
vi.mock(
  "^/EodashProcess/methods/custom-endpoints/layers/eoxhub-workspaces-endpoint",
  () => ({ handleEOxHubEndpoint: subs.eoxhub }),
);

import { handleChartCustomEndpoints } from "^/EodashProcess/methods/custom-endpoints/chart";
import { handleLayersCustomEndpoints } from "^/EodashProcess/methods/custom-endpoints/layers";

describe("handleChartCustomEndpoints", () => {
  beforeEach(() => {
    subs.sentinelhub.mockReset();
    subs.veda.mockReset();
  });

  test("returns the first handler's data and skips the rest", async () => {
    subs.sentinelhub.mockResolvedValue([{ x: 1 }]);
    subs.veda.mockResolvedValue([{ y: 2 }]);

    expect(await handleChartCustomEndpoints(/** @type {any} */ ({}))).toEqual([
      { x: 1 },
    ]);
    expect(subs.veda).not.toHaveBeenCalled();
  });

  test("falls through to the next handler when the first yields nothing", async () => {
    subs.sentinelhub.mockResolvedValue(null);
    subs.veda.mockResolvedValue([{ y: 2 }]);

    expect(await handleChartCustomEndpoints(/** @type {any} */ ({}))).toEqual([
      { y: 2 },
    ]);
  });

  test("treats empty data as invalid and moves on", async () => {
    subs.sentinelhub.mockResolvedValue([]);
    subs.veda.mockResolvedValue([{ y: 2 }]);

    expect(await handleChartCustomEndpoints(/** @type {any} */ ({}))).toEqual([
      { y: 2 },
    ]);
  });

  test("treats data containing a falsy item as invalid", async () => {
    subs.sentinelhub.mockResolvedValue([{ y: 2 }, null]);
    subs.veda.mockResolvedValue(undefined);

    expect(
      await handleChartCustomEndpoints(/** @type {any} */ ({})),
    ).toBeNull();
  });

  test("returns null when every handler yields invalid data", async () => {
    subs.sentinelhub.mockResolvedValue(undefined);
    subs.veda.mockResolvedValue([]);

    expect(
      await handleChartCustomEndpoints(/** @type {any} */ ({})),
    ).toBeNull();
  });
});

describe("handleLayersCustomEndpoints", () => {
  beforeEach(() => subs.eoxhub.mockReset());

  test("keeps only valid eox layers (type + source or layers)", async () => {
    subs.eoxhub.mockResolvedValue([
      { type: "Tile", source: { url: "a" } }, // valid
      { type: "Group", layers: [] }, // valid
      { source: { url: "b" } }, // no type
      { type: "Tile" }, // no source/layers
      null, // falsy
    ]);

    expect(await handleLayersCustomEndpoints(/** @type {any} */ ({}))).toEqual([
      { type: "Tile", source: { url: "a" } },
      { type: "Group", layers: [] },
    ]);
  });

  test("returns an empty list when the handler yields nothing", async () => {
    subs.eoxhub.mockResolvedValue(null);

    expect(await handleLayersCustomEndpoints(/** @type {any} */ ({}))).toEqual(
      [],
    );
  });
});
