<template>
  <span class="d-flex flex-column fill-height overflow-auto pa-4">
    <eox-layercontrol ref="eoxLayercontrol" />
  </span>
</template>
<script setup>
import "@eox/layercontrol";
import "@eox/jsonform";
import "@eox/timecontrol"

import { onMounted, ref } from "vue";
import { mapEl } from "@/store/States";
/** @type { import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxLayercontrol = ref(null);

onMounted(() => {
  /** @type{ HTMLElement & Record<string,any> }*/
  (eoxLayercontrol.value).for = mapEl.value;
});
</script>
