# Templates

Eodash ships with ready made templates so a dashboard can start from a working configuration. `getBaseConfig` provides a complete base configuration to override, as well as a set of named templates for most common use cases.

## getBaseConfig

`getBaseConfig` returns a complete assembled [`Eodash`](/api/Configuration/type-aliases/Eodash.html) configuration, with the overrides you pass deep merged on top. It is exported from `@eodash/eodash/templates`:

```js
import { getBaseConfig } from "@eodash/eodash/templates";

export default getBaseConfig({
  id: "my-dashboard",
  stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  brand: { name: "My Dashboard" },
});
```

The override is merged recursively, so a nested value such as `brand.name` replaces only that field while the rest of the base is kept. Arrays are replaced rather than concatenated, so an array you pass — `widgets`, `collectionsPalette`, or `supportedUpscalingEndpoints` — overrides the base array in full.

The return value is a plain configuration object. Export it directly, or pass it to `createEodash` when the configuration needs access to the store.

## Built-in templates

The package exports four templates, each a [`Template`](/api/Configuration/interfaces/Template.html) describing a grid layout:

| Template  | Layout | Source |
| --------- | ------ | ------ |
| `lite`    | A compact layout for non-experts: the map with a date picker, layer control, STAC info, and tools. | [lite.js](https://github.com/eodash/eodash/blob/main/templates/lite.js) |
| `expert`  | The `lite` layout extended with charts and a processing widget. | [expert.js](https://github.com/eodash/eodash/blob/main/templates/expert.js) |
| `compare` | A layout for comparing datasets, with charts, processing, and tools. | [compare.js](https://github.com/eodash/eodash/blob/main/templates/compare.js) |
| `explore` | A catalog-driven layout pairing the item catalog with the map and layer control. | [explore.js](https://github.com/eodash/eodash/blob/main/templates/explore.js) |

Import a template and assign it to `template`:

```js
import { lite } from "@eodash/eodash/templates";

export default {
  id: "my-dashboard",
  stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  brand: { name: "My Dashboard" },
  template: lite,
};
```

## Multiple templates

Assign several templates to the `templates` map to offer more than one layout. The [`EodashLayoutSwitcher`](/widgets/internal-widgets/EodashLayoutSwitcher) lets the reader move between them:

```js
import { lite, explore } from "@eodash/eodash/templates";

export default {
  id: "my-dashboard",
  stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  brand: { name: "My Dashboard" },
  templates: { lite, explore },
};
```

A template is a plain object, so it can be adjusted before use - for example, to change a widget's properties or its placement on the grid. See the [Configuration](/configuration) guide for the shape of a template, and the [Widgets](/widgets/) guide for the widgets each one contains.