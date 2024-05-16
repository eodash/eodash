<template>
  <v-main>
    <eox-layout :gap="eodash.template.gap ?? 2">
      <eox-layout-item style="z-index: 0;" x="0" y="0" h="12" w="12">
        <Suspense suspensible>
          <component id="bg-widget" :is="bgWidget.component" v-bind="bgWidget.props" />
        </Suspense>
      </eox-layout-item>
      <eox-layout-item v-for="(config, idx) in widgetsConfig" :key="idx"
        style="position: relative; overflow: visible; z-index: 1; border-radius: 0px; background: rgb(var(--v-theme-surface))"
        :x="config.layout.x" :y="config.layout.y" :h="config.layout.h" :w="config.layout.w">

        <Suspense suspensible>
          <component :key="importedWidgets[idx].value.id" :is="importedWidgets[idx].value.component"
            v-bind="importedWidgets[idx].value.props" />
        </Suspense>
      </eox-layout-item>
    </eox-layout>
  </v-main>
</template>
<script setup>
import { eodashKey } from '@/utils/keys';
import { inject } from 'vue';
import { useDefineWidgets } from '@/composables/DefineWidgets'
import '@eox/layout'

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey))

const [bgWidget] = useDefineWidgets([eodash.template?.background])

const widgetsConfig = eodash.template?.widgets

const importedWidgets = useDefineWidgets(widgetsConfig)
</script>
