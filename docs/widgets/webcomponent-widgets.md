# Web Component Widgets

## Registering Included Web Components in eodash
Custom elements normally should be registered in the javascript file defining it. in that case, you should provide the file as a `link` and the `tagName` of your registered element, eodash will automatically run the `link` provided if the `tagName` isn't already defined as a Custom Element. In case the `link` provided doesn't register the element, eodash assumes that it exports a Custom Element Constructor. The exported constructor property from your provided link should be assigned to `constructorProp` and eodash will automatically register the given tagName to that constructor as a custom element.

## Importing a deployed web component library
Including a web component in your instance can be either using an NPM package identifier or a URL (a CDN for example)

### Example of importing from a package identifier
```js
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

### example 


## Exposed Hooks
