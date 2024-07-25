<template>
  <eox-layercontrol ref="eoxLayercontrol" class="pa-4" />
</template>
<script setup>
import "@eox/layercontrol";
import "@eox/jsonform";
import { onMounted, ref } from "vue";
import { mapEl } from "@/store/States";
/** @type { import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxLayercontrol = ref(null);

onMounted(() => {
  /** @type{ HTMLElement & Record<string,any> }*/
  (eoxLayercontrol.value).for = mapEl.value;
});
</script>
