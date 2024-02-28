import { createVuetify } from 'vuetify';
import { createWebHistory, createRouter } from 'vue-router'
import { routes } from '@/plugins/router'
import { createTestingPinia } from "@pinia/testing"
import { reactive } from 'vue'
import { currentUrl, mapInstance } from '@/store/States';

/**
 * @param {import("vue").App} app
 * @param {import('vuetify/lib/framework.mjs').VuetifyOptions} vuetifyOptions
 * @param {import("@pinia/testing").TestingOptions | undefined} piniaOptions
 * @param {import('vue-router').Router | undefined} customRouter
 *
 */
export const registerPlugins = (app, vuetifyOptions = {}, piniaOptions = { createSpy: cy.stub() }, customRouter) => {
  const router = customRouter ? customRouter : createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
  })
  app.use(router)

  const vuetify = createVuetify(vuetifyOptions)
  app.use(vuetify)

  const pinia = createTestingPinia(piniaOptions)
  app.use(pinia)
}




/**
 * @type {EodashConfig}
 */

export const mockedEodashConfig = (() => {
  /** @type {any} */
  let handleMoveEnd = null
  return reactive({
    id: 'mocked',
    stacEndpoint: 'https://eurodatacube.github.io/eodash-catalog/RACE/catalog.json',
    routes: [
      {
        title: "demo 1",
        to: '/about'
      },
      {
        title: "demo 2",
        to: 'https://google.com'
      }],
    brand: {
      name: 'Mocked Demo',
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
        widget: {
          link: 'https://cdn.skypack.dev/@eox/map',
          properties: {
            class: "fill-height fill-width overflow-none",
            center: [15, 48],
            layers: [{ type: "Tile", source: { type: "OSM" } }],
          },
          tagName: 'eox-map',
          onMounted(el, _, router) {
           /** @type {any} */(el).zoom = router.currentRoute.value.query['z'];

            mapInstance.value =  /** @type {any} */(el).map;

            mapInstance.value?.on('moveend', handleMoveEnd =
          /** @param {any} evt  */(evt) => {
                router.push({
                  query: {
                    z: `${evt.map.getView().getZoom()}`
                  }
                });
              });
          },
          onUnmounted(_el, _store, _router) {
            mapInstance.value?.un('moveend', handleMoveEnd);
          }
        },
        type: 'web-component'
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
            link: '@eox/stacinfo',
            node_module: true,
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
  })
}
)()
