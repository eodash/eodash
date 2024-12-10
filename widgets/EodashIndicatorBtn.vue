<template>
  <div ref="rootRef" class="d-flex flex-column my-3 pa-2">
    <v-btn
      color="blue-darken-4"
      :append-icon="[mdiPlus]"
      text="Choose indicator"
    >Choose indicator</v-btn>
      <component
        v-if="widget"
        :is="definedWidget.component"
        :key="definedWidget.id"
        v-bind="definedWidget.props"
      />
  </div>
</template>
<script setup>
import { useDefineWidgets } from "@/composables/DefineWidgets";
import { makePanelTransparent } from "@/composables";
import { ref } from "vue";
import { mdiPlus } from "@mdi/js";

const props = defineProps({
  widget: {
    /** @type {import("vue").PropType<import("@/types").Widget>} */
    type: Object,
    default: undefined,
  },
});

const [definedWidget] = useDefineWidgets([props?.widget]);

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);
makePanelTransparent(rootRef);
</script>
