<template>
  <v-main>
    <eox-timeslider
      v-if="hasTimeControlValues"
      :key="mapEl"
      @update="update"
      .externalMapRendering="true"
      titleKey="title"
      layerIdKey="id"
      for="eox-map#main"
    />
  </v-main>
</template>
<script setup>
import { datetime, mapEl } from "@/store/states";
import "@eox/timeslider";
import { computed, toRef } from "vue";
/**
 *
 * @param {CustomEvent} e
 */
const update = (e) => {
  datetime.value = e.detail.date.toISOString();
};
const hasTimeControlValues = computed(() => {
  const layers = toRef(() => mapEl.value?.layers || []);
  const analysisLayers =
    /** @type {import("@eox/map/src/layers").EOxLayerTypeGroup} */ (
      layers.value.find((l) => l.properties?.id === "AnalysisGroup")
    );
  return (
    analysisLayers?.layers &&
    analysisLayers.layers.some((l) => l.properties?.timeControlValues)
  );
});
</script>
