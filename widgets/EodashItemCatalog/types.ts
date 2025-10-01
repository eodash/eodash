export interface FilterConfigItem {
  property: string;
  type: "range" | "multiselect" | "select";
  title?: string;
  min?: number;
  max?: number;
  filterKeys?: string[];
  state?: Record<string, boolean>;
  placeholder?: string;
}

export type FiltersConfig = FilterConfigItem[];
