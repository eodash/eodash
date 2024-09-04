import { EodashCollection } from "@/utils/eodashSTAC";
import { setMapProjFromCol } from "@/utils/helpers";
import { onMounted, onUnmounted, watch } from "vue";
import log from "loglevel";
/**
 * Description placeholder
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
 *  Adds data layers extracted from eodash collections to Analysis Group
 *
 * @param { Record<string,any>[] | undefined} layersCollection
 * @param {EodashCollection[]} eodashCols
 * @param {string} [updatedTime]
 */
const updateLayersConfig = async (
  layersCollection,
  eodashCols,
  updatedTime,
) => {
  log.debug("Updating layer configuration", layersCollection, eodashCols, updatedTime);
  /** @type {Record<string,any>[]} */
  const analysisLayers = [];

  for (const ec of eodashCols) {
    let layers;
    if (updatedTime) {
      layers = await ec.createLayersJson(new Date(updatedTime));
    } else {
      layers = await ec.createLayersJson();
    }

    if (layers) {
      analysisLayers.push(...layers);
    }
  }
  // Add expand to all analysis layers
  analysisLayers.forEach((dl) => {
    dl.properties.layerControlExpand = true;
    dl.properties.layerControlToolsExpand = true;
  });

  const dataLayersGroup = layersCollection?.find(
    (lyr) => lyr?.properties.id === "AnalysisGroup",
  );
  if (dataLayersGroup) {
    dataLayersGroup.layers = analysisLayers;
  }

  return layersCollection;
};

/**
 * @param {import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 *  } selectedIndicator
 */

const createLayersConfig = async (selectedIndicator) => {
  log.debug("Creating layers config", selectedIndicator);
  const layersCollection = [];
  const dataLayers = {
    type: "Group",
    properties: {
      id: "AnalysisGroup",
      title: "Analysis Layers",
      layerControlExpand: true,
    },
    layers: /** @type {Record<string,any>[]}*/ ([]),
  };

  layersCollection.push(dataLayers);
  const indicatorLayers =
    //@ts-expect-error indicator is collection
    await EodashCollection.getIndicatorLayers(selectedIndicator);

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
 * Description placeholder
 *
 * @param {import("vue").Ref<HTMLElement & Record<string,any> | null>} mapElement
 * @param {import('stac-ts').StacCollection } indicator
 * @param {EodashCollection[]} eodashCols
 * @param {import("vue").Ref<string>} datetime
 */
const handleIndicatorLoading = async(mapElement, indicator, eodashCols, datetime)=> {
  const layersCollection = await createLayersConfig(indicator);

  // updates layersCollection in place
  await updateLayersConfig(layersCollection, eodashCols, datetime.value);

  // Set projection based on indicator level information
  setMapProjFromCol(indicator);

  // Try to move map view to extent
  // Sanitize extent,
  const b = indicator.extent?.spatial.bbox[0];
  const sanitizedExtent = [
    b[0] > -180 ? b[0] : -180,
    b[1] > -90 ? b[1] : -90,
    b[2] < 180 ? b[2] : 180,
    b[3] < 90 ? b[3] : 90,
  ];
  const reprojExtent = mapElement.value?.transformExtent(
    sanitizedExtent,
    "EPSG:4326",
    mapElement.value?.map?.getView().getProjection(),
  );
  /** @type {any} */
  (mapElement.value).zoomExtent = reprojExtent;

  /** @type {any} */
  (mapElement.value).layers = layersCollection;
}

/**
 * Description placeholder
 *
 * @param {import("vue").Ref<HTMLElement & Record<string,any> | null>} mapElement
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} selectedIndicator
 * @param {EodashCollection[]} eodashCols
 * @param {import("vue").Ref<string>} datetime
 */
export const useInitMap = (
  mapElement,
  selectedIndicator,
  eodashCols,
  datetime,
) => {
  log.debug("InitMap", mapElement.value, selectedIndicator.value, eodashCols.values, datetime.value);
  // Check if selected indicator already loaded when initializing map
  if (selectedIndicator && selectedIndicator.value) {
    log.debug("Loading indicator based on url parameter", selectedIndicator.value.id);
    handleIndicatorLoading(mapElement, selectedIndicator.value, eodashCols, datetime);
  }
  watch(selectedIndicator, async (updatedStac) => {
    log.debug("SelectedIndicator watch triggered", selectedIndicator, updatedStac);
    if (updatedStac) {
      handleIndicatorLoading(mapElement, updatedStac, eodashCols, datetime);
    }
  });

  watch(datetime, async (updatedTime, previousTime) => {
    if (updatedTime && updatedTime !== previousTime) {
      const layersCollection = await updateLayersConfig(
        [...(mapElement.value?.layers ?? [])],
        eodashCols,
        updatedTime,
      );
      /** @type {any} */
      (mapElement.value).layers = layersCollection?.reverse();
    }
  });
};
