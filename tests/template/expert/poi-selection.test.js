import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { datetime, indicator, poi } from "@/store/states";
import {
  bootExpert,
  drawtoolsLayerId,
  selectFeature,
  selectIndicator,
  targetFeatures,
} from "../../support/template";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
// POI indicator: its STAC service link renders {{feature}} on select and loads
// that location's whole collection.
const INDICATOR_ID = "N3a2_chl_concentration_tri_esa";
// The nested collection holds the location child links (its own id repeated).
const LOCATIONS_URL = STAC_ENDPOINT.replace(
  /catalog\.json$/,
  `${INDICATOR_ID}/${INDICATOR_ID}/collection.json`,
);
// POI selection fetches the location collection from external hosts.
const TIMEOUT = 1000 * 20;

describe("expert template - POI selection (STAC output)", () => {
  /** @type {Awaited<ReturnType<typeof bootExpert>>} */
  let ctx;
  /** @type {string[]} */
  let locationIds = [];

  beforeAll(async () => {
    ctx = await bootExpert({ endpoint: STAC_ENDPOINT });
    /** @type {any} */
    const locations = await fetch(LOCATIONS_URL).then((r) => r.json());
    locationIds = locations.links
      .filter((/** @type {any} */ l) => l.rel === "child" && "latlng" in l)
      .map((/** @type {any} */ l) => l.id);
    if (!locationIds.length) throw new Error("no locations in collection");

    await selectIndicator(ctx.store, INDICATOR_ID);
    // Ready once drawtools synced to the points layer and every location loaded.
    await vi.waitFor(
      () => {
        if (drawtoolsLayerId(ctx.container) !== "geodb-collection") {
          throw new Error("drawtools not synced to the points layer");
        }
        if (targetFeatures(ctx.container).length !== locationIds.length) {
          throw new Error("location features not loaded");
        }
      },
      { timeout: TIMEOUT },
    );
  });

  afterAll(() => ctx?.app.unmount());

  test("selecting a POI loads its STAC collection", async () => {
    // Capture before dispatch — selecting removes the points layer.
    const selectedId = targetFeatures(ctx.container)[0].get("id");
    expect(locationIds).toContain(selectedId);

    selectFeature(ctx.container, 0);

    await vi.waitFor(
      () => {
        if (ctx.store.selectedStac?.id !== selectedId) {
          throw new Error("location collection not loaded");
        }
      },
      { timeout: TIMEOUT },
    );

    // POI branch: location loaded, parent indicator preserved.
    expect(poi.value).toBe(selectedId);
    expect(indicator.value).toBe(INDICATOR_ID);

    // Datetime re-keyed to the location's own temporal extent.
    const extentEnd =
      ctx.store.selectedStac?.extent?.temporal?.interval?.[0]?.[1];
    if (!extentEnd) throw new Error("loaded collection has no temporal extent");
    const extentEndIso = new Date(extentEnd).toISOString();
    await vi.waitFor(
      () => {
        if (datetime.value !== extentEndIso) {
          throw new Error("datetime did not snap to the location extent");
        }
      },
      { timeout: TIMEOUT },
    );
  });

  test("the app leaves observation-points mode once a POI is loaded", async () => {
    await vi.waitFor(
      () => {
        if (ctx.query("eox-map").getLayerById("geodb-collection")) {
          throw new Error("points layer still present");
        }
      },
      { timeout: TIMEOUT },
    );
    expect(ctx.query(".v-alert")).toBeNull();
  });
});
