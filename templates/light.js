import { mdiViewDashboardVariant } from "@mdi/js";

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
    id: "lite-map",
    type: "internal",
    widget: {
      name: "EodashMap",
      properties: {
        enableCompare: true,
        enableCursorCoordinates: false,
        enableScaleLine: false,
        btns: {
          enableExportMap: false,
          enableChangeProjection: false,
          enableCompareIndicators: false,
          enableBackToPOIs: false,
          enableSearch: true,
        },
      },
    },
  },
  widgets: [
    {
      id: "tools-light",
      type: "internal",
      title: "Tools",
      layout: { x: 0, y: 0, w: "3/3/2", h: 1 },
      widget: {
        name: "EodashTools",
        properties: {
          layoutTarget: "expert",
          layoutIcon: mdiViewDashboardVariant,
          itemFilterConfig: {
            resultType: "cards",
            filtersTitle: "",
            filterProperties: [],
            resultsTitle: "Explore more indicators",
            subTitleProperty: "subtitle",
            imageProperty: "thumbnail",
            cssVars: {
              "--filter-display": "none",
            },
          },
        },
      },
    },
    {
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "layercontrol-light",
              type: "internal",
              title: "Layers",
              layout: { x: 0, y: 1, w: "3/3/2", h: 10 },
              widget: {
                name: "EodashLayerControl",
                properties: {
                  slider: false,
                  tools: ["datetime", "info", "legend"],
                  cssVars: {
                    "--list-padding": "-8px",
                    "--tools-button-visibility": "none",
                    "--layer-input-visibility": "none",
                    "--layer-type-visibility": "none",
                    "--padding": "8px",
                    "--padding-vertical": "16px",
                    "--layer-tools-button-visibility": "none",
                    "--layer-toggle-button-visibility": "flex",
                    "--layer-summary-visibility": "none",
                    "--layer-visibility": "none",
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
              id: "stacinfo-light",
              type: "internal",
              title: "Information",
              layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 10 },
              widget: {
                name: "EodashStacInfo",
                properties: {
                  tags: [],
                  header: [],
                  footer: [],
                  body: ["description"],
                  styleOverride: "",
                  featured: [],
                },
              },
            }
          : null;
      },
    },
    // {
    //   defineWidget: (selectedSTAC) => {
    //     return selectedSTAC
    //       ? {
    //           id: "light-datepicker",
    //           type: "internal",
    //           layout: { x: 4, y: 7, w: 4, h: 5 },
    //           title: "Date",
    //           widget: {
    //             name: "EodashDatePicker",
    //             properties: {
    //               hintText: `<b>Hint:</b> closest available date is displayed <br />
    //                         on map (see Analysis Layers)`,
    //             },
    //           },
    //         }
    //       : null;
    //   },
    // },
    {
      defineWidget: (selectedSTAC) => {
        return selectedSTAC
          ? {
              id: "light-datepicker",
              type: "internal",
              layout: { x: 0, y: 10, w: 12, h: 5 },
              title: "Date",
              widget: {
                name: "EodashTimeSlider",
              },
            }
          : null;
      },
    },
  ],
};
