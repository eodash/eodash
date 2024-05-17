<template>
  <v-app>
    <Suspense>
      <Dashboard :on-template-mount="setStylesFromHead" :config="config" />
      <template #fallback>
        <div style="height: 100dvh; display: flex; align-items: center; justify-content: center;">
          <Loading />
        </div>
      </template>
    </Suspense>
  </v-app>
</template>
<script setup>
import Dashboard from '@/views/Dashboard.vue';
import { createApp, getCurrentInstance } from "vue"
import { registerPlugins } from '@/plugins';
import { eodashKey } from '@/utils/keys';
import Loading from '@/components/Loading.vue';

defineProps({
  config: {
    type: String,
  }
})
const app = createApp({})
registerPlugins(app)

const inst = getCurrentInstance()
//@ts-expect-error
Object.assign(inst.appContext, app._context)
//@ts-expect-error
Object.assign(inst.provides, app._context.provides)

function setStylesFromHead() {
  const eodashComponent = document.querySelector('eo-dash')
  const styleSheet = new CSSStyleSheet()
  const head = document.querySelector('head')
  let stylesStr = ''

  Array.from(head?.children ?? []).forEach((child) => {
    if (child.getAttribute('type') === 'text/css') {
      stylesStr += `\n ${child.innerHTML}`
      return
    }

    if (child.tagName == 'LINK' && child.getAttribute('rel')?.includes('stylesheet')) {
      eodashComponent?.shadowRoot?.appendChild(child.cloneNode(true))
    }
  });

  stylesStr += `\n * {
    font-family:${
      //@ts-expect-error
      /** @type {import("@/types").Eodash} */ (inst.provides[eodashKey])?.brand.font?.family ?? 'Roboto'}
  }
${//@ts-expect-error
  /** @type {import("@/types").Eodash} */ (inst.provides[eodashKey]).brand.noLayout ?
      `div.v-application__wrap {
  min-height: fit-content;
}`: ""}
  `
  styleSheet.replaceSync(stylesStr.replaceAll(":root", ":host"))
  eodashComponent?.shadowRoot?.adoptedStyleSheets.push(styleSheet)
}
</script>
