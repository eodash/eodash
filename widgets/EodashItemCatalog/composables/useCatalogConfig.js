import { ref } from "vue";
import { axios } from "@/plugins/axios";
import { indicator, compareIndicator } from "@/store/states";
import { createFilterProperties } from "../methods/filters";

/**
 * @typedef {{ summaries?: Record<string, any>, queryables?: Record<string, any> }} CollectionMetadata
 */

const DATETIME_KEYS = ["datetime", "start_datetime", "end_datetime"];

/**
 * Reactive catalog config: the author-declared filters/sort/hover, resolved
 * against the selected collections. `initCatalogConfig` runs once at setup;
 * `onCollectionsChange` re-resolves on selection change and rebuilds
 * `filterProperties` through the (unchanged) `createFilterProperties` builder.
 * @param {object} options hook options
 * @param {import("vue").Ref<any>} options.itemfilterEl template ref to `<eox-itemfilter>`
 * @param {import("vue").Ref<string|null> | import("vue").ComputedRef<string|null>} options.endpoint catalog STAC endpoint
 * @param {ReturnType<typeof import("@/store/stac").useSTAcStore>} options.store STAC store
 * @param {boolean} options.datetimeFilter show the datetime range filter
 * @param {boolean} [options.enableCompare] resolve against the compare panel's collection
 * @param {import("../types").FiltersConfig} options.declaredFilters author-declared filters
 * @param {import("../types").SortOption[]} options.declaredSortBy author-declared sort options
 * @param {string[]} options.declaredHoverProperties author-declared hover properties
 * @returns reactive catalog config
 */
export const useCatalogConfig = ({
  itemfilterEl,
  endpoint,
  store,
  datetimeFilter,
  enableCompare = false,
  declaredFilters = [],
  declaredSortBy = [],
  declaredHoverProperties = [],
}) => {
  /** @type {import("vue").Ref<Record<string, any>[]>} */
  const filterProperties = ref([]);
  const sortByOptions = ref([...declaredSortBy]);
  const hoverProperties = ref([...declaredHoverProperties]);

  let lastResolvedSignature = "";
  /** @type {AbortController | undefined} */
  let configController;
  /** @type {Map<string, CollectionMetadata>} */
  const metadataCache = new Map();

  /**
   * Summaries already loaded in the store for a collection, if any.
   * @param {string} id
   */
  const knownSummariesFor = (id) => {
    if (store.selectedStac?.id === id) return store.selectedStac?.summaries;
    if (store.selectedCompareStac?.id === id)
      return store.selectedCompareStac?.summaries;
    return undefined;
  };

  /**
   * @param {string[]} collectionIds
   * @param {AbortSignal} [signal]
   */
  const fetchMetadata = (collectionIds, signal) =>
    Promise.all(
      collectionIds.map(async (id) => {
        const cached = metadataCache.get(id);
        if (cached) return cached;
        const metadata = await fetchCollectionMetadata(
          endpoint.value,
          id,
          signal,
          knownSummariesFor(id),
        );
        if (!signal?.aborted) metadataCache.set(id, metadata);
        return metadata;
      }),
    );

  /**
   * @param {number} value
   * @param {number} lo
   * @param {number} hi
   */
  const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

  /**
   * @param {CollectionMetadata[]} metadataByCollection
   * @param {string[]} collectionIds
   */
  const buildFor = (metadataByCollection, collectionIds) => {
    const filters = resolveDeclaredFilters(
      declaredFilters,
      metadataByCollection,
    );
    sortByOptions.value = resolveSortBy(declaredSortBy, metadataByCollection);
    hoverProperties.value = resolveHoverProperties(
      declaredHoverProperties,
      metadataByCollection,
    );

    const rebuilt = /** @type {Record<string, any>[]} */ (
      createFilterProperties(filters, datetimeFilter)
    );

    // createFilterProperties bakes a defined `state` on the collection filter
    // (indicator seed) and on ranges (bounds), so eox's apply() would overwrite
    // the user's live selection on rebuild — re-overlay it. Multiselect facets
    // have no baked state, so apply() keeps them automatically.
    const live = itemfilterEl.value?.filters;
    if (live && collectionIds.length) {
      for (const entry of rebuilt) {
        const liveEntry = live[entry.key];
        if (!liveEntry) continue;
        if (entry.type === "range") {
          const s = liveEntry.state;
          if (s && typeof s.min === "number" && typeof s.max === "number") {
            const lo = entry.min ?? s.min;
            const hi = entry.max ?? s.max;
            entry.state = {
              min: clamp(s.min, lo, hi),
              max: clamp(s.max, lo, hi),
            };
          }
        } else if (entry.key === "collection") {
          entry.state = liveEntry.state;
          entry.stringifiedState = liveEntry.stringifiedState;
        }
      }
    }
    filterProperties.value = rebuilt;

    // drop live records for facets no longer present, so stale selections do
    // not leak into the search query; itemfilter never removes them itself.
    if (live) {
      const validKeys = new Set(rebuilt.map((f) => f.key));
      for (const key of Object.keys(live)) {
        if (!validKeys.has(key)) delete live[key];
      }
    }
  };

  const initCatalogConfig = async () => {
    const id = enableCompare
      ? (store.selectedCompareStac?.id ?? compareIndicator.value ?? null)
      : (store.selectedStac?.id ?? indicator.value ?? null);
    lastResolvedSignature = id ?? "";
    const metadata = id ? await fetchMetadata([id]) : [];
    buildFor(metadata, id ? [id] : []);
  };

  /** @param {string[]} collectionIds */
  const onCollectionsChange = async (collectionIds) => {
    const signature = [...collectionIds].sort().join(",");
    if (signature === lastResolvedSignature) return;
    lastResolvedSignature = signature;
    configController?.abort();
    const controller = new AbortController();
    configController = controller;
    const metadata = await fetchMetadata(collectionIds, controller.signal);
    if (signature !== lastResolvedSignature) return;
    buildFor(metadata, collectionIds);
  };

  return {
    filterProperties,
    sortByOptions,
    hoverProperties,
    initCatalogConfig,
    onCollectionsChange,
  };
};

