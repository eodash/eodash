<script setup>
import { data } from "./eodash-store.data.js";
</script>

# Eodash Store

eodash fetches the SpatioTemporal Asset Catalog (STAC) endpoint [assigned in the client configuration](/api/Configuration/type-aliases/Eodash.html#stacendpoint), navigates through its links, and assigns the result to its store. The store is then exposed to users, giving them the ability to read or modify the state of the dashboard at runtime.

The store is divided into three areas:

- **`states`** — reactive values that drive the dashboard. They use the [Vue reactivity system](https://vuejs.org/guide/essentials/reactivity-fundamentals), so reading or writing a state updates the interface accordingly.
- **`actions`** — functions that operate on the states, either by fetching new data or by triggering changes to existing states.
- **`stac`** — a [Pinia store](https://pinia.vuejs.org/) that holds the STAC catalog navigation: the root catalog links, the selected STAC object, and the actions to load them.

## States — `store.states`

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody>
    <tr v-for="item in data.states" :key="item.name">
      <td><code>{{ item.name }}</code></td>
      <td><code v-if="item.type">{{ item.type }}</code></td>
      <td v-html="item.description"></td>
    </tr>
  </tbody>
</table>

## Actions — `store.actions`

<table>
  <thead><tr><th>Action</th><th>Signature</th><th>Description</th></tr></thead>
  <tbody>
    <tr v-for="item in data.actions" :key="item.name">
      <td><code>{{ item.name }}</code></td>
      <td><code v-if="item.type">{{ item.type }}</code></td>
      <td v-html="item.description"></td>
    </tr>
  </tbody>
</table>

## STAC store — `store.stac.useSTAcStore()`

The STAC catalog navigation [pinia store](https://pinia.vuejs.org/). Call `store.stac.useSTAcStore()` to access these properties.

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody>
    <tr v-for="item in data.stac" :key="item.name">
      <td><code>{{ item.name }}</code></td>
      <td><code v-if="item.type">{{ item.type }}</code></td>
      <td v-html="item.description"></td>
    </tr>
  </tbody>
</table>

## URL Query Parameters

A subset of the states is mirrored to the URL query string, so a dashboard can be deep-linked and restored to a specific view. On load these parameters are read into the store; while the user navigates they are written back, keeping the URL shareable.

| Parameter | State | Description |
| --- | --- | --- |
| `template` | <code>activeTemplate</code> | The active [template](/templates) id. |
| `indicator` | <code>indicator</code> | The selected dataset (sub-code id of a STAC link). |
| `poi` | <code>poi</code> | Point of interest passed to the dataset's process service. |
| `x`, `y`, `z` | <code>mapPosition</code> | Map center longitude, latitude, and zoom. |
| `datetime` | <code>datetime</code> | Selected date (`YYYY-MM-DD`). |

## Importing the store

The same store API is exported from several entry points; pick the one that matches how the dashboard is configured.

| Configuration | Import |
| --- | --- |
| Build-time ([SPA](/configuration#as-a-single-page-application-spa)) | <code>import { store } from "@eodash/eodash"</code> |
| Web component inside a bundled app | <code>import { store } from "@eodash/eodash/webcomponent"</code> |
| Runtime (`config.js`) | <code>const store = window.eodashStore</code> |
| Runtime ([web component](/configuration#integrating-the-web-component-custom-element) build) | <code>import { store } from "/.eodash/dist/eo-dash.js"</code> |
