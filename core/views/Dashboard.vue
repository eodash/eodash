<template>
  <HeaderComponent />
  <TemplateComponent :style="`height: calc(100dvh - ${mainRect['top'] + mainRect['bottom']}px)`" />
  <FooterComponent />
</template>

<script setup>
import { useEodashRuntimeConfig } from "@/composables/DefineConfig";
import { useUpdateTheme } from "@/composables";
import { useSTAcStore } from '@/store/stac';
import { defineAsyncComponent } from "vue";
import { useDisplay, useLayout } from "vuetify/lib/framework.mjs";
import { loadFont } from '@/store/Actions'
import { onUnmounted } from "vue";


const eodashConfig = await useEodashRuntimeConfig()

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

onUnmounted(() => {
  theme.global.name.value = 'light'
})
if (import.meta.hot) {
  import.meta.hot.on('config:update', () => {
    window.location.reload()
  })
}
</script>

<style scoped lang="scss">
* {
  font-family: v-bind('fontFamily');
}
</style>
