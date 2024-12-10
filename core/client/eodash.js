import { reactive, ref } from "vue";
import { currentUrl } from "./store/States";

const show = ref(false)

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
        properties: {
          enableCompare: true,
        },
      },
    },
    widgets: [
      {
        id: "indicator",
        type: "internal",
        title: "Indicators",
        layout: { x: 0, y: 0, w: 3, h: 1 },
        widget: {
          name: "EodashIndicatorBtn",
          properties: {
            "onClick": (/** @type {boolean} */ newVal) => show.value = newVal,
            widget: {
              id: Symbol(),
              type: "internal",
              title: "PopUp",
              layout: { x: 0, y: 0, w: 0, h: 0 },
              widget: {
                name: "PopUp",
                properties: {
                  modelValue:show,
                  "onUpdate:modelValue": (/** @type {boolean} */ newVal) => show.value = newVal,
                  widget: {
                    id: Symbol(),
                    type: "internal",
                    title: "Indicators",
                    layout: { x: 0, y: 0, w: 0, h: 1 },
                    widget: {
                      name: "EodashItemFilter",
                      properties: {
                        enableCompare: true,
                        aggregateResults: "collection_group",
                        imageProperty: "assets.thumbnail.href",
                        subTitleProperty: "subtitle",
                        resultType: "cards",
                        filterProperties: []
                      },
                    },
                  }
                },
              }
            }
          }
        },
      },
      {
        defineWidget: (selectedSTAC) => {
          return selectedSTAC
            ? {
                id: "Information",
                title: "Information",
                layout: { x: 0, y: 1, w: 3, h: 4 },
                type: "web-component",
                widget: {
                  link: async () => await import("@eox/stacinfo"),
                  properties: {
                    for: currentUrl,
                    allowHtml: "true",
                    properties: '["description"]',
                  },
                  tagName: "eox-stacinfo",
                },
              }
            : null;
        },
      },
      {
        id: Symbol(),
        type: "internal",
        title: "Layer Control",
        layout: { x: 8, y: 6, w: 3, h: 6 },
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
  },
});

export default eodash;
