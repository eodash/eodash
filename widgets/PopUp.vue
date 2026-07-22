<template>
  <span>
    <v-dialog
      v-bind="config"
      v-model="dialog"
      absolute
      scrollable
      scroll-strategy="block"
      close-on-back
    >
      <v-sheet>
        <component
          :is="definedWidget.component"
          v-if="widget"
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
  maxWidth: {
    type: String,
    default: "500px",
  },
  maxHeight: {
    type: String,
    default: "500px",
  },
  width: {
    type: String,
    default: "500px",
  },
  height: {
    type: String,
    default: "500px",
  },
});

const config = {
  maxWidth: props.maxWidth,
  maxHeight: props.maxHeight,
  width: props.width,
  height: props.height,
};

const [definedWidget] = useDefineWidgets([props?.widget]);
</script>
