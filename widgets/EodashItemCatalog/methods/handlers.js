import { mapEl } from "@/store/states";
import { inAndOut } from "ol/easing";
import { renderItemsFeatures } from "./map";

/**
 *
 * @param {CustomEvent} evt
 * @param {import("vue").Ref<import("@/types").GeoJsonFeature[]>} currentItems
 */
export const onFilter = (evt, currentItems) => {
  currentItems.value = evt.detail.results;
  renderItemsFeatures(currentItems.value);
};

/**
 *
 * @param {CustomEvent} evt
 * @param {ReturnType<typeof import("@/store/stac.js").useSTAcStore>} store
 */
export const onSelect = (evt, store) => {
  const item = /** @type {import("stac-ts").StacItem} */ (evt.detail);
  if (!item) {
    return;
  }
  // todo: consider triggering the render using the item
  store.$patch({
    //@ts-expect-error todo
    selectedItem: item,
  });
  // trigger the rendering of the item using the collection watchers
  store.loadSelectedSTAC(item.collection);
  // zoom to the item on the map
  mapEl.value?.selectInteractions[item.id].highlightById([item.id], {
    padding: [100, 100, 100, 100],
    duration: 1200,
    easing: inAndOut,
  });
};
