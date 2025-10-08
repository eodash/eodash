<template>
  <eox-timeslider
    v-if="hasMultipleItems"
    :key="mapEl"
    @update="update"
    .externalMapRendering="true"
    .filters="filters"
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

defineProps({
  filters: {
    type: Array,
    default: () => [],
  },
});

const hasMultipleItems = computed(() => {
  return eodashCollections.some((ec) => {
    const itemLinks = ec.collectionStac?.links.filter((l) => l.rel === "item");
    const itemsLink = ec.collectionStac?.links.some((l) => l.rel === "items");
    return (itemLinks && itemLinks.length > 1) || itemsLink;
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
