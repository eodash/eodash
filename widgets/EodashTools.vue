<template>
  <div class="d-flex flex-column fill-height overflow-auto bg-primary">
    <div
      class="d-flex flex-row justify-space-between pa-4 align-center"
    >
      <v-btn
        v-if="props.showIndicatorsBtn"
        color="secondary"
        class="text-none py-2 px-4"
        :append-icon="[mdiPlus]"
        text="Choose indicator"
        @click="dialog = !dialog"
      >
        Replace indicator
      </v-btn>
      <EodashLayoutSwitcher v-if="props.showLayoutSwitcher" target="main" />
    </div>
    <PopUp v-model="dialog" maxWidth="1000px" width="1000px">
      <EodashItemFilter
        .enableCompare="true"
        imageProperty="thumbnail"
        subTitleProperty="subtitle"
        resultType="cards"
        .filterProperties="[]"
        filtersTitle=""
        resultsTitle="Explore more indicators"
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
})
</script>