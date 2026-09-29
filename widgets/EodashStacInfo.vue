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
import { eodashCollections } from "@/store/stac";
import { useOnLayersUpdate } from "@/composables";
import { computed, onMounted, onUnmounted, ref } from "vue";

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

/**
 * Points at the item the map is showing, rather than at the one the user
 * picked: only a catalog offers item picking, while a static or parquet
 * collection resolves its item from the datetime.
 *
 * The first collection reporting an item wins.
 */
const showRenderedItem = () => {
  if (level !== "item") return;
  const item = eodashCollections.find((ec) => ec.item)?.item;
  if (!item) return;
  revokeItem();
  const selfHref = item.links?.find((l) => l.rel === "self")?.href;
  if (selfHref) {
    itemUrl.value = selfHref;
    return;
  }
  const blob = new Blob([JSON.stringify(item)], {
    type: "application/json",
  });
  activeItemUrl = URL.createObjectURL(blob);
  itemUrl.value = activeItemUrl;
};

// `ec.item` is a plain property, so nothing can watch it
useOnLayersUpdate(showRenderedItem);
onMounted(showRenderedItem);
onUnmounted(revokeItem);

const stacInfoURL = computed(() =>
  level === "item" ? itemUrl.value : currentUrl.value,
);
</script>
