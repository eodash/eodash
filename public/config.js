const stacStore = window.eodashStore?.stac?.useSTAcStore()
let handleMoveEnd = null;
const { mapInstance, currentUrl } = window?.eodashStore?.states ?? null

/**
 * @type {import("@eodash/eodash").EodashConfig}
*/
export default {
  id: 'template-id',
  stacEndpoint: 'https://eurodatacube.github.io/eodash-catalog/RACE/catalog.json',
  routes: [],
  brand: {
    name: "Dashboard",
    font: {
      family: 'Poppins'
    },
    theme: {
      colors: {
        primary: '#880808',
        secondary: "#AA4A44",
        background: '#d3d3d3',
        surface: "#d3d3d3"
      }
    }
  },
  template: {
    gap: 6,
    background: {
      id: Symbol(),
      widget: {
        link: '@eox/map',
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
              onSelect: async (item) => {
                // console.log(item);
                await stacStore.loadSelectedSTAC(item.href)
              }
            }
          },
          onMounted: async function (el, store, _) {
           /** @type {any} */ (el).apply(store?.stac);
          },
          tagName: 'eox-itemfilter'
        },
        type: 'web-component'
      },
      {
        layout: { "x": 9, "y": 0, "w": 3, "h": 12 },
        defineWidget: (selectedSTAC) => {
          const wmsLink = selectedSTAC?.links.find(l => l.rel == 'wms') ?? false
          return wmsLink ? ({
            id: `${wmsLink['wms:layers'][0]} Map`,
            title: "Map",
            type: 'web-component',
            widget: {
              link: 'https://cdn.skypack.dev/@eox/map',
              properties: {
                class: "fill-height fill-width",
                center: [15, 48],
                layers: [{
                  type: "Tile",
                  source: {
                    type: "TileWMS",
                    url: wmsLink.href,
                    params: {
                      LAYERS: wmsLink['wms:layers'],
                      TILED: true
                    },
                    ratio: 1,
                    serverType: "geoserver"
                  }
                }],
              },
              tagName: 'eox-map',
              onMounted(el, _, router) {
                /** @type {any} */ (el).zoom = router.currentRoute.value.query['z']
                mapInstance.value = /** @type {any} */ (el).map
                mapInstance.value?.on('moveend', handleMoveEnd = (evt) => {
                  router.push({
                    query: {
                      z: `${evt.map.getView().getZoom()}`
                    }
                  })
                })
              },
              onUnmounted(_el, _store, _router) {
                mapInstance.value?.un('moveend', handleMoveEnd)
              }
            },
          }) : ({
            id: 'Information',
            title: 'Information',
            type: 'web-component',
            widget: {
              link: "@eox/stacinfo",
              tagName: 'eox-stacinfo',
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
            },
          })
        },
      },
      {
        id: Symbol(),
        title: 'Container',
        type: 'internal',
        layout: { "x": 4, "y": 8, "w": 4, "h": 3 },
        widget: {
          name: "WidgetsContainer",
          props: {
            widgets: [
              {
                id: Symbol(),
                title: 'Information',
                type: 'web-component',
                widget: {
                  link: "@eox/stacinfo",
                  tagName: 'eox-stacinfo',
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
                },
              },
              {
                defineWidget: (selectedSTAC) => {
                  const legendURL = selectedSTAC?.assets?.legend?.href ?? false
                  return legendURL ? ({
                    id: legendURL,
                    title: 'Legend',
                    type: 'web-component',
                    widget: {
                      link: 'https://unpkg.com/progressive-image-element@latest/dist/index.js',
                      tagName: 'progressive-image',
                      properties: {
                        src: legendURL,
                      },
                      onMounted(el) {
                        const img = document.createElement("img")
                        img.src = legendURL
                        el.appendChild(img)
                      }
                    },
                  }) : ({
                    id: "reset-zoom",
                    title: 'Reset Zoom',
                    type: 'web-component',
                    widget: {
                      link: new URL('/reset-zoom-btn/ResetZoom.S2AXqNgZ.js', import.meta.url).href,
                      tagName: 'reset-zoom-btn',
                      properties: {
                        map: mapInstance,
                        to: 6
                      }
                    },
                  })
                }
              },
            ]
          }
        },
      }
    ]
  }
}
