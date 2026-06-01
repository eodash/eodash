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
import { computed, onUnmounted, ref, watch } from "vue";
import { isSTACItem } from "@/eodashSTAC/helpers";

const { level, allowHtml, featured, footer, header, body, tags } = defineProps({
  level: {
    type: /** @type {import("vue").PropType<"item" | "collection">} */ (String),
    default: "collection",
    validator: (/** @type {string} */ v) => ["collection", "item"].includes(v),
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
    /**
     * @type {import("vue").PropType<
     *   (string | {
     *     key: string,
     *     filter?: (item: any) => boolean
     *   })[]
     * >}
     */
    type: Array,
    default: () => ["title"],
  },
  tags: {
    /**
     * @type {import("vue").PropType<
     *   (string | {
     *     key: string,
     *     filter?: (item: any) => boolean
     *   })[]
     * >}
     */
    type: Array,
    default: () => ["themes"],
  },
  body: {
    /**
     * @type {import("vue").PropType<
     *   (string | {
     *     key: string,
     *     filter?: (item: any) => boolean
     *   })[]
     * >}
     */
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
    /**
     * @type {import("vue").PropType<
     *   (string | {
     *     key: string,
     *     filter?: (item: any) => boolean
     *   })[]
     * >}
     */
    type: Array,
    default: () => ["description", "providers", "assets", "links"],
  },
  footer: {
    /**
     * @type {import("vue").PropType<
     *   (string | {
     *     key: string,
     *     filter?: (item: any) => boolean
     *   })[]
     * >}
     */
    type: Array,
    default: () => ["sci:citation", "sci:doi", "sci:publication"],
  },
});

const { selectedItem } = storeToRefs(useSTAcStore());

/** @type {import("vue").Ref<string | null>} */
const itemUrl = ref(null);
/**
 * Active object URL (only set for the blob fallback)
 * @type {string | null}
 */
let activeItemUrl = null;

const revokeItem = () => {
  if (activeItemUrl) {
    URL.revokeObjectURL(activeItemUrl);
    activeItemUrl = null;
  }
};

watch(
  selectedItem,
  (item) => {
    if (level !== "item" || !item) return;
    revokeItem();
    if (!isSTACItem(item)) {
      itemUrl.value = item.href;
      return;
    }
    const selfHref = item?.links?.find((l) => l.rel === "self")?.href;
    if (selfHref) {
      itemUrl.value = selfHref;
    } else if (item) {
      const blob = new Blob([JSON.stringify(item)], {
        type: "application/json",
      });
      activeItemUrl = URL.createObjectURL(blob);
      itemUrl.value = activeItemUrl;
    } else {
      itemUrl.value = null;
    }
  },
  { immediate: true },
);
onUnmounted(revokeItem);

const stacInfoURL = computed(() =>
  level === "item" ? itemUrl.value : currentUrl.value,
);
</script>
