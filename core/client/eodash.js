import { mdiViewDashboard, mdiViewDashboardVariant } from "@mdi/js";
import { reactive } from "vue";
import { includesProcess } from "./store/actions";

/**
 * Reactive Edoash Instance Object. provided globally in the app, and used as an
 * intermediate object to make user defined instances config reactive.
 *
 * @type {import("./types").Eodash}
 */
export const eodash = reactive({
  id: "demo",
  options: {
    // useSubCode: true,
  },
  stacEndpoint:
    // "https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json",
    // "https://esa-eodashboards.github.io/RACE-catalog/RACE/catalog.json",
    // "https://GTIF-Austria.github.io/public-catalog/pr-preview/pr-16/GTIF-Austria/catalog.json",
    // "https://gtif-cerulean.github.io/catalog/cerulean/catalog.json",
    // "https://eodashcatalog.eox.at/samplecatalog/samples/catalog.json",
    // "https://gtif-cerulean.github.io/deside-catalog/deside/catalog.json",
    "https://gtif-cerulean.github.io/cerulean-catalog/cerulean/catalog.json",
  // "https://gtif-austria.github.io/public-catalog/GTIF-Austria/catalog.json",
  brand: {
    noLayout: true,
    name: "Demo",
    font: {
      headers: {
        family: "Open Sans",
        link: "https://eox.at/fonts/opensans/opensans.css",
      },
      body: {
        family: "Sintony",
        link: "https://eox.at/fonts/sintony/sintony.css",
      },
    },
    theme: {
      colors: {
        primary: "#002742",
        secondary: "#0071C2",
        surface: "#ffff",
      },
      variables: {
        "surface-opacity": 0.8,
        "primary-opacity": 0.8,
      },
      // Bank-Wong palette
      collectionsPalette: [
        "#009E73",
        "#E69F00",
        "#56B4E9",
        "#009E73",
        "#F0E442",
        "#0072B2",
        "#D55E00",
        "#CC79A7",
        "#994F00",
      ],
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
          id: Symbol(),
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
                  layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 12 },
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
                  id: "light-datepicker",
                  type: "internal",
                  layout: { x: 4, y: 7, w: 4, h: 5 },
                  title: "Date",
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
          id: Symbol(),
          type: "internal",
          title: "Tools",
          layout: { x: 0, y: 0, w: "3/3/2", h: 1 },
          widget: {
            name: "EodashTools",
            properties: {
              layoutTarget: "light",
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
          id: Symbol(),
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
          defineWidget: (selected) => {
            return selected
              ? {
                  id: "Buttons",
                  layout: { x: "8/8/9", y: 0, w: 1, h: 2 },
                  title: "Buttons",
                  type: "internal",
                  widget: {
                    name: "EodashMapBtns",
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
          id: Symbol(),
          type: "internal",
          title: "Tools",
          layout: { x: 0, y: 0, w: "3/3/2", h: 1 },
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
          id: Symbol(),
          type: "internal",
          title: "Tools",
          layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 1 },
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
          id: Symbol(),
          type: "internal",
          title: "Layers",
          layout: { x: 0, y: 1, w: "3/3/2", h: 11 },
          widget: {
            name: "EodashLayerControl",
          },
        },
        {
          id: Symbol(),
          title: "Comparison Layers",
          layout: { x: "9/9/10", y: 1, w: "3/3/2", h: 4 },
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
              layout: { x: 9, y: 6, w: "3/3/2", h: 5 },
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
                  layout: { x: "8/8/9", y: 0, w: 1, h: 2 },
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
    },
  },
});

export default eodash;
