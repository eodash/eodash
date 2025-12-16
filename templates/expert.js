import { mdiViewDashboard } from "@mdi/js";
import { includesProcess } from "@/store/actions";

/** @type {import("@/types").Template} */
export default {
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
        zoomToExtent: true,
        btns: {
          enableZoom: true,
          enableExportMap: true,
          enableChangeProjection: true,
          enableCompareIndicators: {
            fallbackTemplate: "expert",
          },
          enableBackToPOIs: true,
          enableSearch: true,
        },
        btnsPosition: {
          x: "12/9/9",
          y: 1,
          gap: 16,
        },
      },
    },
  },
  widgets: [
    {
      id: "Tools",
      type: "internal",
      title: "Tools",
      layout: { x: 0, y: 0, w: "3/3/2", h: 2 },
      widget: {
        name: "EodashTools",
        properties: {
          layoutTarget: "lite",
          layoutIcon: mdiViewDashboard,
          itemFilterConfig: {
            resultType: "cards",
            subTitleProperty: "subtitle",
            imageProperty: "thumbnail",
            aggregateResults: "collection_group",
          },
        },
      },
    },
    {
      id: "Layercontrol",
      type: "internal",
      title: "Layers",
      layout: { x: 0, y: 1, w: "3/3/2", h: 11 },
      widget: {
        name: "EodashLayerControl",
      },
    },
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
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "expert-datetime",
              type: "internal",
              layout: { x: 1, y: 8, w: 8, h: 3 },
              title: "Time Slider",
              widget: {
                name: "EodashTimeSlider",
                properties: {
                  // filters: [
                  //   {
                  //     key: "eo:cloud_cover",
                  //     title: "Cloud Coverage %",
                  //     type: "range",
                  //     expanded: true,
                  //     min: 0,
                  //     max: 100,
                  //     step: 5,
                  //     state: {
                  //       min: 0,
                  //       max: 100,
                  //       },
                  //     },
                  //   ],
                },
              },
            }
          : null;
      },
    },
    {
      defineWidget: (selectedSTAC) =>
        includesProcess(selectedSTAC) && {
          id: "Processes",
          type: "internal",
          title: "Processes",
          layout: { x: "9/9/10", y: 5, w: "3/3/2", h: 5 },
          widget: {
            name: "EodashProcess",
          },
        },
    },
  ],
};
