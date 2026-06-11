# What are Internal Widgets

Eodash provides Internal Widgets as extendable Vue Components that are maintained within the package. Along with these, users can also define their own Vue Components. For further information, you can refer to the [API](/api/Configuration/interfaces/InternalComponentWidget.html).

## Using Eodash Provided Internal Widgets

To use eodash provided internal widgets simply set the desired component's name to `widget.name` and props to `widget.properties` if needed. Find the provided components below:

<script setup>
import { data as internalWidgets } from "./internal-widgets.data.js";
import { data as dependencies } from "./client-modules.data.js";
</script>

<table>
  <thead>
    <tr>
      <th>Widget</th>
      <th>API Reference</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="widget in internalWidgets" :key="widget.name">
      <td>
        <a v-if="widget.documented" :href="widget.docLink">{{ widget.name }}</a>
        <span v-else>{{ widget.name }} <em style="opacity: 0.6; font-size: 0.85em;">(documentation pending)</em></span>
      </td>
      <td><a :href="widget.apiLink">API</a></td>
    </tr>
  </tbody>
</table>

find all provided widgets source code in the [widgets](https://github.com/eodash/eodash/tree/main/widgets) folder on **eodash/eodash** repository.

### Example

```js
export default createEodash({
    template: {
        ...
        widgets: [
            {
             id: Symbol(),
             type: "internal",
             title: "datepicker",
             layout: { x: 5, y: 11, w: 2, h: 1 },
             widget: {
               name: "EodashDatePicker",
               properties: {
                 inline: true,
               },
             },
           },
           ...
        ]
    }
})
```

## Compare mode

Several internal widgets can run in compare mode to show two selections side by side. Set `enableCompare: true` on the widget's `properties` to bind it to the compare selection instead of the primary one.

- [`EodashMap`](/widgets/internal-widgets/EodashMap) renders a side-by-side compare map; it requires a selected compare STAC.
- [`EodashChart`](/widgets/internal-widgets/EodashChart) and [`EodashProcess`](/widgets/internal-widgets/EodashProcess) read from the compare selection when `enableCompare` is set.

The primary selection is held in the [store](/eodash-store) as `selectedStac` and the compare selection as `selectedCompareStac`.

```js
{
  id: Symbol(),
  type: "internal",
  layout: { x: 9, y: 1, w: 3, h: 8 },
  widget: {
    name: "EodashProcess",
    properties: { enableCompare: true },
  },
}
```

## Creating your own Internal Widget

You can define your own Vue components and import them into your instance. Eodash automatically looks for a `src/widgets` folder in your project. If found, it imports all Vue files defined inside that folder.

Custom components can simply be referenced by their filename (the component name) in your dashboard configuration under `widget.name`.

### How Custom Widgets Work

1. **Props Mapping**: Any options specified in the widget config under `widget.properties` are passed down to your Vue component as standard Vue props.
2. **Global State & Interaction**: You can import the unified eodash `store` to subscribe to reactive state changes (such as the currently selected STAC indicators, active time slider timestamps, or map layers) and invoke global actions (like loading a new STAC catalog).

You can customize the folder where Eodash looks for custom widgets using the `--widgets` CLI option or the [widgets](/api/CLI/interfaces/EodashConfig.html#widgets) property in `eodash.config.js`.

All of Eodash's core dependencies are accessible inside your Vue components without needing to reinstall them. These include:

<table>
    <tbody>
  <tr>
    <th>Package</th>
    <th>Version</th>
  </tr>
  <tr v-for="dep in dependencies" :key="dep.name">
    <td><a target="_blank" :href="`https://www.npmjs.com/package/${dep.name}`">{{ dep.name }}</a></td>
    <td>{{ dep.version }}</td>
  </tr>
  </tbody>
</table>

### Example: A Custom STAC Selector Widget

Below is an example of a custom Vue widget that lists items in the current STAC catalog, highlights the selected item, and allows selecting an item via a prop-configured highlight color:

```vue
<!-- src/widgets/List.vue -->
<template>
  <v-card class="mx-auto d-flex flex-column fill-height" color="transparent">
    <v-list lines="one" class="overflow-auto">
      <v-list-item
        v-for="(link, idx) in stac"
        :key="idx"
        @click="getSelected(idx)"
        :title="link.title"
        :base-color="link.href === selectedSTAC?.href ? highlightColor : undefined"
      >
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { store } from "@eodash/eodash";
import { storeToRefs } from "pinia";

// Define props to receive properties from the dashboard configuration
defineProps({
  highlightColor: {
    type: String,
    default: "primary"
  }
});

const { stac, selectedSTAC } = storeToRefs(store.stac.useSTAcStore());
const { loadSelectedSTAC } = store.stac.useSTAcStore();

const getSelected = async (idx) => {
  const link = stac.value[idx];
  await loadSelectedSTAC(link.href);
};
</script>
```

To use this custom widget in your configuration:

```js
// src/main.js
import { createEodash } from "@eodash/eodash";

export default createEodash({
  // ...
  template: {
    // ...
    widgets: [
      {
        id: "custom-indicators-list",
        type: "internal",
        title: "Indicators List",
        layout: { x: 0, y: 0, w: 3, h: 12 },
        widget: {
          name: "List", // Matches src/widgets/List.vue
          properties: {
            highlightColor: "secondary" // Passed as a prop to the Vue component
          }
        }
      }
    ]
  }
});
```
