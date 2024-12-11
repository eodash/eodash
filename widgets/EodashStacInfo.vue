<template>
  <div class="d-flex flex-column fill-height overflow-auto">
    <div class="d-flex flex-row justify-space-between pa-4 bg-indigo-darken-4" style="position: sticky">
      <v-btn
        color="blue-darken-4"
        class="text-none font-weight-bold"
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
import { currentUrl, activeTemplate } from "../core/client/store/States";
import { mdiPlus, mdiDoor } from "@mdi/js";

const dialog = defineModel({ type: Boolean, required: true, default: false });

</script>