# What are Internal Widgets
Eodash provides Internal Widgets as extendable Vue Components that are maintained within the package. Along with these, users can also define their own Vue Components. For further information, you can refer to the [API](/api/core/types/interfaces/InternalComponentWidget.html).

## Using Eodash Provided Internal Widgets
to use eodash provided widgets simply set the `name` to the desired widget and the `properties` if any props needed from the following list:

<script setup>
const internalWidgets = (()=>{
    const widgets = import.meta.glob('../../widgets/**.vue')
    return Object.keys(widgets).map(widget=>{
      return widget.split('/').at(-1).slice(0, -4)
    })
})()
</script>

<ul>
<li v-for="widget in internalWidgets">
{{ widget }}
</li>
</ul>

find all provided widgets on  the [widgets](https://github.com/eodash/eodash/tree/main/widgets) folder on **eodash/eodash** repo.

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
             slidable: false,
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

## Creating your own Internal Widget
You can define your own vue components and import them on your instance. Eodash automatically looks for a `src/widgets` folder on your project. If found, it imports all vue files defined inside the folder. The defined components can simply be referenced by their name on your dashboard configuration and the component's props and attributes can be assigned using the `properties` property.

You can assign internal widgets on a folder of your choice by assigning the folders path either using the `--widgets` CLI option or in the [widgets](/api/bin/types/interfaces/EodashConfig.html#widgets) property in `eodash.config.js`

All eodash's dependencies are accessible inside your created vue components without the need to reinstall them. Eodash uses the following dependencies.
<script server>
import pkg from "../../package.json" with { type: "json" };
</script>


<table>
  <tr>
    <th>Package</th>
    <th>Version</th>
  </tr>
  <tr v-for="dependency in Object.keys(pkg.dependencies)" >
    <td>{{dependency}}</td>
    <td>{{ pkg.dependencies[dependency]}}</td>
  </tr>
</table>

### Example 
```vue
// src/widgets/List.vue
<template>
    <v-card class="mx-auto d-flex flex-column overflow-auto fill-height" color="transparent">
        <v-list lines="one" class="overflow-auto">
            <v-list-item v-for="(link, idx) in stac" :key="idx" @click="getSelected(idx)" :title="link.title">
            </v-list-item>
        </v-list>
    </v-card>
</template>
<script setup lang='ts'>
import { store } from '@eodash/eodash';
import { storeToRefs } from 'pinia';

const { stac } = storeToRefs(store.stac.useSTAcStore())
const { loadSelectedSTAC } = store.stac.useSTAcStore()

const getSelected = async (idx) => {
    const link = stac.value[idx]
    await loadSelectedSTAC(link.href)
}
</script>
```

```js
// src/main.js
export default createEodash({
    ...
    template: {
        ...
        widgets:[
             {
             id: Symbol(),
             type: "internal",
             title: "Indicators List",
             layout: { x: 0, y: 0, w: 3, h: 12 },
             widget: {
               name: "List",
             },
           },
           ...
        ]
    }
})

```

