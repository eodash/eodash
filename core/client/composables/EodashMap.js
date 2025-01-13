import { EodashCollection } from "@/eodashSTAC/EodashCollection";
import { setMapProjFromCol } from "@/eodashSTAC/triggers";
import { nextTick, onMounted, onUnmounted, watch } from "vue";
import log from "loglevel";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { useEventBus } from "@vueuse/core";
import { eoxLayersKey } from "@/utils/keys";
import { posIsSetFromUrl } from "@/utils/states";
import { useOnLayersUpdate } from ".";
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
      if (posIsSetFromUrl.value) {
        posIsSetFromUrl.value = false;
      }
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
 * Creates full layer configuration from indicator and time information
 * @param {import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 * } selectedIndicator
 * @param {EodashCollection[]} eodashCols
 * @param {string} [updatedTime]
 */

const createLayersConfig = async (
  selectedIndicator,
  eodashCols,
  updatedTime,
) => {
  log.debug(
    "Creating layers config",
    selectedIndicator,
    eodashCols,
    updatedTime,
  );
  const layersCollection = [];
  const dataLayers = {
    type: "Group",
    properties: {
      id: "AnalysisGroup",
      title: "Data Layers",
      layerControlExpand: true,
    },
    layers: /** @type {Record<string,any>[]}*/ ([]),
  };

  for (const ec of eodashCols) {
    let layers;
    if (updatedTime) {
      layers = await ec.createLayersJson(new Date(updatedTime));
    } else {
      layers = await ec.createLayersJson();
    }
    // Add expand to all analysis layers
    layers.forEach((dl) => {
      dl.properties.layerControlExpand = true;
      dl.properties.layerControlToolsExpand = true;
    });
    dataLayers.layers.push(...layers);
  }

  layersCollection.push(dataLayers);
  const indicatorLayers =
    //@ts-expect-error indicator is collection
    await EodashCollection.getIndicatorLayers(selectedIndicator);
  const geodbLayer = EodashCollection.getGeoDBLayer(eodashCols);
  if (geodbLayer) {
    dataLayers.layers.push(geodbLayer);
  }
  const baseLayers = {
    type: "Group",
    properties: {
      id: "BaseLayersGroup",
      title: "Base Layers",
    },
    layers: /** @type {Record<string,any>[]}*/ ([]),
  };

  const indicatorBaseLayers = indicatorLayers.filter(
    (l) => l.properties.group === "baselayer",
  );

  if (indicatorBaseLayers.length) {
    // Only one baselayer can be set to visible, let's first set all to
    // false that have not a dedicated property visible, then check
    // if there are more then one visible and only allow one
    let counter = 0;
    let lastPos = 0;
    for (let indx = 0; indx < indicatorBaseLayers.length; indx++) {
      const bl = indicatorBaseLayers[indx];
      if (!("visible" in bl.properties)) {
        bl.properties.visible = false;
      }

      if (bl.properties.visible) {
        counter++;
        lastPos = indx;
      }
    }

    // if none visible set the last one as visible
    if (counter === 0) {
      indicatorBaseLayers[0].properties.visible = true;
    }

    // disable all apart from last
    if (counter > 0) {
      indicatorBaseLayers.forEach((bl, indx) => {
        if (indx !== lastPos) {
          bl.properties.visible = false;
        } else {
          bl.properties.visible = true;
        }
      });
    }

    baseLayers.layers.push(...indicatorBaseLayers);

    // Add exclusive to baselayers and make sure only one is selected
    baseLayers.layers.forEach((bl) => {
      bl.properties.layerControlExclusive = true;
    });
  } else {
    // Default to some baselayer
    baseLayers.layers.push({
      type: "Tile",
      properties: {
        id: "osm",
        title: "Background",
        layerControlExclusive: true,
      },
      source: {
        type: "OSM",
      },
    });
  }

  if (baseLayers.layers.length) {
    layersCollection.push(baseLayers);
  }

  const overlayLayers = {
    type: "Group",
    properties: {
      id: "OverlayGroup",
      title: "Overlay Layers",
    },
    layers: /** @type {Record<string,any>[]}*/ ([]),
  };

  const indicatorOverlays = indicatorLayers.filter(
    (l) => l.properties.group === "overlay",
  );

  if (indicatorOverlays.length) {
    overlayLayers.layers.push(...indicatorOverlays);
    layersCollection.unshift(overlayLayers);
  }

  return layersCollection;
};

