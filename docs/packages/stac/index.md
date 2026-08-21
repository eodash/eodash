# @eodash/stac

`@eodash/stac` turns STAC collections into [eox-map](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-map--docs) layer definitions. It reads a collection document, resolves the item that covers a given datetime, and returns the layer configuration for that item. The package runs in Node and in the browser, and does not depend on the rest of eodash. Its types ship with it.

## Installation

```bash
npm install @eodash/stac
```

## Reading a Collection

[`createEodashCollection`](/api/packages/stac/src/types/functions/createEodashCollection) fetches the collection document and returns a reader for it:

```js
import { createEodashCollection } from "@eodash/stac";

const collection = await createEodashCollection(
  "https://example.org/collections/air-quality",
);

const dates = await collection.getDates();
const { layers, projections } = await collection.getLayers(dates.at(-1));
```

The document decides where the items come from:

- **`item` links**: the collection lists its items as links, each carrying a `datetime` (or `start_datetime`/`end_datetime`).
- **GeoParquet mirror**: the collection carries an asset with the `collection-mirror` role, a GeoParquet file holding every item. The mirror is read column by column through HTTP range requests, so asking for dates transfers only the datetime column.
- **STAC API**: the items are found by searching a `/search` endpoint. A collection document cannot state that it is served by an API, so the caller declares it with `{ api: true }`.

The first two are detected from the document itself, and both kinds of reader answer the same way, so the caller does not need to know which one was built.

Requests go through `fetch` unless the `client` option supplies something else, such as a caching or authenticating [axios](https://axios-http.com) instance.

## The Reader

Every reader answers the same questions: which items and datetimes the collection has ([`getItems`](/api/packages/stac/src/types/type-aliases/CollectionReader), `getDates`, `getItem`, `getTemporalExtent`), and what to draw for one of them (`getLayers`, `buildLayers`, `updateLayers`). A reader for an API collection additionally exposes `search`, a raw item search with `collections` preset, and takes a `bbox` to narrow its lookups spatially.

The full surface is [`CollectionReader`](/api/packages/stac/src/types/type-aliases/CollectionReader) and [`ApiReader`](/api/packages/stac/src/types/type-aliases/ApiReader).

Two things about it are worth knowing before reading the reference.

`getItems` answers with what the collection holds: a static collection with its `item` links, a mirror or an API with the items themselves.

`updateLayers` is for datetime changes on a map that already has layers. It takes the current layer tree and the id of any layer this collection built, and returns the tree with that collection's layers swapped for the new item's. Branches that did not change are returned by reference, so a diffing renderer leaves them alone.

## Building Layers

`getLayers`, `buildLayers` and `updateLayers` resolve to [`BuiltLayers`](/api/packages/stac/src/types/interfaces/BuiltLayers), and all take a [`BuildContext`](/api/packages/stac/src/types/type-aliases/BuildContext) carrying what the collection document cannot state, such as the map's view projection or a titiler endpoint.

```js
const { layers, projections, item } = await collection.getLayers(datetime);
```

`layers` are built from the item's [web map links](https://github.com/stac-extensions/web-map-links), its `data` assets and the [render extension](https://github.com/stac-extensions/render). An item none of those cover comes back as a single STAC layer that eox-map resolves itself. A collection with no item at that datetime answers with empty `layers` and `projections`, and no `item`.

### Projections Are Returned, Not Registered

A build returns the projections its layers reference instead of registering them with the map library as a side effect. If registration happened inside the build, a cached or memoized build would skip it, and a second map created later would be left without the projection. The caller registers each entry before assigning the layers:

```js
const { layers, projections } = await collection.getLayers(datetime);

for (const projection of projections) {
  if (typeof projection === "object") {
    // a proj4 definition: { name, def, extent? }
    await map.registerProjection(projection.name, projection.def, projection.extent);
  } else {
    // a code: "EPSG:3035", or bare 3035
    const code = typeof projection === "number" ? `EPSG:${projection}` : projection;
    await map.registerProjectionFromCode(code);
  }
}

map.layers = layers;
```

### Layer Config Form Values

Layers built from a style with a `jsonform` or from an `eodash:rasterform` carry a `layerConfig` that [eox-layercontrol](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-layercontrol--docs) renders as a configuration form. When the user edits the form, the caller reports the new value back through `persistLayerConfig`, typically from eox-layercontrol's `layerConfig:change` event handler.

The remembered values live on the reader. A datetime change rebuilds the layers through the same reader, so the user's settings survive it; a different collection means a different reader, so its forms start empty.

## Authentication

A link or asset can name an authentication scheme through the [authentication extension](https://github.com/stac-extensions/authentication), and the package applies it when building the layer. The supported scheme is an API key sent as a query parameter; the key itself never comes from the catalog, but from an environment variable named after the scheme, so a scheme named `token` is answered by `EODASH_token`.

In Node the variable is read from the environment as it is. In the browser it comes from the bundler, which needs to be told to expose it: [Vite](https://vite.dev) only passes `VITE_`-prefixed variables through by default, so unprefixed ones need the prefix added.

```js
// vite.config.js
export default defineConfig({ envPrefix: ["VITE_","EODASH_"] });
```


## Standalone Exports

Three functions work without a reader:

- [`getTooltipProperties`](/api/packages/stac/src/types/functions/getTooltipProperties) — the tooltip fields an item's styles declare.
- [`getIndicatorLayers`](/api/packages/stac/src/types/functions/getIndicatorLayers) — the base layers and overlays a collection states, built from the collection itself rather than from any of its items.
- [`getObservationPointsLayer`](/api/packages/stac/src/types/functions/getObservationPointsLayer) — one vector layer holding every observation point across the given collections.

Observation points are collections whose entries are places rather than times, marked by `locations: true` or `endpointtype: "GeoDB"`. They are the one thing `buildLayers` does not cover; see [Observation Points](/STAC#observation-points) for the catalog side.

## Subpath Exports

The main entry carries the reader and the standalone functions. Callers assembling their own pipeline rather than using a reader can reach the pieces directly: `@eodash/stac/collections` for the reader factories, `@eodash/stac/layers` for the layer builders, and `@eodash/stac/helpers` for what those are made of.

## Further Reading

[Types](./types) covers the STAC types the package ships and how a catalog with its own properties extends them. The [STAC](/STAC) page describes the same documents from the catalog author's side.
