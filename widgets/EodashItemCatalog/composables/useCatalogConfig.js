import { ref } from "vue";
import { createFilterProperties } from "../methods/filters";

const DATETIME_KEYS = ["datetime", "start_datetime", "end_datetime"];

/**
 * Author-declared filters/sort/hover, shown or hidden per collection based on
 * the properties carried by the current search results; `applyItems` runs at
 * setup and on every collection change.
 * @param {object} options hook options
 * @param {import("vue").Ref<any>} options.itemfilterEl template ref to `<eox-itemfilter>`
 * @param {boolean} options.datetimeFilter show the datetime range filter
 * @param {import("../types").FiltersConfig} options.declaredFilters author-declared filters
 * @param {import("../types").SortOption[]} options.declaredSortBy author-declared sort options
 * @param {string[]} options.declaredHoverProperties author-declared hover properties
 * @returns {{ filterProperties: import("vue").Ref<Record<string, any>[]>, sortByOptions: import("vue").Ref<import("../types").SortOption[]>, hoverProperties: import("vue").Ref<string[]>, applyItems: (items: import("@/types").GeoJsonFeature[]) => void }} reactive catalog config
 */
export const useCatalogConfig = ({
  itemfilterEl,
  datetimeFilter,
  declaredFilters = [],
  declaredSortBy = [],
  declaredHoverProperties = [],
}) => {
  /** @type {import("vue").Ref<Record<string, any>[]>} */
  const filterProperties = ref([]);
  const sortByOptions = ref([...declaredSortBy]);
  const hoverProperties = ref([...declaredHoverProperties]);

  /**
   * Property keys present in the items; `null` (no items) means show everything.
   * @param {import("@/types").GeoJsonFeature[]} items current search results
   * @returns {Set<string> | null} present property keys, or `null` when unknown
   */
  const presentProperties = (items) => {
    if (!items?.length) return null;
    /** @type {Set<string>} */
    const present = new Set();
    for (const item of items) {
      if (item?.properties) {
        for (const key of Object.keys(item.properties)) present.add(key);
      }
    }
    return present;
  };

  /**
   * Whether a property should be shown for the current results.
   * @param {string} property STAC property key
   * @param {Set<string> | null} present present property keys, or `null` when unknown
   * @returns {boolean} true when shown
   */
  const isAvailable = (property, present) =>
    !present || DATETIME_KEYS.includes(property) || present.has(property);

  /**
   * Rebuild the config from the current items and reconcile the element's live
   * filter state so hidden panels disappear.
   * @param {import("@/types").GeoJsonFeature[]} items -  current search results
   */
  const applyItems = (items) => {
    const present = presentProperties(items);

    const visibleFilters = declaredFilters.filter((filter) =>
      isAvailable(filter.property, present),
    );
    sortByOptions.value = declaredSortBy.filter((option) =>
      isAvailable(option.property, present),
    );
    hoverProperties.value = declaredHoverProperties.filter((property) =>
      isAvailable(property, present),
    );

    const rebuilt = /** @type {Record<string, any>[]} */ (
      createFilterProperties(visibleFilters, datetimeFilter)
    );

    const live = itemfilterEl.value?.filters;
    reOverlayLiveState(rebuilt, live);
    filterProperties.value = rebuilt;
    pruneHiddenFilters(rebuilt, live);
  };

  return { filterProperties, sortByOptions, hoverProperties, applyItems };
};

/**
 * Carry the user's live selection over a rebuild for the filters that bake a
 * `state` (range bounds, collection seed). A declared multiselect `state` is
 * not re-overlaid, so it would reset on collection change.
 * @param {Record<string, any>[]} rebuilt - freshly built filter properties
 * @param {Record<string, any> | undefined} live - element's live `filters` state
 */
function reOverlayLiveState(rebuilt, live) {
  if (!live) return;
  for (const entry of rebuilt) {
    const liveEntry = live[entry.key];
    if (!liveEntry) continue;
    if (entry.type === "range") {
      const { min, max } = liveEntry.state ?? {};
      if (typeof min === "number" && typeof max === "number") {
        entry.state = { min, max };
      }
    } else if (entry.key === "collection") {
      entry.state = liveEntry.state;
      entry.stringifiedState = liveEntry.stringifiedState;
    }
  }
}

/**
 * Remove no-longer-visible filters from the element's live state so their panels
 * stop rendering; shrinking `filterProperties` alone does not remove them.
 * @param {Record<string, any>[]} rebuilt - freshly built filter properties
 * @param {Record<string, any> | undefined} live - element's live `filters` state
 */
function pruneHiddenFilters(rebuilt, live) {
  if (!live) return;
  const validKeys = new Set(rebuilt.map((filter) => filter.key));
  for (const key of Object.keys(live)) {
    if (!validKeys.has(key)) delete live[key];
  }
}
