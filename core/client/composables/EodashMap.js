import { EodashCollection } from "@/utils/eodashSTAC";
import { setMapProjFromCol } from "@/utils/helpers";
import { onMounted, onUnmounted, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
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
 * @param {import("vue").Ref<HTMLElement & Record<string,any> | null>} mapElement
 * @param {import("@/utils/eodashSTAC").EodashCollection[]} eodashCols
 * @param {string} updatedTime
 */
const updateLayersConfig = async (mapElement, eodashCols, updatedTime) => {
  const dataLayers = mapElement.value?.layers;
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
  if (
    dataLayers &&
    dataLayers.length > 1 &&
    dataLayers[1].properties.id === "AnalysisGroup"
  ) {
    dataLayers[1].layers = analysisLayers;
  }
  return dataLayers;
};

/**
 *
 * @param {string} indicatorUrl
 * @param {import("@/utils/eodashSTAC").EodashCollection[]} eodashCols
 * @param {import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 *  } selectedIndicator
 */
const createLayersConfig = async (
  indicatorUrl,
  eodashCols,
  selectedIndicator,
) => {
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
  // Only one baselayer can be set to visible, let's first set all to
  // false that have not a dedicated property visible, then check
  // if there are more then one visible and only allow one
  let counter = 0;
  let lastPos = 0;
  indicatorBaseLayers.forEach((bl, indx) => {
    if (!("visible" in bl.properties)) {
      bl.properties.visible = false;
    }
    if (bl.properties.visible) {
      counter++;
      lastPos = indx;
    }
  });
  // if none visible set the last one as visible
  if (counter == 0 && indicatorBaseLayers.length > 0) {
    indicatorBaseLayers[0].properties.visible = true;
  }
  // disable all apart from last
  if (counter > 1) {
    indicatorBaseLayers.forEach((bl, indx) => {
      if (indx !== lastPos) {
        bl.properties.visible = false;
      }
    });
  }

  if (indicatorBaseLayers.length) {
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
 * @param {import("vue").Ref<import("stac-ts").StacCollection | null>} selectedIndicator
 * @param {EodashCollection[]} eodashCols
 * @param {import("vue").Ref<string>} indicatorUrl
 * @param {import("vue").Ref<string>} datetime
 */
export const useInitMap = (
  mapElement,
  selectedIndicator,
  eodashCols,
  indicatorUrl,
  datetime,
) => {
  onMounted(() => {
    watch(selectedIndicator, async (updatedStac, previousStac) => {
      console.log("UPDATED INDICATOR OR TIME");
      if (updatedStac && previousStac?.id !== updatedStac.id) {
        const layersCollection = await createLayersConfig(
          indicatorUrl.value,
          eodashCols,
          updatedStac,
        );
        // Set projection based on indicator level information
        setMapProjFromCol(
          /** @type {import('stac-ts').StacCollection} */
          (updatedStac),
        );
        // Try to move map view to extent
        // Sanitize extent,
        const b = updatedStac.extent?.spatial.bbox[0];
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
    });
    watch(datetime, async (updatedTime, previousTime) => {
      if (updatedTime && updatedTime !== previousTime) {
        console.log("UPDATE TIME");
        const layersCollection = await updateLayersConfig(
          mapElement,
          eodashCols,
          updatedTime,
        );
        /** @type {any} */
        (mapElement.value).layers = layersCollection.reverse();
      }
    });
  });
};
