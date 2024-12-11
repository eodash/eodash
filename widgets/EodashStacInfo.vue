<template>
  <div class="d-flex flex-column fill-height overflow-auto">
    <div class="d-flex flex-row justify-space-between pa-4 bg-primary align-center">
      <v-btn
        color="secondary"
        class="text-none font-weight-bold pa-2"
        :append-icon="[mdiPlus]"
        text="Choose indicator"
        @click="dialog = !dialog"
      >
        Replace indicator
      </v-btn>
      <EodashLayoutSwitcher
        target="main"
      />
    </div>
    <PopUp
      v-model="dialog"
      maxWidth="1000px"
      width="1000px"
    >
      <EodashItemFilter
        .enableCompare="true"
        aggregateResults="collection_group"
        imageProperty="assets.thumbnail.href"
        subTitleProperty="subtitle"
        resultType="cards"
        .filterProperties= "[]"
        filtersTitle= ""
        resultsTitle= "Explore more indicators"
        @select="dialog = !dialog"
      />
    </PopUp>
    <eox-stacinfo
      :for="currentUrl"
      allowHtml="true"
      properties='["description"]'
    >
    </eox-stacinfo>
  </div>
</template>

<script setup>
import "@eox/stacinfo"
import PopUp from "./PopUp.vue";
import EodashItemFilter from "./EodashItemFilter.vue"
import EodashLayoutSwitcher from "./EodashLayoutSwitcher.vue"
import { currentUrl } from "../core/client/store/States";
import { mdiPlus } from "@mdi/js";

const dialog = defineModel({ type: Boolean, required: true, default: false });

</script>