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

/** @type {import("@/types").WebComponentProps["onMounted"]}*/
const onMounted = (el, store) => {
  /**
   * @typedef {object} Item
   * @property {string} href
   * */
  /** @type {any} */ (el).apply(
  // Only list child elements in list
  store.stac?.filter((item) => item.rel === "child")
);
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
