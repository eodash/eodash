import { describe, expect, test } from "vitest";
import { isSTACCatalog } from "../src/helpers/catalog.js";

describe("isSTACCatalog", () => {
  test("identifies Catalog with explicit type: 'Catalog'", () => {
    expect(isSTACCatalog({ type: "Catalog", id: "cat", links: [] })).toBe(true);
  });

  test("identifies Catalog by child links when extent and geometry are absent", () => {
    expect(
      isSTACCatalog({
        id: "cat",
        links: [{ rel: "child", href: "https://example.com/collection.json" }],
      }),
    ).toBe(true);
  });

  test("rejects STAC Collection", () => {
    expect(
      isSTACCatalog({
        type: "Collection",
        id: "coll",
        extent: { spatial: { bbox: [[-180, -90, 180, 90]] } },
        links: [{ rel: "child", href: "https://example.com/child.json" }],
      }),
    ).toBe(false);
  });

  test("rejects STAC Item / Feature", () => {
    expect(
      isSTACCatalog({
        type: "Feature",
        id: "item1",
        geometry: { type: "Point", coordinates: [0, 0] },
        links: [],
      }),
    ).toBe(false);
  });

  test("rejects falsy or non-object values", () => {
    expect(isSTACCatalog(null)).toBe(false);
    expect(isSTACCatalog(undefined)).toBe(false);
    expect(isSTACCatalog("string")).toBe(false);
    expect(isSTACCatalog(123)).toBe(false);
  });
});
