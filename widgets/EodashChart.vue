<template>
  <span>
    <div id="vega-container" ref="vegaChart"></div>
  </span>
</template>
<script setup>
import vegaEmbed from "vega-embed";
import { onMounted, toRaw, watch } from "vue";
import { ref } from "vue";

const props = defineProps({
  spec: {
    /** @type {import("vue").PropType<import("vega").Spec>} */
    type: Object,
    default: () => ({}),
  },
});

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const vegaChart = ref(null);

onMounted(() => {
  watch(
    props.spec,
    async () => {
      if (props.spec) {
        await vegaEmbed(
          /** @type {HTMLDivElement} */ (vegaChart.value),
          toRaw(props.spec),
        );
      }
    },
    { immediate: true },
  );
});
</script>
