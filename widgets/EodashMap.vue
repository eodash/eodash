<template>
  <DynamicWebComponent :link="link" tag-name="eox-map" :properties="properties" :on-mounted="onMounted"
    :on-unmounted="onUnmounted" />
</template>
<script setup>
import { inject, watch } from "vue";
import { toAbsolute } from 'stac-js/src/http.js';
import { EodashCollection } from "@/utils/eodashSTAC";
import { eodashKey } from "@/store/Keys";
import { mapInstance } from "@/store/States";
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
  mapInstance.value =  /** @type {any} */(el).map;
  mapInstance.value?.on('moveend', handleMoveEnd =
    /** @param {any} evt  */
    (evt) => {
      router.push({
        query: {
          z: `${evt.map.getView().getZoom()}`
        }
      });
    });

  const { selectedStac } = storeToRefs(store)
  watch(selectedStac, async (updatedStac) => {
    if (updatedStac) {
      const parentCollUrl = toAbsolute(updatedStac.links[1].href, eodashConfig.stacEndpoint);
      const childCollUrl = toAbsolute(updatedStac.links[1].href, parentCollUrl);
      const eodash = new EodashCollection(childCollUrl);
      /** @type {any} */(el).layers = await eodash.createLayersJson();
    }
  }, { immediate: true })
}
/** @type {import("@/types").WebComponentProps["onUnmounted"]} */
const onUnmounted = (_el, _store, _router) => {
  mapInstance.value?.un('moveend', handleMoveEnd);
}



</script>
