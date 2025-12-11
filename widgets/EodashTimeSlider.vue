<template>
  <eox-timeslider
    v-if="hasMultipleItems"
    :key="mapEl"
    @update="onSelect"
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
import { computed, onUnmounted } from "vue";
import { updateMosaicLayer } from "@/eodashSTAC/mosaic";
import { mosaicState } from "@/utils/states";
import { useSTAcStore } from "@/store/stac";
import { getLayers } from "@/store/actions";

const props = defineProps({
  filters: {
    type: Array,
    default: () => [],
  },
  useMosaic: {
    type: Boolean,
    default: false,
  },
});

const store = useSTAcStore();
// need to update the timeslider to accept ranges to test this
// // TODO: move this to a composable
// if (props.useMosaic && store.mosaicEndpoint) {
//   // Initial render
//   await updateMosaicLayer([...getLayers()], store.mosaicEndpoint);
//   mosaicState.showButton = false;
// }

// onUnmounted(() => {
//   mosaicState.showButton = false;
//   mosaicState.filters.time = null;
// });
///

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
const onSelect = async (e) => {
  console.log("timeslider selection", e.detail);

  // const dateVal = e.detail.date.toISOString();

  // if (props.useMosaic && store.mosaicEndpoint) {
  //   const from = e.detail.date[0]
  //   const to = e.detail.date[1]
  //     await updateMosaicLayer(getLayers(), store.mosaicEndpoint, {
  //       collection: "sentinel-2-l2a",
  //       timRange:[from,to]
  //     });
  //     mosaicState.showButton = false;
  // } else {
  //   datetime.value = dateVal;
  // }
};
</script>
