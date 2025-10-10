import { mapEl } from "@/store/states";
import { inAndOut } from "ol/easing";
import { renderItemsFeatures } from "./map";

/**
 * @param {import("vue").Ref<import("@/types").GeoJsonFeature[]>} currentItems
 */
export const createOnFilterHandler = (currentItems) => {
  /** @param {CustomEvent} evt */
  return (evt) => {
    currentItems.value = evt.detail.results;
    renderItemsFeatures(currentItems.value);
  };
};
/**
 *
 * @param {ReturnType<typeof import("@/store/stac.js").useSTAcStore>} store
 * @returns
 */
export const createOnSelectHandler = (store) => {
  /** @param {CustomEvent} evt */
  return async (evt) => {
    const item = /** @type {import("stac-ts").StacItem} */ (evt.detail);
    if (!item) {
      return;
    }
    if (store.selectedStac?.id === item.collection) {
      store.selectedItem = item;
    } else {
      await store.loadSelectedSTAC(item.collection, false, item);
    }

    mapEl.value?.selectInteractions["stac-items"]?.highlightById([item.id], {
      padding: [100, 100, 100, 100],
      duration: 1200,
      easing: inAndOut,
    });
  };
};

/**
 *
 * @param {CustomEvent} evt
 */
export const onMouseEnterResult = (evt) => {
  mapEl.value?.selectInteractions["stac-items"]?.highlightById([evt.detail.id]);
};
export const onMouseLeaveResult = () => {
  mapEl.value?.selectInteractions["stac-items"]?.highlightById([]);
};
