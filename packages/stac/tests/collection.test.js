import { describe, expect, test } from "vitest";
import {
  getIndicatorLayers,
  getObservationPointsLayer,
} from "../src/layers/collection.js";
import { stacCollection } from "../../../tests/support/stac.js";

// Layers built from a collection rather than from one of its items: the base
// layers and overlays it states, and the points its children sit at.

/** @param {Record<string, any>} over */
const collection = (over) =>
  /** @type {any} */ (stacCollection({ id: "coll", title: "Coll", ...over }));

/** The url a Vector layer carries, read back as the document it encodes. */
const decodeSource = (/** @type {any} */ layer) =>
  JSON.parse(decodeURIComponent(layer.source.url.replace("data:,", "")));

describe("getIndicatorLayers", () => {
  test("builds the collection's own base layer links", async () => {
    const { layers } = await getIndicatorLayers(
      collection({
        links: [
          {
            rel: "xyz",
            href: "https://base/{z}/{x}/{y}.png",
            title: "Base",
            roles: ["baselayer"],
          },
        ],
      }),
    );

    expect(layers).toHaveLength(1);
    expect(layers[0].source?.type).toBe("XYZ");
    // a base layer drops the collection and item from its id, so switching
    // datasets does not reload its tiles
    expect(layers[0].properties?.id).toBe("Base;:;EPSG:3857");
  });

  test("takes only the base layer and overlay assets, leaving data assets out", async () => {
    const { layers } = await getIndicatorLayers(
      collection({
        links: [],
        assets: {
          basemap: {
            type: "image/tiff",
            href: "https://base.tif",
            roles: ["baselayer"],
          },
          measurements: {
            type: "image/tiff",
            href: "https://data.tif",
            roles: ["data"],
          },
        },
      }),
    );

    expect(layers).toHaveLength(1);
    expect(layers[0].source?.sources).toEqual([{ url: "https://base.tif" }]);
  });

  test("returns the projections its layers referenced", async () => {
    const { projections } = await getIndicatorLayers(
      collection({
        links: [
          {
            rel: "xyz",
            href: "https://base/{z}/{x}/{y}.png",
            roles: ["overlay"],
            "proj:code": "EPSG:3035",
          },
        ],
      }),
    );

    expect(projections).toContain("EPSG:3035");
  });

  test("builds nothing from a collection that states no renderable link or asset", async () => {
    expect(await getIndicatorLayers(collection({ links: [] }))).toEqual({
      layers: [],
      projections: [],
    });
  });
});

describe("getObservationPointsLayer", () => {
  /** A collection whose children are places, the way a geoDB one is. */
  const points = (/** @type {Record<string, any>} */ over) =>
    collection({
      endpointtype: "GeoDB",
      geoDBID: "gdb",
      themes: ["air"],
      links: [
        { rel: "item", href: "a.json", latlng: "48.2,16.4", title: "Vienna" },
      ],
      ...over,
    });

  test("gathers the points of every collection that has them", () => {
    const layer = getObservationPointsLayer([
      points({ id: "a" }),
      points({
        id: "b",
        endpointtype: undefined,
        locations: true,
        links: [
          { rel: "child", href: "b.json", latlng: "47,15.4", title: "Graz" },
        ],
      }),
    ]);

    const { features } = decodeSource(layer);
    expect(features.map((/** @type {any} */ f) => f.properties.title)).toEqual([
      "Vienna",
      "Graz",
    ]);
    // lat,lng in the link, lng,lat in the geometry
    expect(features[0].geometry.coordinates).toEqual([16.4, 48.2]);
    expect(layer?.properties?.id).toBe("geodb-collection");
  });

  test("carries what a tooltip needs onto every point", () => {
    const { features } = decodeSource(getObservationPointsLayer([points({})]));

    expect(features[0].properties).toMatchObject({
      collection_id: "coll",
      geoDBID: "gdb",
      themes: ["air"],
      title: "Vienna",
    });
  });

  test("ignores a collection whose items are times rather than places", () => {
    expect(
      getObservationPointsLayer([
        collection({
          links: [{ rel: "item", href: "a.json", latlng: "48.2,16.4" }],
        }),
      ]),
    ).toBeNull();
  });

  test("styles a point by its theme, falling through to a plain circle", () => {
    const layer = getObservationPointsLayer([points({})], {
      themes: { air: { color: "#475faf", icon: "M0 0" } },
    });

    const [themed, fallback] = /** @type {any[]} */ (layer?.style ?? []);
    expect(themed.filter).toEqual(["==", ["get", "themes", 0], "air"]);
    expect(themed.style["icon-src"]).toContain("data:image/svg+xml,");
    expect(themed.style["icon-src"]).toContain(encodeURIComponent("#475faf"));
    expect(fallback.else).toBe(true);
    expect(fallback.style["circle-radius"]).toBe(10);
  });

  test("brands a point with eodash's own themes when none are stated", () => {
    const layer = getObservationPointsLayer([points({})]);

    const rules = /** @type {any[]} */ (layer?.style ?? []);
    const air = rules.find((rule) => rule.filter?.[2] === "air");
    expect(air.style["icon-src"]).toContain(encodeURIComponent("#475faf"));
    expect(rules.at(-1).else).toBe(true);
  });

  test("a theme nothing states falls through to the plain circle", () => {
    const layer = getObservationPointsLayer([points({})], { themes: {} });

    const [fallback, ...rest] = /** @type {any[]} */ (layer?.style ?? []);
    expect(rest).toHaveLength(0);
    expect(fallback.else).toBe(true);
  });

  test("keeps the interactions the layer already carries in the tree", () => {
    const interaction = { type: "select", options: { id: "stac-items" } };

    const layer = getObservationPointsLayer([points({})], {
      currentLayers: /** @type {any} */ ([
        {
          type: "Vector",
          properties: { id: "geodb-collection" },
          interactions: [interaction],
        },
      ]),
    });

    expect(layer?.interactions).toEqual([interaction]);
  });
});
