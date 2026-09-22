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
 * Registers each projection once. A code counts as registered only after its
 * definition is fetched, so duplicates left in the list would each fetch it.
 *
 * @param {import("@eodash/stac").Projection[]} projections
 */
export const registerProjections = async (projections) => {
  const byCode = new Map(
    projections.map((projection) => [
      getProjectionCode(projection),
      projection,
    ]),
  );
  await Promise.all([...byCode.values()].map(registerProjection));
};
