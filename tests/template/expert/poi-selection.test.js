import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { useSTAcStore } from "@/store/stac";
import { pinia } from "@/plugins";
import { datetime, indicator, poi } from "@/store/states";
import { getBaseConfig } from "../../../templates/baseConfig";
import { mountApp } from "../../support/app";

const STAC_ENDPOINT =
  "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json";
// POI indicator: point locations on the "geodb-collection" layer. Its STAC
// service link renders {{feature}} on select and loads that location's whole
// collection.
const INDICATOR_ID = "N3a2_chl_concentration_tri_esa";
// The nested collection holds the location child links (its own id repeated).
const LOCATIONS_URL = STAC_ENDPOINT.replace(
  /catalog\.json$/,
  `${INDICATOR_ID}/${INDICATOR_ID}/collection.json`,
);
const BOOT_TIMEOUT = 1000 * 15;
// POI selection fetches the location collection over the network (external hosts).
const TIMEOUT = 1000 * 20;

describe("expert template - POI selection (STAC output)", () => {
  /** @type {ReturnType<typeof mountApp>} */
  let app;
  /** @param {string} sel @returns {any} */
  const query = (sel) => app.container.querySelector(sel);
  const store = useSTAcStore(pinia);
  /** The location ids from the collection (derived, not hardcoded). */
  let locationIds = /** @type {string[]} */ ([]);

  /** The layerId injected into the process drawtools (its selection target). */
  const drawtoolsLayerId = () =>
    query("eox-jsonform")?.shadowRoot?.querySelector("eox-drawtools")?.layerId;

  /** The features of the drawtools' target layer on the map. */
  const targetFeatures = () =>
    query("eox-map")
      ?.getLayerById(drawtoolsLayerId())
      ?.getSource?.()
      ?.getFeatures?.() ?? [];

  /** Select a POI the way a map click does. */
  const selectFeature = (/** @type {number} */ index) => {
    const feature = targetFeatures()[index];
    expect(feature, `feature #${index} on the target layer`).toBeTruthy();
    query("eox-map").dispatchEvent(
      new CustomEvent("select", {
        detail: { id: "SelectLayerClickInteraction", feature },
      }),
    );
  };

  beforeAll(async () => {
    app = mountApp({
      template: "expert",
      config: () =>
        getBaseConfig({ stacEndpoint: { endpoint: STAC_ENDPOINT } }),
    });
    await vi.waitFor(
      () => {
        if (!(query("eox-map") && store.stac?.length)) {
          throw new Error("map was not initialised");
        }
      },
      { timeout: BOOT_TIMEOUT },
    );
    const child = store.stac?.find((l) => l.id === INDICATOR_ID);
    if (!child) throw new Error(`indicator "${INDICATOR_ID}" not in catalog`);
    /** @type {any} */
    const locations = await fetch(LOCATIONS_URL).then((r) => r.json());
    locationIds = locations.links
      .filter((/** @type {any} */ l) => l.rel === "child" && "latlng" in l)
      .map((/** @type {any} */ l) => l.id);
    if (!locationIds.length) throw new Error("no locations in collection");

    await store.loadSelectedSTAC(child.href);
    // Ready once drawtools synced to the points layer and every location loaded.
    await vi.waitFor(
      () => {
        if (drawtoolsLayerId() !== "geodb-collection") {
          throw new Error("drawtools not synced to the points layer");
        }
        if (targetFeatures().length !== locationIds.length) {
          throw new Error("location features not loaded");
        }
      },
      { timeout: TIMEOUT },
    );
  });

  afterAll(() => app?.unmount());

  test("selecting a POI loads its STAC collection", async () => {
    // Capture before dispatch — selecting removes the points layer.
    const selectedId = targetFeatures()[0].get("id");
    expect(locationIds).toContain(selectedId);

    selectFeature(0);

    await vi.waitFor(
      () => {
        if (store.selectedStac?.id !== selectedId) {
          throw new Error("location collection not loaded");
        }
      },
      { timeout: TIMEOUT },
    );

    // POI branch: location loaded, parent indicator preserved.
    expect(poi.value).toBe(selectedId);
    expect(indicator.value).toBe(INDICATOR_ID);

    // Datetime re-keyed to the location's own temporal extent.
    const extentEnd = store.selectedStac?.extent?.temporal?.interval?.[0]?.[1];
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
        if (query("eox-map").getLayerById("geodb-collection")) {
          throw new Error("points layer still present");
        }
      },
      { timeout: TIMEOUT },
    );
    expect(query(".v-alert")).toBeNull();
  });
});
