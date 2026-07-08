/** @type {import("@/types").Template} */
export default {
  gap: 16,
  loading: {
    id: "loading",
    type: "web-component",
    widget: {
      // https://uiball.com/ldrs/
      link: "https://cdn.jsdelivr.net/npm/ldrs/dist/auto/mirage.js",
      tagName: "l-mirage",
      properties: {
        class: "align-self-center justify-self-center",
        size: "120",
        speed: "2.5",
        color: "#004170",
      },
    },
  },
  background: {
    id: "background-map",
    type: "internal",
    widget: {
      name: "EodashMap",
      properties: {
        zoomToExtent: false,
        enableCompare: true,
        btns: {
          enableZoom: true,
          enableExportMap: true,
          enableChangeProjection: true,
          enableMosaic: false,
          enableCompareIndicators: {
            fallbackTemplate: "explore",
            compareTemplate: "compare",
            itemFilterConfig: {
              imageProperty: "assets.thumbnail.href",
            },
          },
          enableBackToPOIs: false,
          enableSearch: false,
        },
      },
    },
  },
  widgets: [
    {
      id: "explore-layercontrol",
      type: "internal",
      title: "Layers",
      layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 11 },
      widget: {
        name: "EodashLayerControl",
      },
    },
    {
      id: "ItemCatalog",
      title: "Catalog",
      type: "internal",
      layout: { x: 0, y: 0, w: "3/3/2", h: 11 },
      widget: {
        name: "EodashItemCatalog",
        properties: {
          layoutTarget: undefined,
          hoverProperties: ["datetime", "eo:cloud_cover"],
        },
      },
    },
  ],
};
