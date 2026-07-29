import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { bboxToCenterZoom } from "@/eodashSTAC/helpers";
import { tooltipAdapter } from "@/store/states";
import { serveByPath, stacCollection, stacItem } from "../../support/fixtures";
import { bootTemplate, TIMEOUT } from "../../support/template";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

// Explore runs in API mode against live acquisitions that change daily, so the
// api is served from fixtures. They are canned, not a simulated api: nothing
// filters or sorts here, so tests assert what the app renders.
const ENDPOINT = "https://stac.test/stac";
const COLLECTION_ID = "test-collection";

const ITEMS = [
  stacItem({ id: "item-a", collection: COLLECTION_ID, bbox: [10, 47, 11, 48] }),
  stacItem({ id: "item-b", collection: COLLECTION_ID, bbox: [12, 45, 13, 46] }),
  // item-c sits far from the others so a fit-to-bbox is unambiguous.
  stacItem({ id: "item-c", collection: COLLECTION_ID, bbox: [14, 43, 15, 44] }),
];

const COLLECTION = stacCollection({
  id: COLLECTION_ID,
  title: "Test Collection",
  summaries: {
    platform: ["sentinel-2a", "sentinel-2b"],
    "sat:orbit_state": ["ascending", "descending"],
  },
});

const QUERYABLES = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  title: "Queryables",
  properties: {
    datetime: { type: "string" },
    "eo:cloud_cover": { type: "number" },
    platform: { type: "string" },
    "sat:orbit_state": { type: "string" },
  },
  additionalProperties: true,
};

/** @type {Record<string, any>} */
const routes = {
  // Pulled in by baseConfig on every boot.
  "/defaults/colormaps.json": {},
  "/collections": { collections: [COLLECTION] },
  [`/collections/${COLLECTION_ID}`]: COLLECTION,
  [`/collections/${COLLECTION_ID}/queryables`]: QUERYABLES,
  [`/collections/${COLLECTION_ID}/items`]: {
    type: "FeatureCollection",
    features: ITEMS,
  },
  [`/collections/${COLLECTION_ID}/items/item-b`]: ITEMS[1],
  "/search": {
    type: "FeatureCollection",
    features: ITEMS,
    numberMatched: ITEMS.length,
    numberReturned: ITEMS.length,
    links: [],
  },
};

