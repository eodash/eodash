import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { serveByPath, stacCollection } from "../../support/fixtures";
import {
  chooseIndicator,
  enterGlobe,
  leaveGlobe,
  staysInGlobe,
  until,
} from "../../support/globe";
import { bootTemplate, TIMEOUT } from "../../support/template";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

// Diagnostic: how the collection projection rules behave around the globe
// (points 03, 04 and 05 in .agents/globe-investigation/). Same fixture pair as
// projection-switch.test.js: one collection without a projection of its own,
// one in EPSG:3031.
const ENDPOINT = "https://stac.test/catalog.json";
const POLAR_CODE = "EPSG:3031";

const EUROPE = stacCollection({
  id: "europe",
  title: "Europe",
  extent: {
    spatial: { bbox: [[-10, 35, 30, 60]] },
    temporal: { interval: [[null, null]] },
  },
});

const ANTARCTICA = stacCollection({
  id: "antarctica",
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
    spatial: { bbox: [[-180, -90, 180, -60]] },
    temporal: { interval: [[null, null]] },
  },
});

/** @type {Record<string, any>} */
const routes = {
  "/defaults/colormaps.json": {},
  "/defaults/tmsRegistry.json": {},
  "/catalog.json": {
    type: "Catalog",
    stac_version: "1.0.0",
    id: "catalog",
    description: "projection fixtures",
    links: [
      // titled: the indicator popup lists the catalog links by title
      {
        rel: "child",
        href: "./europe/collection.json",
        id: "europe",
        title: "Europe",
      },
      {
        rel: "child",
        href: "./antarctica/collection.json",
        id: "antarctica",
        title: "Antarctica",
      },
    ],
  },
  "/europe/collection.json": EUROPE,
  "/antarctica/collection.json": ANTARCTICA,
};

describe("expert globe - collection projections", () => {
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;
  /** @type {any} */
  let mapEl;

  const viewProjection = () => mapEl.map.getView().getProjection().getCode();

  beforeAll(async () => {
    serveByPath(axiosMock, routes);
    ctx = await bootTemplate({ endpoint: ENDPOINT });
    mapEl = ctx.query("eox-map");
    await chooseIndicator("Antarctica");
    await until(() => viewProjection() === POLAR_CODE, "polar view in 2D");
    await enterGlobe(ctx.container, mapEl);
  });

  afterAll(() => ctx?.app.unmount());

  test("the change-projection button is not offered in 3D", () => {
    // clicking it in 3D leaves the globe behind eodash's back (point 05)
    const button = [...ctx.container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Change map projection"),
    );
    expect(button).toBeUndefined();
  });

  test("picking a collection without a projection of its own keeps the globe", async () => {
    await chooseIndicator("Europe");
    await until(() => ctx.store.selectedStac?.id === "europe", "europe");

    expect(await staysInGlobe(mapEl)).toBe(true);
  });

  test("picking a collection with its own projection keeps the globe", async () => {
    await chooseIndicator("Antarctica");
    await until(() => ctx.store.selectedStac?.id === "antarctica", "polar");

    expect(await staysInGlobe(mapEl)).toBe(true);
  });

  test("leaving 3D restores the collection's projection", async () => {
    // eodash leaves the globe in EPSG:3857 whatever was selected (point 04)
    await leaveGlobe(ctx.container, mapEl);

    await expect.poll(viewProjection, { timeout: TIMEOUT }).toBe(POLAR_CODE);
  });
});
