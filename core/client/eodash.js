import { reactive } from "vue";

/**
 * Reactive Edoash Instance Object. provided globally in the app, and used as an
 * intermediate object to make user defined instances config reactive.
 *
 * @type {import("./types").Eodash}
 */
export const eodash = reactive({
  id: "demo",
  stacEndpoint:
    "https://eodashcatalog.eox.at/test-style/trilateral/catalog.json",
  // "https://gtif-cerulean.github.io/catalog/cerulean/catalog.json",
  brand: {
    noLayout: true,
    name: "Demo",
    theme: {
      colors: {
        primary: "#002742",
        secondary: "#0071C2",
        surface: "#ffff",
      },
      variables: {
        "surface-opacity": 0.6,
        "primary-opacity": 0.8,
      },
    },
    footerText: "Demo configuration of eodash client",
  },
  templates: {
    light: {
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
        id: Symbol(),
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
          id: Symbol(),
          type: "internal",
          title: "Tools",
          layout: { x: 0, y: 0, w: 3, h: 1 },
          widget: {
            name: "EodashTools",
            properties: {
              layoutTarget: "expert",
              itemFilterConfig: {
                resultType: "cards",
                filtersTitle: "",
                style: "--padding: 72px",
                filterProperties: [],
                resultsTitle: "Explore more indicators",
                subTitleProperty: "subtitle",
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
                  title: "Layer Control",
                  layout: { x: 0, y: 1, w: 3, h: 3 },
                  widget: {
                    name: "EodashLayerControl",
                    properties: {
                      tools: ["datetime", "info", "legend"],
                      cssVars: {
                        "--list-padding": "0",
                        "--tools-button-visibility": "none",
                        "--layer-visibility": "none",
                        "--padding": "0",
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
                  layout: { x: 9, y: 0, w: 3, h: 6 },
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
        {
          defineWidget: (selectedSTAC) => {
            return selectedSTAC
              ? {
                  id: "Datepicker",
                  type: "internal",
                  layout: { x: 5, y: 10, w: 2, h: 1 },
                  title: "Datepicker",
                  widget: {
                    name: "EodashDatePicker",
                    properties: {
                      hideArrows: true,
                      hideInputField: true,
                      hintText: `<b>Hint:</b> closest available date is displayed <br />
                            on map (see Analysis Layers)`,
                    },
                  },
                }
              : null;
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
                      compareIndicators: false,
                    },
                  },
                }
              : null;
          },
        },
      ],
    },
    expert: {
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
        id: Symbol(),
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
          id: Symbol(),
          type: "internal",
          title: "Tools",
          layout: { x: 0, y: 0, w: 3, h: 1 },
          widget: {
            name: "EodashTools",
            properties: {
              layoutTarget: "light",
              itemFilterConfig: {
                aggregateResults: "collection_group",
                style: {
                  "--form-flex-direction": "row",
                },
              },
            },
          },
        },
        {
          id: Symbol(),
          type: "internal",
          title: "Layer Control",
          layout: { x: 0, y: 1, w: 3, h: 6 },
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
                  layout: { x: 9, y: 0, w: 3, h: 6 },
                  type: "internal",
                  widget: {
                    name: "EodashStacInfo",
                    properties: {
                      showIndicatorsBtn: false,
                      showLayoutSwitcher: false,
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
                  id: "Datepicker",
                  type: "internal",
                  layout: { x: 5, y: 8, w: 2, h: 2 },
                  title: "Datepicker",
                  widget: {
                    name: "EodashDatePicker",
                    properties: {
                      hintText: `<b>Hint:</b> closest available date is displayed <br />
                            on map (see Analysis Layers)`,
                    },
                  },
                }
              : null;
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
                  },
                }
              : null;
          },
        },
      ],
    },
    compare: {
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
        id: Symbol(),
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
          id: Symbol(),
          type: "internal",
          title: "Tools",
          layout: { x: 0, y: 0, w: 3, h: 1 },
          widget: {
            name: "EodashTools",
            properties: {
              layoutTarget: "expert",
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
          id: Symbol(),
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
          id: Symbol(),
          type: "internal",
          title: "Layer Control",
          layout: { x: 0, y: 1, w: 3, h: 6 },
          widget: {
            name: "EodashLayerControl",
          },
        },
        {
          id: Symbol(),
          title: "Layer Control Comparison",
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
                      compareIndicators: false,
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
                  id: "Datepicker",
                  type: "internal",
                  layout: { x: 5, y: 8, w: 1, h: 2 },
                  title: "Datepicker",
                  widget: {
                    name: "EodashDatePicker",
                    properties: {
                      hintText: `<b>Hint:</b> closest available date is displayed <br />
                                on map (see Analysis Layers)`,
                    },
                  },
                }
              : null;
          },
        },
      ],
    },
  },
});

export default eodash;
