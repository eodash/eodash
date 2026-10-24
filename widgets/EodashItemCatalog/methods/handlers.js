import { inAndOut } from "ol/easing";
import { unref } from "vue";
import axios from "@/plugins/axios";
import { renderItemsFeatures } from "./map";
import { eodashCollections, eodashCompareCollections } from "@/store/stac";
import {
  ANALYSIS_GROUP,
  assignDataLayers,
  assignGroupLayers,
} from "@/eodashSTAC/layers";

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
 *  hoverProperties: import("vue").Ref<string[] | undefined>,
 *  stacItemsStyle?: object,
 *  stacItemsInteractionStyle?: object,
 *  itemfilterEl?: import("vue").Ref<any>,
 *  selectedItemRef?: import("vue").Ref<import("@eodash/stac").STACItem | null | undefined>,
 *  onCollectionsChange?: (collectionIds: string[]) => void,
 *  initialCollections?: string[],
 *  mosaicOptions?: {
 *    isMosaicEnabled: import("vue").ComputedRef<boolean>,
 *    getMosaicEndpoint: () => string | null | undefined,
 *    scheduleMosaicUpdate: (mosaicEndpoint: string | null | undefined, timeRange?: [string,string], filters?: import("@/types").ItemFilterFilters) => void,
 *  } | null
 * }} params
 */
export const createOnFilterHandler = ({
  currentItems,
  mapElement,
  hoverProperties,
  stacItemsStyle,
  stacItemsInteractionStyle,
  itemfilterEl,
  selectedItemRef,
  onCollectionsChange,
  initialCollections = [],
  mosaicOptions = null,
}) => {
  let lastScheduledFiltersKey = "";
  let lastCollectionSignature = [...initialCollections].sort().join(",");

  /** @param {CustomEvent} evt */
  return (evt) => {
    currentItems.value = evt.detail.results;
    renderItemsFeatures(
      currentItems.value,
      mapElement,
      hoverProperties.value,
      stacItemsStyle,
      stacItemsInteractionStyle,
    );

    const collectionState = evt.detail.filters?.collection?.stringifiedState;
    const collectionIds = collectionState
      ? String(collectionState)
          .split(",")
          .map((id) => id.trim())
      : [];
    const signature = [...collectionIds].sort().join(",");
    if (onCollectionsChange && signature !== lastCollectionSignature) {
      lastCollectionSignature = signature;
      onCollectionsChange(collectionIds);
    }

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
      mosaicOptions.scheduleMosaicUpdate(
        mosaicOptions.getMosaicEndpoint(),
        undefined,
        evt.detail.filters,
      );
    }
  };
};
/**
 * Creates a select event handler that highlights the item and updates map data layers.
 *
 * @param {ReturnType<typeof import("@/store/stac").useSTAcStore>} store
 * @param {boolean} enableCompare
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 * @param {import("vue").MaybeRef<string | null>} endpoint - the catalog's STAC API, for fetching a trimmed result in full
 */
export const createOnSelectHandler = (
  store,
  enableCompare,
  mapElement,
  endpoint,
) => {
  const readers = enableCompare ? eodashCompareCollections : eodashCollections;
  const updateEvent = enableCompare
    ? "compareLayers:updated"
    : "layers:updated";
  const itemEvent = enableCompare ? "compareTime:updated" : "time:updated";

  /** @param {CustomEvent} evt */
  return async (evt) => {
    const item = /** @type {import("@eodash/stac").STACItem} */ (evt.detail);
    const currentItem = enableCompare
      ? store.selectedCompareItem
      : store.selectedItem;

    if (!item || item.id === currentItem?.id) {
      if (enableCompare) {
        store.selectedCompareItem = null;
      } else {
        store.selectedItem = null;
      }

      readers.forEach((reader) => (reader.item = undefined));
      await assignGroupLayers(
        mapElement.value,
        ANALYSIS_GROUP,
        [],
        updateEvent,
      );
      return;
    }

    mapElement.value?.selectInteractions["stac-items"]?.highlightById(
      [item.id],
      {
        padding: [100, 100, 100, 100],
        duration: 1200,
        easing: inAndOut,
      },
    );

    // a search trimmed by `fields` returns no links, which a full STAC item always has
    const fullItem = item.links ? item : await fetchItem(unref(endpoint), item);
    if (!fullItem) return;

    if (enableCompare) {
      if (store.selectedCompareStac?.id === fullItem.collection) {
        store.selectedCompareItem = fullItem;
        await assignDataLayers(mapElement.value, {
          readers,
          stac: store.selectedCompareStac,
          timeOrItem: fullItem,
          event: itemEvent,
        });
      } else {
        await store.loadSelectedCompareSTAC(
          fullItem.collection,
          false,
          fullItem,
        );
      }
    } else {
      if (store.selectedStac?.id === fullItem.collection) {
        store.selectedItem = fullItem;
        await assignDataLayers(mapElement.value, {
          readers,
          stac: store.selectedStac,
          timeOrItem: fullItem,
          event: itemEvent,
        });
      } else {
        await store.loadSelectedSTAC(fullItem.collection, false, fullItem);
      }
    }
  };
};

/**
 * Creates a hover handler to highlight the hovered item footprint on the map.
 *
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 */
export const createOnMouseEnterResult = (mapElement) => {
  /**
   * @param {CustomEvent} evt
   */
  return (evt) => {
    mapElement.value?.selectInteractions["stac-item-hover"]?.highlightById([
      evt.detail.id,
    ]);
  };
};

/**
 * Creates a mouse leave handler to clear hover highlighting on the map.
 *
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 */
export const createOnMouseLeaveResult = (mapElement) => {
  return () => {
    mapElement.value?.selectInteractions["stac-item-hover"]?.highlightById([]);
  };
};

/**
 * @param {string | null} endpoint
 * @param {import("@eodash/stac").STACItem} item
 * @returns {Promise<import("@eodash/stac").STACItem | undefined>}
 */
async function fetchItem(endpoint, item) {
  const url = `${endpoint}/collections/${encodeURIComponent(item.collection ?? "")}/items/${encodeURIComponent(item.id)}`;
  try {
    return (await axios.get(url)).data;
  } catch (error) {
    console.error("[eodash] Failed to fetch the selected item", url, error);
    return undefined;
  }
}