describe("explore template - catalog", () => {
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;
  /** @type {{ unmatched: string[] }} */
  let served;

  /**
   * Ids actually rendered in the footprints layer.
   */
  const footprintIds = () => {
    /** @type {import("ol").Feature[]} */
    const features =
      ctx
        .query("eox-map")
        .getLayerById("stac-items")
        ?.getSource()
        ?.getFeatures() ?? [];
    return features.map((f) => f.getId());
  };

  const scopedRoutes = { ...routes };

  beforeAll(async () => {
    served = serveByPath(axiosMock, scopedRoutes);
    ctx = await bootTemplate({
      template: "explore",
      endpoint: ENDPOINT,
      api: true,
    });
  });

  afterAll(() => ctx?.app.unmount());

  test("boots the explore template without an error alert", () => {
    expect(ctx.query("eox-map")).toBeTruthy();
    expect(ctx.query(".v-alert")).toBeNull();
    // Surfaces any api call the fixtures do not cover yet.
    expect(served.unmatched).toEqual([]);
  });

  test("lists the searched items in the catalog", async () => {
    await expect
      .poll(() => ctx.query("eox-itemfilter"), { timeout: TIMEOUT })
      .toBeTruthy();
    await expect
      .poll(() => ctx.query("eox-itemfilter")?.results?.length, {
        timeout: TIMEOUT,
      })
      .toBe(ITEMS.length);
  });

  test("draws a footprint per searched item on the map", async () => {
    // The features load asynchronously from the layer's inline geojson source.
    await expect
      .poll(() => footprintIds(), { timeout: TIMEOUT })
      .toEqual(ITEMS.map((i) => i.id));
  });

  test("hovering a result highlights its footprint, leaving clears it", async () => {
    await expect
      .poll(
        () => ctx.query("eox-map")?.selectInteractions?.["stac-item-hover"],
        { timeout: TIMEOUT },
      )
      .toBeTruthy();
    const hover = ctx.query("eox-map").selectInteractions["stac-item-hover"];
    const highlight = vi.spyOn(hover, "highlightById");

    const itemfilter = ctx.query("eox-itemfilter");
    itemfilter.dispatchEvent(
      new CustomEvent("mouseenter:result", { detail: { id: "item-b" } }),
    );
    expect(highlight).toHaveBeenCalledWith(["item-b"]);

    itemfilter.dispatchEvent(new CustomEvent("mouseleave:result", {}));
    expect(highlight).toHaveBeenLastCalledWith([]);
    highlight.mockRestore();
  });

  test("the hover tooltip adapter formats configured properties, drops others", () => {
    const adapt = tooltipAdapter.value;
    if (!adapt) throw new Error("no tooltip adapter registered");
    // hoverProperties in explore.js: datetime, eo:cloud_cover, sat:orbit_state.
    expect(adapt({ key: "eo:cloud_cover", value: 42.4 })).toEqual({
      key: "Cloud Cover",
      value: "42",
    });
    expect(
      adapt({ key: "datetime", value: "2026-01-03T00:00:00.000000Z" }),
    ).toEqual({
      key: "Datetime",
      value: "Sat, 03 Jan 2026 00:00:00 GMT",
    });
    expect(adapt({ key: "platform", value: "sentinel-2a" })).toBeUndefined();
  });

  test("selecting a result selects the item and fits the map to its bbox", async () => {
    const item = ITEMS[2];
    ctx
      .query("eox-itemfilter")
      .dispatchEvent(new CustomEvent("select", { detail: item }));

    await expect
      .poll(() => ctx.store.selectedItem?.id, { timeout: TIMEOUT })
      .toBe("item-c");

    const { center } = bboxToCenterZoom(/** @type {number[]} */ (item.bbox));
    await expect
      .poll(
        () => {
          const [x, y] = ctx.query("eox-map").lonLatCenter;
          return Math.abs(x - center[0]) < 0.6 && Math.abs(y - center[1]) < 0.6;
        },
        { timeout: TIMEOUT },
      )
      .toBe(true);
  });

  test("clicking a footprint on the map selects its item and syncs the url", async () => {
    // The layer is rebuilt async after the previous selection, so re-read it.
    const findFeature = () => {
      /** @type {import("ol").Feature[]} */
      const features =
        ctx
          .query("eox-map")
          .getLayerById("stac-items")
          ?.getSource()
          ?.getFeatures() ?? [];
      return features.find((f) => f.getId() === "item-a");
    };
    await expect.poll(findFeature, { timeout: TIMEOUT }).toBeTruthy();

    ctx.query("eox-map").dispatchEvent(
      new CustomEvent("select", {
        detail: { originalEvent: { type: "click" }, feature: findFeature() },
      }),
    );

    await expect
      .poll(() => ctx.store.selectedItem?.id, { timeout: TIMEOUT })
      .toBe("item-a");
    await expect
      .poll(() => new URLSearchParams(window.location.search).get("item"), {
        timeout: TIMEOUT,
      })
      .toBe("item-a");
  });

  test("a new search re-renders the list and the footprints", async () => {
    // Swap the canned response, then re-search (what a filter change triggers).
    // Asserting on item-c's absence rather than an exact list keeps this
    // independent of the selected item, which is pinned back into the results.
    scopedRoutes["/search"] = {
      type: "FeatureCollection",
      features: [ITEMS[1]],
    };
    ctx.query("eox-itemfilter").search();

    const resultIds = () => {
      /** @type {import("stac-ts").StacItem[]} */
      const results = ctx.query("eox-itemfilter")?.results ?? [];
      return results.map((r) => r.id);
    };
    // Both settle through a transient empty state, so wait for the new item to
    // be present, not just the old one gone.
    const settled = (/** @type {(string | number | undefined)[]} */ ids) =>
      ids.includes("item-a") &&
      ids.includes("item-b") &&
      !ids.includes("item-c");

    await expect
      .poll(() => settled(resultIds()), { timeout: TIMEOUT })
      .toBe(true);
    await expect
      .poll(() => settled(footprintIds()), { timeout: TIMEOUT })
      .toBe(true);
  });
});

// Booting with `?indicator=&item=` restores the selection with no interaction.
describe("explore template - deep link restores an item", () => {
  /** @type {Awaited<ReturnType<typeof bootTemplate>>} */
  let ctx;

  beforeAll(async () => {
    serveByPath(axiosMock, routes);
    ctx = await bootTemplate({
      endpoint: ENDPOINT,
      api: true,
      initialUrl: `?template=explore&indicator=${COLLECTION_ID}&item=item-b?x=12&y=14&z=3`,
    });
  });

  afterAll(() => ctx?.app.unmount());

  test("restores the collection and item from the url", async () => {
    await expect
      .poll(() => ctx.store.selectedStac?.id, { timeout: TIMEOUT })
      .toBe(COLLECTION_ID);
    await expect
      .poll(() => ctx.store.selectedItem?.id, { timeout: TIMEOUT })
      .toBe("item-b");
  });

  test("fits the map to the restored item's bbox", async () => {
    const { center } = bboxToCenterZoom(
      /** @type {number[]} */ (ITEMS[1].bbox),
    );
    await expect
      .poll(
        () => {
          const [x, y] = ctx.query("eox-map").lonLatCenter;
          return Math.abs(x - center[0]) < 0.6 && Math.abs(y - center[1]) < 0.6;
        },
        { timeout: TIMEOUT },
      )
      .toBe(true);
  });
});
