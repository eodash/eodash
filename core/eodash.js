import { reactive } from "vue";
import { currentUrl } from "./store/States";

/**
 * Reactive Edoash Instance Object. provided globally in the app,
 * and used as an intermediate object to make user defined instances config reactive.
 * @type {import("./types").Eodash}
 */
const eodash = reactive({
  id: "demo",
  stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  routes: [],
  brand: {
    name: "Demo",
    font: {
      family: "Poppins",
    },
    theme: {
      colors: {
        primary: "#004170",
        secondary: "#00417044",
        surface: "#f0f0f0f0",
      },
    },
    meta: {},
    footerText: "Demo configuration of eodash client",
  },
  template: {
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
        title: "itemfilter",
        layout: { x: 0, y: 0, w: 3, h: 12 },
        slidable: false,
        widget: {
          name: "EodashItemFilter",
        },
      },
      {
        id: Symbol(),
        type: "internal",
        title: "datepicker",
        layout: { x: 5, y: 11, w: 2, h: 1 },
        slidable: false,
        widget: {
          name: "EodashDatePicker",
          properties: {
            inline: true,
          },
        },
      },
      {
        id: Symbol(),
        title: "Information",
        layout: { x: 9, y: 0, w: 3, h: 12 },
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
        type: "web-component",
      },
    ],
  },
});

export default eodash;
