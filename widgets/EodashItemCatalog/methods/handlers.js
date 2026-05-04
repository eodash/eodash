import { inAndOut } from "ol/easing";
import { renderItemsFeatures } from "./map";
import { scheduleMosaicUpdate } from "@/eodashSTAC/mosaic";

/**
 * Build a compact signature from filter key + stringified state.
 * @param {import("@/types").ItemFilterFilters | undefined} filters
 * @returns {string}
 */
const getFiltersSignature = (filters) => {
  if (!filters) return "";
  return Object.keys(filters)
    .sort()
    .map((key) => `${key}:${filters[key]?.stringifiedState ?? ""}`)
    .join("|");
};

/**
 * @param {{
 *  currentItems: import("vue").Ref<import("@/types").GeoJsonFeature[]>,
 *  mapElement: import("vue").Ref<import("@eox/map").EOxMap | null>,
 *  hoverProperties: string[] | undefined,
 *  itemfilterEl?: import("vue").Ref<any>,
 *  selectedItemRef?: import("vue").Ref<import("stac-ts").StacItem | null>,
 *  mosaicOptions?: {
 *    isMosaicEnabled: import("vue").ComputedRef<boolean>,
 *    getMosaicEndpoint: () => string | null | undefined
 *  } | null
 * }} params
 */
export const createOnFilterHandler = ({
  currentItems,
  mapElement,
  hoverProperties,
  itemfilterEl,
  selectedItemRef,
  mosaicOptions = null,
}) => {
  let lastScheduledFiltersKey = "";

  /** @param {CustomEvent} evt */
  return (evt) => {
    currentItems.value = evt.detail.results;
    renderItemsFeatures(currentItems.value, mapElement, hoverProperties);

    const selected = selectedItemRef?.value;
    if (selected && itemfilterEl?.value) {
      itemfilterEl.value.selectedResult = selected;
    }

    if (mosaicOptions?.isMosaicEnabled.value && !selected) {
      const nextFiltersKey = getFiltersSignature(evt.detail.filters);
      if (nextFiltersKey === lastScheduledFiltersKey) {
        return;
      }

      lastScheduledFiltersKey = nextFiltersKey;
      scheduleMosaicUpdate(
        mosaicOptions.getMosaicEndpoint(),
        undefined,
        evt.detail.filters,
      );
    }
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
      if (item.id === store.selectedCompareItem?.id) {
        store.selectedCompareItem = null;
        return;
      }
      if (store.selectedCompareStac?.id === item.collection) {
        store.selectedCompareItem = item;
      } else {
        await store.loadSelectedCompareSTAC(item.collection, false, item);
      }
    } else {
      if (item.id === store.selectedItem?.id) {
        store.selectedItem = null;
        return;
      }
      if (store.selectedStac?.id === item.collection) {
        store.selectedItem = item;
      } else {
        await store.loadSelectedSTAC(item.collection, false, item);
      }
    }

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
