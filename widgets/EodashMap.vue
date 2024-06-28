<template>
  <DynamicWebComponent
    :link="link"
    tag-name="eox-map"
    :properties="properties"
    :on-mounted="onMounted"
    :on-unmounted="onUnmounted"
  />
</template>
<script setup>
import { inject, watch } from "vue";
import { toAbsolute } from "stac-js/src/http.js";
import { EodashCollection, extractCollectionUrls } from "@/utils/eodashSTAC";
import { eodashKey } from "@/utils/keys";
import { datetime, mapPosition } from "@/store/States";
import DynamicWebComponent from "@/components/DynamicWebComponent.vue";
import { storeToRefs } from "pinia";
import "@eox/map/dist/eox-map-advanced-layers-and-sources.js";

const eodashConfig = /** @type {import("@/types").Eodash} */ inject(eodashKey);

/** @type {Record<string, unknown>} */
const properties = {
  class: "fill-height fill-width overflow-none",
  center: [15, 48],
  zoom: 4,
  // TODO: we should probably introduce some way of defining
  layers: [
    {
      type: "Vector",
      source: {
        type: "Vector",
        url: "https://openlayers.org/data/vector/ecoregions.json",
        format: "GeoJSON",
      },
    },
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
};
// Check if selected indicator was already set in store
if (mapPosition && mapPosition.value && mapPosition.value.length === 3) {
  // TODO: do further checks for invalid values?
  // TODO: can we expect the values to be in a specific projection
  properties.center = [mapPosition.value?.[0], mapPosition.value[1]];
  properties.zoom = mapPosition.value[2];
}

const link = () => import("@eox/map");

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

/** @type {import("@/types").WebComponentProps["onMounted"]} */
const onMounted = (el, store) => {
  /** @type {any} */
  (el)?.map?.on("moveend", handleMoveEnd);
  const { selectedStac } = storeToRefs(store);

  watch(
    [selectedStac, datetime],
    async ([updatedStac, updatedTime]) => {
      if (updatedStac) {
        const parentCollUrl = toAbsolute(
          `./${updatedStac.id}/collection.json`,
          eodashConfig.stacEndpoint,
        );
        const collectionUrls = extractCollectionUrls(
          selectedStac.value,
          parentCollUrl,
        );
        /** @type {import("@/utils/eodashSTAC").EodashCollection[]} */
        const eodashCollections = [];
        collectionUrls.forEach((cu) => {
          eodashCollections.push(new EodashCollection(cu));
        });
        const layersCollection = [];
        for (let idx = 0; idx < eodashCollections.length; idx++) {
          const ec = eodashCollections[idx];
          let layers;
          if (updatedTime) {
            layers = await ec.createLayersJson(new Date(updatedTime));
          } else {
            layers = await ec.createLayersJson();
          }
          if (layers) {
            layersCollection.push(...layers);
          }
        }
        // TODO: add base layers and overlays as defined in the top collection / indicator
        // Probably best also to introduce background and overlay groups
        // For now adding OSM as background
        layersCollection.push({
          type: "Tile",
          properties: {
            id: "osm",
            title: "Background",
          },
          source: {
            type: "OSM",
          },
        });

        // TODO: we can check if the collection / indicator has a specific
        //       projection it wants to be displayed in the map we can register
        //       and set the attribute here, e.g. like following
        /* 
        (el)?.registerProjection(
          'EPSG:3031','+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs'
        );
        (el)?.projection = "EPSG:3031";
        */

        /** @type {any} */
        (el).layers = layersCollection;
      }
    },
    { immediate: true },
  );
};

/** @type {import("@/types").WebComponentProps["onUnmounted"]} */
const onUnmounted = (el, _store) => {
  /** @type {any} */
  (el)?.map?.un("moveend", handleMoveEnd);
};
</script>
