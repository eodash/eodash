import { reactive } from "vue";
import { currentUrl } from './store/States';

/**
 * Reactive Edoash Instance Object. provided globally in the app,
 * and used as an intermediate object to make user defined instances config reactive.
 * @type {import("./types").Eodash}
 */
const eodash = reactive({
  id: 'demo',
  stacEndpoint: 'https://eurodatacube.github.io/eodash-catalog/RACE/catalog.json',
  routes: [],
  brand: {
    name: 'Demo',
    font: {
      family: 'Poppins'
    },
    theme: {
      colors: {
        primary: '#004170',
        secondary: '#00417044',
        surface: "#f0f0f0f0",
      }
    }
  },
  template: {
    background: {
      id: Symbol(),
      type: "internal",
      widget: {
        name: 'EodashMap'
      }
    },
    widgets: [
      {
        id: Symbol(),
        title: 'Tools',
        layout: { "x": 0, "y": 0, "w": 3, "h": 12 },
        widget: {
          link: 'https://cdn.skypack.dev/@eox/itemfilter',
          properties: {
            config: {
              titleProperty: "title",
              filterProperties: [
                {
                  keys: ["title", "themes"],
                  title: "Search",
                  type: "text",
                  expanded: true,
                },
                {
                  key: "themes",
                  title: "Theme",
                  type: "multiselect",
                  featured: true
                },
              ],
              aggregateResults: "themes",
              enableHighlighting: true,
            }
          },
          onMounted: async function (el, store, _) {
            /**
            * @typedef {object} Item
            * @property {string} href
            * */

            /** @type {any} */(el).apply(store?.stac);
            /** @type {any} */(el).config.onSelect =
              /**
               * @param {Item} item
               * */
              async (item) => {
                console.log(item);
                await store.loadSelectedSTAC(item.href);
              };
          },
          tagName: 'eox-itemfilter'
        },
        type: 'web-component'
      },
      {
        id: Symbol(),
        title: 'Information',
        layout: { "x": 9, "y": 0, "w": 3, "h": 12 },
        widget: {
          link: async () => await import('@eox/stacinfo'),
          properties: {
            for: currentUrl,
            allowHtml: "true",
            styleOverride: "#properties li > .value {font-weight: normal !important;}",
            header: "[]",

            subheader: "[]",
            properties: '["description"]',
            featured: "[]",
            footer: "[]"
          },
          tagName: 'eox-stacinfo'
        },
        type: 'web-component'
      },
    ]
  }
});


export default eodash;
