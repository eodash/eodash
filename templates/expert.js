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
              id: "expert-datepicker",
              type: "internal",
              layout: { x: 4, y: 7, w: 4, h: 5 },
              title: "Date",
              widget: {
                name: "EodashDatePicker",
                properties: {
                  hintText: `<b>Hint:</b> closest available date is displayed <br />
                            on map (see Analysis Layers)`,
                  toggleCalendar: true,
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
          layout: { x: "9/9/10", y: 6, w: "3/3/2", h: 5 },
          widget: {
            name: "EodashProcess",
          },
        },
    },
  ],
};
