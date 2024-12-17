<template>
  <div ref="rootRef">
    <v-tooltip :text="`Switch to ${target} mode`">
      <template v-slot:activator="{ props }">
        <v-icon
          v-bind="props"
          @click="activeTemplate = target"
          :icon="[icon]"
        ></v-icon>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup>
import { activeTemplate } from "@/store/States";
import { mdiViewDashboard } from "@mdi/js";
import { makePanelTransparent } from "@/composables";
import { ref } from "vue";

defineProps({
  target: {
    type: String,
    default: "main",
  },
  // mdi/js icon
  icon: {
    type: String,
    default: mdiViewDashboard,
  },
});

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);
makePanelTransparent(rootRef);
</script>
