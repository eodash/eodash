# Configuration

Eodash client is configured through a single object that defines where the data comes from, how the dashboard is branded, and which widgets are rendered. You can write a custom object from scratch, or start from one of the provided [templates](/templates) and adjust it.

The complete API reference is described by the [`Eodash`](/api/Configuration/type-aliases/Eodash.html) type.

## id

An identifier for the instance, used internally to distinguish one configuration from another.

```js
{
  id: "my-dashboard",
}
```

## stacEndpoint

The link to the root [STAC](/STAC) catalog that eodash reads to build its layers and items. In its simplest form it is a URL string to a [static STAC Catalog](https://github.com/radiantearth/stac-spec/blob/master/catalog-spec/catalog-spec.md):

```js
{
  stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
}
```

Alternatively, an object can be passed to configure a STAC API endpoint, a dedicated raster [TiTiler services](https://developmentseed.org/titiler/), or the origins allowed to upscale imagery. The full set of options is documented in the [`StacEndpoint`](/api/Configuration/type-aliases/Eodash.html) type.

```js
{
  stacEndpoint: {
    endpoint: "https://api.explorer.eopf.copernicus.eu/stac",
    api: true,
    rasterEndpoint: "https://api.explorer.eopf.copernicus.eu/raster",
    supportedUpscalingEndpoints: [
      { url: "https://api.explorer.eopf.copernicus.eu/raster", titilerVersion: 1 },
      { url: "https://api.explorer.eopf.copernicus.eu/rstaging", titilerVersion: 2 },
    ],
  },
}
```

## brand

The `brand` object configures the dashboard's visual identity: name, colors, fonts, and footer.

```js
{
  brand: {
    name: "My Dashboard",
    font: {
      family: "Open Sans",
      link: "https://eox.at/fonts/opensans/opensans.css",
    },
    theme: {
      colors: {
        primary: "#004170",
        secondary: "#0071c2",
        surface: "#f2f4f3",
      },
    },
    footerText: "© My Organisation",
  },
}
```

See the [Branding](/branding) guide for the full set of brand options.

## templates

A [`Template`](/api/Configuration/interfaces/Template.html) describes the grid: an optional `background` and `loading` widget, the `gap` between cells, and the `widgets` array that fills it. Each entry places a [widget](/widgets/) on the grid and supplies its properties.

Provide a single `template` when one layout is sufficient:

```js
{
  template: {
    background: {
      id: Symbol(),
      type: "internal",
      widget: { name: "EodashMap" },
    },
    widgets: [
      {
        id: Symbol(),
        title: "Item Filter",
        type: "internal",
        layout: { x: 0, y: 0, w: 3, h: 12 },
        widget: { name: "EodashItemFilter" },
      },
    ],
  },
}
```

Use `templates` to offer several layouts the reader can switch between - a named map of templates:

```js
import { lite, explore } from "@eodash/eodash/templates";

export default {
  // ...
  templates: { lite, explore },
};
```

The [Widgets](/widgets/) guide covers the three kinds of widgets and how to configure each. The [Templates](/templates) page explains how to start from a maintained template rather than an empty grid.

## Deployment

A configuration takes effect once it reaches a browser. Eodash supports two deployment modes, and the same configuration object is used for both.

### As a single-page application (SPA)

The default mode builds a complete, standalone application. The project's entry point, `src/main.js`, exports the configuration, optionally wrapped in `createEodash`, which gives the configuration access to the store when parts of it are computed dynamically.

```js
// src/main.js
import { createEodash } from "@eodash/eodash";
import tools from "./tools";

export default createEodash({
  id: "my-dashboard",
  stacEndpoint:
    "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  brand: { name: "My Dashboard" },
  template: {
    background: {
      id: Symbol(),
      type: "internal",
      widget: { name: "EodashMap" },
    },
    widgets: [
      tools,
      {
        id: Symbol(),
        title: "Date Picker",
        type: "internal",
        layout: { x: 10, y: 0, h: 2, w: 2 },
        widget: {
          name: "EodashDatePicker",
          properties: { inline: true },
        },
      },
    ],
  },
});
```

Vite bundles this file at build time, so the configuration can `import` npm packages and local files, and can define its own [internal widgets](/widgets/internal-widgets) as Vue components. Use `eodash dev` during development and `eodash build` to produce the production application. The [CLI](/cli) guide lists the full set of commands and configurations.

`createEodash` also accepts a callback that receives the [store](/eodash-store), so parts of the configuration can be computed from the application's state:

```js
// src/main.js
import { createEodash } from "@eodash/eodash";

export default createEodash((store) => ({
  id: "my-dashboard",
  stacEndpoint:
    "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  brand: { name: "My Dashboard" },
  template: {
    // reference `store` where a widget needs the current state
  },
}));
```

### Integrating the web component (Custom Element)

`<eo-dash>` is a self-contained custom element that can be embedded in an existing page or application. Build it with the `--lib` flag (or `lib: true` in `eodash.config.js`), or use the prebuilt library at `@eodash/eodash/webcomponent` without a build step.

The element reads its configuration from the `config` attribute, which points to a configuration file served alongside the page:

```html
<script type="module" src="@eodash/eodash/webcomponent"></script>
<eo-dash config="/config.js"></eo-dash>
```

```js
// config.js
export default {
  id: "my-dashboard",
  stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  brand: { name: "My Dashboard" },
  template: {
    background: {
      id: Symbol(),
      type: "internal",
      widget: { name: "EodashMap" },
    },
    widgets: [
      {
        id: Symbol(),
        title: "Item Filter",
        type: "internal",
        layout: { x: 0, y: 0, w: 3, h: 12 },
        widget: { name: "EodashItemFilter" },
      },
    ],
  },
};
```

A served file is loaded directly by the browser. Because it is not processed by a bundler, it cannot use bare module specifiers (like `import { ref } from "vue"`) or define new internal widgets via `.vue` files. It can still reference any internal widget already compiled into the bundle, along with [web-component](/widgets/webcomponent-widgets) and iframe widgets.

The `config` property also accepts a callback that returns a configuration. The callback can be async and runs inside the host application's module graph, so it can dynamically `import` a configuration module — which is itself processed by the host's bundler, restoring the ability to import files and folders:

```js
document.querySelector("eo-dash").config = async () =>
  (await import("/config.js")).default;
```

:::tip INFO

- A configuration served to the web component takes precedence over one built into the application, so a default can be shipped and overridden per deployment.
- Both modes are read on every load and reload, allowing different configurations based on conditions such as the current route.
- The served configuration can be set with the `--runtime <path>` CLI flag or the `runtime` property in `eodash.config.js`. The build-time entry point can be set with `--entryPoint <path>` or the `entryPoint` property.

:::
