<template>
  <v-main>
    <eox-layout :gap="eodash.template.gap ?? 2">
      <eox-layout-item class="bg-widget" style="z-index: 0;" x="0" y="0" h="12" w="12">
        <component :is="bgWidget.component" v-bind="bgWidget.props" />
      </eox-layout-item>
      <eox-layout-item v-for="(config, idx) in widgetsConfig" ref="itemEls" :key="idx"
        style="position: relative; overflow: visible; z-index: 1;" class="custom-widget" :x="config.layout.x"
        :y="config.layout.y" :h="config.layout.h" :w="config.layout.w">

        <v-btn v-if="slideBtns[idx].enabled" position="absolute" variant="tonal" :style="slideBtns[idx].style"
          class="slide-btn" @click="slideInOut(idx)">
          <v-icon :icon="slideBtns[idx].active ? slideBtns[idx].icon.in : slideBtns[idx].icon.out" />
        </v-btn>
        <component :key="importedWidgets[idx].value.id" :is="importedWidgets[idx].value.component"
          v-bind="importedWidgets[idx].value.props" />

      </eox-layout-item>
    </eox-layout>
  </v-main>
</template>
<script setup>
import { eodashKey } from '@/utils/keys';
import { inject } from 'vue';
import { useDefineWidgets } from '@/composables/DefineWidgets'
import { useSlidePanels } from '@/composables'
import { ref } from 'vue';
import '@eox/layout'

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey))

const [bgWidget] = useDefineWidgets([eodash.template?.background])

const widgetsConfig = eodash.template?.widgets

const importedWidgets = useDefineWidgets(widgetsConfig)
/**
 * Layout items template ref
 * @type {import('vue').Ref<HTMLElement[]>}
 */
const itemEls = ref([])

const { slideBtns, slideInOut } = useSlidePanels(itemEls, widgetsConfig)
</script>
<style scoped lang="css">
eodash-component :host eox-layout-item {
  border-radius: 0px;
  background: rgb(var(--v-theme-surface))
}

.bg-widget {
  z-index: 0;
}

.custom-widget {
  position: relative;
  overflow: visible;
  z-index: 1;
}
</style>
