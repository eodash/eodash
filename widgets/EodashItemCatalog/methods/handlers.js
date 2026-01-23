import { inAndOut } from "ol/easing";
import { renderItemsFeatures } from "./map";
import { mosaicState } from "@/utils/states";

/**
 * @param {import("vue").Ref<import("@/types").GeoJsonFeature[]>} currentItems
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 */
export const createOnFilterHandler = (currentItems, mapElement) => {
  /** @param {CustomEvent} evt */
  return (evt) => {
    currentItems.value = evt.detail.results;
    renderItemsFeatures(currentItems.value, mapElement);
  };
};
/**
 *
 * @param {ReturnType<typeof import("@/store/stac.js").useSTAcStore>} store
 * @param {boolean} enableCompare
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 * @returns
 */
export const createOnSelectHandler = (store, enableCompare, mapElement) => {
  /** @param {CustomEvent} evt */
  return async (evt) => {
    const item = /** @type {import("stac-ts").StacItem} */ (evt.detail);
    if (!item) {
      return;
    }
    if (enableCompare) {
      if (store.selectedCompareStac?.id === item.collection) {
        store.selectedCompareItem = item;
      } else {
        await store.loadSelectedCompareSTAC(item.collection, false, item);
      }
    } else {
      if (store.selectedStac?.id === item.collection) {
        store.selectedItem = item;
      } else {
        await store.loadSelectedSTAC(item.collection, false, item);
      }
    }
    mosaicState.showButton = true;

    mapElement.value?.selectInteractions["stac-items"]?.highlightById(
      [item.id],
      {
        padding: [100, 100, 100, 100],
        duration: 1200,
        easing: inAndOut,
      },
    );
  };
};

/**
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 */
export const createOnMouseEnterResult = (mapElement) => {
  /**
   * @param {CustomEvent} evt
   */
  return (evt) => {
    mapElement.value?.selectInteractions["stac-items"]?.highlightById([
      evt.detail.id,
    ]);
  };
};

/**
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 */
export const createOnMouseLeaveResult = (mapElement) => {
  return () => {
    mapElement.value?.selectInteractions["stac-items"]?.highlightById([]);
  };
};
