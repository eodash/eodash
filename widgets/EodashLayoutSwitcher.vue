<template>
  <div ref="rootRef">
    <v-btn
      class="text-none font-weight-bold text-capitalize pa-2"
      :variant="props.variant"
      :append-icon="[mdiDoor]"
      @click="activeTemplate = props.target"
    >
      {{ props.target }} mode
    </v-btn>
  </div>
</template>

<script setup>
import { activeTemplate } from "../core/client/store/States";
import { mdiDoor } from "@mdi/js";
import { makePanelTransparent } from "@/composables";
import { ref } from "vue";

const props = defineProps({
  target: {
    type: String,
    default: "main",
  },
  variant: {
    type: String,
    default: "text",
  },
});

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);
makePanelTransparent(rootRef);
</script>
