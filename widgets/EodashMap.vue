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
import { EodashCollection } from "@/utils/eodashSTAC";
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
  layers: [{ type: "Tile", source: { type: "OSM" } }],
};
// Check if selected indicator was already set in store
if (mapPosition && mapPosition.value && mapPosition.value.length === 3) {
  // TODO: do further checks for invalid values?
  properties.center = [mapPosition.value?.[0], mapPosition.value[1]];
  properties.zoom = mapPosition.value[2];
}

const link = () => import("@eox/map");

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
        const childCollUrl = toAbsolute(
          updatedStac.links[1].href,
          parentCollUrl,
        );
        const eodash = new EodashCollection(childCollUrl);
        if (updatedTime) {
          /** @type {any} */ (el).layers = await eodash.createLayersJson(
            new Date(updatedTime),
          );
        } else {
          /** @type {any} */ (el).layers = await eodash.createLayersJson();
        }
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
