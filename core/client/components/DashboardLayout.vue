<template>
  <v-main>
    <eox-layout
      :gap="eodash.template.gap ?? 16"
      :style="`padding: ${eodash.template.gap || 16}px`"
    >
      <eox-layout-item
        v-if="bgWidget.component"
        class="bg-panel bg-surface"
        :style="`margin: -${eodash.template.gap ?? 16}px;`"
        x="0"
        y="0"
        h="12"
        w="12"
      >
        <Suspense suspensible>
          <component
            id="bg-widget"
            :is="bgWidget.component"
            v-bind="bgWidget.props"
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
import { eodashKey } from "@/utils/keys";
import { inject } from "vue";
import { useDefineWidgets } from "@/composables/DefineWidgets";
import "@eox/layout";

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));

const [bgWidget] = useDefineWidgets([eodash.template?.background]);

const importedWidgets = useDefineWidgets(eodash.template?.widgets);
</script>
<style scoped>
.panel {
  position: relative;
  overflow: visible;
  z-index: 1;
  border-radius: 0px;
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
</style>
