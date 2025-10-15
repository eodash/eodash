import { sanitizeBbox } from "@/eodashSTAC/helpers";
import { indicator, mapEl } from "@/store/states";
import { useSTAcStore } from "@/store/stac";

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
    // {
    //   key: "properties.datetime",
    //   title: "Date",
    //   type: "range",
    //   format: "date",
    // }
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
          state: {
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
 * Build STAC API filter string from dynamic filters
 * @param {Record<string,any>} filters
 * @param {import("../types").FiltersConfig} propsFilters
 * @returns {string}
 */
export const buildStacFilters = (filters, propsFilters) => {
  /** @type {string[]} */
  const stacFilters = [];

  propsFilters.forEach((filterConfig) => {
    const filterKey = `properties.${filterConfig.property}`;
    const filterValue = filters[filterKey];

    if (!filterValue) return;

    if (filterConfig.type === "range" && filterValue.state) {
      const { min, max } = filterValue.state;

      // Add range filters based on configuration
      if (min !== undefined && min > (filterConfig.min || 0)) {
        stacFilters.push(`${filterConfig.property}>=${min}`);
      }
      if (max !== undefined && max < (filterConfig.max || 100)) {
        stacFilters.push(`${filterConfig.property}<=${max}`);
      }
    } else if (
      filterConfig.type === "multiselect" &&
      filterValue.stringifiedState
    ) {
      // Handle multiselect filters
      const selectedValues = filterValue.stringifiedState;
      if (selectedValues.length > 0) {
        stacFilters.push(`${filterConfig.property} IN (${selectedValues})`);
      }
    } else if (filterConfig.type === "select" && filterValue.stringifiedState) {
      // Handle single select filters
      const selectedValue = filterValue.stringifiedState;
      if (selectedValue) {
        stacFilters.push(`${filterConfig.property}='${selectedValue}'`);
      }
    }
  });

  return stacFilters.join(" AND ");
};

/**
 * Build search URL with proper STAC API parameters
 * @param {Record<string,any>} filters
 * @param {Array<any>} propsFilters
 * @param {boolean} bboxFilter
 * @returns {string}
 */
export const buildSearchUrl = (filters, propsFilters, bboxFilter) => {
  const store = useSTAcStore();
  const params = new URLSearchParams();

  // Add collections
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

  // Add dynamic filters
  const stacFilter = buildStacFilters(filters, propsFilters);
  if (stacFilter) {
    params.append("filter", stacFilter);
  }

  // Add limit
  params.append("limit", "100");

  return `${store.stacEndpoint}/search?${params.toString()}`;
};

/**
 *
 * @param {import("../types").FiltersConfig} propsFilters
 * @param {boolean} bboxFilter
 */
export const createExternalFilter = (propsFilters, bboxFilter) => {
  /**
   * @param {Array<any>} _items
   * @param {Record<string,any>} filters
   */
  return (_items, filters) => ({
    url: buildSearchUrl(filters, propsFilters, bboxFilter),
    key: "features",
  });
};
