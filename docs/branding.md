# Branding

## Layout:

Supporting layout customization by allowing to configure the header and footer of the dashboard

### No Layout
removing the header and footer completely by setting: 
```js
{
    ...
    brand: {
        noLayout: true
        ...
    }
}
```
### Dashboard Name
Set the name displayed on the Header:
```js
{
    ...
    brand: {
        name: "My Dashboard"
        ...
    }
}
```

### Footer Text
configurable text on the footer left side:

```js
{
    ...
    brand: {
        footerText: "Lorem ipsum, dolor sit amet consectetur adipisicing elit."
        ...
    }
}
```

### Logo
add your own brand logo to the header by referencing it using [vite's static assets](https://vitejs.dev/guide/assets.html#static-asset-handling) handling:

```js
import myLogo from './assets/logo.png'
// or
const myLogo = new URL('./assets/logo.png',import.meta.url).href 
{
    ...
    brand: {
        logo: myLogo
        ...
    }
}
```
<!-- ::: warning
Only statically served assets in `public` folder can be referenced in eodash runtime configuration. [Learn more](https://vitejs.dev/guide/assets.html#the-public-directory)
::: -->

## Theme Customization
eodash components utilize [Vuetify's theming system](https://vuetifyjs.com/en/features/theme/#api) for colors customization. You can adapt the dashboard's look and feel to align with your brand.

### Basic Theme Modification Example
```js
{
    ...
    brand: {
        ...
        theme: {
           colors: {
            primary: "#fff",
            secondary: "#fff",
            surface: "#fff",
          },
           dark: false
        }
    }
}
```

## Font Customization
eodash utilizes [typekit/webfontloader](https://github.com/typekit/webfontloader) which applies the specified font across the dashboard.
Supporting loading [Google Fonts](https://fonts.google.com) out of the box by adding the font's family name only.

```js
{
    ...
    brand: {
        ...
        font: {
          family: "Poppins"
        }
    }
}
```
or loading custom fonts by adding a link to the stylesheet that defines the font-face. Could be either a relative or absolute URL.

```js
{
    ...
    brand: {
        ...
        font: {
          link:'/link-to-stylesheet.css',  
          family: "MyCustomFont"
        }
    }
}
```

