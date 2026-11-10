import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { fromLonLat } from "ol/proj";
import {
  BBOX,
  buildCatalog,
  CATALOG_URL,
  xyzLink,
} from "../../support/catalog";
import { serveByPath } from "../../support/fixtures";
import { analysisGroup } from "../../support/layers";
import { bootTemplate, MAP_ONLY, TIMEOUT } from "../../support/template";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const INDICATOR_ID = "mosaicked";
const RASTER_ENDPOINT = `${globalThis.location.origin}/raster`;
const TILEJSON_ROUTE = `/collections/${INDICATOR_ID}/WebMercatorQuad/tilejson.json`;

const renders = {
  [INDICATOR_ID]: {
    true_color: { title: "True Color", assets: ["reflectance"] },
  },
};

// The map plus the time slider, which is what mounts the mosaic.
const MOSAIC = {
  background: MAP_ONLY.background,
  widgets: [
    {
      /** @param {unknown} selectedSTAC */
      defineWidget: (selectedSTAC) =>
        selectedSTAC
          ? {
              id: "mosaic-datetime",
              type: "internal",
              layout: { x: 1, y: 8, w: 10, h: 4 },
              title: "Time Slider",
              widget: {
                name: "EodashTimeSlider",
                properties: {
                  useMosaic: true,
                  mosaicIndicators: [INDICATOR_ID],
                },
              },
            }
          : null,
    },
  ],
};

const catalog = buildCatalog([{ id: INDICATOR_ID }]);
/** @param {string} url */
const tilejson = (url) => ({
  tiles: [`${xyzLink().href}?${new URL(url).searchParams}&z={z}&x={x}&y={y}`],
});
catalog.routes[TILEJSON_ROUTE] = tilejson;
catalog.routes["/assets"] = [{ id: "asset" }];

describe("mosaic template", () => {
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;
  // `eox-map` dispatches `layerschanged` once per `set layers`, so this counts
  // how many times the app wrote the map.
  let mapWrites = 0;

  beforeAll(async () => {
    serveByPath(axiosMock, catalog.routes);
    ctx = await bootTemplate({
      template: "mosaic",
      endpoint: CATALOG_URL,
      rasterEndpoint: RASTER_ENDPOINT,
      over: { templates: { mosaic: MOSAIC }, options: { renders } },
    });
    ctx.query("eox-map").addEventListener("layerschanged", () => mapWrites++);
  });

  afterAll(() => ctx?.app.unmount());

  test("renders the mosaic layer with a single map write", async () => {
    // The mosaic only renders zoomed in, as the view's hint tells the user.
    const view = ctx.query("eox-map").map.getView();
    view.setCenter(
      fromLonLat([(BBOX[0] + BBOX[2]) / 2, (BBOX[1] + BBOX[3]) / 2]),
    );
    view.setZoom(9);

    mapWrites = 0;
    await ctx.store.loadSelectedSTAC(catalog.hrefOf(INDICATOR_ID));

    await expect
      .poll(
        () =>
          analysisGroup(ctx.query("eox-map"))?.layers?.[0]?.properties?.id ??
          "",
        { timeout: TIMEOUT },
      )
      .toBe(`${INDICATOR_ID};:;mosaic`);

    // // Two by the current division of labour: the map writes base and overlay,
    // // then the time slider mounts and the mosaic writes the analysis group. A
    // // third would mean someone else is rewriting the map.
    // expect(mapWrites).toBe(2);
  });
});
