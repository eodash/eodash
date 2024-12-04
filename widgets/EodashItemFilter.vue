<template>
  <v-card class="d-flex flex-column fill-height overflow-auto">
    <v-card-title class="bg-indigo-darken-4">
      <v-dialog>
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            v-bind="activatorProps"
            color="blue-darken-4"
            append-icon="plus"
            text="Choose indicator"
          ></v-btn>
        </template>

        <template v-slot:default="{ isActive }">
          <v-card>
            <eox-itemfilter
              class="fill-height light-itemfilter"
              v-bind="config"
              ref="eoxItemFilter"
              style="overflow: auto"
              .imageProperty="'assets.thumbnail.href'"
              .subTitleProperty="'subtitle'"
              .filterProperties="[]"
              .items='store.stac?.filter((item) => item.rel === "child")'
              result-type="cards"
              @select="onSelect"
            >
              <h4 slot="filterstitle" style="margin: 14px 8px">{{ filtersTitle }}</h4>

              <h4 slot="resultstitle" style="margin: 14px 8px">{{ resultsTitle }}</h4>
            </eox-itemfilter>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                text="Close Dialog"
                @click="isActive.value = false"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </v-card-title>
    <v-card-text style="padding: 0 !important;">
      <eox-stacinfo
        .for="currentUrl"
        allowHtml="true"
        properties='["description"]'
        styleOverride=""
      >
      </eox-stacinfo>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { useSTAcStore } from "@/store/stac";
import "../node_modules/@eox/itemfilter/dist/eox-itemfilter";
import "@eox/stacinfo"
import { currentUrl } from "../core/client/store/States";

// import "@eox/itemfilter";

import { onMounted, ref } from "vue";

const props = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
  filtersTitle: {
    type: String,
    default: "",
  },
  resultsTitle: {
    type: String,
    default: "Explore more indicators",
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
};
/** @type {import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxItemFilter = ref(null);

const store = useSTAcStore();

const defaultStyle =
  "float:right; height:15px; padding:4px;  margin-top:-4px; background-color:white;";
const highlightStyle =
  "float:right; height:15px; padding:4px;  margin-top:-4px; background-color:#9bcaeb;";

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
