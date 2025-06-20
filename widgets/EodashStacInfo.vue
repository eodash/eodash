<template>
  <div class="flex-grow-1">
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
    default: "",
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
