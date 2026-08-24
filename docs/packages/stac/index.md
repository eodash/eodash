# @eodash/stac

`@eodash/stac` turns STAC collections into [eox-map](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-map--docs) layer definitions. It reads a collection document, resolves the item that covers a given datetime, and returns the layer configuration for that item. The package runs in Node.js and in the browser without depending on the rest of eodash, and includes TypeScript types.

## Installation

```bash
npm install @eodash/stac
```

## Reading a collection

[`createEodashCollection`](/api/@eodash/stac/functions/createEodashCollection) fetches the collection document and returns a reader for it:

```js
import { createEodashCollection } from "@eodash/stac";

const collection = await createEodashCollection(
  "https://example.org/collections/air-quality",
);

const dates = await collection.getDates();
const { layers, projections } = await collection.getLayers(dates.at(-1));
```

The collection document determines how items are resolved:

- **`item` links**: The collection lists its items in its `links` array with `rel: "item"`, each carrying a `datetime` (or `start_datetime`/`end_datetime`).
- **GeoParquet mirror**: The collection includes an asset with the `collection-mirror` role pointing to a GeoParquet file. The reader queries it column by column using HTTP range requests, downloading only the datetime column when checking available dates.
- **STAC API**: Items are queried through a `/search` endpoint by passing `{ api: true }` in the options.

Static links and GeoParquet mirrors are detected automatically from the document, and all readers expose a consistent API.

Network requests use global `fetch` by default. You can supply a custom HTTP client (such as an [axios](https://axios-http.com) instance with authentication or interceptors) through the `client` option.

You can also configure rendering defaults when initializing the reader:

```js
const collection = await createEodashCollection(url, {
  color: "#ff5722",
  rasterEndpoint: "https://titiler.example.org",
  upscalingEndpoints: ["https://titiler-upscale.example.org"],
});
```

- `color`: Hex color applied to vector layers or layer metadata to distinguish collections rendered together.
- `rasterEndpoint`: Base URL for a TiTiler instance. Without this endpoint, STAC Render extension entries do not produce raster layers.
- `upscalingEndpoints`: TiTiler endpoints used when an item requests upscaled tiles.
- `tileMatrixSets`: Custom TileMatrixSet definitions used for projection lookups.

## The Reader API

Every reader provides methods to inspect available items and datetimes (`getItems`, `getDates`, `getItem`, `getTemporalExtent`) and generate map layer configurations (`getLayers`, `buildLayers`, `updateLayers`). Readers for STAC API collections also provide `search` (with the collection ID pre-applied) and accept an optional `bbox` to narrow spatial queries.

See [`Reader`](/api/@eodash/stac/type-aliases/Reader) for the complete interface. The `kind` property indicates whether the collection resolved to `"static"`, `"parquet"`, or `"api"`.

## Building Layers

`getLayers`, `buildLayers`, and `updateLayers` resolve to [`BuiltLayers`](/api/@eodash/stac/interfaces/BuiltLayers). Each function accepts an optional [`BuildContext`](/api/@eodash/stac/type-aliases/BuildContext) to override settings per call (such as the map's current view projection or custom raster endpoints).

```js
const { layers, projections, item } = await collection.getLayers(datetime);
```

Layers are generated from the item's [web map links](https://github.com/stac-extensions/web-map-links), `data` assets, and [render extension](https://github.com/stac-extensions/render) definitions. An item matching none of these formats falls back to a single STAC layer that eox-map resolves directly. If no item exists at the requested datetime, the call returns empty `layers` and `projections` arrays, with `item` as `undefined`.

### Registering Projections

`getLayers` returns referenced projection definitions alongside layers rather than registering them globally. Register each entry with your map instance before assigning the layers:

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

### Layer Config Forms

Layers built from a style with a `jsonform` or an `eodash:rasterform` include a `layerConfig` object that [eox-layercontrol](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-layercontrol--docs) renders as an interactive configuration form.

When a user edits the form, report the new value back using `persistLayerConfig` (typically from eox-layercontrol's `layerConfig:change` event handler). The reader retains these values so user configurations persist across datetime changes.

## Authentication

Links or assets that define an authentication scheme via the [STAC authentication extension](https://github.com/stac-extensions/authentication) are authenticated when building layers.

The package supports query parameter API keys. The key value is read from an environment variable named after the scheme (`EODASH_<scheme_name>`). For example, a scheme named `token` looks for `EODASH_token`.

In Node.js, the variable is read from `process.env`. In browser builds, ensure your bundler exposes variables with the `EODASH_` prefix. In Vite, add the prefix to `envPrefix`:

```js
// vite.config.js
export default defineConfig({
  envPrefix: ["VITE_", "EODASH_"],
});
```

## Standalone functions

The package also exports standalone functions that do not require a reader:

- [`getTooltipProperties`](/api/@eodash/stac/functions/getTooltipProperties): Extracts tooltip fields declared in item styles.
- [`getIndicatorLayers`](/api/@eodash/stac/functions/getIndicatorLayers): Builds base layers and overlays defined directly on the collection document.
- [`getObservationPointsLayer`](/api/@eodash/stac/functions/getObservationPointsLayer): Builds a single vector layer containing point locations for collections with `locations: true` or `endpointtype: "GeoDB"`.

## Subpath exports

You can import specific subsystems directly if you are assembling a custom pipeline:

- `@eodash/stac/collections`: Reader factory functions (`createStaticCollection`, `createParquetCollection`, `createAPICollection`).
- `@eodash/stac/layers`: Layer builder functions.
- `@eodash/stac/helpers`: Utility functions for STAC assets, links, styles, and dates.

## Further reading

- [Types](./types): TypeScript definitions and extension patterns.
- [STAC Concepts](/STAC): Guide to structuring eodash-compatible STAC catalogs.
