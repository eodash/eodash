import { describe, expect, test } from "vitest";
import {
  resolveTmsByProjection,
  tmsToTileGridOptions,
} from "../src/helpers/projection.js";

describe("resolveTmsByProjection", () => {
  const customRegistry = {
    WebMercatorQuad: {
      id: "WebMercatorQuad",
      crs: "http://www.opengis.net/def/crs/EPSG/0/3857",
    },
    WGS1984Quad: {
      id: "WGS1984Quad",
      crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
    },
    LAEA: {
      id: "LAEA",
      crs: "urn:ogc:def:crs:EPSG::3035",
    },
  };

  test("matches by EPSG code", () => {
    expect(resolveTmsByProjection("EPSG:3857", customRegistry).id).toBe(
      "WebMercatorQuad",
    );
    expect(resolveTmsByProjection("EPSG:4326", customRegistry).id).toBe(
      "WGS1984Quad",
    );
    expect(resolveTmsByProjection("EPSG:3035", customRegistry).id).toBe("LAEA");
  });

  test("matches by full URI or URN parts", () => {
    expect(resolveTmsByProjection("3857", customRegistry).id).toBe(
      "WebMercatorQuad",
    );
    expect(resolveTmsByProjection("4326", customRegistry).id).toBe(
      "WGS1984Quad",
    );
  });

  test("returns undefined for no match", () => {
    expect(
      resolveTmsByProjection("EPSG:32632", customRegistry),
    ).toBeUndefined();
  });

  test("returns undefined for missing input", () => {
    // @ts-expect-error - testing invalid null input
    expect(resolveTmsByProjection(null, customRegistry)).toBeUndefined();
    expect(resolveTmsByProjection("EPSG:3857", null)).toBeUndefined();
  });
});

describe("tmsToTileGridOptions", () => {
  const tms = {
    id: "WebMercatorQuad",
    crs: "http://www.opengis.net/def/crs/EPSG/0/3857",
    orderedAxes: ["X", "Y"],
    tileMatrices: [
      {
        id: "0",
        cellSize: 156543.03392804097,
        pointOfOrigin: [-20037508.3427892, 20037508.3427892],
        matrixWidth: 1,
        matrixHeight: 1,
        tileWidth: 256,
        tileHeight: 256,
      },
      {
        id: "1",
        cellSize: 78271.51696402048,
        pointOfOrigin: [-20037508.3427892, 20037508.3427892],
        matrixWidth: 2,
        matrixHeight: 2,
        tileWidth: 256,
        tileHeight: 256,
      },
    ],
  };

  test("converts basic TMS to tile grid options", () => {
    const options = tmsToTileGridOptions(tms, [256, 256]);
    expect(options.origin).toEqual([-20037508.3427892, 20037508.3427892]);
    expect(options.resolutions).toHaveLength(2);
    expect(options.matrixIds).toEqual(["0", "1"]);
    expect(options.tileSize).toEqual([256, 256]);
  });

  test("handles targetTileSize for upscaling", () => {
    const options = tmsToTileGridOptions(tms, [512, 512]);
    expect(options.tileSize).toEqual([512, 512]);
    // Resolutions should be halved if tile size is doubled
    expect(options.resolutions[0]).toBeCloseTo(
      tms.tileMatrices[0].cellSize / 2,
    );
  });

  test("handles orderedAxes NE (swaps origin)", () => {
    const neTms = {
      ...tms,
      orderedAxes: ["N", "E"],
      tileMatrices: [
        {
          ...tms.tileMatrices[0],
          pointOfOrigin: [10, 20], // N=10, E=20
        },
      ],
    };
    const options = tmsToTileGridOptions(neTms);
    // Origin should be [E, N] = [20, 10]
    expect(options.origin).toEqual([20, 10]);
  });
});
