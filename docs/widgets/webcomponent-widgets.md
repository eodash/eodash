# Web Component Widgets

## Importing a deployed web component library
Including a web component in your instance can be either using an NPM package identifier or a URL (a CDN for example)

### Example of importing from a package identifier
```js
import { store } from "@eodash/eodash"
const { currentUrl } = store.states

export default createEodash({
    ...
    template:{
        ...
        widgets: [      
          {
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
          }
          ...
       ]
    }
})

```
::: warning
importing from a package identifier using an import function is only possible in "compiletime" eodash client configuration. see [here](/api/core/types/interfaces/WebComponentProps.html#link)
:::

### Example of importing from a URL

```js
import { store } from "@eodash/eodash"
const { currentUrl } = store.states

export default createEodash({
    ...
    template:{
        ...
        widgets: [      
          {
            id: "Information",
            title: "Information",
            type: "web-component",
            widget: {
                link: "https://cdn.skypack.dev/@eox/stacinfo",
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
           }
          ...
       ]
    }
})
```

## Deploying Web Components Within Eodash Instance
You can define a web component in a file in your instance project and include it using an internal link.

### Example 
```js
// src/elements/current-date.js

export class CurrentDate extends HTMLElement {
    connectedCallback() {
        // Create a Date object representing the current date.
        const now = new Date();
        
        // Format the date to a human-friendly string, and set the
        // formatted date as the text content of this element.
        this.textContent = now.toLocaleDateString();
    }
}

// Register the CurrentDate component using the tag name <current-date>.
customElements.define('current-date', CurrentDate);
```

```js
// src/main.js

export default createEodash({
    ...
    template:{
        ...
        widgets: [      
          {
            type: "web-component",
            id: Symbol(),
            slidable: true,
            layout: { x: 4, y: 0, h: 3, w: 3 },
            title: "Current Date",
            widget: {
              link: new URL('./elements/current-date.js',import.meta.url).href,
              tagName:"current-date",
            }
          },
          ...
       ]
    }
})
```

## Registering Web Components in eodash
Custom elements normally should be registered in the javascript file defining it. in that case, you should provide the file as a `link` and the `tagName` of your registered element, eodash will automatically import the `link` provided if the `tagName` isn't already defined as a Custom Element. In case the `link` provided doesn't register the element, eodash assumes that it exports a Custom Element Constructor. The exported constructor property from your provided link should be assigned to `constructorProp` and eodash will automatically register the given tagName to that constructor as a custom element.



## Exposed Hooks
the configured web component is exposed on the hooks [onMounted](/api/core/types/interfaces/WebComponentProps.html#onmounted) and [onUnmounted](/api/core/types/interfaces/WebComponentProps.html#onunmounted). this is typically used for adding and removing Event Listeners, or assigning properties.

### Example 
```js
let handleMoveEnd = () => { // [!code focus]
  ... // [!code focus]
} // [!code focus]

export default createEodash({
    ...
    template:{
        ...
        widgets: [      
          {
            type: "web-component",
            id: Symbol(),
            slidable: false,
            layout: { x: 4, y: 0, h: 3, w: 3 },
            title: "Map",
            widget: {
              link:async()=>await import("@eox/map"),
              tagName:"eox-map",
              onMounted:(eoxMap,_store) => {  // [!code focus]
                eoxMap.map.on('moveend', handleMoveEnd) // [!code focus]
              }, // [!code focus]
              onUnmounted:(eoxMap,_store) => { // [!code focus]
                 eoxMap.map.un('moveend', handleMoveEnd) // [!code focus]
              } // [!code focus]
            }
          },
          ...
       ]
    }
})
```
```
