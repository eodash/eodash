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
 * @param {ReturnType<typeof import("@/store/stac.js").useSTAcStore>} store
 * @returns
 */
export const createOnSelectHandler = (store) => {
  // make sure to clear the selectedItem (from the old collection)
  // when collection changes, without triggering the effects
  store.$onAction(({ name, store }) => {
    if (name === "loadSelectedSTAC" && store.selectedStac) {
      store.$patch({ selectedItem: null });
    }
  });

  /** @param {CustomEvent} evt */
  return async (evt) => {
    const item = /** @type {import("stac-ts").StacItem} */ (evt.detail);
    if (!item) {
      return;
    }
    if (store.selectedStac?.id === item.collection) {
      store.selectedItem = item;
    } else {
      await store.loadSelectedSTAC(item.collection).then(() => {
        store.selectedItem = item;
      });
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
