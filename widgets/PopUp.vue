<template>
  <span>
    <v-dialog
      max-width="500px"
      max-height="500px"
      absolute
      scrollable
      scroll-strategy="block"
      close-on-back
      v-model="dialog"
    >
      <v-sheet>
        <component
          v-if="widget"
          :is="definedWidget.component"
          :key="definedWidget.id"
          v-bind="definedWidget.props"
        />
        <span v-if="$slots.default">
          <slot />
        </span>
      </v-sheet>
    </v-dialog>
  </span>
</template>
<script setup>
import { useDefineWidgets } from "@/composables/DefineWidgets";

const dialog = defineModel({ type: Boolean, required: true, default: false });

const props = defineProps({
  widget: {
    /** @type {import("vue").PropType<import("@/types").Widget>} */
    type: Object,
    default: undefined,
  },
});

const [definedWidget] = useDefineWidgets([props?.widget]);
</script>
