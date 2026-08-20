import { describe, expect, test } from "vitest";
import {
  findLayer,
  findLayersByLayerPrefix,
  getColFromLayer,
  removeLayers,
  replaceLayer,
} from "../src/helpers/layers.js";

// Driven directly, since `updateLayers` reaches them through a reader. The
// array they hand back is assigned to eox-map, which re-renders whatever it is
// not given the same reference for; that is why untouched levels are asserted
// by identity.

/** @param {string} id */
const layer = (id) => ({ type: "Tile", properties: { id } });

/**
 * @param {string} id
 * @param {Record<string, any>[]} layers
 */
const group = (id, layers) => ({ type: "Group", properties: { id }, layers });

const A_TOP = "a;:;i;:;top;:;EPSG:3857";
const A_NESTED = "a;:;i;:;nested;:;EPSG:3857";
const B_NESTED = "b;:;i;:;nested;:;EPSG:3857";

/** A layer per level, two collections deep, rebuilt per test. */
const tree = () => [
  layer(A_TOP),
  group("g", [layer(A_NESTED), layer(B_NESTED)]),
];

describe("layer tree", () => {
  describe("findLayer", () => {
    test("finds a layer nested in a group", () => {
      const layers = /** @type {any} */ (tree());

      expect(findLayer(layers, A_NESTED)).toBe(layers[1].layers[0]);
    });

    test("returns nothing when no layer carries that id", () => {
      expect(findLayer(/** @type {any} */ (tree()), "missing")).toBeUndefined();
    });
  });

  describe("findLayersByLayerPrefix", () => {
    test("collects every layer of the reference layer's collection", () => {
      const layers = /** @type {any} */ (tree());

      const found = findLayersByLayerPrefix(layers, layer(A_TOP));

      expect(found.map((l) => l.properties?.id)).toEqual([A_TOP, A_NESTED]);
    });

    test("throws on a reference id that carries no separator", () => {
      expect(() =>
        findLayersByLayerPrefix(/** @type {any} */ (tree()), layer("plain")),
      ).toThrow(";:;");
    });

    test("returns nothing without a reference layer", () => {
      expect(
        findLayersByLayerPrefix(/** @type {any} */ (tree()), undefined),
      ).toEqual([]);
    });
  });

  describe("removeLayers", () => {
    test("drops the layer and rebuilds only the group it sat in", () => {
      const layers = /** @type {any} */ (tree());

      const result = removeLayers(layers, [A_NESTED]);

      expect(result[1].layers.map((l) => l.properties?.id)).toEqual([B_NESTED]);
      // the untouched sibling is the layer eox-map already holds
      expect(result[0]).toBe(layers[0]);
      expect(result[1]).not.toBe(layers[1]);
      // and the tree it was given is left as it was
      expect(layers[1].layers).toHaveLength(2);
    });

    test("hands back the array it was given when nothing matched", () => {
      const layers = /** @type {any} */ (tree());

      expect(removeLayers(layers, ["missing"])).toBe(layers);
    });
  });

  describe("replaceLayer", () => {
    test("inserts the new layers where the removed one sat", () => {
      const layers = /** @type {any} */ (tree());
      const inserted = [layer("new;:;1"), layer("new;:;2")];

      const result = replaceLayer(
        layers,
        A_NESTED,
        /** @type {any} */ (inserted),
      );

      expect(result[1].layers.map((l) => l.properties?.id)).toEqual([
        "new;:;1",
        "new;:;2",
        B_NESTED,
      ]);
      expect(result[0]).toBe(layers[0]);
      expect(layers[1].layers).toHaveLength(2);
    });

    test("removes every id it is given, inserting once", () => {
      const layers = /** @type {any} */ ([
        layer(A_TOP),
        layer(A_NESTED),
        layer(B_NESTED),
      ]);

      const result = replaceLayer(
        layers,
        [A_TOP, A_NESTED],
        /** @type {any} */ ([layer("new;:;1")]),
      );

      expect(result.map((l) => l.properties?.id)).toEqual([
        "new;:;1",
        B_NESTED,
      ]);
    });

    test("hands back the array it was given when nothing matched", () => {
      const layers = /** @type {any} */ (tree());

      expect(
        replaceLayer(
          layers,
          "missing",
          /** @type {any} */ ([layer("new;:;1")]),
        ),
      ).toBe(layers);
    });
  });

  describe("getColFromLayer", () => {
    /** @param {string} id */
    const olLayer = (id) => /** @type {any} */ ({ get: () => id });

    test("matches the reader whose collection the layer was built from", async () => {
      const readers = [{ stac: { id: "a" } }, { stac: { id: "b" } }];

      expect(await getColFromLayer(readers, olLayer(B_NESTED))).toBe(
        readers[1],
      );
    });

    test("returns nothing when no reader owns it", async () => {
      const readers = [{ stac: { id: "a" } }];

      expect(
        await getColFromLayer(readers, olLayer("c;:;i;:;l;:;EPSG:3857")),
      ).toBeUndefined();
    });
  });
});
