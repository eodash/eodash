# Single Page Application vs Web Component

Utilizing [Vue](https://vuejs.org/guide/extras/ways-of-using-vue.html#embedded-web-components), eodash provides developing and building as a single-page application (SPA) that has a complete application architecture focused on seamless user experiences within a single web page. Eodash also offers encapsulating the dashboard in a self-contained Web Component, which creates a reusable UI element built with standard web technologies under the `<eo-dash/>` tagName. Eodash SPA benefits from a smoother user experience, while Eodash Web Component excels in modularity and cross-project reusability, it can be used as a powerful building block that can often be used effectively within the structure of another web application.

## Eodash as a SPA:

**Development**: Run `eodash dev` to launch the development server.

**Production Build**: Run `eodash build` to create the production-ready version.

**Preview**: Run `eodash preview` to launch a preview of the built app.

## Eodash as a Web Component:

**Configuration**: Set the `lib` option to `true` in `eodash.config.js` or use the `--lib` flag with the `dev` or `build` commands.

The `eodash` web component `<eo-dash/>` comes with a reactive `config` attribute. This attribute accepts the path to the runtime configuration and loads it automatically when the dashboard page loads.

Additionally, `@eodash/eodash` provides a pre-built web component library within the `/webcomponent` package, which can be used if you only want to use the runtime configuration. Checkout [Installing Eodash Web Component In Your Project](/#installing-eodash-web-component-in-your-project)
