import { describe, expect, test } from "vitest";
import { resolvePoiCollectionUrl } from "@/eodashSTAC/poi";

const COLLECTION_URL = "https://example.com/catalog/indicator/collection.json";

/**
 * @param {import("@eodash/stac").STACCollection["links"]} links
 * @returns {import("@eodash/stac").STACCollection}
 */
const collectionWith = (links) => ({
  type: "Collection",
  stac_version: "1.0.0",
  id: "indicator",
  description: "Location selection",
  license: "proprietary",
  extent: {
    spatial: { bbox: [[-180, -90, 180, 90]] },
    temporal: { interval: [[null, null]] },
  },
  links,
});

/** @param {string} href */
const serviceLink = (href) => ({
  rel: "service",
  type: "application/json; profile=collection",
  href,
});

describe("resolvePoiCollectionUrl", () => {
  test.each([
    [
      "./{{feature}}/collection.json",
      "https://example.com/catalog/indicator/vienna/collection.json",
    ],
    [
      "../locations/{{location}}/collection.json",
      "https://example.com/catalog/locations/vienna/collection.json",
    ],
    [
      "./{{.}}/collection.json",
      "https://example.com/catalog/indicator/vienna/collection.json",
    ],
    [
      "https://data.example.com/{{feature}}/collection.json",
      "https://data.example.com/vienna/collection.json",
    ],
  ])("resolves %s", (href, expected) => {
    expect(
      resolvePoiCollectionUrl(
        collectionWith([serviceLink(href)]),
        COLLECTION_URL,
        "vienna",
      ),
    ).toBe(expected);
  });

  test("ignores unrelated service and child links", () => {
    const collection = collectionWith([
      {
        rel: "child",
        type: "application/json; profile=collection",
        href: "./wrong.json",
      },
      { rel: "service", type: "application/json", href: "./wrong.json" },
      serviceLink("./{{feature}}/collection.json"),
    ]);
    expect(resolvePoiCollectionUrl(collection, COLLECTION_URL, "vienna")).toBe(
      "https://example.com/catalog/indicator/vienna/collection.json",
    );
  });

  test("returns undefined without a location collection service link", () => {
    expect(
      resolvePoiCollectionUrl(collectionWith([]), COLLECTION_URL, "vienna"),
    ).toBeUndefined();
  });

  test("does not resolve an empty POI ID", () => {
    expect(
      resolvePoiCollectionUrl(
        collectionWith([serviceLink("./{{feature}}/collection.json")]),
        COLLECTION_URL,
        "",
      ),
    ).toBeUndefined();
  });
});
