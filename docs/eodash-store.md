# Eodash Store

eodash fetches the SpatioTemporal Asset Catalog (STAC) endpoint [assigned in the client configuration](/api/client/types/interfaces/Eodash.html#stacendpoint), navigate through its links, and assign values to its store. This store is then exposed to users, giving them the ability to read or modify the state of the dashboard.

The store is divided into three main areas. The first area is the reactive `states`. These states are designed to respond to changes in the dashboard and update the interface accordingly, leveraging the [Vue reactivity system](https://vuejs.org/guide/essentials/reactivity-fundamentals).

The second area consists of `actions`. These actions are functions that interact with the states, either by fetching new data or triggering changes in the existing states. They are responsible for updating the dashboard with new information or altering the display format of the current data.

Finally, the third area is under the `stac` property. This is a [pinia store](https://pinia.vuejs.org/) that exposes the root STAC catalog links, the selected STAC object, a function to load the selected STAC object, and a function to load the links from the root catalog endpoint. Checkout the [API](/api/client/types/interfaces/EodashStore.html) to learn more

## URL Query Parameters

The dashboard is designed to display data based on the selected store states. This is achieved through the use of URL query parameters, which enable the dashboard to load on a specific state according to the values provided.

---

:::info
There are several eodash stores that have the same API, they reference different exported stores. As a result, you may encounter different situations that require you to use a specific eodash store.

### Build-time Configuration

The default store exported from `@eodash/eodash` is meant to be used on [build-time configuration](/instantiation.html#compile-time-build-time-configuration)

```js
// src/main.js
import { store } from "@eodash/eodash"

export default createEodash({
    ...
})
```

or using `createEodash` callback parameter

```js
// src/main.js
export default createEodash((store)=>({
    ...
}))
```

### Runtime Configuration

eodash attaches the store on the `window` object, which is useful for certain runtime configuration scenarios.

```js
// .eodash/dist/config.js
const store = window.eodashStore;

export default {
    ...
}
```

### Runtime configuration When Building Eodash in `lib` Mode

When building eodash as a web component using the `lib` option or configuration, the store exposed from the built `dist/eo-dash.js` should be used in runtime configuration.

```js
// public/config.js
import { store } from "/.eodash/dist/eo-dash.js"
export default {
    ...
}
```

<br>

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script type="module" src="/.eodash/dist/style.css"></script> // [!code focus]
  </head>

  <body>
    <script type="module" src="/.eodash/dist/eo-dash.js"></script>
    <eo-dash config="/config.js"></eo-dash> // [!code focus]
  </body>
</html>
```

:::
