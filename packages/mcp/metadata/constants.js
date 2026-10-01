export const CATEGORY_MAP = {
  EodashMap: "Visualization & Map",
  EodashLayerControl: "Visualization & Map",
  EodashItemCatalog: "Catalog & Discovery",
  EodashItemFilter: "Filtering & Selection",
  EodashTimeSlider: "Temporal Navigation",
  EodashDatePicker: "Temporal Navigation",
  EodashProcess: "Analysis & Processing",
  EodashChart: "Analysis & Processing",
  EodashStacInfo: "Branding & Metadata",
  EodashTools: "Layout & Orchestration",
  EodashLayoutSwitcher: "Layout & Orchestration",
};

export const TAGS_MAP = {
  EodashMap: [
    "map",
    "visualization",
    "layers",
    "openlayers",
    "geo",
    "spatial",
    "globe",
    "projection",
  ],
  EodashLayerControl: [
    "layer",
    "layers",
    "control",
    "visibility",
    "opacity",
    "visualization",
    "legend",
  ],
  EodashItemCatalog: [
    "catalog",
    "stac",
    "items",
    "discovery",
    "search",
    "filter",
    "collection",
  ],
  EodashItemFilter: [
    "filter",
    "filtering",
    "selection",
    "tag",
    "theme",
    "attribute",
    "search",
  ],
  EodashTimeSlider: [
    "time",
    "temporal",
    "slider",
    "datetime",
    "navigation",
    "animation",
    "range",
  ],
  EodashDatePicker: [
    "time",
    "temporal",
    "date",
    "picker",
    "datetime",
    "calendar",
  ],
  EodashProcess: [
    "process",
    "processing",
    "analysis",
    "jsonform",
    "service",
    "execution",
    "wps",
    "algorithms",
  ],
  EodashChart: [
    "chart",
    "vega",
    "graph",
    "timeseries",
    "statistics",
    "analysis",
    "plot",
  ],
  EodashStacInfo: [
    "info",
    "stac",
    "metadata",
    "citation",
    "branding",
    "details",
  ],
  EodashTools: ["tools", "layout", "toolbar", "actions", "orchestration"],
  EodashLayoutSwitcher: [
    "layout",
    "template",
    "switcher",
    "view",
    "orchestration",
  ],
};

export const STAC_EXTENSIONS_MAP = {
  EodashMap: [
    "eox:flatstyle",
    "eodash:rasterform",
    "proj:epsg",
    "eodash:mapProjection",
    "eodash:proj4_def",
    "eodash:merge_assets",
    "eodash:layerExclusive",
  ],
  EodashLayerControl: [
    "eox:flatstyle",
    "eodash:rasterform",
    "eodash:merge_assets",
    "eodash:layerExclusive",
  ],
  EodashItemCatalog: ["eo:cloud_cover"],
  EodashItemFilter: [],
  EodashTimeSlider: [],
  EodashDatePicker: [],
  EodashProcess: ["eodash:jsonform"],
  EodashChart: ["eodash:vegadefinition"],
  EodashStacInfo: ["sci:citation", "sci:doi", "sci:publication"],
};

export const STAC_CORE_FIELDS_MAP = {
  EodashMap: [],
  EodashLayerControl: [],
  EodashItemCatalog: ["datetime", "assets.thumbnail"],
  EodashItemFilter: ["themes", "tags", "summaries"],
  EodashTimeSlider: ["extent.temporal", "datetime"],
  EodashDatePicker: ["extent.temporal", "datetime"],
  EodashProcess: ["links (rel=service)"],
  EodashChart: ["links (rel=service, type=application/json|text/csv)"],
  EodashStacInfo: ["providers", "description", "title"],
};

export const DEFAULT_EXAMPLES = {
  EodashMap: {
    layout: { x: 0, y: 0, w: 9, h: 12 },
    widget: {
      name: "EodashMap",
      properties: {
        enableDrawing: false,
        syncTimeWithStore: true,
      },
    },
  },
  EodashLayerControl: {
    layout: { x: 9, y: 0, w: 3, h: 6 },
    widget: {
      name: "EodashLayerControl",
      properties: {
        tools: ["opacity", "config", "legend"],
      },
    },
  },
  EodashItemCatalog: {
    layout: { x: 0, y: 0, w: 4, h: 12 },
    widget: {
      name: "EodashItemCatalog",
      properties: {
        inlineFilters: true,
      },
    },
  },
  EodashItemFilter: {
    layout: { x: 0, y: 0, w: 3, h: 12 },
    widget: {
      name: "EodashItemFilter",
      properties: {
        enableSearch: true,
      },
    },
  },
  EodashTimeSlider: {
    layout: { x: 0, y: 10, w: 12, h: 2 },
    widget: {
      name: "EodashTimeSlider",
      properties: {
        step: "day",
      },
    },
  },
  EodashDatePicker: {
    layout: { x: 9, y: 0, w: 3, h: 3 },
    widget: {
      name: "EodashDatePicker",
      properties: {},
    },
  },
  EodashProcess: {
    layout: { x: 9, y: 0, w: 3, h: 12 },
    widget: {
      name: "EodashProcess",
      properties: {
        enableCompare: true,
        vegaEmbedOptions: { actions: false },
      },
    },
  },
  EodashChart: {
    layout: { x: 0, y: 8, w: 12, h: 4 },
    widget: {
      name: "EodashChart",
      properties: {},
    },
  },
  EodashStacInfo: {
    layout: { x: 9, y: 0, w: 3, h: 6 },
    widget: {
      name: "EodashStacInfo",
      properties: {
        header: ["title", "description"],
        tags: ["themes"],
      },
    },
  },
  EodashTools: {
    layout: { x: 0, y: 0, w: 12, h: 1 },
    widget: {
      name: "EodashTools",
      properties: {},
    },
  },
  EodashLayoutSwitcher: {
    layout: { x: 10, y: 0, w: 2, h: 1 },
    widget: {
      name: "EodashLayoutSwitcher",
      properties: {},
    },
  },
};
