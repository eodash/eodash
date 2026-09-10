/**
 * STAC and axios fixtures with no app imports, so they can be used from tests
 * that run without vue — `@eodash/stac` is tested in node to keep its
 * framework-free claim honest. `fixtures.js` re-exports everything here.
 */
import { deepmergeCustom } from "deepmerge-ts";

// Objects merge, arrays replace — same semantics as getBaseConfig.
const deepmerge = deepmergeCustom({ mergeArrays: false });

/** @param {number[]} bbox @returns {number[][][]} closed polygon ring */
const bboxRing = ([w, s, e, n]) => [
  [
    [w, s],
    [e, s],
    [e, n],
    [w, n],
    [w, s],
  ],
];

/** @param {Record<string, any>} [over] */
export const stacCollection = (over = {}) => ({
  type: "Collection",
  stac_version: "1.0.0",
  id: "coll",
  title: "Coll",
  description: "d",
  license: "proprietary",
  extent: {
    spatial: { bbox: [[0, 0, 1, 1]] },
    temporal: { interval: [[null, null]] },
  },
  links: [],
  assets: {},
  ...over,
});

/**
 * Route a mocked axios `get` by url; anything unlisted rejects loudly so a
 * forgotten fixture fails the test instead of hanging.
 * @param {{ get: import("vitest").MockInstance }} axiosMock
 * @param {Record<string, any>} responses
 */
export const serveUrls = (axiosMock, responses) => {
  axiosMock.get.mockImplementation((/** @type {string} */ url) =>
    url in responses
      ? Promise.resolve({ data: responses[url] })
      : Promise.reject(new Error(`unmocked url ${url}`)),
  );
};

/**
 * A STAC item shaped after a real `/search` feature; deep-merges `over` onto the
 * base. Geometry derives from `over.bbox` unless an explicit geometry is given.
 * @param {Record<string, any>} [over]
 * @returns {import("@eodash/stac").STACItem}
 */
export const stacItem = (over = {}) => {
  const bbox = over.bbox ?? [10, 47, 11, 48];
  return /** @type {import("@eodash/stac").STACItem} */ (
    /** @type {unknown} */ (
      deepmerge(
        {
          type: "Feature",
          stac_version: "1.1.0",
          id: "item",
          collection: "test-collection",
          bbox,
          geometry: { type: "Polygon", coordinates: bboxRing(bbox) },
          properties: {
            datetime: "2026-01-01T00:00:00.000000Z",
            "eo:cloud_cover": 10,
            platform: "sentinel-2a",
            "sat:orbit_state": "descending",
          },
          links: [],
          assets: {
            thumbnail: {
              href: "https://example.com/thumb.jpg",
              roles: ["thumbnail"],
            },
          },
        },
        over,
      )
    )
  );
};

/**
 * Route a mocked axios `get` by URL pathname, so tests stay decoupled from the
 * generated query string (search params are covered in the filters unit test).
 * Routes are matched most-specific-first; unmatched urls resolve to `{}` and
 * are recorded on `unmatched` for debugging.
 *
 * Responses resolve after `delay` ms: widgets that fetch during setup mount
 * before the map otherwise, and layers rendered onto it are lost.
 * @param {{ get: import("vitest").Mock<(url: string) => Promise<unknown>> }} axiosMock
 * @param {Record<string, any>} routes pathname suffix -> response data
 * @param {{ delay?: number }} [options]
 * @returns {{ unmatched: string[] }}
 */
export const serveByPath = (axiosMock, routes, { delay = 50 } = {}) => {
  const paths = Object.keys(routes).sort((a, b) => b.length - a.length);
  /** @type {string[]} */
  const unmatched = [];
  axiosMock.get.mockImplementation((url) => {
    const { pathname } = new URL(url, "https://test.local");
    const match = paths.find((p) => pathname.endsWith(p));
    if (!match) unmatched.push(url);
    const data = match ? routes[match] : {};
    return new Promise((resolve) => setTimeout(() => resolve({ data }), delay));
  });
  return { unmatched };
};
