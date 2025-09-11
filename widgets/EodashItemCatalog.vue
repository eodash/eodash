<template>
  <eox-itemfilter
    v-if="items.length"
    class="fill-height"
    ref="eoxItemFilter"
    style="overflow: auto; --background-color: none"
    @select="onSelect"
    .items="toRaw(items)"
    v-bind="config"
  >
    <h4 slot="filterstitle" style="margin: 14px 8px">{{ filtersTitle }}</h4>

    <h4 slot="resultstitle" style="margin: 14px 8px">{{ resultsTitle }}</h4>
  </eox-itemfilter>
</template>
<script setup>
import axios from "@/plugins/axios";
import { useSTAcStore } from "@/store/stac";
import { ref, toRaw } from "vue";

defineProps({
  filtersTitle: {
    type: String,
    default: "",
  },
  resultsTitle: {
    type: String,
    default: "Items",
  },
});

const store = useSTAcStore();
const items = await (async () => {
  if (!store.selectedStac) {
    return ref([]);
  }
  if (store.isApi) {
    return await axios
      .get(
        store.stacEndpoint + "/collections/" + store.selectedStac.id + "/items",
      )
      .then((res) => ref(res.data.features));
  } else {
    return ref(store.selectedStac.links || []);
  }
})();

store.$subscribe(async ({ type }) => {
  if (type === "patch object" && store.selectedStac) {
    items.value = await axios
      .get(
        store.stacEndpoint + "/collections/" + store.selectedStac.id + "/items",
      )
      //@ts-expect-error todo
      .then((res) => res.data.features.map(item => ({...item, ...item.properties})));
  }
});

/**
 *
 * @param {CustomEvent} evt
 */
const onSelect = async (evt) => {
  const item = evt.detail
  store.selectedItem = item;
  console.log(store.selectedStac?.id, store.selectedItem);

  store.loadSelectedSTAC(store.selectedStac?.id);
};

// Configuration for item cards & STAC-relevant filters
const config = {
  resultType: "cards",
  titleProperty: "title",
  subTitleProperty: "id", // fallback if no subtitle field
  imageProperty: "thumbnail",
  expandMultipleFilters: true,
  expandMultipleResults: true,
  enableHighlighting: true,
  filterProperties: [
    {
      keys: ["id", "title", "description"],
      title: "Search",
      type: "text",
      expanded: true,
    },
    {
      key: "themes",
      title: "Themes",
      type: "multiselect",
      expanded: true,
    },
    {
      key: "keywords",
      title: "Keywords",
      type: "multiselect",
      expanded: false,
    },
    // Additional example filters (uncomment if those properties exist on your items):
    // { key: 'platform', title: 'Platform', type: 'multiselect', expanded: false },
    // { key: 'instruments', title: 'Instrument', type: 'multiselect', expanded: false },
  ],
}
</script>
