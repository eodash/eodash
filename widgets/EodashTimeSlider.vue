<template>
  <eox-timeslider
    v-if="hasMultipleItems"
    :key="mapEl"
    @update="update"
    .external-map-rendering="true"
    titleKey="title"
    layerIdKey="id"
    for="eox-map#main"
  />
</template>
<script setup>
import { datetime, mapEl } from "@/store/states";
import { eodashCollections } from "@/utils/states";
import "@eox/timeslider";
import { computed } from "vue";

const hasMultipleItems = computed(() => {
  return eodashCollections.some((ec) => {
    const items = ec.collectionStac?.links.filter((l) => l.rel === "item");
    return items && items.length > 1;
  });
});
/**
 *
 * @param {CustomEvent} e
 */
const update = (e) => {
  datetime.value = e.detail.date.toISOString();
};
</script>
