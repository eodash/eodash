import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { fromLonLat } from "ol/proj";
import {
  BBOX,
  buildCatalog,
  CATALOG_URL,
  DATES,
  xyzLink,
} from "../../support/catalog";
import {
  enterGlobe,
  globeLayer,
  leaveGlobe,
  leftGlobe,
  until,
} from "../../support/globe";
import { serveByPath } from "../../support/fixtures";
import { bootTemplate, MAP_ONLY, TIMEOUT } from "../../support/template";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

// Diagnostic: which mosaic interactions reach the 3D globe (points 02, 07, 11
// in .agents/globe-investigation/). Same fixture as render.test.js: the map plus
// the time slider, which is what mounts the mosaic.
const INDICATOR_ID = "mosaicked";
const MOSAIC_LAYER_ID = `${INDICATOR_ID};:;mosaic`;
const RASTER_ENDPOINT = `${globalThis.location.origin}/raster`;
const TILEJSON_ROUTE = `/collections/${INDICATOR_ID}/WebMercatorQuad/tilejson.json`;

const renders = {
  [INDICATOR_ID]: {
    true_color: { title: "True Color", assets: ["reflectance"] },
  },
};

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
// The tile url carries the tilejson query, so a new time range is a new url.
/** @param {string} url */
const tilejson = (url) => ({
  tiles: [`${xyzLink().href}?${new URL(url).searchParams}&z={z}&x={x}&y={y}`],
});
catalog.routes[TILEJSON_ROUTE] = tilejson;
catalog.routes["/assets"] = [{ id: "asset" }];

describe("mosaic globe", () => {
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;
  /** @type {any} */
  let mapEl;

  const olUrl = () =>
    mapEl.getLayerById(MOSAIC_LAYER_ID)?.getSource()?.getUrls()?.[0];

  beforeAll(async () => {
    serveByPath(axiosMock, catalog.routes);
    ctx = await bootTemplate({
      template: "mosaic",
      endpoint: CATALOG_URL,
      rasterEndpoint: RASTER_ENDPOINT,
      over: { templates: { mosaic: MOSAIC }, options: { renders } },
    });
    mapEl = ctx.query("eox-map");
    // The mosaic only renders zoomed in.
    const view = mapEl.map.getView();
    view.setCenter(
      fromLonLat([(BBOX[0] + BBOX[2]) / 2, (BBOX[1] + BBOX[3]) / 2]),
    );
    view.setZoom(9);
    // This template has no indicator picker; the app selects through the store.
    await ctx.store.loadSelectedSTAC(catalog.hrefOf(INDICATOR_ID));
    await until(() => mapEl.getLayerById(MOSAIC_LAYER_ID), "mosaic layer");
    await enterGlobe(ctx.container, mapEl);
  });

  afterAll(() => ctx?.app.unmount());

  test("the globe holds the mosaic layer with the map's tiles", async () => {
    // the slider can re-initialise the mosaic after entering 3D
    await expect
      .poll(() => globeLayer(mapEl, MOSAIC_LAYER_ID)?.url, {
        timeout: TIMEOUT,
      })
      .toBe(olUrl());
  });

  test("a new time range on the slider reloads the mosaic on the globe", async () => {
    // same layer id, new tile url
    const before = olUrl();
    ctx.query("eox-timecontrol").dispatchEvent(
      new CustomEvent("select", {
        detail: { date: [DATES[0], DATES[0]], selectedItems: {} },
      }),
    );

    await expect.poll(olUrl, { timeout: TIMEOUT }).not.toBe(before);
    await expect
      .poll(() => globeLayer(mapEl, MOSAIC_LAYER_ID)?.url, {
        timeout: TIMEOUT,
      })
      .toBe(olUrl());
  });

  test("the time range change raises no error alert", async () => {
    // the mosaic data check reads the map's lon/lat extent in 3D too; give its
    // 300 ms debounce time to run
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(ctx.query(".v-alert")).toBeNull();
  });

  test("the globe gets the mosaic's zoom threshold", () => {
    // the globe skips the mosaic tiles below it, like the 2D map (point 19)
    expect(globeLayer(mapEl, MOSAIC_LAYER_ID).minZoom).toBeGreaterThan(0);
  });

  test("the url keeps a map zoom, not the camera altitude", () => {
    // a reload or shared link opens in 2D (point 11)
    const z = Number(new URLSearchParams(window.location.search).get("z"));
    expect(z).toBeLessThanOrEqual(28);
  });

  test("switching back to 2D tears the globe down and keeps the mosaic layer", async () => {
    await leaveGlobe(ctx.container, mapEl);

    expect(leftGlobe(mapEl)).toBe(true);
    expect(mapEl.getLayerById(MOSAIC_LAYER_ID)).toBeTruthy();
  });
});
