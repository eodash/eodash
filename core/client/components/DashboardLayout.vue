<template>
  <v-main>
    <eox-layout :gap="gap" :style="`padding: ${gap}px`">
      <eox-layout-item
        v-if="bgWidget?.component"
        class="bg-panel bg-surface"
        :style="`margin: -${gap + 1}px;`"
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
            :id="importedWidget.value.id.toString()"
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
  border-radius: 0px !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
:deep(.bg-surface) {
  backdrop-filter: blur(9.5px) !important;
  background-color: rgba(
    var(--v-theme-surface),
    var(--v-surface-opacity, 0.8)
  ) !important;
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  border-color: rgb(var(--v-theme-surface));
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.2) transparent;
  scrollbar-width: thin;
}
:deep(.bg-primary) {
  backdrop-filter: blur(9.5px) !important;
  background-color: rgba(
    var(--v-theme-primary),
    var(--v-primary-opacity, 0.8)
  ) !important;
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  border-color: rgb(var(--v-theme-primary));
  scrollbar-color: rgba(var(--v-theme-on-primary), 0.2) transparent;
  scrollbar-width: thin;
}
</style>
