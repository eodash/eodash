<template>
  <v-main class="overflow-none" style="height: 91dvh;">

    <component :is="bgWidget.component" v-bind="bgWidget.props"></component>

    <v-row no-gutters class="d-flex justify-center align-end">
      <v-col v-for="(importedWidget, idx) in importedWidgets" :key="idx" :cols="cols"
        class="flex-column fill-height fill-width elevation-1 align-start ma-0 justify-center">
        <span class="d-flex pa-2 justify-center ma-0 panel-header align-center fill-width"
          @click="handleSelection(idx)">
          {{ importedWidget.value.title }}
        </span>
        <div v-show="activeIdx === idx" class="overlay align-self-end overflow-auto pa-2">
          <v-btn icon variant="text" class="close-btn" @click="activeIdx = -1">&#x2715;</v-btn>
          <component :key="importedWidget.value.id" :is="importedWidget.value.component" v-show="activeIdx === idx"
            v-bind="importedWidget.value.props" />
        </div>
      </v-col>
    </v-row>
  </v-main>
</template>
<script setup>
import { eodashKey } from '@/store/Keys';
import { inject } from 'vue';
import { useDefineWidgets } from '@/composables/DefineWidgets'
import { ref } from 'vue';

const eodash = /** @type {import("@/types").Eodash} */(inject(eodashKey));

//import widgets
const widgetsConfig = eodash.template.widgets
const importedWidgets = useDefineWidgets(widgetsConfig)
const [bgWidget] = useDefineWidgets([eodash.template?.background])



/**
 * number of flex columns
 */
const cols = importedWidgets.length / 12

/**
 * index of the active tab
 */
const activeIdx = ref(-1)

/**
* @param {number} idx
**/
const handleSelection = (idx) => {
  activeIdx.value = activeIdx.value === idx ? -1 : idx
}
</script>
<style scoped lang='scss'>
.panel-header {
  height: auto;
  margin: 0;
  width: 100%;
  position: relative;
  bottom: 64px;
  z-index: 10;
  background: rgb(var(--v-theme-background));
}

.overlay {
  position: absolute;
  width: 100%;
  left: 0;
  top: 64px;
  bottom: 64px;
  z-index: 1;
  background: rgb(var(--v-theme-background));
}

.close-btn {
  justify-self: end;
}
</style>
