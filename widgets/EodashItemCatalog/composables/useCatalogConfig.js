import { ref } from "vue";
import { axios } from "@/plugins/axios";
import { createFilterProperties } from "../methods/filters";

/**
 * @typedef {{ summaries: Record<string, any>, queryables: Record<string, any> }} CollectionMetadata
 */

const DATETIME_KEYS = ["datetime", "start_datetime", "end_datetime"];
const NUMERIC_TYPES = new Set(["number", "integer"]);

/**
 * @param {number} value number to clamp
 * @param {number} lo lower bound
 * @param {number} hi upper bound
 * @returns {number} clamped value
 */
const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

/**
 * Author-declared filters/sort/hover, shown or hidden per selected collection,
 * with range bounds and multiselect options resolved from the collections'
 * queryables/summaries (fetched lazily and cached).
 * @param {object} options hook options
 * @param {import("vue").Ref<import("@eox/itemfilter").EOxItemFilter>} options.itemfilterEl template ref to `<eox-itemfilter>`
 * @param {boolean} options.datetimeFilter show the datetime range filter
 * @param {import("../types").FiltersConfig} options.declaredFilters author-declared filters
 * @param {import("../types").SortOption[]} options.declaredSortBy author-declared sort options
 * @param {string[]} options.declaredHoverProperties author-declared hover properties
 * @param {string} options.endpoint STAC API root
 * @param {boolean} [options.staticFilters] show declared filters/options as-is, skipping the per-collection metadata fetch
 * @returns config
 */
export const useCatalogConfig = ({
  itemfilterEl,
  datetimeFilter,
  declaredFilters = [],
  declaredSortBy = [],
  declaredHoverProperties = [],
  endpoint,
  staticFilters = false,
}) => {
  /** @type {import("vue").Ref<Record<string, any>[]>} */
  const filterProperties = ref([]);
  const sortByOptions = ref([...declaredSortBy]);
  const hoverProperties = ref([...declaredHoverProperties]);

  /** @type {Map<string, CollectionMetadata>} */
  const metadataCache = new Map();
  let epoch = 0;

  /**
   * @param {string} id collection id
   * @returns {Promise<CollectionMetadata>} cached or freshly fetched metadata
   */
  const loadMetadata = async (id) => {
    const cached = metadataCache.get(id);
    if (cached) return cached;
    try {
      const metadata = await fetchCollectionMetadata(endpoint, id);
      metadataCache.set(id, metadata);
      return metadata;
    } catch {
      return { summaries: {}, queryables: {} };
    }
  };

  /**
   * Build the eox filter config from resolved filters and reconcile the
   * element's live filter state.
   * @param {import("../types").FiltersConfig} resolvedFilters resolved filters
   */
  const setFilterProperties = (resolvedFilters) => {
    const rebuilt = /** @type {Record<string, any>[]} */ (
      createFilterProperties(resolvedFilters, datetimeFilter)
    );
    const live = itemfilterEl.value?.filters;
    reOverlayLiveState(rebuilt, live);
    pruneHiddenFilters(rebuilt, live);
    filterProperties.value = rebuilt;
  };

  /**
   * Resolve and rebuild the config for the selected collections - caching their
   * metadata on first use - and reconcile the element's live filter state.
   * Stale runs (superseded by a newer selection) bail out before writing.
   * @param {string[]} [collectionIds] selected collection ids
   */
  const applyCollections = async (collectionIds = []) => {
    if (staticFilters) {
      sortByOptions.value = [...declaredSortBy];
      hoverProperties.value = [...declaredHoverProperties];
      setFilterProperties(declaredFilters);
      return;
    }

    const token = ++epoch;
    const metadataList = await Promise.all(collectionIds.map(loadMetadata));
    if (token !== epoch) return;

    sortByOptions.value = declaredSortBy.filter((option) =>
      isAvailable(option.property, metadataList),
    );
    hoverProperties.value = declaredHoverProperties.filter((property) =>
      isAvailable(property, metadataList),
    );
    setFilterProperties(
      declaredFilters
        .filter((filter) => isAvailable(filter.property, metadataList))
        .map((filter) => resolveFilter(filter, metadataList)),
    );
  };

  return { filterProperties, sortByOptions, hoverProperties, applyCollections };
};

/**
 * A property is shown when some selected collection summarises/exposes it;
 * with no collection selected (or no metadata) everything declared is shown.
 * @param {string} property STAC property key
 * @param {CollectionMetadata[]} metadataList selected collections' metadata
 * @returns {boolean} true when shown
 */
function isAvailable(property, metadataList) {
  if (DATETIME_KEYS.includes(property)) return true;
  if (!metadataList.length) return true;
  return metadataList.some(
    ({ summaries, queryables }) =>
      property in summaries || property in queryables,
  );
}

