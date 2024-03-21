<template>
  <HeaderComponent />
  <TemplateComponent :style="`height: calc(100dvh - ${mainRect['top'] + mainRect['bottom']}px)`" />
  <FooterComponent />
</template>

<script setup>
import { useEodashRuntime } from "@/composables/DefineEodash";
import { useUpdateTheme } from "@/composables";
import { useSTAcStore } from '@/store/stac';
import { defineAsyncComponent } from "vue";
import { useDisplay, useLayout } from "vuetify/lib/framework.mjs";
import { loadFont } from '@/store/Actions'
import { useSeoMeta } from "@unhead/vue"
import { onUnmounted } from "vue";



const eodash = await useEodashRuntime()

const theme = useUpdateTheme('dashboardTheme', eodash.brand?.theme)
theme.global.name.value = 'dashboardTheme'

const fontFamily = await loadFont(eodash.brand?.font?.family, eodash.brand?.font?.link)

const { loadSTAC } = useSTAcStore()
await loadSTAC()
const { smAndDown } = useDisplay()
const TemplateComponent = smAndDown.value ?
  defineAsyncComponent(() => import(`@/components/MobileLayout.vue`)) :
  defineAsyncComponent(() => import(`@/components/DashboardLayout.vue`))

const HeaderComponent = defineAsyncComponent(() => import(`@/components/Header.vue`))
const FooterComponent = defineAsyncComponent(() => import(`@/components/Footer.vue`))
const { mainRect } = useLayout()

onUnmounted(() => {
  theme.global.name.value = 'light'
})

import.meta.hot?.on('reload', () => {
  window.location.reload()
})

useSeoMeta(eodash.brand.meta ?? {})
</script>

<style scoped lang="scss">
* {
  font-family: v-bind('fontFamily');
}
</style>
