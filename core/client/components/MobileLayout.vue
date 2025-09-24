<template>
  <v-main class="overflow-hidden pa-0">
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
          <button
            class="circle small transparent close-btn"
            @click="activeIdx = -1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>close</title>
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
        </div>
        <Suspense suspensible>
          <div
            class="d-flex flex-column justify-center component-container"
            v-show="activeIdx === idx"
          >
            <component
              :key="importedWidget.value.id"
              :is="importedWidget.value.component"
              v-bind="importedWidget.value.props"
            />
          </div>
        </Suspense>
      </div>
    </template>

    <nav class="tabbed tabs">
      <template v-for="(importedWidget, idx) in importedWidgets" :key="idx">
        <a
          v-if="importedWidget.value.component"
          :class="{ active: activeIdx === idx }"
          @click="activeIdx = activeIdx === idx ? -1 : idx"
        >
          <span>{{ importedWidget.value.title }}</span>
        </a>
      </template>
    </nav>
  </v-main>
</template>
<script setup>
import { useDefineTemplate } from "@/composables/DefineTemplate";
import { ref, onMounted } from "vue";
import { useLayout } from "vuetify";

const { bgWidget, importedWidgets } = useDefineTemplate();
const { mainRect } = useLayout();

const activeIdx = ref(-1);

const tabsHeightFromBtm = ref("");
const mainRectTopPx = ref("");
const mainRectBtmPx = ref("");

onMounted(() => {
  mainRectTopPx.value = mainRect.value.top + "px";
  mainRectBtmPx.value = (mainRect.value.bottom || 48) + "px";
  tabsHeightFromBtm.value = mainRect.value.bottom + 48 + 32 + "px"; // 48px nav height + 32px bottom offset
});
</script>
<style scoped>
@import url("@eox/ui/style.css");

#bg-widget {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.panel {
  bottom: v-bind("tabsHeightFromBtm");
  top: v-bind("mainRectTopPx");
  position: absolute;
  overflow: hidden;
  width: 100%;
  left: 0;
  z-index: 3;
}

.component-container {
  height: 90%;
}

.close-btn {
  height: 5%;
  position: relative;
}

.tabs {
  position: fixed;
  bottom: 32px;
  left: 12px;
  right: 12px;
  width: calc(100% - 24px);
  height: 48px;
  z-index: 10;
  background: white;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
:deep(.bg-surface) {
  backdrop-filter: blur(10px) !important;
  background-color: rgba(
    var(--v-theme-surface),
    var(--v-surface-opacity, 0.8)
  ) !important;
}
</style>
