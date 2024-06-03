# Instantiating Eodash
Eodash client is configured through two primary methods:

## Compile-time (Build-time) Configuration
To configure your instance, the default and recommended method is to use Compile Time Configuration. In this method, eodash utilizes the exported `createEodash` function from the entry point of your project `src/main.js` to define your custom dashboard. When your instance is being built, this configuration is processed by Vite and bundled into the minified output.

### example
```js
// src/main.js

import { createEodash } from "@eodash/eodash";
import tools from "./tools";
import basedOnWms from "./basedOnWms";
import container from "./container";

export default createEodash({
  id: "id",
  stacEndpoint: "https://eurodatacube.github.io/eodash-catalog/RACE/catalog.json",
  brand: {
    name: "Dashboard",
    font: {
      family: "Poppins",
    },
    theme: {
      colors: {
        primary: "#880808",
        secondary: "#AA4A44",
        background: "#d3d3d3",
        surface: "#d3d3d3",
      },
    },
  },
  template: {
    gap: 6,
    background: {
      id: Symbol(),
      type: "internal",
      widget: {
        name: "EodashMap",
      },
    },
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
    widgets: [
      tools,
      basedOnWms,
      container,
      {
        id: Symbol(),
        layout: { x: 10, y: 0, h: 2, w: 2 },
        title: "Date Picker",
        type: "internal",
        widget: {
          name: "EodashDatePicker",
          properties: {
            inline: true
          }
        },
      },
      {
        type: "web-component",
        id: Symbol(),
        slidable: true,
        layout: { x: 4, y: 0, h: 1, w: 3 },
        title: "Iframe",
        widget: {
          link:new URL('./elements/current-date.js',import.meta.url).href,
          tagName:"current-date",
        }
      }
    ],
  },
});

```

## Runtime Configuration
This provides a way to modify Eodash settings after it has been built, which is optional but allows for greater flexibility. In development, you'll typically create a file named `src/runtime.js` and export an [`Eodash<"runtime">`](/api/client/types/interfaces/Eodash.html) object as a default. The runtime config file is moved to `.eodash/dist/config.js` in production. However, it is important to note that runtime configuration has certain limitations compared to compile-time configuration. It doesn't support packages and file imports nor refrencing [user-defined internal wigets](/widgets/internal-widgets), and is shipped to the browser without being processed, hence the name `runtime`. A runtime configuration can also be set to `<eo-dash/>` web component using the `config` attribute, check out this [example](/get-started.html#installing-eodash-web-component-in-your-project) to learn more.

### example
```js
// .eodash/dist/config.js

export default {
    id: 'id',
    stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
    brand: {
        name: 'runtime config',
        font: { family: "Montserrat" },
        theme: {
            colors: {
                primary: "#5E503F",
                surface: "#f2f4f3",
                secondary: "#A9927D"
            }
        }
    },
    template: {
        background: {
            id: Symbol(),
            type: "internal",
            widget: {
                name: "EodashMap"
            }
        },
        widgets: [
            {
                type: 'internal',
                title: "Container",
                id: Symbol(),
                layout: { x: 0, y: 0, w: 3, h: 12 },
                widget: {
                    name: "WidgetsContainer",
                    properties: {
                        widgets: [
                            {
                                title: "Tools",
                                id: Symbol(),
                                type: "internal",
                                widget: {
                                    name: "EodashItemFilter"
                                }
                            },
                        ]
                    }
                }
            },
            {
                layout: { x: 4, y: 0, w: 4, h: 4 },
                title: "Date Picker",
                id: Symbol(),
                type: "internal",
                widget: {
                    name: "EodashDatePicker",
                    properties: {
                        inline: true
                    }
                }
            }
        ]
    }
}
```

---

:::info
* Runtime configuration settings will take precedence over compile time settings.
* Both Runtime and Compiletime configurations define the dashboard during load and reload, allowing the definition of different configurations based on conditions like routes.
* Runtime configuration file can be set using the `--runtime <path>` CLI flag or by setting the path to the `runtime` property in `eodash.config.js`
* Buildtime configuration file can be set using the `--entryPoint <path>` CLI flag or by setting the path to the `entryPoint` property in `eodash.config.js`
:::


