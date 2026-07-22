<template>
  <div ref="rootRef">
    <v-tooltip v-if="!mobile" :text="`Switch to ${target} mode`">
      <template #activator="{ props }">
        <v-icon
          v-bind="props"
          :icon="[icon]"
          @click="activeTemplate = target"
        ></v-icon>
      </template>
    </v-tooltip>
    <v-icon v-else :icon="[icon]" @click="activeTemplate = target"></v-icon>
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
    default: "expert",
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
