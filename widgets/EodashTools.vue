<template>
  <div ref="rootEl" class="d-flex flex-column fill-height bg-primary">
    <div
      class="d-flex flex-row align-center fill-height justify-space-between pa-2 align-center"
    >
      <v-btn
        v-if="props.showIndicatorsBtn"
        color="secondary"
        :size="btnSize"
        class="text-none"
        :class="btnClasses"
        :append-icon="[mdiPlus]"
        :text="indicatorBtnText"
        @click="dialog = !dialog"
      >
      </v-btn>
      <EodashLayoutSwitcher
        v-if="props.showLayoutSwitcher"
        :target="layoutTarget"
        :icon="layoutIcon"
      />
    </div>
    <PopUp
      v-model="dialog"
      :maxWidth="popupWidth"
      :width="popupWidth"
      :max-height="popupHeight"
      :height="popupHeight"
    >
      <EodashItemFilter
        class="pa-4"
        results-title=""
        v-bind="props.itemFilterConfig"
        @select="dialog = !dialog"
      />
    </PopUp>
  </div>
</template>

<script setup>
import PopUp from "^/PopUp.vue";
import EodashItemFilter from "^/EodashItemFilter.vue";
import EodashLayoutSwitcher from "^/EodashLayoutSwitcher.vue";
import { mdiPlus, mdiViewDashboard } from "@mdi/js";
import { computed, ref } from "vue";
import { makePanelTransparent } from "@/composables";
import { useDisplay } from "vuetify";

const dialog = ref(false);

const { smAndDown, xxl, lgAndUp } = useDisplay();
const popupWidth = computed(() => (smAndDown.value ? "80%" : "70%"));
const popupHeight = computed(() => (smAndDown.value ? "90%" : "70%"));
const btnClasses = computed(() => ({
  "text-body-2": !xxl.value,
  "py-2": lgAndUp.value,
}));
const btnSize = computed(() => (xxl.value ? undefined : "small"));

const props = defineProps({
  showIndicatorsBtn: {
    type: Boolean,
    default: true,
  },
  showLayoutSwitcher: {
    type: Boolean,
    default: true,
  },
  layoutTarget: {
    type: String,
    default: "light",
  },
  // mdi/js icon
  layoutIcon: {
    type: String,
    default: mdiViewDashboard,
  },
  indicatorBtnText: {
    type: String,
    default: "Select indicator",
  },
  itemFilterConfig: {
    /** @type {import("vue").PropType<InstanceType<import("./EodashItemFilter.vue").default>["$props"]>} */
    type: Object,
    default: () => {},
  },
});
const rootEl = ref(null);
makePanelTransparent(rootEl);
</script>
<style lang="scss" scoped></style>
