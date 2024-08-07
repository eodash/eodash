<template>
  <eox-map-compare
    class="fill-height fill-width overflow-none"
    :enabled="showCompare"
  >
    <eox-map
      class="fill-height fill-width overflow-none"
      slot="first"
      ref="eoxMap"
      sync="eox-map#compare"
      id="main"
      :config="eoxMapConfig"
    />
    <eox-map
      class="fill-height fill-width overflow-none"
      id="compare"
      slot="second"
      ref="compareMap"
      :config="eoxCompareMapConfig"
    />
  </eox-map-compare>
</template>
<script setup>
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { EodashCollection } from "@/utils/eodashSTAC";
import { extractCollectionUrls, setMapProjFromCol } from "@/utils/helpers";
import {
  currentUrl,
  currentCompareUrl,
  datetime,
  mapEl,
  mapPosition,
} from "@/store/States";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import "@eox/map";
import "@eox/map/dist/eox-map-advanced-layers-and-sources.js";

const props = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
});

/** @type {import("vue").Ref<(HTMLElement & Record<string,any>) | null>} */
const eoxMap = ref(null);
/** @type {import("vue").Ref<(HTMLElement & Record<string,any>) | null>} */
const compareMap = ref(null);

const showCompare = ref("first");

const eoxMapConfig = reactive({
  /** @type {(number|undefined)[] | undefined} */
  center: [15, 48],
  /** @type {number | undefined} */
  zoom: 4,
  // TODO: we should probably introduce some way of defining
  layers: [
    {
      type: "Tile",
      properties: {
        id: "osm",
        title: "Background",
      },
      source: {
        type: "OSM",
      },
    },
  ],
});

const eoxCompareMapConfig = reactive({
  /** @type {(number|undefined)[] | undefined} */
  center: [15, 48],
  /** @type {number | undefined} */
  zoom: 4,
  layers: [],
});

// Check if selected indicator was already set in store
if (mapPosition && mapPosition.value && mapPosition.value.length === 3) {
  // TODO: do further checks for invalid values?
  // TODO: can we expect the values to be in a specific projection
  eoxMapConfig.center = [mapPosition.value?.[0], mapPosition.value[1]];
  eoxMapConfig.zoom = mapPosition.value[2];
}

/** @type {import("openlayers").EventsListenerFunctionType} */
const handleMoveEnd = (evt) => {
  const map = /** @type {import("openlayers").Map | undefined} */ (
    /** @type {any} */ (evt).map
  );
  const lonlat = eoxMap.value?.lonLatCenter;
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

const store = useSTAcStore();
/**
 *
 * @param {import("vue").Ref<string>} baseUrl
 * @param {string} updatedTime
 * @param {import("vue").Ref<
 *   | import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 * >} selectedStac
 */
const createLayersConfig = async (baseUrl, updatedTime, selectedStac) => {
  const collectionUrls = extractCollectionUrls(
    selectedStac.value,
    baseUrl.value,
  );
  const eodashCollections = collectionUrls.map(
    (cu) => new EodashCollection(cu),
  );

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

  for (const ec of eodashCollections) {
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
  const indicator = new EodashCollection(currentUrl.value);
  const indicatorLayers = await indicator.buildJsonArray(
    //@ts-expect-error we use this function to generate collection level visualization
    selectedStac.value,
    currentUrl.value,
    selectedStac.value?.title ?? "",
    selectedStac.value?.endpointtype ?? false,
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

onMounted(() => {
  mapEl.value = /** @type {HTMLElement & Record<string,any>} */ (eoxMap.value);

  /** @type {import('ol/Map').default} */
  (eoxMap.value?.map)?.on("moveend", handleMoveEnd);

  const { selectedStac, selectedCompareStac } = storeToRefs(store);
  if (props.enableCompare) {
    watch(
      [selectedCompareStac, datetime],
      async (
        [updatedCompareStac, updatedTime],
        [_previousCompareStac, _previousTime],
      ) => {
        if (updatedCompareStac) {
          const compareLayersCollection = await createLayersConfig(
            currentCompareUrl,
            updatedTime,
            selectedCompareStac,
          );
          /** @type {any} */
          (compareMap.value).layers = compareLayersCollection;
          showCompare.value = "";
        }
      },
    );
  }

  watch(
    [selectedStac, datetime],
    async ([updatedStac, updatedTime], [previousSTAC, _previousTime]) => {
      if (updatedStac) {
        const layersCollection = await createLayersConfig(
          currentUrl,
          updatedTime,
          selectedStac,
        );
        /** @type {any} */
        (eoxMap.value).layers = layersCollection;

        // only on different indicator selection and not on time change
        if (previousSTAC?.id !== updatedStac.id) {
          // Set projection based on indicator level information
          setMapProjFromCol(updatedStac);
          showCompare.value = "first";
          // Try to move map view to extent
          // Make sure for now we are always converting from 4326
          // of stac items  into current map projection
          // TODO: This might change if we decide to use 4326 as default for zoom and extent
          // Sanitize extent
          // @ts-expect-error we will need to change the approach to use
          // native eox-map transformation once included
          const b = updatedStac.extent?.spatial.bbox[0];
          const sanitizedExtent = [
            b[0] > -180 ? b[0] : -180,
            b[1] > -90 ? b[1] : -90,
            b[2] < 180 ? b[2] : 180,
            b[3] < 90 ? b[3] : 90,
          ];
          const reprojExtent = eoxMap.value?.transformExtent(
            sanitizedExtent,
            "EPSG:4326",
            eoxMap.value?.map?.getView().getProjection(),
          );
          /** @type {any} */
          (eoxMap.value).zoomExtent = reprojExtent;
        }
      }
    },
    { immediate: true },
  );
});

onUnmounted(() => {
  /** @type {import('ol/Map').default} */
  (eoxMap.value?.map)?.un("moveend", handleMoveEnd);
});
</script>
