# Branding

eodash allows you to configure your own brand. Check out the [API](/api/Configuration/type-aliases/Eodash.html#brand) and the guide below to learn more.

## No Layout

Removing the header and footer completely by setting:

```js
import { createEodash } from "@eodash/eodash"

export default createEodash({
    ...
    brand: {
        noLayout: true
        ...
    }
})
```

## Dashboard Name

Set the name displayed on the Header:

```js
import { createEodash } from "@eodash/eodash"

export default createEodash({
    ...
    brand: {
        name: "My Dashboard"
        ...
    }
})
```

## Footer Text

Configurable text on the footer:

```js
import { createEodash } from "@eodash/eodash"

export default createEodash({
    ...
    brand: {
        footerText: "Lorem ipsum, dolor sit amet consectetur adipisicing elit."
        ...
    }
})
```

## Logo

Add your own brand logo to the header by referencing it using [Vite's static assets](https://vitejs.dev/guide/assets.html#static-asset-handling) handling:

```js
import { createEodash } from "@eodash/eodash"
import myLogo from './assets/logo.png'
// or
const myLogo = new URL('./assets/logo.png',import.meta.url).href

export default createEodash({
    ...
    brand: {
        logo: myLogo
        ...
    }
})
```

## Theme Customization

eodash components use [Vuetify's theming system](https://vuetifyjs.com/en/features/theme/#api) for color customization. You can adapt the dashboard's look and feel to align with your brand.

### Theme Modification Example

```js
import { createEodash } from "@eodash/eodash"

export default createEodash({
    ...
    brand: {
        ...
        theme: {
           colors: {
             primary: '#004170',
             secondary: '#00417044',
             surface: "#f0f0f0f0",
          },
           dark: false
        }
    }
})
```

The theme accepts the full [Vuetify theme definition](https://vuetifyjs.com/en/features/theme/) plus one eodash-specific field, `collectionsPalette`: an array of colors assigned to collections shown together (for example, chart series and layer accents).

```js
theme: {
  colors: { primary: "#002742" },
  // Bang-Wong color-blind-safe palette
  collectionsPalette: [
    "#009E73",
    "#E69F00",
    "#56B4E9",
    "#F0E442",
    "#0072B2",
    "#D55E00",
    "#CC79A7",
  ],
}
```

## Font Customization

eodash uses [typekit/webfontloader](https://github.com/typekit/webfontloader) to apply the specified font across the dashboard. Fonts are loaded by adding a link to the stylesheet that defines the font-face. The `link` can be either a relative or an absolute URL.

```js
import { createEodash } from "@eodash/eodash"

export default createEodash({
    ...
    brand: {
        ...
        font: {
          link:'/link-to-stylesheet.css',
          family: "MyCustomFont"
        }
    }
})
```

To use a different font for headers and body text, pass an object with `headers` and `body` instead of a single font:

```js
font: {
  headers: {
    family: "Open Sans",
    link: "https://example.com/fonts/opensans/opensans.css",
  },
  body: {
    family: "Sintony",
    link: "/fonts/sintony.css",
  },
}
```

## Error Message

`errorMessage` sets the text shown to users when the dashboard crashes:

```js
brand: {
  errorMessage: "Something went wrong. Please reload the page.",
}
```

## Feedback

`feedback` configures the [eox-feedback](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-feedback--docs) form. `endpoint` is required; `schema` is an optional [eox-jsonform](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-jsonform--docs) JSON Schema for the form fields.

```js
brand: {
  feedback: {
    endpoint: "https://feedback.example.com/submit",
    schema: {
      // eox-jsonform JSON Schema
    },
  },
}
```
