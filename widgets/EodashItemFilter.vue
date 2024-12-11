<template>
  <eox-itemfilter
    class="fill-height"
    v-bind="config"
    ref="eoxItemFilter"
    style="overflow: auto"
    @select="onSelect"
    .items='store.stac?.filter((item) => item.rel === "child")'
  >
    <h4 slot="filterstitle" style="margin: 14px 8px">{{ filtersTitle }}</h4>

    <h4 slot="resultstitle" style="margin: 14px 8px">{{ resultsTitle }}</h4>
  </eox-itemfilter>
</template>
<script setup>
import { useSTAcStore } from "@/store/stac";
import "@eox/itemfilter";

import { ref } from "vue";

const emit = defineEmits(['select']);

const props = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
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
  imageProperty: {
    type: String,
    default: "",
  },
  subTitleProperty: {
    type: String,
    default: "",
  },
  resultType: {
    type: String,
    default: "",
  },
  enableHighlighting: { type: Boolean, default: true },
  expandMultipleFilters: { type: Boolean, default: true },
  expandMultipleResults: { type: Boolean, default: true },
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

/** @param {any} evt*/
const onSelect = async (evt) => {
  // reset the style of all compare buttons
  eoxItemFilter.value?.shadowRoot
    ?.querySelectorAll(".compareMapButton")
    .forEach((res) => res.setAttribute("style", defaultStyle));
  const item = /** @type {import('stac-ts').StacLink} */ evt.detail;
  if (item) {
    // Reset compare stac to empty
    store.resetSelectedCompareSTAC();
    await store.loadSelectedSTAC(item.href);
    emit('select', item);
  } else {
    // TODO: it is possible to unselect items now
    // we need to consider how to reset to "default"
    // if that happens here
  }
};
const config = {
  titleProperty: props.titleProperty,
  filterProperties: props.filterProperties,
  aggregateResults: props.aggregateResults,
  enableHighlighting: props.enableHighlighting,
  expandMultipleFilters: props.expandMultipleFilters,
  expandMultipleResults: props.expandMultipleResults,
  imageProperty: props.imageProperty,
  subTitleProperty: props.subTitleProperty,
  resultType: props.resultType,
};
/** @type {import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxItemFilter = ref(null);

const store = useSTAcStore();

const defaultStyle =
  "float:right; height:15px; padding:4px;  margin-top:-4px; background-color:white;";
const highlightStyle =
  "float:right; height:15px; padding:4px;  margin-top:-4px; background-color:#9bcaeb;";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const injectCompareButtons = () => {
  setTimeout(() => {
    /** @type {any} */
    (eoxItemFilter.value)?.shadowRoot
      .querySelectorAll("details>summary")
      .forEach((/** @type {HTMLElement} */ el) =>
        el.setAttribute("style", "width: 100%"),
      );
    /** @type {any} */
    (eoxItemFilter.value)?.shadowRoot
      .querySelectorAll("details>div li")
      .forEach((/** @type {HTMLElement} */ res) => {
        let compareButton = document.createElement("button");
        compareButton.className = "compareMapButton";
        compareButton.dataset.id = res.children[0].id;

        compareButton.onclick = async (
          /** {Event & { currentTarget: HTMLElement }} */ evt,
        ) => {
          // reset the style of all compare buttons
          eoxItemFilter.value?.shadowRoot
            ?.querySelectorAll(".compareMapButton")
            .forEach((res) => {
              res.setAttribute("style", defaultStyle);
            });
          const currentTarget = /** @type {HTMLElement}*/ (evt.currentTarget);
          currentTarget?.setAttribute("style", highlightStyle);
          const selected = eoxItemFilter.value?.items.find(
            (/** @type {HTMLElement} */ it) =>
              it.id === currentTarget?.dataset.id,
          );
          if (selected) {
            await store.loadSelectedCompareSTAC(selected.href);
          }
        };
        compareButton.setAttribute("style", defaultStyle);
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
        res.append(compareButton);
      });
  }, 100);
};

// onMounted(() => {
//   const style = document.createElement("style");
//   style.innerHTML = `
//     section {
//       margin: 0 !important;
//     }
//     section button#filter-reset {
//       padding: 0 8px;
//       top: 8px;
//       right: 8px;
//     }
//   `;
//   eoxItemFilter.value?.shadowRoot?.appendChild(style);

//   // Only list child elements in list
//   const items = store.stac?.filter((item) => item.rel === "child");
//   /** @type {any} */
//   (eoxItemFilter.value).items = items;
//   if (props.enableCompare) {
//     injectCompareButtons();
//   }
// });
</script>
