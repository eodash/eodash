<template>
  <v-main class="pa-0">
    <eox-layout
      :mediaBreakpoints="[0, 960, 1920]"
      :gap="gap"
      :style="layoutStyle"
    >
      <eox-layout-item
        v-if="bgWidget?.component"
        :key="bgWidget.id"
        class="bg-panel"
        :style="`margin: -${gap + 1}px;`"
        x="0"
        y="0"
        h="12"
        w="12"
      >
        <Suspense>
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
            class="panel"
            :h="importedWidget.value.layout.h"
            :w="importedWidget.value.layout.w"
            :x="importedWidget.value.layout.x"
            :y="importedWidget.value.layout.y"
          >
            <Suspense>
              <div class="bg-surface pointer">
                <component
                  :key="importedWidget.value.id"
                  :is="importedWidget.value.component"
                  v-bind="importedWidget.value.props"
                />
              </div>
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

const layoutStyle = {
  padding: gap.value + "px",
  overflow: "hidden !important",
};
</script>
<style scoped>
.panel {
  position: relative;
  overflow: auto;
  z-index: 1;
  pointer-events: none;
}

.pointer {
  pointer-events: all;
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
.bg-surface,
.bg-primary {
  backdrop-filter: blur(10px) !important;
  border-radius: 8px;
  border: none;
  box-shadow:
    0px 0px 1px rgba(24, 39, 75, 0.22),
    0px 6px 12px -6px rgba(24, 39, 75, 0.12),
    0px 8px 24px -4px rgba(24, 39, 75, 0.08);
  max-height: 100%;
  overflow: auto;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.2) transparent;
  scrollbar-width: thin;
}
.bg-surface {
  background-color: rgba(
    var(--v-theme-surface),
    var(--v-surface-opacity, 0.8)
  ) !important;
}
.bg-primary {
  background-color: rgba(
    var(--v-theme-primary),
    var(--v-primary-opacity, 0.8)
  ) !important;
}
</style>
