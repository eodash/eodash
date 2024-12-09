<template>
  <div>
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
import { mdiPlus } from "@mdi/js";

const props = defineProps({
  widget: {
    /** @type {import("vue").PropType<import("@/types").Widget>} */
    type: Object,
    default: undefined,
  },
});

const [definedWidget] = useDefineWidgets([props?.widget]);
</script>
