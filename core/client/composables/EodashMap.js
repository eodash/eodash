import { EodashCollection } from "@/utils/eodashSTAC";
import { setMapProjFromCol } from "@/utils/helpers";
import { onMounted, onUnmounted, watch } from "vue";

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
 *
 * @param {string} indicatorUrl
 * @param {import("@/utils/eodashSTAC").EodashCollection[]} eodashCols
 * @param {string} updatedTime
 * @param {import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 *  } selectedIndicator
 */
const createLayersConfig = async (
  indicatorUrl,
  eodashCols,
  updatedTime,
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

  for (const ec of eodashCols) {
    let layers;
    if (updatedTime) {
      layers = await ec.createLayersJson(new Date(updatedTime));
    } else {
      layers = await ec.createLayersJson();
    }
    if (layers) {
      dataLayers.layers.push(...layers);
    }
  }
  // Add expand to all analysis layers
  dataLayers.layers.forEach((dl) => {
    dl.properties.layerControlExpand = true;
    dl.properties.layerControlToolsExpand = true;
  });

  layersCollection.push(dataLayers);

  const indicator = new EodashCollection(indicatorUrl);
  const indicatorLayers = await indicator.buildJsonArray(
    //@ts-expect-error we use this function to generate collection level visualization
    selectedIndicator,
    indicatorUrl,
    selectedIndicator?.title ?? "",
    selectedIndicator?.endpointtype === "GeoDB",
  );

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
    watch(
      [selectedIndicator, datetime],
      async ([updatedStac, updatedTime], [previousSTAC, _previousTime]) => {
        if (updatedStac) {
          const layersCollection = await createLayersConfig(
            indicatorUrl.value,
            eodashCols,
            updatedTime,
            updatedStac,
          );
          /** @type {any} */
          (mapElement.value).layers = layersCollection;

          // only on different indicator selection and not on time change
          if (previousSTAC?.id !== updatedStac.id) {
            // Set projection based on indicator level information
            setMapProjFromCol(
              /** @type {import('stac-ts').StacCollection} */
              (updatedStac),
            );
            // Try to move map view to extent
            // Make sure for now we are always converting from 4326
            // of stac items  into current map projection
            // TODO: This might change if we decide to use 4326 as default for zoom and extent
            // Sanitize extent
            // // @ts-expect-error we will need to change the approach to use
            // // native eox-map transformation once included
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
          }
        }
      },
      { immediate: true },
    );
  });
};
