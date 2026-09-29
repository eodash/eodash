# @eodash/stac [![Version](https://badgen.net/npm/v/@eodash/stac)](https://www.npmjs.com/package/@eodash/stac)

A package for turning STAC collections into [eox-map](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-map--docs) layer definitions. It reads a collection, resolves the item covering a given datetime, and returns the layer configuration for that item. It runs both in node and in the browser.

## Installation

```bash
npm install @eodash/stac
```

## Usage

```js
import { createEodashCollection } from "@eodash/stac";

const collection = await createEodashCollection(
  "https://example.org/collections/air-quality",
);

const dates = await collection.getDates();
const { layers, projections } = await collection.getLayers(dates.at(-1));
```

Where the items come from is determined by the document: the `item` links it lists, or an asset with the `collection-mirror` role holding a GeoParquet mirror of them. A STAC API is declared by `{ api: true }`.

Documentation lives at [eodash.github.io/eodash/packages/stac](https://eodash.github.io/eodash/packages/stac/).
