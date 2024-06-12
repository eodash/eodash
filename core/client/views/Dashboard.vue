<template>
  <HeaderComponent ref="headerRef" v-if="!eodash.brand.noLayout" />
  <ErrorAlert v-model="error" />
  <Suspense>
    <TemplateComponent @vue:mounted="onTemplateMount?.(hiddenElements)" class="template" />
    <template #fallback>
      <div class="loading-container">
        <Loading />
      </div>
    </template>
  </Suspense>
  <FooterComponent ref="footerRef" v-if="!eodash.brand.noLayout" />
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

await loadFont(eodash.brand?.font?.family, eodash.brand?.font?.link, !!props.onTemplateMount)

const { loadSTAC } = useSTAcStore()
await loadSTAC()

const { smAndDown } = useDisplay()
const TemplateComponent = smAndDown.value ?
  defineAsyncComponent(() => import(`@/components/MobileLayout.vue`)) :
  defineAsyncComponent(() => import(`@/components/DashboardLayout.vue`))

const HeaderComponent = defineAsyncComponent(() => import(`@/components/Header.vue`))
const FooterComponent = defineAsyncComponent(() => import(`@/components/Footer.vue`))
const { mainRect } = useLayout()
const templateHeight = eodash.brand.noLayout ? (props.onTemplateMount ? '100%' : '90dvh') :
  `calc(100dvh - ${mainRect.value['top'] + mainRect.value['bottom']}px)`


/** @type {import("vue").Ref<InstanceType<typeof
 *  import("@/components/Header.vue").default >|null>}
 **/
const headerRef = ref(null);
/** @type {import("vue").Ref<InstanceType<typeof
 *  import("@/components/Footer.vue").default >|null>}
 **/
const footerRef = ref(null);

const hiddenElements = [headerRef, footerRef]

onMounted(() => {
  if (props.onTemplateMount && !eodash.brand.noLayout) {
    hiddenElements.forEach(element => {
      /** @type {HTMLElement} */
      // @ts-expect-error
      (element.value.$el).style.opacity = "0"
    })
  }
})

const error = ref('')
onErrorCaptured((e, comp, info) => {
  error.value = `
  ${e}.
  component: ${comp?.$.type.name}.
  info: ${info}.
  `
})

</script>
<style>
html {
  overflow: hidden !important;
}

.template {
  height: v-bind("templateHeight")
}

.loading-container {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
