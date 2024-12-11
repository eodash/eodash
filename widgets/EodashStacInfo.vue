<template>
  <div class="d-flex flex-column fill-height overflow-hidden">
    <div
      v-if="showHeader"
      class="d-flex flex-row flex-shrink-0 justify-space-between pa-4 bg-primary align-center"
    >
      <v-btn
        v-if="showIndicatorsBtn"
        color="secondary"
        class="text-none py-2 px-4"
        :append-icon="[mdiPlus]"
        text="Choose indicator"
        @click="dialog = !dialog"
      >
        Replace indicator
      </v-btn>
      <EodashLayoutSwitcher v-if="showLayoutSwitcher" target="main" />
    </div>
    <PopUp v-model="dialog" maxWidth="1000px" width="1000px">
      <EodashItemFilter
        .enableCompare="true"
        imageProperty="assets.thumbnail.href"
        subTitleProperty="subtitle"
        resultType="cards"
        .filterProperties="[]"
        filtersTitle=""
        resultsTitle="Explore more indicators"
        @select="dialog = !dialog"
      />
    </PopUp>
    <div class="flex-grow-1 fill-height overflow-auto">
      <eox-stacinfo
        .for="currentUrl"
        .allowHtml="allowHtml"
        .body="body"
        .featured="featured"
        .footer="footer"
        .styleOverride="styleOverride"
        .header="header"
        .subheader="subheader"
        .tags="tags"
      >
      </eox-stacinfo>
    </div>
  </div>
</template>

<script setup>
import "@eox/stacinfo";
import PopUp from "./PopUp.vue";
import EodashItemFilter from "./EodashItemFilter.vue";
import EodashLayoutSwitcher from "./EodashLayoutSwitcher.vue";
import { currentUrl } from "../core/client/store/States";
import { mdiPlus } from "@mdi/js";
import { ref } from "vue";

const dialog = ref(false);

const {
  showIndicatorsBtn,
  showLayoutSwitcher,
  allowHtml,
  featured,
  footer,
  header,
  body,
  styleOverride,
  subheader,
  tags,
} = defineProps({
  showIndicatorsBtn: {
    type: Boolean,
    default: true,
  },
  showLayoutSwitcher: {
    type: Boolean,
    default: true,
  },
  allowHtml: {
    type: Boolean,
    default: true,
  },

  styleOverride: {
    type: String,
    default: `
.single-property {columns: 1!important;}
h1 {margin:0px!important;font-size:16px!important;}
header h1:after {
content:' ';
display:block;
border:1px solid #d0d0d0;
}
h2 {font-size:15px}
h3 {font-size:14px}
summary {cursor: pointer;}
#properties li > .value { font-weight: normal !important;}
main {padding-bottom: 10px;}
.footer-container {line-height:1;}
.footer-container button {margin-top: -10px;}
.footer-container small {font-size:10px;line-height:1;}`,
  },
  header: {
    type: Array,
    default: () => ["title"],
  },
  tags: {
    type: Array,
    default: () => ["themes"],
  },
  subheader: {
    type: Array,
    default: () => [],
  },
  body: {
    type: Array,
    default: () => ["satellite", "sensor", "agency", "extent"],
  },
  featured: {
    type: Array,
    default: () => ["description", "providers", "assets", "links"],
  },
  footer: {
    type: Array,
    default: () => ["sci:citation"],
  },
});
const showHeader = showIndicatorsBtn || showLayoutSwitcher;
</script>
