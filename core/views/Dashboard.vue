<template>
  <HeaderComponent v-if="!eodash.brand.noLayout" />
  <Suspense>
    <TemplateComponent
      :style="`height: ${eodash.brand.noLayout ? '90dvh' : 'calc(100dvh - ' + mainRect['top'] + mainRect['bottom'] + 'px)'}`" />
  </Suspense>
  <FooterComponent v-if="!eodash.brand.noLayout" />
</template>

<script setup>
import { useEodashRuntime } from "@/composables/DefineEodash";
import { useUpdateTheme } from "@/composables";
import { useSTAcStore } from '@/store/stac';
import { defineAsyncComponent } from "vue";
import { useDisplay, useLayout } from "vuetify/lib/framework.mjs";
import { loadFont } from '@/utils'
import { useSeoMeta } from "@unhead/vue"

const props = defineProps(['config'])

const eodash = await useEodashRuntime(props.config)

// useRouteParams()

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

useSeoMeta(eodash.brand.meta ?? {})
</script>

<style scoped lang="css">
html {
  overflow: hidden;
}

* {
  font-family: v-bind('fontFamily');
}
</style>
