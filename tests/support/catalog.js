/**
 * Synthetic STAC catalogs for the bench tier.
 *
 * Static, not API mode: the app caches API items module-wide, so iteration 2
 * would do less work than iteration 1 and report it as an improvement.
 */
import { stacCollection, stacItem } from "./fixtures";

/**
 * Same origin as the page. Widgets that fetch their own url over native `fetch`
 * bypass the axios mock, and one dead DNS lookup per iteration took a 21ms flow
 * from ±4.7% to ±18%.
 */
const ENDPOINT = `${globalThis.location.origin}/stac`;

export const CATALOG_URL = `${ENDPOINT}/catalog.json`;

/**
 * The default extent. Shared, so selecting an indicator never animates a fit
 * into a measured window; pass a distinct `bbox` per row where the fit is the
 * point.
 */
export const BBOX = [0, 40, 10, 50];

/**
 * Three is the minimum that yields a `layerDatetime`; with fewer, the layer
 * falls back to `layers[0]` and a wait succeeds against the wrong thing. In the
 * past, so the app writes the interval's end back into the datetime it watches.
 */
export const DATES = Array.from({ length: 3 }, (_, index) =>
  new Date(Date.UTC(2020, 0, 1 + index)).toISOString(),
);

const TILE = "/tests/support/assets/tile.png";

/**
 * Visible, as in the app. One local png; vite serves it.
 * @param {string} [title] also the layer's id
 */
export const xyzLink = (title = "xyz") => ({
  rel: "xyz",
  href: TILE,
  title,
});

/**
 * Drives layer count without changing the number of round trips.
 * @param {number} n
 */
export const xyzLinks = (n) =>
  Array.from({ length: n }, (_, index) => xyzLink(`xyz-${index}`));

/** Opaque, like a real catalog's, so no collection id prefixes an item id. */
let itemCounter = 0;
const nextItemId = () =>
  `item-${(itemCounter += 1).toString().padStart(6, "0")}`;

/** @param {string} id */
const getIndicatorUrl = (id) => `${ENDPOINT}/indicators/${id}.json`;
/** @param {string} id */
const getChildUrl = (id) => `${ENDPOINT}/collections/${id}.json`;
/** @param {string} id */
const getItemUrl = (id) => `${ENDPOINT}/items/${id}.json`;

/**
 * @typedef {object} Row one indicator in the catalog
 * @property {string} id
 * @property {number} [children] child collections under it, default 1
 * @property {any[]} [links] links on every item, default one xyz
 * @property {Record<string, any>} [assets] assets on every item
 * @property {number[]} [bbox] default {@link BBOX}
 * @property {string} [mirror] path of a parquet file the page serves. The child
 *   mirrors its items from it instead of carrying item links, as production
 *   does. Page origin, not the STAC endpoint: the file has to be reachable
 *   over http as well as through the axios mock
 * @property {string[]} [locations] ids of other rows, turning this into a POI
 *   indicator whose child links are observation points
 */

/**
 * A catalog of one indicator per row.
 *
 * @param {Row[]} rows
 * @returns {{routes: Record<string, any>, hrefOf: (id: string) => string}}
 */
export const buildCatalog = (rows) => {
  /** Fetched on every boot. */
  const routes = {
    "/defaults/colormaps.json": {},
    "/defaults/tmsRegistry.json": {},
  };

  for (const row of rows) {
    const {
      id,
      children = 1,
      links,
      assets,
      bbox = BBOX,
      mirror,
      locations,
    } = row;
    const extent = {
      spatial: { bbox: [bbox] },
      temporal: { interval: [[DATES[0], DATES[DATES.length - 1]]] },
    };
    const childIds = Array.from({ length: children }, (_, index) =>
      children === 1 ? id : `${id}-c${index}`,
    );

    routes[`/indicators/${id}.json`] = stacCollection({
      id,
      title: id,
      extent,
      links: [
        // `type` is load-bearing: the app filters child links on it, and
        // without it an indicator collapses to one collection and the fan-out
        // this tier measures disappears.
        ...childIds.map((childId) => ({
          rel: "child",
          id: childId,
          href: getChildUrl(childId),
          type: "application/json",
          title: childId,
        })),
        // Rendered against the clicked feature, so `{{id}}` resolves to the
        // location's own indicator.
        ...(locations
          ? [
              {
                rel: "service",
                type: "application/json; profile=collection",
                endpoint: "STAC",
                href: getIndicatorUrl("{{id}}"),
              },
            ]
          : []),
      ],
    });

    for (const childId of childIds) {
      // No items: the child links are the observation points, which become one
      // Vector layer of markers.
      if (locations) {
        routes[`/collections/${childId}.json`] = stacCollection({
          id: childId,
          title: childId,
          extent,
          locations: true,
          links: locations.map((locationId, index) => ({
            rel: "child",
            id: locationId,
            title: locationId,
            type: "application/json",
            href: getIndicatorUrl(locationId),
            latlng: `${45 + index},${5 + index}`,
          })),
        });
        continue;
      }

      // No item links either: the items come from the parquet, as blob links.
      if (mirror) {
        routes[`/collections/${childId}.json`] = stacCollection({
          id: childId,
          title: childId,
          extent,
          links: [],
          assets: {
            mirror: {
              href: `${globalThis.location.origin}${mirror}`,
              type: "application/vnd.apache.parquet",
              roles: ["collection-mirror"],
            },
          },
        });
        continue;
      }

      const itemIds = DATES.map(() => nextItemId());

      routes[`/collections/${childId}.json`] = stacCollection({
        id: childId,
        title: childId,
        extent,
        links: DATES.map((datetime, index) => ({
          rel: "item",
          id: itemIds[index],
          href: getItemUrl(itemIds[index]),
          type: "application/json",
          datetime,
        })),
      });

      DATES.forEach((datetime, index) => {
        routes[`/items/${itemIds[index]}.json`] = stacItem({
          id: itemIds[index],
          collection: childId,
          bbox,
          properties: { datetime },
          // Every item needs one supported link, or the build collapses to the
          // STAC passthrough and measures the wrong path.
          links: links ?? [xyzLink(childId)],
          ...(assets ? { assets } : {}),
        });
      });
    }
  }

  routes["/catalog.json"] = {
    type: "Catalog",
    stac_version: "1.0.0",
    id: "bench",
    description: "synthetic catalog",
    links: rows.map(({ id }) => ({
      rel: "child",
      id,
      href: getIndicatorUrl(id),
      type: "application/json",
      title: id,
    })),
  };

  return { routes, hrefOf: getIndicatorUrl };
};
