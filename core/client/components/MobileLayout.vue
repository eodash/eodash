<template>
  <v-main class="overflow-hidden main">
    <Suspense suspensible>
      <component
        id="bg-widget"
        v-if="bgWidget?.component"
        :key="bgWidget.id"
        :is="bgWidget.component"
        v-bind="bgWidget.props"
      ></component>
    </Suspense>

    <template v-for="(importedWidget, idx) in importedWidgets" :key="idx">
      <div
        v-if="importedWidget.value.component"
        v-show="activeIdx === idx"
        id="overlay"
        class="pa-2 panel bg-surface"
      >
        <div class="d-flex py-2 justify-end align-end">
          <v-btn icon variant="text" class="close-btn" @click="activeIdx = -1"
            >&#x2715;</v-btn
          >
        </div>
        <Suspense suspensible>
          <div class="component-container" v-show="activeIdx === idx">
            <component
              :key="importedWidget.value.id"
              :is="importedWidget.value.component"
              v-bind="importedWidget.value.props"
            />
          </div>
        </Suspense>
      </div>
    </template>

    <v-tabs
      ref="tabs"
      align-tabs="center"
      bg-color="surface"
      class="tabs"
      show-arrows
      v-model="activeIdx"
    >
      <template v-for="(importedWidget, idx) in importedWidgets" :key="idx">
        <v-tab v-if="importedWidget.value.component" :value="idx">
          {{ importedWidget.value.title }}
        </v-tab>
      </template>
    </v-tabs>
  </v-main>
</template>
<script setup>
import { useDefineTemplate } from "@/composables/DefineTemplate";
import { ref, onMounted } from "vue";
import { useLayout } from "vuetify";

const { bgWidget, importedWidgets } = useDefineTemplate();
const { mainRect } = useLayout();

const activeIdx = ref(-1);

/** @type {import("vue").Ref<import("vuetify/components").VTabs | null>} */
const tabs = ref(null);
const tabsHeightFromBtm = ref("");
const mainRectTopPx = ref("");
const mainRectBtmPx = ref("");

onMounted(() => {
  mainRectTopPx.value = mainRect.value.top + "px";
  mainRectBtmPx.value = (mainRect.value.bottom || 48) + "px";
  tabsHeightFromBtm.value =
    mainRect.value.bottom + (tabs.value?.$el?.clientHeight ?? 48) + "px";
});
</script>
<style scoped>
.panel {
  bottom: v-bind("tabsHeightFromBtm");
  position: absolute;
  overflow: hidden;
  width: 100%;
  left: 0;
  z-index: 1;
}

.component-container {
  height: 90%;
}

.close-btn {
  height: 5%;
  position: relative;
}

.tabs {
  bottom: v-bind("mainRectBtmPx");
  position: relative;
  z-index: 10;
}
:deep(.bg-surface) {
  backdrop-filter: blur(10px) !important;
  background-color: rgba(
    var(--v-theme-surface),
    var(--v-surface-opacity, 0.8)
  ) !important;
}
</style>
