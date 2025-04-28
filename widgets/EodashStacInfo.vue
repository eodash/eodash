<template>
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
      style="--color-primary-lighter: none"
    >
    </eox-stacinfo>
  </div>
</template>

<script setup>
import "@eox/stacinfo";
import { currentUrl } from "@/store/states";

const {
  allowHtml,
  featured,
  footer,
  header,
  body,
  styleOverride,
  subheader,
  tags,
} = defineProps({
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
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => ["title"],
  },
  tags: {
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => ["themes"],
  },
  subheader: {
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => [],
  },
  body: {
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => ["satellite", "sensor", "agency", "extent"],
  },
  featured: {
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => ["description", "providers", "assets", "links"],
  },
  footer: {
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => ["sci:citation"],
  },
});
</script>
