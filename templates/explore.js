import { includesProcess } from "@/store/actions";
/** @type {import("@/types").Template} */
//@ts-expect-error todo
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
        enableCompare: true,
      },
    },
  },
  widgets: [
    {
      id: "Tools",
      type: "internal",
      title: "Tools",
      layout: { x: 0, y: 0, w: "3/3/2", h: 1 },
      widget: {
        name: "EodashTools",
        properties: {
          itemFilterConfig: {
            explore: true,
            resultType: "cards",
            subTitleProperty: "subtitle",
            imageProperty: "thumbnail",
            aggregateResults: "collection_group",
          },
        },
      },
    },
    // {
    //   id: "Layercontrol",
    //   type: "internal",
    //   title: "Layers",
    //   layout: { x: 0, y: 6, w: "3/3/2", h: 5 },
    //   widget: {
    //     name: "EodashLayerControl",
    //   },
    // },
    {
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "Information",
              title: "Information",
              layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 6 },
              type: "internal",
              widget: {
                name: "EodashStacInfo",
              },
            }
          : null;
      },
    },
    {
      id: "ItemCatalog",
      title: "Catalog",
      type: "internal",
      layout: { x: 0, y: 1, w: "4/4/3", h: 11 },
      widget: {
        name: "EodashItemCatalog",
      },
    },
    {
      defineWidget: (selectedSTAC) =>
        includesProcess(selectedSTAC) && {
          id: "Processes",
          type: "internal",
          title: "Processes",
          layout: { x: "9/9/10", y: 6, w: "3/3/2", h: 5 },
          widget: {
            name: "EodashProcess",
          },
        },
    },
  ],
};
