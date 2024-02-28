<template>
  <span class="d-flex flex-column fill-height overflow-auto">
    <component :is="tagName" v-bind="properties" ref="elementRef" />
  </span>
</template>
<script async setup>
import modulesMap from '@/modulesMap';
import { useSTAcStore } from '@/store/stac';
import {
  onUnmounted as whenUnMounted,
  onMounted as whenMounted
} from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  link: {
    type: String,
    required: true
  },
  node_module: Boolean,
  constructorProp: String,
  tagName: {
    type: String,
    required: true
  },
  properties: {
    type: Object,
    default: () => {
      return {}
    }
  },
  onMounted: Function,
  onUnmounted: Function
})

const getWebComponent = async () => props.node_module ?
  await modulesMap[/** @type {keyof typeof modulesMap} */(props.link)]()
  : await import( /* @vite-ignore */props.link)

const imported = await getWebComponent().catch(e => {
  console.error(e)
})

const defined = customElements.get(props.tagName)

// if the imported link doesn't define the custom tag provided
if (!defined && props.constructorProp) {
  const Constructor = imported[props.constructorProp]
  customElements.define(props.tagName, Constructor)
}

const store = useSTAcStore()

/**
 *  @typedef {HTMLElement &
 * Record<string|number|symbol,unknown>} CustomElement
 * @type {import('vue').Ref<CustomElement|null>}
 */
const elementRef = ref(null)
const router = useRouter()

whenMounted(() => {
  if (props.onMounted && elementRef.value) {
    /** @type {DynamicWebComponentProps} */
    (props).onMounted(elementRef.value, store, router)?.catch(err => {
      console.error(err)
    })
  }
})

whenUnMounted(() => {
  if (props.onUnmounted && elementRef.value) {
    /** @type {DynamicWebComponentProps}  */
    (props).onUnmounted(elementRef.value, store, router)?.catch(err => {
      console.error(err)
    })
  }
})
</script>
