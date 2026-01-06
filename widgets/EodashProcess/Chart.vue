<template>
  <div ref="container" class="pb-0">
    <eox-chart
      ref="chartElRef"
      class="chart"
      v-if="usedChartData && usedChartSpec"
      .spec="toRaw(usedChartSpec)"
      .dataValues="toRaw(usedChartData)"
      @click:item="onChartClick"
      :style="chartStyles"
      .opt="vegaEmbedOptions"
    />
  </div>
</template>
<script setup>
import "@eox/chart";

import { computed, toRaw, useTemplateRef, watch } from "vue";
import {
  chartEl,
  compareChartEl,
} from "@/store/states";
import { onChartClick } from "./methods/handling";
import { chartData, compareChartData, chartSpec, compareChartSpec } from "@/store/states";

const { enableCompare, vegaEmbedOptions } = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
  vegaEmbedOptions: {
    type: Object,
    default() {
      return { actions: true };
    },
  },
});

const usedChartData = computed(() => {
  return enableCompare ? compareChartData.value : chartData.value;
});

const usedChartSpec = computed(() => {
  return enableCompare ? compareChartSpec.value : chartSpec.value;
});

const chartElRef =
  /** @type {Readonly<import("vue").ShallowRef<import("@eox/chart").EOxChart | null>>} */ (
    useTemplateRef("chartElRef")
  );

const containerEl = useTemplateRef("container");

const chartStyles = computed(() => {
  /** @type {Record<string,string>} */
  const styles = {};
  if (!usedChartSpec?.["height"]) {
    styles["height"] =
      Math.max(
        (containerEl.value?.offsetHeight ?? 0),
        200,
      ) + "px";
  }
  return styles;
});

// Assign chart element to global state based on compare mode
watch(chartElRef, (newVal) => {
  if (enableCompare) {
    compareChartEl.value = newVal;
  } else {
    chartEl.value = newVal;
  }
});
</script>
<style>
eox-chart {
  --background-color: transparent;
  padding-top: 1em;
}

</style>
