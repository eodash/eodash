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
      />
    </div>
    <PopUp v-model="dialog" maxWidth="1000px" width="1000px">
      <EodashItemFilter
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
import { mdiPlus } from "@mdi/js";
import { ref } from "vue";
import { makePanelTransparent } from "@/composables";

const dialog = ref(false);

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
  indicatorBtnText: {
    type: String,
    default: "Select indicator",
  },
  itemFilterConfig: {
    type: Object,
    default: () => {},
  },
});
const rootEl = ref(null);
makePanelTransparent(rootEl);
</script>
