import { includesProcess } from "@/store/actions";

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
      id: "tools",
      type: "internal",
      title: "Tools",
      layout: { x: 0, y: 0, w: 3, h: 1 },
      widget: {
        name: "EodashTools",
        properties: {
          showLayoutSwitcher: false,
          itemFilterConfig: {
            cssVars: {
              "--form-flex-direction": "row",
            },
          },
        },
      },
    },
    // compare indicators
    {
      id: "compare-tools",
      type: "internal",
      title: "Tools",
      layout: { x: 9, y: 0, w: 3, h: 1 },
      widget: {
        name: "EodashTools",
        properties: {
          showLayoutSwitcher: false,
          indicatorBtnText: "Select an indicator to compare",
          itemFilterConfig: {
            enableCompare: true,
            // resultsTitle:"Select an indicator to compare",
            filtersTitle: "Select an indicator to compare",
            // filterProperties: [],
            cssVars: {
              "--form-flex-direction": "row",
            },
          },
        },
      },
    },
    {
      id: "layercontrol",
      type: "internal",
      title: "Layers",
      layout: { x: 0, y: 1, w: 3, h: 6 },
      widget: {
        name: "EodashLayerControl",
      },
    },
    {
      id: "compare-layercontrol",
      title: "Comparison Layers",
      layout: { x: 9, y: 1, w: 3, h: 6 },
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
          id: "Processes",
          type: "internal",
          title: "Processes",
          layout: { x: 9, y: 6, w: 3, h: 5 },
          widget: {
            name: "EodashProcess",
          },
        },
    },
    {
      defineWidget: (selected) => {
        return selected
          ? {
              id: "Buttons",
              layout: { x: 8, y: 0, w: 1, h: 2 },
              title: "Buttons",
              type: "internal",
              widget: {
                name: "EodashMapBtns",
                properties: {
                  compareIndicators: {
                    fallbackTemplate: "expert",
                  },
                },
              },
            }
          : null;
      },
    },
    {
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "expert-Datepicker",
              type: "internal",
              layout: { x: 5, y: 8, w: 2, h: 4 },
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
