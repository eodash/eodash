<template>
  <eox-map-compare
    class="fill-height fill-width overflow-none"
    :enabled="showCompare"
  >
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
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { EodashCollection } from "@/utils/eodashSTAC";
import { extractCollectionUrls, uid } from "@/utils/helpers";
import { currentUrl, datetime, mapEl, mapPosition } from "@/store/States";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import "@eox/map";
import "@eox/map/dist/eox-map-advanced-layers-and-sources.js";

/** @type {import("vue").Ref<(HTMLElement & Record<string,any>) | null>} */
const eoxMap = ref(null);

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
  const [x, y] = map?.getView().getCenter() ?? [0, 0];
  const z = map?.getView().getZoom();
  if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
    mapPosition.value = [x, y, z];
  }
};

const store = useSTAcStore();

onMounted(() => {
  mapEl.value = /** @type {HTMLElement & Record<string,any>} */ (eoxMap.value);

  /** @type {import('ol/Map').default} */
  (eoxMap.value?.map)?.on("moveend", handleMoveEnd);

  const { selectedStac } = storeToRefs(store);

  watch(
    [selectedStac, datetime],
    async ([updatedStac, updatedTime], [previousSTAC, _previousTime]) => {
      if (updatedStac) {
        const collectionUrls = extractCollectionUrls(
          selectedStac.value,
          currentUrl.value,
        );
        const collectionUrls = extractCollectionUrls(
          selectedStac.value,
          currentUrl.value,
        );

        const eodashCollections = collectionUrls.map(
          (cu) => new EodashCollection(cu),
        );

        const layersCollection = [];
        const dataLayers = {
          type: "Group",
          properties: {
            id: uid(),
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
          // @ts-expect-error we pass a collection instead of an item, we want to reuse the layer extraction logic
          selectedStac.value,
          currentUrl.value,
          selectedStac.value?.title ?? "",
          selectedStac.value?.endpointtype ?? false,
        );

        const baseLayers = {
          type: "Group",
          properties: {
            id: uid(),
            title: "Base Layers",
          },
          layers: /** @type {Record<string,any>[]}*/ ([]),
        };

        const indicatorBaseLayers = indicatorLayers.filter(
          (l) => l.properties.group === "baselayer",
        );
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
            id: uid(),
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

        /** @type {any} */
        (eoxMap.value).layers = layersCollection;

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