/**
 * Fetch a collection's `summaries` (enum sources) and `queryables` properties
 * (range schemas). Each half degrades to `{}` on error (static catalog / no
 * queryables endpoint).
 * @param {string | null} endpoint
 * @param {string} collectionId
 * @param {AbortSignal} [signal]
 * @param {Record<string, any>} [knownSummaries] skip the collection fetch when summaries are already in hand
 * @returns {Promise<CollectionMetadata>}
 */
async function fetchCollectionMetadata(
  endpoint,
  collectionId,
  signal,
  knownSummaries,
) {
  const [summaries, queryables] = await Promise.all([
    knownSummaries
      ? Promise.resolve(knownSummaries)
      : axios
          .get(`${endpoint}/collections/${collectionId}`, { signal })
          .then((res) => res.data?.summaries ?? {})
          .catch(() => ({})),
    axios
      .get(`${endpoint}/collections/${collectionId}/queryables`, { signal })
      .then((res) => res.data?.properties ?? {})
      .catch(() => ({})),
  ]);
  return { summaries, queryables };
}

/**
 * A property is available when it is the datetime dimension or appears in any
 * selected collection's summaries/queryables. Used to prune sort/hover.
 * @param {string} property
 * @param {CollectionMetadata[]} metadataByCollection
 * @returns {boolean}
 */
export const isPropertyPresent = (property, metadataByCollection) =>
  DATETIME_KEYS.includes(property) ||
  metadataByCollection.some(
    ({ summaries, queryables }) =>
      (!!summaries && property in summaries) ||
      (!!queryables && property in queryables),
  );

/**
 * @param {string} property
 * @param {CollectionMetadata[]} metadataByCollection
 * @returns {string[]}
 */
const collectEnumOptions = (property, metadataByCollection) => {
  /** @type {string[]} */
  const options = [];
  for (const { summaries } of metadataByCollection) {
    const value = summaries?.[property];
    if (!Array.isArray(value)) continue;
    for (const entry of value) {
      if (typeof entry === "string" && !options.includes(entry)) {
        options.push(entry);
      }
    }
  }
  return options;
};

/**
 * `present` (a numeric queryable in any collection) hides the filter when false.
 * @param {import("../types").FilterConfigItem} declared
 * @param {CollectionMetadata[]} metadataByCollection
 * @returns {{ min: number, max: number, present: boolean }}
 */
function resolveRangeBounds(declared, metadataByCollection) {
  let min = Infinity;
  let max = -Infinity;
  let present = false;
  for (const { queryables } of metadataByCollection) {
    const schema = queryables?.[declared.property];
    if (!schema || (schema.type !== "number" && schema.type !== "integer")) {
      continue;
    }
    present = true;
    if (typeof schema.minimum === "number") min = Math.min(min, schema.minimum);
    if (typeof schema.maximum === "number") max = Math.max(max, schema.maximum);
  }
  return {
    min: Number.isFinite(min) ? min : (declared.min ?? 0),
    max: Number.isFinite(max) ? max : (declared.max ?? 100),
    present,
  };
}

/**
 * Populate declared filters from the selected collections' metadata, dropping
 * any whose property no selected collection exposes.
 * @param {import("../types").FiltersConfig} declaredFilters
 * @param {CollectionMetadata[]} metadataByCollection
 * @returns {import("../types").FiltersConfig}
 */
function resolveDeclaredFilters(declaredFilters, metadataByCollection) {
  if (!metadataByCollection.length) return [];
  /** @type {import("../types").FiltersConfig} */
  const resolved = [];
  for (const declared of declaredFilters) {
    // datetime is handled by the base datetime filter in createFilterProperties;
    // pass a declared datetime facet through untouched.
    if (declared.property === "datetime") {
      resolved.push({ ...declared });
      continue;
    }
    if (declared.type === "range") {
      const { min, max, present } = resolveRangeBounds(
        declared,
        metadataByCollection,
      );
      if (!present) continue;
      const span = max - min;
      resolved.push({
        ...declared,
        min,
        max,
        step: declared.step ?? (span > 0 ? span / 100 : 1),
        state: declared.state ?? { min, max },
      });
    } else {
      const filterKeys = collectEnumOptions(
        declared.property,
        metadataByCollection,
      );
      if (!filterKeys.length) continue;
      resolved.push({ ...declared, filterKeys });
    }
  }
  return resolved;
}

/**
 * @param {import("../types").SortOption[]} declaredSortBy
 * @param {CollectionMetadata[]} metadataByCollection
 * @returns {import("../types").SortOption[]}
 */
function resolveSortBy(declaredSortBy, metadataByCollection) {
  return declaredSortBy.filter((option) =>
    isPropertyPresent(option.property, metadataByCollection),
  );
}

/**
 * @param {string[]} declaredHoverProperties
 * @param {CollectionMetadata[]} metadataByCollection
 * @returns {string[]}
 */
function resolveHoverProperties(declaredHoverProperties, metadataByCollection) {
  return declaredHoverProperties.filter((property) =>
    isPropertyPresent(property, metadataByCollection),
  );
}
