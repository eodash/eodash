import { includesProcess, shouldShowChartWidget } from "@/store/actions";

/** @type {import("@/types").Template} */
export default {
  gap: 16,
  loading: {
    id: Symbol(),
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
      layout: { x: 0, y: 0, w: "3/3/2", h: 2 },
      widget: {
        name: "EodashTools",
        properties: {
          showLayoutSwitcher: false,
          itemFilterConfig: {
            resultType: "cards",
            filtersTitle: "Select an indicator",
            resultsTitle: "",
            subTitleProperty: "subtitle",
            imageProperty: "thumbnail",
          },
        },
      },
    },
    // compare indicators
    {
      id: "CompareTools",
      type: "internal",
      title: "Tools",
      layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 2 },
      widget: {
        name: "EodashTools",
        properties: {
          showLayoutSwitcher: false,
          indicatorBtnText: "Select second indicator",
          itemFilterConfig: {
            enableCompare: true,
            resultType: "cards",
            filtersTitle: "Select an indicator to compare",
            resultsTitle: "",
            subTitleProperty: "subtitle",
            imageProperty: "thumbnail",
          },
        },
      },
    },
    {
      id: "layercontrol",
      type: "internal",
      title: "Layers",
      layout: { x: 0, y: 1, w: "3/3/2", h: 5 },
      widget: {
        name: "EodashLayerControl",
      },
    },
    {
      id: "CompareLayerControl",
      title: "Comparison Layers",
      layout: { x: "9/9/10", y: 1, w: "3/3/2", h: 5 },
      type: "internal",
      widget: {
        name: "EodashLayerControl",
        properties: {
          map: "second",
        },
      },
    },
    {
      defineWidget: (selectedSTAC) =>
        includesProcess(selectedSTAC) && {
          id: "Process",
          type: "internal",
          title: "Processes",
          layout: { x: 0, y: 6, w: "3/3/2", h: 5 },
          widget: {
            name: "EodashProcess",
          },
        },
    },
    {
      defineWidget: (_, updatedCompareStac) =>
        includesProcess(updatedCompareStac, true) && {
          id: "CompareMapProcess",
          type: "internal",
          title: "Processes",
          layout: { x: 9, y: 6, w: "3/3/2", h: 5 },
          widget: {
            name: "EodashProcess",
            properties: {
              enableCompare: true,
            },
          },
        },
    },
    {
      defineWidget: () =>
        shouldShowChartWidget() && {
          id: "ProcessResultChart",
          type: "internal",
          title: "Chart",
          layout: { x: 0, y: 0, w: 6, h: 8 },
          widget: {
            name: "EodashChart",
          },
        },
    },
    {
      defineWidget: () =>
        shouldShowChartWidget(true) && {
          id: "ProcessResultChartCompare",
          type: "internal",
          title: "Compare Chart",
          layout: { x: 6, y: 0, w: 6, h: 8 },
          widget: {
            name: "EodashChart",
            properties: {
              enableCompare: true,
            },
          },
        },
    },
    {
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "expert-Datepicker",
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
  ],
};
