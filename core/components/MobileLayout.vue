<template>
  <v-main class="overflow-hidden" style="height: 91dvh;">

    <component id="bg-widget" :is="bgWidget.component" v-bind="bgWidget.props"></component>

    <div v-show="activeIdx === idx" class="overlay pa-2" :style="{ bottom: tabsBottom }"
      v-for="(importedWidget, idx) in importedWidgets" :key="idx">
      <v-btn icon variant="text" class="close-btn" @click="activeIdx = -1">&#x2715;</v-btn>
      <component :key="importedWidget.value.id" :is="importedWidget.value.component" v-show="activeIdx === idx"
        v-bind="importedWidget.value.props" />
    </div>

    <v-tabs ref="tabs" align-tabs="center" bg-color="surface"
      :style="{ position: 'relative', bottom: mainRect.bottom + 'px', zIndex: 10 }" show-arrows v-model="activeIdx">
      <v-tab v-for="(importedWidget, idx) in importedWidgets" :key="idx" :value="idx">
        {{ importedWidget.value.title }}
      </v-tab>
    </v-tabs>

  </v-main>
</template>
<script setup>
import { eodashKey } from '@/store/Keys';
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
const tabsBottom = ref('')
onMounted(() => {
  tabsBottom.value = mainRect.value.bottom + (/** @type {HTMLElement} */(tabs.value?.$el)?.clientHeight ?? 0) + "px"
})
</script>
<style scoped lang='scss'>
.overlay {
  position: absolute;
  width: 100%;
  left: 0;
  top: 64px;
  z-index: 1;
  background: rgb(var(--v-theme-surface));
}

.close-btn {
  position: relative;
  height: 1rem;
  font-size: 0.8rem;
}
</style>
