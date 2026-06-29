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
Importing by package name only works when a bundler resolves it - build-time configs, or runtime configs bundled into your app. If the browser loads your config file directly, import by URL instead. See [here](/api/Configuration/interfaces/WebComponentProps.html#link).
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

## Deploying Web Components Within an eodash Instance

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
customElements.define("current-date", CurrentDate);
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

Custom elements are normally registered in the JavaScript file that defines them. In that case, provide the file as a `link` and the `tagName` of your registered element; eodash imports the `link` if the `tagName` isn't already defined as a custom element. If the `link` does not register the element, eodash assumes it exports a custom element constructor. Assign that exported constructor property to `constructorProp`, and eodash registers the given `tagName` to that constructor as a custom element.

## Exposed Hooks

The configured web component is exposed on the [onMounted](/api/Configuration/interfaces/WebComponentProps.html#onmounted) and [onUnmounted](/api/Configuration/interfaces/WebComponentProps.html#onunmounted) hooks. These are typically used for adding and removing event listeners, or assigning properties.

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
