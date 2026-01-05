<template>
  <div class="flex-grow-1">
    <eox-stacinfo
      .for="currentUrl"
      .allowHtml="allowHtml"
      .body="body"
      .featured="featured"
      .footer="footer"
      .header="header"
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
  tags,
} = defineProps({
  allowHtml: {
    type: Boolean,
    default: true,
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
  body: {
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => ["satellite", "sensor", "insituSources", "otherSources", "agency", "extent"],
  },
  featured: {
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => ["description", "providers", "assets", "links"],
  },
  footer: {
    /** @type {import("vue").PropType<string[]>}  */
    type: Array,
    default: () => ["sci:citation", "sci:doi", "sci:publication"],
  },
});
</script>
