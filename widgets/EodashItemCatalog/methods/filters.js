import { sanitizeBbox } from "@/eodashSTAC/helpers";
import { indicator, mapEl } from "@/store/states";
import { useSTAcStore } from "@/store/stac";
import axios from "@/plugins/axios";
import { buildCqlFilter } from "@/eodashSTAC/cql";

/**
 *
 * @param {import("../types").FiltersConfig} filtersConfig
 */
export const createSubtitleProperty = (filtersConfig) => {
  /**
   * @param {Record<string, any>} item
   */ // should be dynamic based on a prop
  return (item) => {
    let subtitle = "";
    filtersConfig.forEach((filter) => {
      const property = filter.property;
      if ((!filter.icon && !filter.unitLabel) || !item.properties[property]) {
        return;
      }
      if (filter.icon) {
        subtitle += filter.icon;
      }

      let value = item.properties[property];
      if (typeof value === "number" && !Number.isInteger(value)) {
        value = value.toFixed(1);
      }

      subtitle += value;

      if (filter.unitLabel) {
        subtitle += filter.unitLabel;
      }
    });
    return subtitle;
  };
};

/**
 * @param {Array<{
 *   property: string,
 *   type: "range" | "multiselect" | "select",
 *   title?: string,
 *   min?: number,
 *   max?: number,
 *   filterKeys?: string[],
 *   state?: Record<string, boolean>,
 *   placeholder?: string,
 * }>} filtersConfig
 */
// Transform simple filter configs into eox-itemfilter format
export const createFilterProperties = (filtersConfig) => {
  const store = useSTAcStore();
  const baseFilters = [
    {
      key: "collection",
      title: "Collections",
      type: "multiselect",
      placeholder: "Select collections",
      inline: false,
      filterKeys: store.stac?.map((col) => col.id) || [],
      ...(indicator.value && { state: { [indicator.value]: true } }),
    },
  ];

  const dynamicFilters = filtersConfig
    .map((filter) => {
      const propertyKey = `properties.${filter.property}`;

      if (filter.type === "range") {
        return {
          key: propertyKey,
          title: filter.title || filter.property,
          type: "range",
          expanded: true,
          filterKeys: [filter.min || 0, filter.max || 100],
          state: filter.state ?? {
            min: filter.min ?? 0,
            max: filter.max ?? 100,
          },
        };
      } else if (filter.type === "multiselect") {
        return {
          key: propertyKey,
          title: filter.title || filter.property,
          type: "multiselect",
          placeholder: filter.placeholder || `Select ${filter.property}`,
          inline: false,
          filterKeys: filter.filterKeys || [],
          state: filter.state,
        };
      } else if (filter.type === "select") {
        return {
          key: propertyKey,
          title: filter.title || filter.property,
          type: "select",
          placeholder:
            filter.placeholder || `Select ${filter.title || filter.property}`,
          filterKeys: filter.filterKeys || [],
          state: filter.state,
        };
      }

      return null;
    })
    .filter(Boolean);

  return [...baseFilters, ...dynamicFilters];
};

/**
 * Build search URL with proper STAC API parameters
 * @param {Record<string,any>} filters
 * @param {boolean} bboxFilter
 * @param {string} [sortBy]
 * @returns {string}
 */
export const buildSearchUrl = (filters, bboxFilter, sortBy) => {
  const store = useSTAcStore();
  const params = new URLSearchParams();

  if (filters.collection?.stringifiedState) {
    params.append(
      "collections",
      filters.collection.stringifiedState.replaceAll(" ", ""),
    );
  }

  if (mapEl.value?.lonLatExtent && bboxFilter) {
    params.append(
      "bbox",
      sanitizeBbox([...mapEl.value.lonLatExtent]).join(","),
    );
  }

  const cqlFilter = buildCqlFilter(filters);
  if (cqlFilter) {
    params.append("filter", cqlFilter);
  }
  if (sortBy) {
    params.append("sortby", sortBy);
  }

  params.append("limit", "100");

  return `${store.stacEndpoint}/search?${params.toString()}`;
};

/**
 *
 * @param {import("../types").FiltersConfig} propsFilters
 * @param {boolean} bboxFilter
 * @param {import("vue").Ref<import("@/types").GeoJsonFeature[]>} currentItems
 * @param {import("vue").Ref<string>} sortBy
 * @param {import("vue").Ref<import("stac-ts").StacItem | null>} [selectedItemRef]
 */
export const createExternalFilter = (
  propsFilters,
  bboxFilter,
  currentItems,
  sortBy,
  selectedItemRef,
) => {
  let controller = new AbortController();
  /**
   * @param {Array<any>} _items
   * @param {Record<string,any>} filters
   */
  return (_items, filters) => ({
    url: buildSearchUrl(filters, bboxFilter, sortBy.value),
    /** @param {string} url */
    fetchFn: async (url) => {
      controller.abort();
      controller = new AbortController();
      const signal = controller.signal;
      return await axios
        .get(url, { signal })
        .then((res) => {
          /** @type {import("@/types").GeoJsonFeature[]} */
          const results = res.data.features;
          const selected = selectedItemRef?.value;
          if (selected && !results.some((r) => r.id === selected.id)) {
            return [selected, ...results];
          }
          return results;
        })
        .catch((e) => {
          // return previous items if aborted
          if (e.name === "AbortError" || e.name === "CanceledError") {
            return currentItems.value;
          }
          console.error(e);
          return [];
        });
    },
  });
};
