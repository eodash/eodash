<template>
  <div ref="rootRef">
    <v-tooltip v-if="!mobile" :text="`Switch to ${target} mode`">
      <template v-slot:activator="{ props }">
        <v-icon
          v-bind="props"
          @click="activeTemplate = target"
          :icon="[icon]"
        ></v-icon>
      </template>
    </v-tooltip>
    <v-icon v-else @click="activeTemplate = target" :icon="[icon]"></v-icon>
  </div>
</template>

<script setup>
import { activeTemplate } from "@/store/states";
import { mdiViewDashboard } from "@mdi/js";
import { useTransparentPanel } from "@/composables";
import { ref } from "vue";
import { useDisplay } from "vuetify/lib/composables/display";

const { mobile } = useDisplay();
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
useTransparentPanel(rootRef);
</script>
