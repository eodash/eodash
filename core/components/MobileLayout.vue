<template>
  <v-main class="overflow-hidden" style="height: 91dvh;">
    <Suspense suspensible>
      <component id="bg-widget" v-if="bgWidget.component" :is="bgWidget.component" v-bind="bgWidget.props"></component>
    </Suspense>

    <template v-for="(importedWidget, idx) in importedWidgets" :key="idx">
      <div v-if="importedWidget.value.component" v-show="activeIdx === idx" id="overlay" class="pa-2" :style="{
        bottom: tabsHeightFromBtm, position: 'absolute', overflow: 'hidden',
        width: '100%', left: 0, top: mainRect.top + 'px', zIndex: 1, background: 'rgb(var(--v-theme-surface))'
      }">
        <v-btn icon variant="text" style="height: 5%;position: relative;" @click="activeIdx = -1">&#x2715;</v-btn>
        <Suspense suspensible>
          <div style="height: 90% !important;" v-show="activeIdx === idx">
            <component :key="importedWidget.value.id" :is="importedWidget.value.component"
              v-bind="importedWidget.value.props" />
          </div>
        </Suspense>
      </div>
    </template>

    <v-tabs ref="tabs" align-tabs="center" bg-color="surface"
      :style="{ position: 'relative', bottom: (mainRect.bottom || 48) + 'px', zIndex: 10 }" show-arrows
      v-model="activeIdx">
      <template v-for="(importedWidget, idx) in importedWidgets" :key="idx">
        <v-tab v-if="importedWidget.value.component" :value="idx">
          {{ importedWidget.value.title }}
        </v-tab>
      </template>
    </v-tabs>

  </v-main>
</template>
<script setup>
import { eodashKey } from '@/utils/keys';
import { inject, ref, onMounted } from 'vue';
import { useDefineWidgets } from '@/composables/DefineWidgets'
import { useLayout } from "vuetify"

const eodash = /** @type {import("@/types").Eodash} */(inject(eodashKey));

//import widgets
const widgetsConfig = eodash.template.widgets
const importedWidgets = useDefineWidgets(widgetsConfig)
const [bgWidget] = useDefineWidgets([eodash.template?.background])

const { mainRect } = useLayout()

const activeIdx = ref(-1)

/** @type {import("vue").Ref<import("vuetify/components").VTabs|null>} */
const tabs = ref(null)
const tabsHeightFromBtm = ref('')
onMounted(() => {
  tabsHeightFromBtm.value = mainRect.value.bottom + (/** @type {HTMLElement} */(tabs.value?.$el)?.clientHeight ?? 0) + "px"
})
</script>
