# Widgets
eodash client is a micro frontend host, that exposes a store to share stateful STAC related data and actions between the widgets. The placement of the widgets is backed by the [EOxElement](https://github.com/EOX-A/EOxElements) `@eox/layout` that offers a grid based layout system, and a `layout` property configures the element on the dashboard. Refer to the [API](/api/core/types/type-aliases/Widget.html) to learn more.

## Type of Widgets:
eodash supports the integration of three widget types `iframes`, `web-components`, and `internal`:

### Web Component Widgets
Learn how to integrate Web Components that are developed using Custom Elements specification by referring to the [guide](/widgets/webcomponent-widgets) and [API](/api/core/types/interfaces/WebComponentWidget.html).

### IFrame Widgets
Integrating micro-frontend standalone apps and HTML files using an IFrame. Check out the [API](/api/core/types/interfaces/IFrameWidget.html) for further information. 
#### Example 
```js
const myIframe =  new URL('./assets/iframe.html', import.meta.url).href // in-project HTML file
//or
const myIframe = "https://eox-a.github.io/EOxElements" // external URL

export default createEodash({
    ...
    template: {
        ...
        widgets:[
             {
               id: Symbol(),
               type: "iframe",
               slidable: false,
               layout: { x: 4, y: 0, h: 3, w: 3 },
               title: "Iframe Example",
               widget: {
                 src: myIframe
               }
             }
            ... 
        ]
    }
})
```

### Internal Widgets
Eodash provides Internal Widgets as extendable Vue Components that are maintained within the package. Along with these, users can also define their own Vue Components. A guide is available to [learn more](/widgets/internal-widgets). For further information, you can refer to the [API](/api/core/types/interfaces/InternalComponentWidget.html).


## Functional Widgets
Functional widgets are a special form of widgets that are rendered using the [defineWidget](/api/core/types/interfaces/FunctionalWidget#definewidget) function on STAC object selection, and provides the selected STAC object as a parameter before render. The render of the widget is triggered when the `id` of the returned config changes. It gives the ability to switch and hide widgets based on a specific state or indicator.

### Example based on the existence of a WMS relation
in the following example a widget is configured based on if a wms relation is found in the selected STAC object links. A `eox-stacinfo` web component is rendered if no relation found. A `eox-map` web component is rendered whenever a relation is found, and rerendered if `wmsLink["wms:layers"][0]` value changes.

```js
import { store } from "@eodash/eodash"

const { currentUrl } = store.states

export default createEodash({
    template: {
        ...
        widgets:[
            {
              layout: { x: 9, y: 0, w: 3, h: 12 },
              defineWidget: (selectedSTAC) => {
                const wmsLink = selectedSTAC?.links.find((link) => link.rel == "wms") ?? false;
                return wmsLink
                  ? {
                    id: `${wmsLink["wms:layers"][0]} Map`,
                    title: "Map",
                    type: "web-component",
                    widget: {
                      link: "https://cdn.skypack.dev/@eox/map",
                      properties: {
                        class: "fill-height fill-width",
                        center: [15, 48],
                        layers: [
                          {
                            type: "Tile",
                            source: {
                              type: "TileWMS",
                              url: wmsLink.href,
                              params: {
                                LAYERS: wmsLink["wms:layers"],
                                TILED: true,
                              },
                              ratio: 1,
                              serverType: "geoserver",
                            },
                          },
                        ],
                      },
                      tagName: "eox-map",
                    },
                  }
                  : {
                    id: "Information",
                    title: "Information",
                    type: "web-component",
                    widget: {
                      link: () => import("@eox/stacinfo"),
                      tagName: "eox-stacinfo",
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
                    },
                  };
              },
            },
            ...
        ]
    }
})
```


## Background Widget
Defining a Background Widget which is typically used for setting the map.

### Example 
```js
export default createEodash({
    template: {
        ...
        background: {
           id: Symbol(),
           type: "internal",
           widget: {
             name: "EodashMap",
           },
         },
    }
})

```

## Loading Widget
You can set a loading spinner or animation using any widget type, the configured widget will be displayed as a fallback for the dashboard suspunsible states.

### Example 
```js
export default createEodash({
    template: {
        ...
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
                color: "#004170"
              }
            }
        },
    }
})
```

