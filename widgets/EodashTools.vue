<template>
  <div
    ref="rootEl"
    class="d-flex flex-column fill-height overflow-auto bg-primary"
  >
    <div class="d-flex flex-row justify-space-between pa-4 align-center">
      <v-btn
        v-if="props.showIndicatorsBtn"
        color="secondary"
        class="text-none py-2 px-4"
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
import { useDisplay } from "vuetify/lib/framework.mjs";

const dialog = ref(false);

const { smAndDown } = useDisplay();
const popupWidth = computed(() => (smAndDown.value ? "80%" : "1500px"));
const popupHeight = computed(() => (smAndDown.value ? "90%" : "800px"));

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
