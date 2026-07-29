export interface FilterConfigItem {
  property: string;
  type: "range" | "multiselect" | "select";
  title?: string;
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  filterKeys?: string[];
  /** boolean map for select/multiselect; `{ min, max }` for range */
  state?: Record<string, any>;
  placeholder?: string;
  /** svg icon */
  icon?: string;
  unitLabel?: string;
}

export type FiltersConfig = FilterConfigItem[];

export interface SortOption {
  property: string;
  label: string;
}
