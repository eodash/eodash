import { beforeEach, describe, expect, test } from "vitest";
import registerProjectionDefinition from "@eox/map/src/helpers/register-projection";
import { zoomToCollection } from "@/eodashSTAC/layers";
import { useSTAcStore } from "@/store/stac";
import { hasRestoredView, shouldZoomToExtent } from "@/utils/states";

// South polar stereographic, the projection an Antarctic collection declares.
const POLAR = "EPSG:3031";
registerProjectionDefinition(
  POLAR,
  "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 " +
    "+datum=WGS84 +units=m +no_defs",
);

const ANTARCTICA = [-180, -90, 180, -60];

/**
 * A map stub standing in for eox-map: `zoomToCollection` only reads the view
 * projection and writes `zoomExtent`.
 * @param {{ id?: string, projection?: string }} [opts]
 */
const mapWith = ({ id = "main", projection = "EPSG:3857" } = {}) => ({
  id,
  OLprojection: projection,
  zoomExtent: undefined,
});

/** @param {number[]} bbox */
const collection = (bbox) => ({ extent: { spatial: { bbox: [bbox] } } });

describe("zoomToCollection", () => {
  beforeEach(() => {
    shouldZoomToExtent.value = true;
    hasRestoredView.value = false;
    useSTAcStore().selectedItem = undefined;
  });

  test("fits a collection bbox transformed into the view projection", () => {
    const map = mapWith();

    zoomToCollection(map, collection([-10, 40, 10, 50]));

    expect(map.zoomExtent).toBeDefined();
    const [minX, minY, maxX, maxY] = map.zoomExtent;
    expect(minX).toBeCloseTo(-1113195, 0);
    expect(maxX).toBeCloseTo(1113195, 0);
    expect(minY).toBeLessThan(maxY);
  });

  test("collapses a polar bbox, having only the corners to go on", () => {
    const map = mapWith({ projection: POLAR });

    zoomToCollection(map, collection(ANTARCTICA));

    const [minX, , maxX] = map.zoomExtent;
    expect(maxX - minX).toBeCloseTo(0);
  });

  test("gives a restored view precedence, once", () => {
    hasRestoredView.value = true;
    const map = mapWith();

    zoomToCollection(map, collection(ANTARCTICA));
    expect(map.zoomExtent).toBeUndefined();

    // the link positioned the map for the collection it named; the next zooms
    zoomToCollection(map, collection(ANTARCTICA));
    expect(map.zoomExtent).toBeDefined();
  });

  describe("leaves the view where it is", () => {
    /** @param {ReturnType<typeof mapWith>} map */
    const stays = (map) => {
      zoomToCollection(map, collection(ANTARCTICA));
      expect(map.zoomExtent).toBeUndefined();
    };

    test("when the template does not zoom to the extent", () => {
      shouldZoomToExtent.value = false;
      stays(mapWith());
    });

    test("on the compare map", () => {
      stays(mapWith({ id: "compare" }));
    });

    test("while a selected item holds the fit the catalog gave it", () => {
      useSTAcStore().selectedItem = { id: "item" };
      stays(mapWith());
    });

    test("for a collection that declares no extent", () => {
      const map = mapWith();

      zoomToCollection(map, {});

      expect(map.zoomExtent).toBeUndefined();
    });
  });
});
