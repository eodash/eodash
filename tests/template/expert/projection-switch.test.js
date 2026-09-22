import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { transformExtent } from "@eox/map";
import { serveByPath, stacCollection } from "../../support/fixtures";
import { bootTemplate, selectIndicator, TIMEOUT } from "../../support/template";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

// No published test collection declares a projection, so the pair is served from
// fixtures: switching between them is the only way to exercise a reprojection.
const ENDPOINT = "https://stac.test/catalog.json";

const EUROPE_ID = "europe";
const EUROPE_BBOX = [-10, 35, 30, 60];
const POLAR_ID = "antarctica";
const POLAR_BBOX = [-180, -90, 180, -60];
const POLAR_CODE = "EPSG:3031";

const EUROPE = stacCollection({
  id: EUROPE_ID,
  title: "Europe",
  extent: {
    spatial: { bbox: [EUROPE_BBOX] },
    temporal: { interval: [[null, null]] },
  },
});

const ANTARCTICA = stacCollection({
  id: POLAR_ID,
  title: "Antarctica",
  // the definition form registers through proj4 locally; a bare code would send
  // the projection lookup to epsg.io
  "eodash:mapProjection": {
    name: POLAR_CODE,
    def:
      "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 " +
      "+datum=WGS84 +units=m +no_defs",
  },
  extent: {
    spatial: { bbox: [POLAR_BBOX] },
    temporal: { interval: [[null, null]] },
  },
});

const CATALOG = {
  type: "Catalog",
  stac_version: "1.0.0",
  id: "catalog",
  description: "projection fixtures",
  links: [
    { rel: "child", href: "./europe/collection.json", id: EUROPE_ID },
    { rel: "child", href: "./antarctica/collection.json", id: POLAR_ID },
  ],
};

/** @type {Record<string, any>} */
const routes = {
  "/defaults/colormaps.json": {},
  "/defaults/tmsRegistry.json": {},
  "/catalog.json": CATALOG,
  "/europe/collection.json": EUROPE,
  "/antarctica/collection.json": ANTARCTICA,
};

describe("expert template - switching to a collection with its own projection", () => {
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;

  const viewProjection = () =>
    ctx.query("eox-map").map.getView().getProjection().getCode();

  /**
   * Whether the map shows the whole collection footprint, compared in the view's
   * own units: `zoomExtent` reads back as the view's extent rather than the
   * value the app set.
   *
   * @param {number[]} bbox
   */
  const shows = (bbox) => {
    const map = ctx.query("eox-map");
    const footprint = transformExtent(
      bbox,
      "EPSG:4326",
      map.map.getView().getProjection(),
    );
    const [w, s, e, n] = map.zoomExtent;
    return w <= footprint[0] &&
      s <= footprint[1] &&
      e >= footprint[2] &&
      n >= footprint[3]
      ? true
      : `view ${map.zoomExtent.map(Math.round)} does not hold ${footprint.map(Math.round)}`;
  };

  beforeAll(async () => {
    serveByPath(axiosMock, routes);
    ctx = await bootTemplate({ endpoint: ENDPOINT });
  });

  afterAll(() => ctx?.app.unmount());

  test("fits the first collection in the default projection", async () => {
    await selectIndicator(ctx.store, EUROPE_ID);

    await expect
      .poll(() => shows(EUROPE_BBOX), { timeout: TIMEOUT })
      .toBe(true);
    expect(viewProjection()).toBe("EPSG:3857");
  });

  test("reprojects to the projection the collection declares", async () => {
    await selectIndicator(ctx.store, POLAR_ID);

    await expect.poll(viewProjection, { timeout: TIMEOUT }).toBe(POLAR_CODE);
  });

  test("fits again on the way back, rather than only reprojecting", async () => {
    await selectIndicator(ctx.store, EUROPE_ID);

    await expect.poll(viewProjection, { timeout: TIMEOUT }).toBe("EPSG:3857");
    await expect
      .poll(() => shows(EUROPE_BBOX), { timeout: TIMEOUT })
      .toBe(true);
  });
});
