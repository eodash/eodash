import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { xyzLink } from "../../support/catalog";
import {
  enterGlobe,
  globeLayer,
  leaveGlobe,
  leftGlobe,
  until,
} from "../../support/globe";
import { serveByPath, stacCollection, stacItem } from "../../support/fixtures";
import { dataLayerId } from "../../support/layers";
import { bootTemplate, TIMEOUT } from "../../support/template";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

// Diagnostic: which catalog-to-map interactions reach the 3D globe (points 01,
// 02, 06, 07 in .agents/globe-investigation/). Same canned api as
// catalog.test.js, with an xyz link per item so a selected item renders a layer.
const ENDPOINT = "https://stac.test/stac";
const COLLECTION_ID = "test-collection";
const FOOTPRINTS_ID = "stac-items";

const ITEMS = ["item-a", "item-b", "item-c"].map((id, index) =>
  stacItem({
    id,
    collection: COLLECTION_ID,
    bbox: [10 + 2 * index, 47 - 2 * index, 11 + 2 * index, 48 - 2 * index],
    links: [xyzLink()],
  }),
);

const COLLECTION = stacCollection({ id: COLLECTION_ID, title: "Test Collection" });

/** @type {Record<string, any>} */
const routes = {
  "/conformance": { conformsTo: [] },
  "/defaults/colormaps.json": {},
  "/defaults/tmsRegistry.json": {},
  "/collections": { collections: [COLLECTION] },
  [`/collections/${COLLECTION_ID}`]: COLLECTION,
  [`/collections/${COLLECTION_ID}/queryables`]: {
    type: "object",
    properties: {},
  },
  [`/collections/${COLLECTION_ID}/items`]: {
    type: "FeatureCollection",
    features: ITEMS,
  },
  ...Object.fromEntries(
    ITEMS.map((item) => [
      `/collections/${COLLECTION_ID}/items/${item.id}`,
      item,
    ]),
  ),
  "/search": {
    type: "FeatureCollection",
    features: ITEMS,
    numberMatched: ITEMS.length,
    numberReturned: ITEMS.length,
    links: [],
  },
};

describe("explore globe - catalog", () => {
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;
  /** @type {any} */
  let mapEl;

  const footprintCount = () =>
    mapEl.getLayerById(FOOTPRINTS_ID)?.getSource()?.getFeatures()?.length ?? 0;

  /**
   * Footprints drawn on the globe. eox-map draws the footprint GeoJSON as a
   * native vector once its own fetch of the data url resolved.
   */
  const globeFootprintCount = () => {
    const layer = globeLayer(mapEl, FOOTPRINTS_ID);
    return layer?.instanceName === "Vector" ? layer.getEntities().length : 0;
  };

  /** @param {number} index */
  const selectResult = (index) =>
    ctx
      .query("eox-itemfilter")
      .dispatchEvent(new CustomEvent("select", { detail: ITEMS[index] }));

  beforeAll(async () => {
    serveByPath(axiosMock, routes);
    ctx = await bootTemplate({
      template: "explore",
      endpoint: ENDPOINT,
      api: true,
    });
    mapEl = ctx.query("eox-map");
    await until(
      () => ctx.query("eox-itemfilter")?.results?.length === ITEMS.length,
      "search results",
    );
    // The globe button mounts once a selection sets the indicator.
    selectResult(1);
    await until(() => ctx.store.selectedItem?.id === "item-b", "item selected");
    await until(() => dataLayerId(mapEl), "item layer");
    await until(() => footprintCount() === ITEMS.length, "footprints");
    await enterGlobe(ctx.container, mapEl);
  });

  afterAll(() => ctx?.app.unmount());

  test("the globe holds the selected item's layer", () => {
    expect(globeLayer(mapEl, dataLayerId(mapEl))).toBeTruthy();
  });

  test("the footprints are drawn on the globe", async () => {
    await expect
      .poll(globeFootprintCount, { timeout: TIMEOUT })
      .toBe(ITEMS.length);
  });

  test("selecting another result renders its layer on the globe", async () => {
    const previous = dataLayerId(mapEl);
    selectResult(2);

    await expect
      .poll(() => ctx.store.selectedItem?.id, { timeout: TIMEOUT })
      .toBe("item-c");
    await expect
      .poll(() => dataLayerId(mapEl), { timeout: TIMEOUT })
      .not.toBe(previous);
    await expect
      .poll(() => globeLayer(mapEl, dataLayerId(mapEl)), { timeout: TIMEOUT })
      .toBeTruthy();
  });

  test("a new search runs in 3D", async () => {
    // What a filter change triggers. The search reads the map's lon/lat extent,
    // which eox-map cannot compute in 3D (point 07).
    routes["/search"] = { type: "FeatureCollection", features: [ITEMS[0]] };
    ctx.query("eox-itemfilter").search();

    await expect
      .poll(() => ctx.query("eox-itemfilter")?.results?.length, {
        timeout: TIMEOUT,
      })
      .toBeLessThan(ITEMS.length);
  });

  test("the footprints on the globe follow the new results", async () => {
    // the map updates the footprints in place, which the globe does not see
    // (points 01, 02); depends on the search above
    await expect.poll(footprintCount, { timeout: TIMEOUT }).toBeLessThan(
      ITEMS.length,
    );
    await expect
      .poll(globeFootprintCount, { timeout: TIMEOUT })
      .toBe(footprintCount());
  });

  test("switching back to 2D tears the globe down and keeps the footprints", async () => {
    await leaveGlobe(ctx.container, mapEl);

    expect(leftGlobe(mapEl)).toBe(true);
    await expect
      .poll(footprintCount, { timeout: TIMEOUT })
      .toBeGreaterThan(0);
    expect(ctx.query(".v-alert")).toBeNull();
  });
});
