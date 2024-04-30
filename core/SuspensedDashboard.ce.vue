<template>
  <v-app>
    <Suspense>
      <Dashboard :config="config" />
    </Suspense>
  </v-app>
</template>
<script setup>
import Dashboard from './views/Dashboard.vue';
import { createApp, getCurrentInstance, onMounted } from "vue"
import { registerPlugins } from '@/plugins';

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

onMounted(async () => {
  setStylesFromHead()
})

function setStylesFromHead() {
  setTimeout(() => {
    const eodashComponent = document.querySelector('eo-dash')
    const styleSheet = new CSSStyleSheet()
    const head = document.querySelector('head')
    let stylesStr = ''

    Array.from(head?.children ?? []).forEach((child) => {
      if (child.getAttribute('type') === 'text/css') {
        stylesStr += `\n ${child.innerHTML}`
        return
      }

      if (child.tagName == 'LINK' && child.getAttribute('rel') === 'stylesheet') {
        eodashComponent?.shadowRoot?.appendChild(child.cloneNode(true))
        // child.remove()
      }
    })

    styleSheet.replaceSync(stylesStr.replaceAll(":root", ":host"))
    eodashComponent?.shadowRoot?.adoptedStyleSheets.push(styleSheet)
  }, 1000);
}
</script>
