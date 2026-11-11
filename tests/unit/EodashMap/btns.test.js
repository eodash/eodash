import { afterEach, beforeEach, describe, expect, test } from "vitest";
import "@eox/map";
import registerProjectionDefinition from "@eox/map/src/helpers/register-projection";
import { switchGlobe } from "^/EodashMap/methods/btns";
import { availableMapProjection, isGlobe, mapEl } from "@/store/states";

const POLAR = "EPSG:3031";
registerProjectionDefinition(
  POLAR,
  "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 " +
    "+datum=WGS84 +units=m +no_defs",
);

describe("switchGlobe", () => {
  /** @type {any} */
  let map;

  beforeEach(() => {
    map = document.createElement("eox-map");
    map.id = "main";
    document.body.append(map);
    mapEl.value = map;
  });

  afterEach(() => {
    isGlobe.value = false;
    availableMapProjection.value = "";
    mapEl.value = null;
    map.remove();
  });

  test("leaving 3D restores the selected collection's projection", () => {
    isGlobe.value = true;
    availableMapProjection.value = POLAR;

    switchGlobe();

    expect(map.map.getView().getProjection().getCode()).toBe(POLAR);
    expect(isGlobe.value).toBe(false);
  });
});
