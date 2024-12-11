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
  stacEndpoint:
    "https://eodashcatalog.eox.at/test-style/trilateral/catalog.json",
  // "https://gtif-cerulean.github.io/catalog/cerulean/catalog.json",
  brand: {
    noLayout: true,
    name: "Demo",
    theme: {
      colors: {
        primary: "#002742",
        secondary: "#004170",
        surface: "#fff",
      },
    },
    footerText: "Demo configuration of eodash client",
  },
  templates: {
    main: {
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
          title: "Indicators",
          layout: { x: 0, y: 0, w: 3, h: 6 },
          widget: {
            name: "EodashItemFilter",
            properties: {
              enableCompare: true,
              aggregateResults: "collection_group",
            },
          },
        },
        {
          id: Symbol(),
          type: "internal",
          title: "LayoutSwitcher",
          layout: { x: 3, y: 0, w: 1, h: 1 },
          widget: {
            name: "EodashLayoutSwitcher",
            properties: {
              target: "light",
              variant: "flat"
            }
          }
        },
        {
          id: Symbol(),
          type: "internal",
          title: "Layer Control",
          layout: { x: 0, y: 6, w: 3, h: 6 },
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
                  type: "web-component",
                  widget: {
                    link: async () => await import("@eox/stacinfo"),
                    properties: {
                      for: currentUrl,
                      allowHtml: "true",
                      styleOverride: `.single-property {columns: 1!important;}
                            h1 {margin:0px!important;font-size:16px!important;}
                            header h1:after {
                              content:' ';
                              display:block;
                              border:1px solid #d0d0d0;
                            }
                            h2 {font-size:15px}
                            h3 {font-size:14px}
                            summary {cursor: pointer;}
                            #properties li > .value { font-weight: normal !important;}
                            main {padding-bottom: 10px;}
                            .footer-container {line-height:1;}
                            .footer-container button {margin-top: -10px;}
                            .footer-container small {font-size:10px;line-height:1;}`,
                      header: '["title"]',
                      tags: '["themes"]',
                      subheader: "[]",
                      properties: '["satellite","sensor","agency","extent"]',
                      featured: '["description","providers","assets","links"]',
                      footer: '["sci:citation"]',
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
          title: "Indicators",
          layout: { x: 0, y: 0, w: 3, h: 6 },
          widget: {
            name: "EodashItemFilter",
            properties: {
              enableCompare: true,
              aggregateResults: "collection_group",
            },
          },
        },
        {
          id: Symbol(),
          type: "internal",
          title: "Layer Control",
          layout: { x: 0, y: 6, w: 3, h: 6 },
          widget: {
            name: "EodashLayerControl",
          },
        },
        {
          id: Symbol(),
          title: "Layer Control Comparison",
          layout: { x: 9, y: 6, w: 3, h: 6 },
          type: "internal",
          widget: {
            name: "EodashLayerControl",
            properties: {
              map: "second",
            },
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
    light: {
      gap: 6,
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
          title: "Stac info",
          layout: { x: 0, y: 0, w: 3, h: 6},
          widget: {
            name: "EodashStacInfo"
          }
        },
        {
          id: Symbol(),
          type: "internal",
          title: "Layer Control",
          layout: { x: 0, y: 6, w: 3, h: 3 },
          widget: {
            name: "EodashLayerControl",
            properties: {
              tools: ['datetime', 'info','legend'],
              style: "--list-padding: 0; --layer-visibility: none; --layer-tools-button-visibility: none; --padding: 0",
            }
          },
        },
        {
          defineWidget: (selected) => {
            return selected
              ? {
                  id: "Buttons",
                  layout: { x: 11, y: 0, w: 1, h: 1 },
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
    }
  },
});

export default eodash;