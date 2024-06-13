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
        // expanded: true,
      },
      {
        key: "themes",
        title: "Theme Filter",
        type: "multiselect",
        // featured: true,
        // expanded: true
      },
    ],
    aggregateResults: "themes",
    enableHighlighting: true,
    expandMultipleFilters: false,
    expandMultipleResults: false,
  },
};

/** @type {import("@/types").WebComponentProps["onMounted"]}*/
const onMounted = (el, store) => {
  /** @type {any} */ (el).style.height = "100%";
  
  const style = document.createElement("style");
  style.innerHTML = `
    section {
      margin: 0 !important;
    }
    section button#filter-reset {
      padding: 0 8px;
      top: 8px;
      right: 8px;
    }
  `;
  el?.shadowRoot?.appendChild(style);

  const filterstitle = document.createElement("div");
  filterstitle.setAttribute("slot", "filterstitle");
  filterstitle.innerHTML = `<h4 style="margin: 14px 8px">Indicators</h4>`;
  /** @type {any} */ (el).appendChild(filterstitle);
  const resultstitle = document.createElement("div");
  resultstitle.setAttribute("slot", "resultstitle");
  /** @type {any} */ (el).appendChild(resultstitle);

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
