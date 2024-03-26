<template>
  <HeaderComponent />
  <TemplateComponent :style="`height: calc(100dvh - ${mainRect['top'] + mainRect['bottom']}px)`" />
  <FooterComponent />
</template>

<script setup>
import { useEodashRuntime } from "@/composables/DefineEodash";
import { useRouteParams, useUpdateTheme } from "@/composables";
import { useSTAcStore } from '@/store/stac';
import { defineAsyncComponent } from "vue";
import { useDisplay, useLayout } from "vuetify/lib/framework.mjs";
import { loadFont } from '@/utils'


const eodashConfig = await useEodashRuntime()

useRouteParams()

const theme = useUpdateTheme('dashboardTheme', eodashConfig.brand?.theme)
theme.global.name.value = 'dashboardTheme'

const fontFamily = await loadFont(eodashConfig.brand?.font?.family, eodashConfig.brand?.font?.link)

const { loadSTAC } = useSTAcStore()
await loadSTAC()
const { smAndDown } = useDisplay()
const TemplateComponent = smAndDown.value ?
  defineAsyncComponent(() => import(`@/components/MobileLayout.vue`)) :
  defineAsyncComponent(() => import(`@/components/DashboardLayout.vue`))

const HeaderComponent = defineAsyncComponent(() => import(`@/components/Header.vue`))
const FooterComponent = defineAsyncComponent(() => import(`@/components/Footer.vue`))
const { mainRect } = useLayout()
</script>

<style scoped lang="scss">
html {
  overflow: hidden;
}

* {
  font-family: v-bind('fontFamily');
}
</style>
