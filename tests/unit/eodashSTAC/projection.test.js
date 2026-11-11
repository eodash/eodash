import { afterEach, beforeEach, describe, expect, test } from "vitest";
import "@eox/map";
import { setMapProjFromCol } from "@/eodashSTAC/projection";
import { availableMapProjection, isGlobe, mapEl } from "@/store/states";
import { stacCollection } from "../../support/fixtures";

// South polar stereographic. The definition form registers through proj4
// locally; a bare code would send the lookup to epsg.io.
const POLAR = {
  name: "EPSG:3031",
  def:
    "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 " +
    "+datum=WGS84 +units=m +no_defs",
};

// Picking a collection in 3D used to write a 2D projection to eox-map, which
// left the globe while eodash still showed 3D.
describe("setMapProjFromCol in 3D", () => {
  /** @type {any} */
  let map;

  beforeEach(() => {
    map = document.createElement("eox-map");
    map.id = "main";
    document.body.append(map);
    mapEl.value = map;
    isGlobe.value = true;
    availableMapProjection.value = "";
  });

  afterEach(() => {
    isGlobe.value = false;
    mapEl.value = null;
    map.remove();
  });

  test("a collection with its own projection keeps the globe and is remembered for leaving it", async () => {
    await setMapProjFromCol(stacCollection({ "eodash:mapProjection": POLAR }));

    expect(map.getAttribute("projection")).toBeNull();
    expect(map.map.getView().getProjection().getCode()).toBe("EPSG:3857");
    expect(availableMapProjection.value).toBe(POLAR.name);
  });

  test("a collection without a projection keeps the globe", async () => {
    availableMapProjection.value = POLAR.name;

    await setMapProjFromCol(stacCollection());

    expect(map.getAttribute("projection")).toBeNull();
    expect(availableMapProjection.value).toBe("");
  });
});
