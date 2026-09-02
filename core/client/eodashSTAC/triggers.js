/*
 * eodashSTAC helpers that utilizes the app states or actions
 */
import { changeMapProjection, registerProjection } from "@/store/actions";
import log from "loglevel";
import { getProjection, getProjectionCode } from "@eodash/stac/helpers";
import { availableMapProjection } from "@/store/states";

/**
 * Updates map projection from a collection's spatial metadata.
 * @param {import("@eodash/stac").STACCollection} [STAcCollection] - STAC collection
 */
export const setMapProjFromCol = async (STAcCollection) => {
  log.debug("Checking for available map projection in indicator");
  const projection = getProjection(STAcCollection);
  if (projection) {
    log.debug("Projection found", projection);
    await registerProjection(projection);
    const projectionCode = getProjectionCode(projection);
    if (availableMapProjection.value !== projectionCode) {
      log.debug(
        "Changing map projection",
        availableMapProjection.value,
        projectionCode,
      );
      await changeMapProjection(projection);
    }
    availableMapProjection.value = /** @type {string} */ (projectionCode);
  } else {
    log.debug("Resetting projection to default EPSG:3857");
    await changeMapProjection((availableMapProjection.value = ""));
  }
};

/**
 * Resolves the end date of a collection's temporal extent, falling back to the current date.
 *
 * @param {import("@eodash/stac").STACCollection | null} [collection]
 * @returns {Date}
 */
export const getLatestDatetime = (collection) => {
  const interval = collection?.extent?.temporal?.interval;
  const declaredEnd = interval?.[0]?.[1];
  if (!declaredEnd) {
    return new Date();
  }
  const end = new Date(declaredEnd);
  return isNaN(end.getTime()) ? new Date() : end;
};
