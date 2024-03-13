<template>
  <details is="animated-details" v-for="mod, idx in importedWidgets" ref="detailsEls" :key="idx" class="overflow-auto"
    exclusive>
    <summary ref="summaryEls">{{ mod.value.title }}</summary>
    <span :style="{ height: widgetHeight }" class="d-flex flex-column">
      <component :is="mod.value.component" v-bind="mod.value.props" />
    </span>
  </details>
</template>
<script setup>
import { useDefineWidgets } from '@/composables/DefineWidgets';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useLayout } from 'vuetify/lib/framework.mjs';
import 'animated-details'

const props = defineProps({
  widgets: {
    /** @type {import('vue').PropType<Omit<import("@/types").WidgetConfig,'layout'>[]>} */
    type: Array,
    required: true,
  }
})

const importedWidgets = useDefineWidgets(props.widgets)

/**
 *  details elements template ref
 * @type {import('vue').Ref<HTMLDetailsElement[]>}
 **/
const detailsEls = ref([])
/**
 *  summary elements template ref
 * @type {import('vue').Ref<HTMLDetailsElement[]>}
 **/
const summaryEls = ref([])
const widgetHeight = ref('')
const summariesHeights = ref(0)


onMounted(() => {
  summariesHeights.value = summaryEls.value.reduce((acc, el) => acc += el.clientHeight, 0)
  const { mainRect } = useLayout()
  widgetHeight.value = ((detailsEls.value[0].parentElement?.scrollHeight ?? 0) - summariesHeights.value - mainRect.value['top']) + 'px'
})
</script>
