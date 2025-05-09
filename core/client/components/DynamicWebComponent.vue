<template>
  <span class="d-flex flex-column fill-height overflow-auto">
    <component :is="tagName" v-bind="properties" ref="elementRef" />
  </span>
</template>

<script async setup>
import { useSTAcStore } from "@/store/stac";
import { onUnmounted as whenUnMounted, onMounted as whenMounted } from "vue";
import { ref } from "vue";

const props = /** @type {import("@/types").WebComponentProps} */ (
  defineProps({
    link: {
      type: [String, Function],
      required: true,
    },
    constructorProp: String,
    tagName: {
      type: String,
      required: true,
    },
    properties: {
      type: Object,
      default: () => {
        return {};
      },
    },
    onMounted: Function,
    onUnmounted: Function,
  })
);

const getWebComponent = async () =>
  typeof props.link === "string"
    ? await import(/* @vite-ignore */ props.link)
    : await props.link?.();

const imported = !customElements.get(props.tagName)
  ? await getWebComponent().catch((e) => {
      console.error(e);
    })
  : null;

const defined = customElements.get(props.tagName);

// if the imported link doesn't define the custom tag provided
if (!defined && props.constructorProp) {
  try {
    const Constructor = imported[props.constructorProp];
    customElements.define(props.tagName, Constructor);
  } catch (e) {
    console.error(
      `[eodash] ${props.tagName} is not defined, please add a valid link or constructorProp`,
    );
    console.error(e);
  }
}

const store = useSTAcStore();

/**
 * @typedef {HTMLElement & Record<string | number | symbol, unknown>} CustomElement
 * @type {import("vue").Ref<CustomElement | null>}
 */
const elementRef = ref(null);

whenMounted(() => {
  props.onMounted?.(elementRef.value, store);
});

whenUnMounted(() => {
  props.onUnmounted?.(elementRef.value, store);
});
</script>
