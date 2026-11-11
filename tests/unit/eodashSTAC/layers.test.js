import { afterEach, beforeEach, describe, expect, test } from "vitest";
import "@eox/map";
import registerProjectionDefinition from "@eox/map/src/helpers/register-projection";
import {
  assignGlobeBaseLayers,
  BASE_LAYERS_GROUP,
  restoreBaseLayers2D,
  updateIndicatorLayers,
  zoomToCollection,
} from "@/eodashSTAC/layers";
import { useSTAcStore } from "@/store/stac";
import { isGlobe } from "@/store/states";
import { hasRestoredView, shouldZoomToExtent } from "@/utils/states";
import { stacCollection } from "../../support/fixtures";

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

// A base layer in a polar projection covers part of the globe and leaves the
// rest white, so the globe swaps it for one in a world projection.
describe("globe base layers", () => {
  const ORTHO = {
    name: "ORTHO:680500",
    def: "+proj=ortho +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs",
    extent: [-6422528, -6422528, 6422528, 6422528],
  };
  registerProjectionDefinition(ORTHO.name, ORTHO.def, ORTHO.extent);

  const WORLD_ID = "world";
  const POLAR_ID = "polar";

  /** @param {boolean} worldVisible */
  const baseLayers = (worldVisible) => [
    {
      type: "Tile",
      properties: { id: WORLD_ID, visible: worldVisible },
      source: { type: "XYZ", url: "https://tiles.test/{z}/{y}/{x}.png" },
    },
    {
      type: "Tile",
      properties: { id: POLAR_ID, visible: !worldVisible },
      source: {
        type: "TileWMS",
        url: "https://wms.test/wms",
        projection: ORTHO.name,
        params: { LAYERS: "terrain" },
      },
    },
  ];

  /** @type {any} */
  let map;

  const baseIds = () =>
    map.layers
      .find(
        (/** @type {any} */ group) =>
          group.properties?.id === BASE_LAYERS_GROUP,
      )
      .layers.map((/** @type {any} */ layer) => layer.properties.id);

  /** @param {string} id */
  const shows = (id) => map.getLayerById(id).getVisible();

  beforeEach(() => {
    map = document.createElement("eox-map");
    map.id = "main";
    document.body.append(map);
    map.layers = [
      {
        type: "Group",
        properties: { id: BASE_LAYERS_GROUP },
        layers: baseLayers(false),
      },
    ];
  });

  afterEach(() => {
    isGlobe.value = false;
    map.remove();
  });

  test("entering drops the polar base layer and shows the world one", async () => {
    await assignGlobeBaseLayers(map);

    expect(baseIds()).toEqual([WORLD_ID]);
    expect(shows(WORLD_ID)).toBe(true);
  });

  test("leaving brings the polar base layer back as the visible one", async () => {
    await assignGlobeBaseLayers(map);
    await restoreBaseLayers2D(map);

    expect(baseIds()).toEqual([WORLD_ID, POLAR_ID]);
    expect(shows(POLAR_ID)).toBe(true);
    expect(shows(WORLD_ID)).toBe(false);
  });

  test("a base layer picked in the layer control survives the round trip", async () => {
    map.getLayerById(POLAR_ID).setVisible(false);
    map.getLayerById(WORLD_ID).setVisible(true);

    await assignGlobeBaseLayers(map);
    await restoreBaseLayers2D(map);

    expect(shows(WORLD_ID)).toBe(true);
    expect(shows(POLAR_ID)).toBe(false);
  });

  test("an indicator picked in 3D does not bring the polar base layer", async () => {
    isGlobe.value = true;
    const arctic = stacCollection({
      id: "arctic",
      links: [
        {
          rel: "xyz",
          href: "https://tiles.test/{z}/{y}/{x}.png",
          type: "image/png",
          id: WORLD_ID,
          roles: ["baselayer", "invisible"],
        },
        {
          rel: "wms",
          href: "https://wms.test/wms",
          type: "image/png",
          id: POLAR_ID,
          roles: ["baselayer", "visible"],
          "wms:layers": "terrain",
          "eodash:proj4_def": ORTHO,
        },
      ],
    });

    await updateIndicatorLayers(map, { readers: [], stac: arctic });

    expect(baseIds()).toHaveLength(1);
    expect(baseIds()[0]).toContain(WORLD_ID);
  });
});
