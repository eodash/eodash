<template>
  <v-main class="overflow-hidden main">
    <Suspense suspensible>
      <component
        id="bg-widget"
        v-if="bgWidget.component"
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
        <v-btn icon variant="text" class="close-btn" @click="activeIdx = -1"
          >&#x2715;</v-btn
        >
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
import { eodashKey } from "@/utils/keys";
import { inject, ref, onMounted } from "vue";
import { useDefineWidgets } from "@/composables/DefineWidgets";
import { useLayout } from "vuetify";

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));

//import widgets
const widgetsConfig = eodash.template.widgets;
const importedWidgets = useDefineWidgets(widgetsConfig);
const [bgWidget] = useDefineWidgets([eodash.template?.background]);

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
    mainRect.value.bottom + (tabs.value?.$el?.clientHeight ?? 0) + "px";
});
</script>
<style scoped>
.main {
  height: 91dvh;
}

.panel {
  top: v-bind("mainRectTopPx");
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
</style>