/**
 * Fetch a collection's `summaries` and queryables `properties`. Throws when the
 * collection request fails so the caller can avoid caching a transient error;
 * the optional queryables endpoint degrades to `{}`.
 * @param {string} endpoint STAC API root
 * @param {string} id collection id
 * @returns {Promise<CollectionMetadata>} metadata
 */
async function fetchCollectionMetadata(endpoint, id) {
  const [collection, queryables] = await Promise.all([
    axios.get(`${endpoint}/collections/${id}`).then((res) => res.data),
    axios
      .get(`${endpoint}/collections/${id}/queryables`)
      .then((res) => res.data?.properties ?? {})
      .catch(() => ({})),
  ]);
  return { summaries: collection?.summaries ?? {}, queryables };
}

/**
 * Fill a filter's bounds/options from the collections' metadata, keeping what
 * the config already defines.
 * @param {import("../types").FilterConfigItem} filter declared filter
 * @param {CollectionMetadata[]} metadataList selected collections' metadata
 * @returns {import("../types").FilterConfigItem} resolved filter
 */
function resolveFilter(filter, metadataList) {
  if (filter.type === "range") return resolveRange(filter, metadataList);
  if (filter.type === "multiselect" || filter.type === "select") {
    return resolveOptions(filter, metadataList);
  }
  return filter;
}

/**
 * Config `min`/`max` win; otherwise take the bounds from queryables.
 * @param {import("../types").FilterConfigItem} filter declared range filter
 * @param {CollectionMetadata[]} metadataList selected collections' metadata
 * @returns {import("../types").FilterConfigItem} resolved filter
 */
function resolveRange(filter, metadataList) {
  if (typeof filter.min === "number" && typeof filter.max === "number") {
    return filter;
  }
  let min = Infinity;
  let max = -Infinity;
  for (const { queryables } of metadataList) {
    const schema = queryables?.[filter.property];
    if (!schema || !NUMERIC_TYPES.has(schema.type)) continue;
    if (typeof schema.minimum === "number") min = Math.min(min, schema.minimum);
    if (typeof schema.maximum === "number") max = Math.max(max, schema.maximum);
  }
  if (!Number.isFinite(min) && !Number.isFinite(max)) return filter;
  return {
    ...filter,
    min: Number.isFinite(min) ? min : filter.min,
    max: Number.isFinite(max) ? max : filter.max,
  };
}

/**
 * Options come from the collections' summaries for this property: declared
 * `filterKeys` are narrowed to them, or populated from them when none are set.
 * @param {import("../types").FilterConfigItem} filter declared multiselect filter
 * @param {CollectionMetadata[]} metadataList selected collections' metadata
 * @returns {import("../types").FilterConfigItem} resolved filter
 */
function resolveOptions(filter, metadataList) {
  /** @type {Set<any>} */
  const domain = new Set();
  for (const { summaries } of metadataList) {
    const values = summaries?.[filter.property];
    if (Array.isArray(values)) values.forEach((value) => domain.add(value));
  }
  if (!domain.size) return filter;
  const options = filter.filterKeys?.length
    ? filter.filterKeys.filter((key) => domain.has(key))
    : [...domain];
  return { ...filter, filterKeys: options };
}

/**
 * createFilterProperties bakes `state` onto the collection and range filters, so
 * a rebuild would reset the user's live selection - carry it back over.
 * @param {Record<string, any>[]} rebuilt freshly built filter properties
 * @param {Record<string, any> | undefined} live element's live `filters` state
 */
function reOverlayLiveState(rebuilt, live) {
  if (!live) return;
  for (const entry of rebuilt) {
    const liveEntry = live[entry.key];
    if (!liveEntry) continue;
    if (entry.type === "range") {
      const { min, max } = liveEntry.state ?? {};
      if (typeof min === "number" && typeof max === "number") {
        // clamp into the (possibly narrower) rebuilt bounds
        const lo = entry.min ?? min;
        const hi = entry.max ?? max;
        entry.state = { min: clamp(min, lo, hi), max: clamp(max, lo, hi) };
      }
    } else if (entry.key === "collection") {
      entry.state = liveEntry.state;
      entry.stringifiedState = liveEntry.stringifiedState;
    }
  }
}

/**
 * Drop live filter state whose key is no longer in the rebuilt config.
 * @param {Record<string, any>[]} rebuilt freshly built filter properties
 * @param {Record<string, any> | undefined} live element's live `filters` state
 */
function pruneHiddenFilters(rebuilt, live) {
  if (!live) return;
  const validKeys = new Set(rebuilt.map((filter) => filter.key));
  for (const key of Object.keys(live)) {
    if (!validKeys.has(key)) delete live[key];
  }
}
