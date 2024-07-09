import { reactive } from "vue";
import { currentUrl } from "./store/States";
/**
 * Reactive Edoash Instance Object. provided globally in the app, and used as an
 * intermediate object to make user defined instances config reactive.
 *
 * @type {import("./types").Eodash}
 */
export const eodash = reactive({
  id: "demo",
  stacEndpoint: "https://eodashcatalog.eox.at/test-style/trilateral/catalog.json",
  brand: {
    noLayout: true,
    name: "Demo",
    theme: {
      colors: {
        primary: "#fff",
        secondary: "#fff",
        surface: "#fff",
      },
    },
    footerText: "Demo configuration of eodash client",
  },
  template: {
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
      },
    },
    widgets: [
      {
        id: Symbol(),
        type: "internal",
        title: "Indicators",
        layout: { x: 0, y: 0, w: 4, h: 8 },
        widget: {
          name: "EodashItemFilter",
        },
      },
      {
        id: Symbol(),
        type: "web-component",
        title: "Layer Control",
        layout: { x: 0, y: 8, w: 4, h: 4 },
        widget: {
          link: async() =>{ await import("@eox/layercontrol"); await import("@eox/jsonform")},
          tagName: "eox-layercontrol",
          properties:{
            for:"eox-map",
            class:"pa-4"
          }
        },
      },
      {
        defineWidget: (selectedSTAC) => {
          return selectedSTAC
            ? {
                id: "Information",
                title: "Information",
                layout: { x: 9, y: 0, w: 3, h: 12 },
                type: "web-component",
                widget: {
                  link: async () => await import("@eox/stacinfo"),
                  properties: {
                    for: currentUrl,
                    allowHtml: "true",
                    styleOverride:
                      "#properties li > .value {font-weight: normal !important;}",
                    header: "[]",
                    subheader: "[]",
                    properties: '["description"]',
                    featured: "[]",
                    footer: "[]",
                  },
                  tagName: "eox-stacinfo",
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
              layout: { x: 5, y: 10, w: 1, h: 1 },
              title: "Datepicker",
              widget: {
                name: "EodashDatePicker",
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
                layout: { x: 8, y: 0, w: 1, h: 1 },
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
});

export default eodash;