/**
 * Initializes the map and updates it based on changes in the selected indicator and datetime,
 *
 * @param {import("vue").Ref<import("@eox/map").EOxMap| null>} mapElement
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} selectedIndicator
 * @param {EodashCollection[]} eodashCols
 * @param {import("vue").Ref<string>} datetime
 * @param {import("vue").Ref<Record<string,any>[]>} mapLayers
 * @param {import("vue").Ref<import("@eox/map").EOxMap| null>} partnerMap
 */
export const useInitMap = (
  mapElement,
  selectedIndicator,
  eodashCols,
  datetime,
  mapLayers,
  partnerMap,
) => {
  log.debug(
    "InitMap",
    mapElement.value,
    selectedIndicator.value,
    eodashCols.values,
    datetime.value,
  );
  const layersEvent = useEventBus(eoxLayersKey);

  const stopIndicatorWatcher = watch(
    [selectedIndicator, datetime],
    async ([updatedStac, updatedTime], [previousStac, previousTime]) => {
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
          updatedStac?.id === previousStac?.id && updatedTime !== previousTime;

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

        // We re-crate the configuration if time changed
        if (onlyTimeChanged) {
          layersCollection = await createLayersConfig(
            updatedStac,
            eodashCols,
            updatedTime,
          );
          log.debug(
            "Assigned layers after changing time only",
            JSON.parse(JSON.stringify(layersCollection)),
          );
          mapLayers.value = layersCollection;
          await nextTick(() => {
            layersEvent.emit("time:updated", mapLayers.value);
          });
          return;
        }

        /** @type {Record<string,any>[]} */
        layersCollection = await createLayersConfig(
          updatedStac,
          eodashCols,
          datetime.value,
        );

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
          endInterval !== null &&
          endInterval.toISOString() !== datetime.value
        ) {
          datetime.value = endInterval.toISOString();
        }

        // Try to move map view to extent only when main
        // indicator and map changes
        if (
          mapElement?.value?.id === "main" &&
          updatedStac.extent?.spatial.bbox &&
          !posIsSetFromUrl.value
        ) {
          // Sanitize extent,
          const b = updatedStac.extent?.spatial.bbox[0];
          const sanitizedExtent = [
            b?.[0] > -180 ? b?.[0] : -180,
            b?.[1] > -90 ? b?.[1] : -90,
            b?.[2] < 180 ? b?.[2] : 180,
            b?.[3] < 90 ? b?.[3] : 90,
          ];

          const reprojExtent = mapElement.value?.transformExtent(
            sanitizedExtent,
            "EPSG:4326",
            mapElement.value?.map?.getView().getProjection(),
          );
          /** @type {import("@eox/map").EOxMap} */
          (mapElement.value).zoomExtent = reprojExtent;
        }
        if (posIsSetFromUrl.value) {
          posIsSetFromUrl.value = false;
        }

        log.debug(
          "Assigned layers",
          JSON.parse(JSON.stringify(layersCollection)),
        );
        mapLayers.value = layersCollection;
        // Emit event to update layers
        await nextTick(() => {
          mapElement.value?.updateComplete.then(() => {
            layersEvent.emit("layers:updated", mapLayers.value);
          });
        });
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
 * @param {EodashCollection[]} eodashCols
 * @param {import("vue").Ref<string[]>} tooltipProperties
 */
export const useUpdateTooltipProperties = (eodashCols, tooltipProperties) => {
  useOnLayersUpdate(async () => {
    tooltipProperties.value = [];
    for (const ec of eodashCols) {
      tooltipProperties.value.push(...(await ec.getToolTipProperties()));
    }
  });
};
