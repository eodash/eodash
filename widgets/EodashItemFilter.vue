<template>
  <DynamicWebComponent :link="link" tag-name="eox-itemfilter" :properties="properties" :on-mounted="onMounted" />
</template>
<script setup>
import DynamicWebComponent from "@/components/DynamicWebComponent.vue";

const link = () => import("@eox/itemfilter");

const properties = {
  config: {
    titleProperty: "title",
    filterProperties: [
      {
        keys: ["title", "themes"],
        title: "Search",
        type: "text",
        expanded: true,
      },
      {
        key: "themes",
        title: "Theme",
        type: "multiselect",
        featured: true,
      },
    ],
    aggregateResults: "themes",
    enableHighlighting: true,
  },
};

/** @type {import("../core/types").WebComponentProps["onMounted"]}*/
const onMounted = (el, store, router) => {
  /**
   * @typedef {object} Item
   * @property {string} href
   * */
  /** @type {any} */ (el).apply(
  // Only list child elements in list
  store.stac?.filter((item) => item.rel === "child")
);
  // Check if indicator is selected
  const { query } = router.currentRoute.value;
  if ("indicator" in query) {
    const match = store.stac?.find((item) => item.id === query.indicator);
    if (match) {
      //@ts-expect-error
      (el).selectedResult = match;
      store.loadSelectedSTAC(match.href);
    }
  }
  /** @type {any} */ (el).config.onSelect =
    /**
     * @param {Item} item
     * */
    async (item) => {
      console.log(item);
      await store.loadSelectedSTAC(item.href);
    };
};
</script>
