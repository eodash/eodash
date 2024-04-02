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
    },
    meta: {},
    footerText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  },
  template: {
    intro: {
      markdown: `
## Section 1
Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
Aldus PageMaker including versions of Lorem Ipsum.

## Section 2
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
          `
    },
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
        slidable: false,
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
            **/

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
