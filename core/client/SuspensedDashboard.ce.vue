<template>
  <v-app ref="vAppRef">
    <Suspense>
      <Dashboard :on-template-mount="setStylesFromHead" :config="config" />

      <template #fallback>
        <ErrorAlert @vue:mounted="setStylesFromHead()" v-model="error" />
      </template>
    </Suspense>
  </v-app>
</template>
<script setup>
import Dashboard from '@/views/Dashboard.vue';
import { createApp, getCurrentInstance, onErrorCaptured, ref } from "vue"
import { registerPlugins } from '@/plugins';
import { eodashKey } from '@/utils/keys';
import ErrorAlert from '@/components/ErrorAlert.vue';

defineProps({
  config: {
    type: String,
  }
});

/** @type { import("vue").Ref<import("vuetify/components").VApp| null > } */
const vAppRef = ref(null)
const app = createApp({})
registerPlugins(app)

const inst = getCurrentInstance()

Object.assign(inst?.appContext ?? {}, app._context)

//@ts-expect-error Property 'provides' does not exist on type 'ComponentInternalInstance'
Object.assign(inst?.provides ?? {}, app._context.provides)

/** @param {import("vue").Ref<HTMLElement | import("vue").ComponentPublicInstance>[]} [hiddenElements] */
function setStylesFromHead(hiddenElements) {
  const eodashShadowRoot = vAppRef.value?.$el.getRootNode()
  const styleSheet = new CSSStyleSheet()
  const head = document.querySelector('head')
  let stylesStr = ''

  Array.from(head?.children ?? []).forEach((child) => {
    if (child.getAttribute('type') === 'text/css') {
      stylesStr += `\n ${child.innerHTML}`
      return
    }

    if (child.tagName == 'LINK' && child.getAttribute('rel')?.includes('stylesheet')) {
      eodashShadowRoot?.appendChild(child.cloneNode(true))
    }
  });

  stylesStr += `\n
      ${//@ts-expect-error Property 'provides' does not exist on type 'ComponentInternalInstance'
        /** @type {import("@/types").Eodash} */ (inst?.provides[eodashKey])?.brand.noLayout ?
      `div.v-application__wrap {
          min-height: fit-content;
        }`: ""}
        `
  styleSheet.replaceSync(stylesStr.replaceAll(":root", ":host"))
  eodashShadowRoot?.adoptedStyleSheets.push(styleSheet);

  //@ts-expect-error Property 'provides' does not exist on type 'ComponentInternalInstance'
  if (hiddenElements && !(/** @type {import("@/types").Eodash} */ (inst.provides[eodashKey])?.brand.noLayout)) {
    hiddenElements.forEach(element => {
      if (element.value) {
        if (element.value instanceof HTMLElement) {
          element.value.style.opacity = "1"
        } else {
          /** @type {HTMLElement} */
          (element.value.$el).style.opacity = "1"
        }
      }
    })
  }
}

const error = ref('')
onErrorCaptured((e, comp, info) => {
  error.value = `
  ${e}.
  component: ${comp?.$.type.name}.
  info: ${info}.
  `
})
</script>
