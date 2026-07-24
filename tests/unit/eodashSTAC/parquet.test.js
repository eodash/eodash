import { describe, expect, test } from "vitest";
import { adjustParquetItems } from "@/eodashSTAC/parquet";

/**
 * A raw hyparquet row: flat STAC fields, bbox as an object, BigInt columns.
 * @param {Record<string, any>} overrides
 */
const parquetRow = (overrides = {}) => ({
  type: "Feature",
  id: "point-1",
  collection: "chl",
  geometry: { type: "Point", coordinates: [10, 47] },
  bbox: { xmin: 10, ymin: 47, xmax: 10, ymax: 47 },
  assets: { data: { href: "https://example.com/a.tif" } },
  datetime: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

describe("adjustParquetItems", () => {
  test("moves non-STAC top-level fields into properties", () => {
    const [item] = adjustParquetItems([
      parquetRow({ datetime: "2024-01-01", measurement_value: 3.5 }),
    ]);

    expect(item.properties).toMatchObject({
      datetime: "2024-01-01",
      measurement_value: 3.5,
    });
    expect(item).not.toHaveProperty("datetime");
    expect(item).not.toHaveProperty("measurement_value");
  });

  test("keeps standard STAC fields at the top level", () => {
    const [item] = adjustParquetItems([parquetRow()]);

    expect(item.id).toBe("point-1");
    expect(item.type).toBe("Feature");
    expect(item.collection).toBe("chl");
    expect(item.geometry).toEqual({ type: "Point", coordinates: [10, 47] });
  });

  test("converts the bbox object into a [xmin, ymin, xmax, ymax] array", () => {
    const [item] = adjustParquetItems([
      parquetRow({ bbox: { xmin: 10, ymin: 47, xmax: 11, ymax: 48 } }),
    ]);

    expect(item.bbox).toEqual([10, 47, 11, 48]);
  });

  test("converts BigInt column values to numbers", () => {
    const [item] = adjustParquetItems([
      parquetRow({ count: 42n, nested: { total: 100n } }),
    ]);

    expect(item.properties?.count).toBe(42);
    expect(item.properties?.nested).toEqual({ total: 100 });
  });

  test("drops assets that have no href", () => {
    const [item] = adjustParquetItems([
      parquetRow({
        assets: {
          data: { href: "https://example.com/a.tif" },
          empty: {},
          missing: null,
        },
      }),
    ]);

    expect(Object.keys(item.assets)).toEqual(["data"]);
  });

  test("merges non-STAC fields into an existing properties object", () => {
    const [item] = adjustParquetItems([
      parquetRow({ properties: { title: "Site A" }, measurement_value: 3.5 }),
    ]);

    expect(item.properties).toMatchObject({
      title: "Site A",
      measurement_value: 3.5,
    });
  });

  test("converts a BigInt bbox to a numeric array", () => {
    const [item] = adjustParquetItems([
      parquetRow({ bbox: { xmin: 10n, ymin: 47n, xmax: 11n, ymax: 48n } }),
    ]);

    expect(item.bbox).toEqual([10, 47, 11, 48]);
  });

  test("adjusts every item in the list", () => {
    const items = adjustParquetItems([
      parquetRow({ id: "a", datetime: "2024-01-01" }),
      parquetRow({ id: "b", datetime: "2025-01-01" }),
    ]);

    expect(items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(items.map((i) => i.properties?.datetime)).toEqual([
      "2024-01-01",
      "2025-01-01",
    ]);
  });
});
