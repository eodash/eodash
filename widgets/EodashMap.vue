<template>
  <eox-map-compare class="fill-height fill-width overflow-none" :enabled="showCompare">
      <eox-map
        class="fill-height fill-width overflow-none"
        slot="first"
        ref="eoxMap"
        id="main"
        :config="eoxMapConfig"
      />
      <eox-map
        class="fill-height fill-width overflow-none"
        sync="eox-map#main"
        id="compare"
        slot="second"
        ref="compareMap"
        :config="eoxMapConfig"
      />
    </eox-map-compare>
</template>
<script setup>
import { transformExtent } from "ol/proj";
import { inject, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { toAbsolute } from "stac-js/src/http.js";
import { EodashCollection } from "@/utils/eodashSTAC";
import { extractCollectionUrls } from "@/utils/helpers";
import { eodashKey } from "@/utils/keys";
import { datetime, mapPosition } from "@/store/States";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import "@eox/map";
import "@eox/map/dist/eox-map-advanced-layers-and-sources.js";

const eodashConfig = /** @type {import("@/types").Eodash} */ (
  inject(eodashKey)
);

/** @type {import("vue").Ref<(HTMLElement & Record<string,unknown>) | null>} */
const eoxMap = ref(null);

/** @type {import("vue").Ref<(HTMLElement & Record<string,unknown>) | null>} */
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
  /*
  const currentProj = map?.getView().getProjection();
  const transFunc = getTransform(currentProj?.getCode(), 'EPSG:4326');
  const [x, y] = transFunc(map?.getView().getCenter() ?? [0, 0], undefined, undefined);
  */
  const [x, y] = map?.getView().getCenter() ?? [0, 0];
  const z = map?.getView().getZoom();
  if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
    mapPosition.value = [x, y, z];
  }
};

const store = useSTAcStore();

const createLayersConfig = async (stacItem, updatedTime, selectedStac) => {
  const parentCollUrl = toAbsolute(
    `./${stacItem.id}/collection.json`,
    eodashConfig.stacEndpoint,
  );
  const collectionUrls = extractCollectionUrls(
    stacItem,
    parentCollUrl,
  );
  /** @type {import("@/utils/eodashSTAC").EodashCollection[]} */
  const eodashCollections = [];
  collectionUrls.forEach((cu) => {
    eodashCollections.push(new EodashCollection(cu));
  });
  const uid = function () {
    return (
      Date.now().toString(36) + Math.random().toString(36).substring(2)
    );
  };
  const layersCollection = [];
  const dataLayers = {
    type: "Group",
    properties: {
      id: uid(),
      title: "Analysis Layers",
      layerControlExpand: true,
    },
    layers: /** @type {object[]}*/ ([]),
  };
  for (let idx = 0; idx < eodashCollections.length; idx++) {
    const ec = eodashCollections[idx];
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
    // @ts-expect-error no type definition for eox-map config
    dl.properties.layerControlExpand = true;
    // @ts-expect-error no type definition for eox-map config
    dl.properties.layerControlToolsExpand = true;
  });

  layersCollection.push(dataLayers);
  // TODO: add base layers and overlays as defined in the top collection / indicator
  // Probably best also to introduce background and overlay groups
  // For now adding OSM as background
  const indicator = new EodashCollection(parentCollUrl);
  const indicatorLayers = await indicator.buildJsonArray(
    // @ts-expect-error we pass a collection instead of an item, we want to reuse the layer extraction logic
    selectedStac.value,
    false,
    false,
  );
  const baseLayers = {
    type: "Group",
    properties: {
      id: uid(),
      title: "Base Layers",
    },
    layers: /** @type {object[]}*/ ([]),
  };
  const overlayLayers = {
    type: "Group",
    properties: {
      id: uid(),
      title: "Overlay Layers",
    },
    layers: /** @type {object[]}*/ ([]),
  };
  if (indicatorLayers && indicatorLayers.length > 0) {
    baseLayers.layers.push(
      ...indicatorLayers.filter(
        // @ts-expect-error group is added by the buildJsonArray
        (l) => l.properties.group === "baselayer",
      ),
    );
    // Add exclusive to baselayers and make sure only one is selected
    baseLayers.layers.forEach((bl) => {
      // @ts-expect-error no type definition for eox-map config
      bl.properties.layerControlExclusive = true;
    });
    overlayLayers.layers.push(
      // @ts-expect-error group is added by the buildJsonArray
      ...indicatorLayers.filter((l) => l.properties.group === "overlay"),
    );
  } else {
    // Default to some baselayer
    baseLayers.layers.push({
      type: "Tile",
      properties: {
        id: "osm",
        title: "Background",
      },
      source: {
        type: "OSM",
      },
    });
  }
  if (baseLayers.layers.length > 0) {
    layersCollection.push(baseLayers);
  }
  if (overlayLayers.layers.length > 0) {
    layersCollection.unshift(overlayLayers);
  }

  // TODO: we can check if the collection / indicator has a specific
  //       projection it wants to be displayed in the map we can register
  //       and set the attribute here, e.g. like following
  /*
  (el)?.registerProjection(
    'EPSG:3031','+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs'
  );
  (el)?.projection = "EPSG:3031";
  */

  return layersCollection;
}

onMounted(() => {
  /** @type {import('ol/Map').default} */
  (eoxMap.value?.map)?.on("moveend", handleMoveEnd);

  const { selectedStac, selectedCompareStac } = storeToRefs(store);

  watch( [selectedCompareStac, datetime],
  async ([updatedCompareStac, updatedTime], [_previousCompareStac, _previousTime]) => {
    if(updatedCompareStac) {
      const comapreLayersCollection = await createLayersConfig(updatedCompareStac, updatedTime, selectedCompareStac);
      /** @type {any} */
      (compareMap.value).layers = comapreLayersCollection;
      showCompare.value = "";
    }
  });
  watch(
    [selectedStac, datetime],
    async ([updatedStac, updatedTime], [_previousSTAC, _previousTime]) => {
      if (updatedStac) {
        const layersCollection = await createLayersConfig(updatedStac, updatedTime, selectedStac);
        showCompare.value = "first";
        /** @type {any} */
        (eoxMap.value).layers = layersCollection;
        /*
        // only on different indicator selection and not on time change
        if (previousSTAC?.id !== updatedStac.id) {
          // Try to move map view to extent
          const extent = await indicator.getExtent();
          // Make sure for now we are always converting from 4326
          // of stac items  into current map projection
          // TODO: This might change if we decide to use 4326 as default for zoom and extent
          // Sanitize extent
          const b = extent.spatial.bbox[0];
          const sanitizedExtent = [
            b[0] > -180 ? b[0] : -180,
            b[1] > -90 ? b[1] : -90,
            b[2] < 180 ? b[2] : 180,
            b[3] < 90 ? b[3] : 90,
          ];
          const reprojExtent = transformExtent(
            sanitizedExtent,
            "EPSG:4326",
            // @ts-expect-error we should expect to have the view here
            eoxMap.value?.map?.getView().getProjection(),
          );
          /** @type {any} *
          //(eoxMap.value).zoomExtent = reprojExtent;
        }
          */
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
