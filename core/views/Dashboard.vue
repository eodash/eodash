<template>
  <HeaderComponent v-if="!eodash.brand.noLayout" />
  <ErrorAlert v-model="error" />
  <Suspense>
    <TemplateComponent @vue:mounted="onTemplateMount?.()"
      :style="`height: ${eodash.brand.noLayout ? (onTemplateMount ? '100%' : '90dvh') : 'calc(100dvh - ' + mainRect['top'] + mainRect['bottom'] + 'px)'}`" />
    <template #fallback>
      <div style="height: 100dvh; display: flex; align-items: center; justify-content: center;">
        <Loading />
      </div>
    </template>
  </Suspense>
  <FooterComponent v-if="!eodash.brand.noLayout" />
</template>

<script setup>
import { useEodashRuntime } from "@/composables/DefineEodash";
import { useURLSearchParametersSync, useUpdateTheme } from "@/composables";
import { useSTAcStore } from '@/store/stac';
import { defineAsyncComponent, onErrorCaptured, onMounted, ref } from "vue";
import { useDisplay, useLayout } from "vuetify/lib/framework.mjs";
import { loadFont } from '@/utils'
import Loading from "@/components/Loading.vue";
import ErrorAlert from "@/components/ErrorAlert.vue";

const props = defineProps({
  config: {
    type: String
  },
  onTemplateMount: {
    type: Function
  }
})

const eodash = await useEodashRuntime(props.config)

useURLSearchParametersSync();

const theme = useUpdateTheme('dashboardTheme', eodash.brand?.theme)
theme.global.name.value = 'dashboardTheme'

await loadFont(eodash.brand?.font?.family, eodash.brand?.font?.link)

const { loadSTAC } = useSTAcStore()
await loadSTAC()

const { smAndDown } = useDisplay()
const TemplateComponent = smAndDown.value ?
  defineAsyncComponent(() => import(`@/components/MobileLayout.vue`)) :
  defineAsyncComponent(() => import(`@/components/DashboardLayout.vue`))

const HeaderComponent = defineAsyncComponent(() => import(`@/components/Header.vue`))
const FooterComponent = defineAsyncComponent(() => import(`@/components/Footer.vue`))
const { mainRect } = useLayout()

onMounted(() => {
  const htmlTag = /** @type {HTMLElement}  */(document.querySelector('html'))
  htmlTag.style.overflow = 'hidden';
})

const error = ref('')
onErrorCaptured((e, comp, info) => {
  error.value = `
  error: ${e}.
  component: ${comp?.$.type.name}.
  info: ${info}.
  `
})

</script>
