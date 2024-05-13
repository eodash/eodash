# Get Started

## Prerequisites
* Node.js version 18 or higher.
* Terminal for accessing eodash via its command line interface (CLI).
* VSCode is recommended, along with the official Vue extension.

Eodash can be used on its own, or be installed into an existing project. In both cases, you can install it with:

```bash
npm install @eodash/eodash 
```
## Create your eodash instance
1. Create your repository from eodash's [config template](https://github.com/eodash/config-template). Check Github's guide on how to [Create a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template#)
2. Install dependecies:
```bash
npm install
```

3. Start the development server.
```bash
npm run dev # or npx eodash dev
```

4. Edit the entry point `src/main.js`.
```js
import { createEodash } from "@eodash/eodash"

export default createEodash({
    ...
})
```

5. Build eodash as a Single Page Application
```bash
npm run build # or npx eodash build
```

6. You can also build eodash as a Web Component library
```bash
npm run build -- --lib # or npx eodash build --lib
```

## Installing eodash Web Component in your project
1. Install `@eodash/eodash` in your project
```bash
npm install @eodash/eodash 
```
2. import `@eodash/eodash/webcomponent` and `@eodash/eodash/webcomponent.css` and use `eo-dash` tag.
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <eo-dash></eo-dash> // [!code focus]
    <script type="module" src="index.js"></script> // [!code focus]
</body>

</html>
```
```js
// index.js
import "@eodash/eodash/webcomponent"
import "@eodash/eodash/webcomponent.css"
...
```
3. Create your [runtime configuration](/instantiation.html#runtime-configuration).
```js
// public/config.js
const store = window.eodashStore

export default {
  id: "my runtime config",
  stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  brand: {
    noLayout: false,
    name: "My Dashboard",
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
    footerText: "lorem ipsum",
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
          color: "#004170"
        }
      }
    },
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
        slidable: true,
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
          link: "https://cdn.skypack.dev/@eox/stacinfo",
          properties: {
            for: store.states.currentUrl,
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
}
```
4. Add the runtime config URL path to the `config` attribute

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="@eodash/eodash/webcomponent.css">
</head>

<body>
    <script type="module" src="@eodash/eodash/webcomponent"></script> 
    <eo-dash config='/config.js'></eo-dash> // [!code focus]
</body>

</html>
```
## Including Stories and Pages
Checkout our [eodash-pages-template](https://github.com/eodash/eodash-pages-template) that uses eodash web component with [Vitepress](https://vitepress.dev) and [EOxStorytelling](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-storytelling--docs) for including pages and stories.

## Command line interface:
Eodash offers a CLI for a seamless development experience. Check out the [CLI guide](/cli) for more information.
```json
{
  ...
  "scripts": {
    "dev": "eodash dev",
    "build": "eodash build",
    "preview": "eodash preview"
  },
  ...
}
```

## Community: 
Don’t hesitate to ask any questions on our [GitHub discussion](https://github.com/eodash/eodash/discussions) forum or contribute to our project by creating a pull request.