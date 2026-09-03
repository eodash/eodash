import { onMounted, onUnmounted, watch } from "vue";
import { getTooltipProperties } from "@eodash/stac";
import axios from "@/plugins/axios";
import log from "loglevel";
import { useOnLayersUpdate } from "@/composables";
import { isGlobe } from "@/store/states";
import { sanitizeBbox } from "@eodash/stac/helpers";
import { transformExtent } from "@eox/map";

export { useMapLoading } from "./use-map-loading";

/**
 * Handles updating {@link mapPosition} on movement on the map
 *
 * @param {import("vue").Ref<HTMLElement & Record<string,any> & {map:import("ol").Map } | null>} mapElement
 * @param {import("vue").Ref<(number | undefined)[]>} mapPosition
 */
export const useHandleMapMoveEnd = (mapElement, mapPosition) => {
  /** @type {import("ol/events").ListenerFunction} */
  const handleMoveEnd = (evt) => {
    const map = /** @type {import("ol").Map | undefined} */ (
      /** @type {any} */ (evt).map
    );
    const lonlat = mapElement.value?.lonLatCenter;
    const z = map?.getView().getZoom();
    if (
      lonlat &&
      !Number.isNaN(lonlat[0]) &&
      !Number.isNaN(lonlat[1]) &&
      !Number.isNaN(z)
    ) {
      mapPosition.value = [lonlat[0], lonlat[1], z];
    }
  };

  const handleGlobeMoveEnd = () => {
    const camera = mapElement.value?.globe?.planet?.camera;
    const lonLat = camera?.getLonLat();
    if (!lonLat) return;
    const { lon, lat, height } = lonLat;
    if (![lon, lat, height].some(Number.isNaN)) {
      mapPosition.value = [lon, lat, height];
    }
  };

  /** @type {{ events: { off: Function } } | null} */
  let subscribedCamera = null;

  const subscribeGlobe = (retries = 3) => {
    if (!isGlobe.value) return; // toggled back out during retry
    const camera = mapElement.value?.globe?.planet?.camera;
    if (camera) {
      if (subscribedCamera === camera) return;
      camera.events.on("moveend", handleGlobeMoveEnd);
      subscribedCamera = camera;
      handleGlobeMoveEnd();
      return;
    }
    if (retries > 0) setTimeout(() => subscribeGlobe(retries - 1), 50);
  };
  const unsubscribeGlobe = () => {
    subscribedCamera?.events.off("moveend", handleGlobeMoveEnd);
    subscribedCamera = null;
  };

  const stopGlobeWatch = watch(isGlobe, (globe) =>
    globe ? subscribeGlobe() : unsubscribeGlobe(),
  );

  onMounted(() => {
    const map = mapElement.value?.map;
    map?.on("moveend", handleMoveEnd);
    // Seed mapPosition from the initial view
    handleMoveEnd(/** @type {any} */ ({ map }));
  });

  onUnmounted(() => {
    /** @type {import('ol/Map').default} */
    (mapElement.value?.map)?.un("moveend", handleMoveEnd);
    unsubscribeGlobe();
    stopGlobeWatch();
  });
};

/**
 * Moves the main map to a newly selected collection's extent.
 *
 * Callers decide whether a zoom is wanted at all: restoring from a URL
 * positions the map itself, and selecting an item is a deferred feature.
 *
 * @param {import("@eox/map").EOxMap | null} map
 * @param {import("@eodash/stac").STACCollection | null} [collection]
 */
export const zoomToCollection = (map, collection) => {
  if (map?.id !== "main") {
    return;
  }

  const bbox = collection?.extent?.spatial?.bbox?.[0];
  if (!bbox) {
    return;
  }

  map.zoomExtent = transformExtent(
    sanitizeBbox([...bbox]),
    "EPSG:4326",
    map.map?.getView().getProjection(),
  );
};

/**
 *
 * @param {import("@eodash/stac").Reader[]} eodashCols
 * @param {import("vue").Ref<Exclude<import("@/types").EodashStyleJson["tooltip"],undefined>>} tooltipProperties
 * @param {boolean} enableCompare
 */

export const useUpdateTooltipProperties = (
  eodashCols,
  tooltipProperties,
  enableCompare = false,
) => {
  /**
   * Listen to events related to the main or compare map based on the enableCompare flag
   * @param {string} evt */
  const listenTo = (evt) =>
    enableCompare ? evt.includes("compare") : !evt.includes("compare");
  useOnLayersUpdate(async (evt) => {
    if (!listenTo(evt)) {
      return;
    }

    const tooltips = [];
    for (const ec of eodashCols) {
      if (!ec.item) {
        continue;
      }
      // the app's cached client, or every event refetches the styles
      tooltips.push(
        ...(await getTooltipProperties(ec.item, { client: axios })),
      );
    }
    tooltipProperties.value = tooltips;
    log.debug("Updated tooltip properties", tooltipProperties.value);
  });
};
