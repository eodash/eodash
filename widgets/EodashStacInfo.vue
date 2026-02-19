<template>
  <div class="flex-grow-1">
    <eox-stacinfo
      v-if="stacInfoURL"
      .for="stacInfoURL"
      .allowHtml="allowHtml"
      .body="body"
      .featured="featured"
      .footer="footer"
      .header="header"
      .tags="tags"
      style="--color-primary-lighter: none"
      .styleOverride="styleOverride"
    >
    </eox-stacinfo>
  </div>
</template>

<script setup>
import "@eox/stacinfo";
import { currentUrl } from "@/store/states";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { computed } from "vue";

const { level, allowHtml, featured, footer, header, body, tags } = defineProps({
  level: {
    type: String,
    default: "collection",
  },
  styleOverride: {
    type: String,
    default: "",
  },
  allowHtml: {
    type: Boolean,
    default: true,
  },

  header: {
    /** @type {import("vue").PropType<import("@eox/stacinfo").EOxStacInfo["header"]>}  */
    type: Array,
    default: () => ["title"],
  },
  tags: {
    /** @type {import("vue").PropType<import("@eox/stacinfo").EOxStacInfo["tags"]>}  */
    type: Array,
    default: () => ["themes"],
  },
  body: {
    /** @type {import("vue").PropType<import("@eox/stacinfo").EOxStacInfo["body"]>}  */
    type: Array,
    default: () => [
      "satellite",
      "sensor",
      "insituSources",
      "otherSources",
      "agency",
      "extent",
    ],
  },
  featured: {
    /** @type {import("vue").PropType<import("@eox/stacinfo").EOxStacInfo["featured"]>}  */
    type: Array,
    default: () => ["description", "providers", "assets", "links"],
  },
  footer: {
    /** @type {import("vue").PropType<import("@eox/stacinfo").EOxStacInfo["footer"]>}  */
    type: Array,
    default: () => ["sci:citation", "sci:doi", "sci:publication"],
  },
});

const { selectedItem } = storeToRefs(useSTAcStore());
const stacInfoURL = computed(() => {
  if (level === "item") {
    if (!selectedItem.value) {
      return null;
    }
    //@ts-expect-error todo
    return getItemUrl(selectedItem.value);
  }
  return currentUrl.value;
});

/**
 *
 * @param {import("stac-ts").StacItem} item
 */
function getItemUrl(item) {
  if (!item) {
    return null;
  }
  const selfLink = item.links?.find((link) => link.rel === "self");
  if (selfLink && selfLink.href) {
    return selfLink.href;
  }
  const itemBlob = new Blob([JSON.stringify(item)], {
    type: "application/json",
  });
  const itemURL = URL.createObjectURL(itemBlob);
  console.log("Created item URL:", itemURL);
  // Revoke the object URL after a short delay to free up memory
  setTimeout(() => {
    URL.revokeObjectURL(itemURL);
  }, 3000);
  return itemURL;
}
</script>
