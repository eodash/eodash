<template>
  <eox-itemfilter :config="config" ref="eoxItemFilter"></eox-itemfilter>
</template>
<script setup>
import { useSTAcStore } from "@/store/stac";
import "@eox/itemfilter";
import { onMounted, ref } from "vue";

/** @type {import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxItemFilter = ref(null);
const config = {
  titleProperty: "title",
  filterProperties: [
    {
      keys: ["title", "themes"],
      title: "Search",
      type: "text",
    },
    {
      key: "themes",
      title: "Theme Filter",
      type: "multiselect",
    },
  ],
  aggregateResults: "themes",
  enableHighlighting: true,
  expandMultipleFilters: false,
  expandMultipleResults: false,
};

const store = useSTAcStore();
onMounted(() => {
  /** @type {any} */ (eoxItemFilter.value).style.height = "100%";

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
  eoxItemFilter.value?.shadowRoot?.appendChild(style);

  const filterstitle = document.createElement("div");
  filterstitle.setAttribute("slot", "filterstitle");
  filterstitle.innerHTML = `<h4 style="margin: 14px 8px">Indicators</h4>`;
  /** @type {any} */ (eoxItemFilter.value).appendChild(filterstitle);
  const resultstitle = document.createElement("div");
  resultstitle.setAttribute("slot", "resultstitle");
  /** @type {any} */ (eoxItemFilter.value).appendChild(resultstitle);

  /**
   * @typedef {object} Item
   * @property {string} href
   */
  /** @type {any} */ (eoxItemFilter.value).apply(
    // Only list child elements in list
    store.stac?.filter((item) => item.rel === "child"),
  );
  /** @type {any} */ (eoxItemFilter.value).config.onSelect =
    /** @param {Item} item */
    async (item) => {
      console.log(item);
      await store.loadSelectedSTAC(item.href);
    };
});
</script>
