/**
 * The third delivery mode, where the item is handed straight to the builder
 * rather than read from collection links or a parquet mirror. API mode,
 * because that is the only way explore runs.
 *
 * One collection, two items. The act picks the other one, which is never a
 * deselect: clicking the selected item toggles it off. Staying inside one
 * collection also keeps the collection filter out of the flow, and with it the
 * re-search and the collection load that renders an item on its own.
 */
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { xyzLink } from "../support/catalog";
import { stacCollection, stacItem } from "../support/fixtures";
import { analysisGroup, getLayerIdentity } from "../support/layers";
import {
  defineBenchmark,
  bootBench,
  expectConstant,
  expectDistinct,
  reportMetrics,
  runBenchmark,
  TEST_TIMEOUT,
  waitUntil,
} from "../support/bench";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const COLLECTION_ID = "collection-a";
const ITEM_A_ID = "item-a";
const ITEM_B_ID = "item-b";

/**
 * A tile url of its own per item, as a real catalog has.
 * @param {string} id
 */
const itemTile = (id) => ({ ...xyzLink(id), href: `${xyzLink().href}?${id}` });

/**
 * One extent for both. The selection is the state change; a second extent only
 * adds the catalog's 1200ms fit, which lands inside the window in some
 * iterations and not others.
 * @param {string} id
 */
const itemOf = (id) =>
  stacItem({
    id,
    collection: COLLECTION_ID,
    bbox: [10, 47, 11, 48],
    links: [itemTile(id)],
  });

const ITEM_A = itemOf(ITEM_A_ID);
const ITEM_B = itemOf(ITEM_B_ID);

const QUERYABLES = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: { datetime: { type: "string" } },
};

const collectionOf = (/** @type {string} */ id) =>
  stacCollection({ id, title: id });

const routes = {
  "/defaults/colormaps.json": {},
  "/defaults/tmsRegistry.json": {},
  "/collections": { collections: [collectionOf(COLLECTION_ID)] },
  [`/collections/${COLLECTION_ID}`]: collectionOf(COLLECTION_ID),
  [`/collections/${COLLECTION_ID}/queryables`]: QUERYABLES,
  [`/collections/${COLLECTION_ID}/items`]: {
    type: "FeatureCollection",
    features: [ITEM_A, ITEM_B],
  },
  // Canned, not a simulated api: nothing here filters or sorts, so both items
  // are always in the result set.
  "/search": {
    type: "FeatureCollection",
    features: [ITEM_A, ITEM_B],
    numberMatched: 2,
    numberReturned: 2,
    links: [],
  },
};

describe("explore item selection", () => {
  test(
    "selecting a catalog item renders its layer",
    { timeout: TEST_TIMEOUT },
    async (ctx) => {
      const { app, query, served, isOnMap } = await bootBench(
        axiosMock,
        { routes, hrefOf: (id) => id },
        { template: "explore", api: true },
      );

      await waitUntil(
        () => Boolean(query("eox-itemfilter")),
        "the catalog never listed its items",
      );
      const filterEl = query("eox-itemfilter");

      /**
       * In-page, not `userEvent`: a CDP click adds ~20ms of floor and unclamps
       * the poll, and the picker lives in a shadow root anyway.
       * @param {string} id
       */
      const pick = (id) =>
        page
          .elementLocator(filterEl)
          .getByText(id, { exact: true })
          .element()
          .click();

      /**
       * The item's own layer, by id. Not the group's first layer: the catalog
       * keeps a `stac-items` overlay of every listed footprint in front of it.
       * @param {string} id
       */
      const itemLayer = (id) =>
        analysisGroup(query("eox-map"))?.layers?.find((layer) =>
          layer.properties?.id?.includes(`;:;${id};:;`),
        );
      /** @param {string} id */
      const isRendered = (id) => Boolean(itemLayer(id));

      await waitUntil(
        () => Boolean(filterEl.shadowRoot.textContent.includes(ITEM_B_ID)),
        "the items never listed",
      );

      /**
       * Select an item and wait for its layer. Clicking the selected item
       * deselects it, so every call has to land on a different one.
       * @param {string} itemId
       */
      const selectItem = async (itemId) => {
        pick(itemId);
        await waitUntil(
          () => isOnMap(() => isRendered(itemId)),
          `${itemId} never rendered`,
        );
      };

      await selectItem(ITEM_A_ID);
      // Leave setup where the act leaves the app, or the first reset picks the
      // item that is already selected and toggles it off.
      await selectItem(ITEM_B_ID);

      const benchmark = defineBenchmark(ctx, "explore item", {
        // Back to collection A and its item, then across to B, so the act lands
        // on an item that is never already selected.
        reset: () => selectItem(ITEM_A_ID),
        act: () => {
          pick(ITEM_B_ID);
        },
        isFinished: () => isOnMap(() => isRendered(ITEM_B_ID)),
        record: () => {
          const id = itemLayer(ITEM_B_ID)?.properties?.id;
          return {
            id,
            identity: getLayerIdentity(query("eox-map").getLayerById(id)),
          };
        },
      });

      try {
        await runBenchmark(benchmark);
        await reportMetrics(benchmark);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        // The layer, not the group's size: the catalog's footprint overlay
        // sits beside it here and in its own group elsewhere.
        expectConstant(benchmark, "id");
        expectDistinct(benchmark, "identity");
      } finally {
        app.unmount();
      }
    },
  );
});
