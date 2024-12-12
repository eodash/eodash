<template>
  <v-main>
    <eox-layout :gap="gap" :style="`padding: ${gap}px`">
      <eox-layout-item
        v-if="bgWidget?.component"
        class="bg-panel bg-surface"
        :style="`margin: -${gap}px;`"
        x="0"
        y="0"
        h="12"
        w="12"
      >
        <Suspense suspensible>
          <component
            id="bg-widget"
            :is="bgWidget?.component"
            v-bind="bgWidget?.props"
          />
        </Suspense>
      </eox-layout-item>
      <template v-for="(importedWidget, idx) in importedWidgets" :key="idx">
        <Transition name="fade">
          <eox-layout-item
            v-if="importedWidget.value.component"
            :key="importedWidget.value.id"
            class="panel bg-surface"
            :h="importedWidget.value.layout.h"
            :w="importedWidget.value.layout.w"
            :x="importedWidget.value.layout.x"
            :y="importedWidget.value.layout.y"
          >
            <Suspense suspensible>
              <component
                :key="importedWidget.value.id"
                :is="importedWidget.value.component"
                v-bind="importedWidget.value.props"
              />
            </Suspense>
          </eox-layout-item>
        </Transition>
      </template>
    </eox-layout>
  </v-main>
</template>
<script setup>
import "@eox/layout";
import { useDefineTemplate } from "@/composables/DefineTemplate";

const { bgWidget, importedWidgets, gap } = useDefineTemplate();
</script>
<style scoped>
.panel {
  position: relative;
  overflow: visible;
  z-index: 1;
}

.bg-panel {
  z-index: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bg-surface {
  backdrop-filter: blur(9.5px) !important;
  background-color: #ffffff99 !important;
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  border-color: #fff;
}
</style>
