<template>
  <span>
    <eox-chart
      v-if="spec && dataValues"
      .spec="spec"
      .dataValues="dataValues"
    />
  </span>
</template>
<script setup>
defineProps({
  spec: {
    /** @type {import("vue").PropType<import("vega").Spec>} */
    type: Object,
    default: () => ({}),
  },
  dataValues: {
    /** @type {import("vue").PropType<import("vega").Spec>} */
    type: Object,
    default: () => ({}),
  },
});
</script>
