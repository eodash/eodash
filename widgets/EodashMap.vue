<template>
  <DynamicWebComponent :link="link" tag-name="eox-map" :properties="properties" :on-mounted="onMounted"
    :on-unmounted="onUnmounted" />
</template>
<script setup>
import { inject, watch } from "vue";
import { toAbsolute } from 'stac-js/src/http.js';
import { EodashCollection } from "@/utils/eodashSTAC";
import { eodashKey } from "@/store/Keys";
import { mapInstance, datetime } from "@/store/States";
import DynamicWebComponent from "@/components/DynamicWebComponent.vue";
import { storeToRefs } from "pinia";
import '@eox/map/dist/eox-map-advanced-layers-and-sources.js';

const eodashConfig = /** @type {import("@/types").Eodash} */ inject(eodashKey)

const properties = {
  class: "fill-height fill-width overflow-none",
  center: [15, 48],
  layers: [{ type: "Tile", source: { type: "OSM" } }],
}
const link = () => import("@eox/map")

/** @type {import("openlayers").EventsListenerFunctionType}*/
let handleMoveEnd;

/** @type {import("@/types").WebComponentProps["onMounted"]} */
const onMounted = (el, store, router) => {
  datetime.value = /** @type {string} */ (router.currentRoute.value.query["datetime"] ?? "");
  mapInstance.value =  /** @type {any} */(el).map;

  const { selectedStac } = storeToRefs(store)

  watch([selectedStac, datetime], async ([updatedStac, updatedTime]) => {
    if (updatedStac) {
      const parentCollUrl = toAbsolute(`./${updatedStac.id}/collection.json`, eodashConfig.stacEndpoint);
      const childCollUrl = toAbsolute(updatedStac.links[1].href, parentCollUrl);
      const eodash = new EodashCollection(childCollUrl);
      if (updatedTime) {
        /** @type {any} */(el).layers = await eodash.createLayersJson(new Date(updatedTime));
      } else {
        /** @type {any} */(el).layers = await eodash.createLayersJson();
      }
    }
  }, { immediate: true })
}
/** @type {import("@/types").WebComponentProps["onUnmounted"]} */
const onUnmounted = (_el, _store, _router) => {
  mapInstance.value?.un('moveend', handleMoveEnd);
}



</script>
