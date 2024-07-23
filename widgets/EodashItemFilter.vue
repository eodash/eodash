<template>
  <eox-itemfilter class="fill-height" :config="config" ref="eoxItemFilter">
    <h4 slot="filterstitle" style="margin: 14px 8px">{{ filtersTitle }}</h4>

    <h4 slot="resultstitle" style="margin: 14px 8px">{{ resultsTitle }}</h4>
  </eox-itemfilter>
</template>
<script setup>
import { useSTAcStore } from "@/store/stac";
import "@eox/itemfilter";
import { onMounted, ref } from "vue";

const props = defineProps({
  filtersTitle: {
    type: String,
    default: "Indicators",
  },
  resultsTitle: {
    type: String,
    default: "",
  },
  titleProperty: {
    type: String,
    default: "title",
  },

  aggregateResults: {
    type: String,
    default: "themes",
  },
  enableHighlighting: { type: Boolean, default: true },
  expandMultipleFilters: { type: Boolean, default: false },
  expandMultipleResults: { type: Boolean, default: false },
  filterProperties: {
    /** @type {import("vue").PropType<{
     * keys:string[];
     * title:string;
     * type:string;
     * expanded?:boolean
     * }[]> }*/
    type: Array,
    default: () => [
      {
        keys: ["title", "themes", "description"],
        title: "Search",
        type: "text",
      },
      {
        key: "themes",
        title: "Theme Filter",
        type: "multiselect",
      },
    ],
  },
});

const config = {
  titleProperty: props.titleProperty,
  filterProperties: props.filterProperties,
  aggregateResults: props.aggregateResults,
  enableHighlighting: props.enableHighlighting,
  expandMultipleFilters: props.expandMultipleFilters,
  expandMultipleResults: props.expandMultipleResults,
};
/** @type {import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxItemFilter = ref(null);

const store = useSTAcStore();

onMounted(() => {
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

  eoxItemFilter.value?.apply(
    // Only list child elements in list
    store.stac?.filter((item) => item.rel === "child"),
  );
  /** @type {any} */ (eoxItemFilter.value).config.onSelect =
    /** @param {import('stac-ts').StacLink} item */
    async (item) => {
      // reset the style of all compare buttons
      eoxItemFilter.value?.shadowRoot
        ?.querySelectorAll(".compareMapButton")
        .forEach((res) => {
          res.setAttribute(
            "style",
            "margin-left: auto; height: 15px; padding: 4px; background-color: white;",
          );
        });
      await store.loadSelectedSTAC(item.href);
      console.log(item, store.selectedStac);
    };
  setTimeout(() => {
    // @ts-expect-error best approach to be solved in updated itemfilter
    eoxItemFilter.value.shadowRoot
      .getElementById("section-results")
      .querySelectorAll("input[type=radio]")
      .forEach((res) => {
        let compareButton = document.createElement("button");
        compareButton.className = "compareMapButton";
        compareButton.dataset.id = res.id;
        compareButton.onclick = async (evt) => {
          // reset the style of all compare buttons
          eoxItemFilter.value?.shadowRoot
            ?.querySelectorAll(".compareMapButton")
            .forEach((res) => {
              res.setAttribute(
                "style",
                "margin-left: auto; height: 15px; padding: 4px; background-color: white;",
              );
            });
          evt.currentTarget?.setAttribute(
            "style",
            "margin-left: auto; height: 15px; padding: 4px; background-color: #004170;",
          );
          const selected = eoxItemFilter.value?.items.find(
            (it) => it.id === evt.currentTarget.dataset.id,
          );
          if (selected) {
            await store.loadSelectedCompareSTAC(selected.href);
          }
        };
        compareButton.setAttribute(
          "style",
          "margin-left: auto; height: 15px; padding: 4px; background-color: white;",
        );
        const svgIcon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        const iconPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        svgIcon.setAttribute("width", "15");
        svgIcon.setAttribute("height", "15");
        svgIcon.setAttribute("viewBox", "0 0 24 24");
        iconPath.setAttribute(
          "d",
          "M19,3H14V5H19V18L14,12V21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10,18H5L10,12M10,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H10V23H12V1H10V3Z",
        );
        svgIcon.appendChild(iconPath);
        compareButton.appendChild(svgIcon);
        res.parentElement?.append(compareButton);
      });
  }, 100);
});
</script>
