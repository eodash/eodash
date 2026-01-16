// import { includesProcess } from "@/store/actions";
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
        initialLayers: [
          {
            type: "Group",
            properties: {
              id: "BaseLayersGroup",
              title: "Base Layers",
            },
            layers: [
              {
                type: "Tile",
                properties: {
                  id: "terrain-light;:;EPSG:3857",
                  title: "Terrain Light",
                },
                source: {
                  type: "XYZ",
                  url: "https://s2maps-tiles.eu/wmts/1.0.0/terrain-light_3857/default/g/{z}/{y}/{x}.jpeg",
                },
              },
            ],
          },
        ],
        enableCompare: true,
        btns: {
          enableZoom: true,
          enableExportMap: true,
          enableChangeProjection: true,
          enableCompareIndicators: {
            fallbackTemplate: "explore",
            itemFilterConfig: {
              // imageProperty: "assets.thumbnail.href",
            },
          },
          enableSearch: true,
        },
      },
    },
  },
  widgets: [
    {
      id: "Layercontrol",
      type: "internal",
      title: "Layers",
      layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 12 },
      widget: {
        name: "EodashLayerControl",
        properties: {
          tools: ["info", "config", "legend", "opacity"],
        },
      },
    },
    {
      id: "ItemCatalog",
      title: "Catalog",
      type: "internal",
      layout: { x: 0, y: 0, w: "3/3/2", h: 12 },
      widget: {
        name: "EodashItemCatalog",
        properties: {
          useMosaic: false,
        },
      },
    },
  ],
};
