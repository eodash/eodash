# Branding

eodash allows you to configure your own brand. Check out the [API](/api/client/types/type-aliases/Eodash.html#brand) and the guide below to learn more.

### No Layout

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

### Dashboard Name

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

### Footer Text

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

### Logo

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

eodash components utilize [Vuetify's theming system](https://vuetifyjs.com/en/features/theme/#api) for colors customization. You can adapt the dashboard's look and feel to align with your brand.

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

## Font Customization

eodash utilizes [typekit/webfontloader](https://github.com/typekit/webfontloader) which applies the specified font across the dashboard. Fonts can be loaded by adding a link to the stylesheet that defines the font-face. Could be either a relative or an absolute URL.

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
