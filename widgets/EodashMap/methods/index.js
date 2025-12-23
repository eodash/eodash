import { createLayersConfig } from "./create-layers-config";
import { setMapProjFromCol } from "@/eodashSTAC/triggers";
import { onMounted, onUnmounted, watch } from "vue";
import log from "loglevel";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { isFirstLoad } from "@/utils/states";
import { useEmitLayersUpdate, useOnLayersUpdate } from "@/composables";
import { mapPosition } from "@/store/states";
import { sanitizeBbox } from "@/eodashSTAC/helpers";
import { transformExtent } from "@eox/map";
/**
 * Holder for previous compare map view as it is overwritten by sync
 * @type { import("ol").View | null} mapElement
 */
let viewHolder = null;

/**
 * Handles updating {@link mapPosition} on movement on the map
 *
 * @param {import("vue").Ref<HTMLElement & Record<string,any> & {map:import("ol").Map } | null>} mapElement
 * @param {import("vue").Ref<(number | undefined)[]>} mapPosition
 */
export const useHandleMapMoveEnd = (mapElement, mapPosition) => {
  /** @type {import("openlayers").EventsListenerFunctionType} */
  const handleMoveEnd = (evt) => {
    const map = /** @type {import("openlayers").Map | undefined} */ (
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

  onMounted(() => {
    /** @type {import('ol/Map').default} */
    (mapElement.value?.map)?.on("moveend", handleMoveEnd);
  });

  onUnmounted(() => {
    /** @type {import('ol/Map').default} */
    (mapElement.value?.map)?.un("moveend", handleMoveEnd);
  });
};

/**
 * Initializes the map and updates it based on changes in the selected indicator and datetime,
 *
 * @param {import("vue").Ref<import("@eox/map").EOxMap| null>} mapElement
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} selectedIndicator
 * @param {import("@/eodashSTAC/EodashCollection").EodashCollection[]} eodashCols
 * @param {import("vue").Ref<string>} datetime
 * @param {import("vue").Ref<Record<string,any>[]>} mapLayers
 * @param {import("vue").Ref<import("@eox/map").EOxMap| null>} partnerMap
 * @param {boolean} zoomToExtent
 * @param {import("vue").Ref<import("stac-ts").StacItem | import("stac-ts").StacLink | null>} [selectedItem]
 */
export const useInitMap = (
  mapElement,
  selectedIndicator,
  eodashCols,
  datetime,
  mapLayers,
  partnerMap,
  zoomToExtent,
  selectedItem,
) => {
  log.debug(
    "InitMap",
    mapElement.value,
    selectedIndicator.value,
    eodashCols.values,
    datetime.value,
  );
  // watch selectedItem if provided
  const watching = selectedItem
    ? [selectedIndicator, datetime, selectedItem]
    : [selectedIndicator, datetime];
  const stopIndicatorWatcher = watch(
    watching,
    async (updated, previous) => {
      const [updatedStac, updatedTime, updatedItem] =
        /** @type {[import("stac-ts").StacCollection, string, import("stac-ts").StacItem | null]} */ (
          selectedItem ? updated : [updated[0], updated[1], null]
        );
      const [previousStac, previousTime, previousItem] =
        /** @type {[import("stac-ts").StacCollection, string, import("stac-ts").StacItem]} */ (
          selectedItem ? previous : [previous[0], previous[1], null]
        );

      if (updatedStac) {
        log.debug(
          "Selected Indicator watch triggered",
          updatedStac,
          updatedTime,
        );

        if (mapElement?.value?.id === "main") {
          // Making sure main map gets the viewer that seems to be
          // removed when the second map is no longer rendered
          if (viewHolder !== null) {
            // Set view to previous compare view
            mapElement?.value?.map.setView(viewHolder);
            viewHolder = null;
          }
        }
        let layersCollection = [];

        const onlyTimeChanged =
          updatedStac?.id === previousStac?.id &&
          (updatedTime !== previousTime ||
            (updatedItem && updatedItem?.id !== previousItem?.id));

        const { selectedCompareStac } = storeToRefs(useSTAcStore());
        if (mapElement?.value?.id === "main") {
          // Main map being initialized
          // Set projection based on indicator level information for both maps
          await setMapProjFromCol(updatedStac);
        } else {
          // Compare map being initialized
          if (selectedCompareStac.value !== null) {
            // save view of compare map
            viewHolder = mapElement?.value?.map.getView() ?? null;
            /** @type {any} */
            (mapElement.value).sync = partnerMap.value;
          }
        }

        // We re-create the configuration if time changed
        if (onlyTimeChanged) {
          layersCollection = await createLayersConfig(
            updatedStac,
            eodashCols,
            updatedItem ?? updatedTime,
          );
          log.debug(
            "Assigned layers after changing time only",
            JSON.parse(JSON.stringify(layersCollection)),
          );
          mapLayers.value = layersCollection;

          useEmitLayersUpdate(
            mapElement.value?.id === "compare"
              ? "compareTime:updated"
              : "time:updated",
            mapElement.value,
            layersCollection,
          );
          return;
        }

        // We try to set the current time selection to latest extent date
        let endInterval = null;
        const interval = updatedStac?.extent?.temporal?.interval;
        if (interval && interval.length > 0 && interval[0].length > 1) {
          // @ts-expect-error this is the defined STAC structure
          endInterval = new Date(interval[0][1]);
          log.debug(
            "Indicator load: found stac extent, setting time to latest value",
            endInterval,
          );
        }
        if (
          !updatedItem &&
          endInterval !== null &&
          endInterval.toISOString() !== datetime.value &&
          !isFirstLoad.value
        ) {
          datetime.value = endInterval.toISOString();
        } else if (isFirstLoad.value && !datetime.value && endInterval) {
          datetime.value = endInterval.toISOString();
        }

        /** @type {Record<string,any>[]} */
        layersCollection = await createLayersConfig(
          updatedStac,
          eodashCols,
          updatedItem ?? updatedTime,
        );

        if (zoomToExtent) {
          // Try to move map view to extent only when main
          // indicator and map changes
          if (
            !updatedItem &&
            mapElement?.value?.id === "main" &&
            updatedStac.extent?.spatial.bbox &&
            !(
              isFirstLoad.value &&
              mapPosition.value?.[0] &&
              mapPosition.value?.[1]
            )
          ) {
            // Sanitize extent,
            const b = updatedStac.extent?.spatial.bbox[0];
            const sanitizedExtent = sanitizeBbox([...b]);

            const reprojExtent = transformExtent(
              sanitizedExtent,
              "EPSG:4326",
              mapElement.value?.map?.getView().getProjection(),
            );
            /** @type {import("@eox/map").EOxMap} */
            (mapElement.value).zoomExtent = reprojExtent;
          }
        }

        log.debug(
          "Assigned layers",
          JSON.parse(JSON.stringify(layersCollection)),
        );
        mapLayers.value = layersCollection;
        // Emit event to update layers
        await useEmitLayersUpdate(
          mapElement.value?.id === "compare"
            ? "compareLayers:updated"
            : "layers:updated",
          mapElement.value,
          mapLayers.value,
        );
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stopIndicatorWatcher();
  });
};
/**
 *
 * @param {import("@/eodashSTAC/EodashCollection").EodashCollection[]} eodashCols
 * @param {import("vue").Ref<Exclude<import("@/types").EodashStyleJson["tooltip"],undefined>>} tooltipProperties
 */

export const useUpdateTooltipProperties = (eodashCols, tooltipProperties) => {
  useOnLayersUpdate(async (evt, _payload) => {
    if (evt.includes("compare")) {
      // TODO: support compare map tooltips
      // Do not update tooltip properties on compare map
      return;
    }
    const tooltips = [];
    for (const ec of eodashCols) {
      tooltips.push(...(await ec.getToolTipProperties()));
    }
    tooltipProperties.value = tooltips;
    log.debug("Updated tooltip properties", tooltipProperties.value);
  });
};
