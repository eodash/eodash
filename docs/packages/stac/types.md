# Types

`@eodash/stac` includes full TypeScript definitions. See the [type reference](/api/@eodash/stac/) for auto-generated API details.

## STAC documents

Every STAC extension and custom property supported by eodash is typed. For catalog structuring details, see [STAC Concepts](/STAC).

| Concept | Types |
|---|---|
| Items and collections with eodash fields | [`STACItem`](/api/@eodash/stac/type-aliases/STACItem), [`STACCollection`](/api/@eodash/stac/type-aliases/STACCollection) |
| Eodash extension fields | [`ItemExtensions`](/api/@eodash/stac/interfaces/ItemExtensions), [`CollectionExtensions`](/api/@eodash/stac/interfaces/CollectionExtensions) |
| Web map links | [`WMSLink`](/api/@eodash/stac/interfaces/WMSLink), [`WMTSLink`](/api/@eodash/stac/interfaces/WMTSLink), [`XYZLink`](/api/@eodash/stac/interfaces/XYZLink), [`TileJSONLink`](/api/@eodash/stac/interfaces/TileJSONLink), [`VectorTileLink`](/api/@eodash/stac/interfaces/VectorTileLink), [`MapboxStyleDocumentLink`](/api/@eodash/stac/interfaces/MapboxStyleDocumentLink) |
| Data assets | [`GeoTIFFAsset`](/api/@eodash/stac/interfaces/GeoTIFFAsset), [`GeoJSONAsset`](/api/@eodash/stac/interfaces/GeoJSONAsset), [`FlatGeobufAsset`](/api/@eodash/stac/interfaces/FlatGeobufAsset), [`GeoZarrAsset`](/api/@eodash/stac/interfaces/GeoZarrAsset), [`GeoDBAsset`](/api/@eodash/stac/interfaces/GeoDBAsset) |
| Projections | [`Projection`](/api/@eodash/stac/type-aliases/Projection) |
| Render extension | [`Render`](/api/@eodash/stac/interfaces/Render) |
| Authentication | [`AuthScheme`](/api/@eodash/stac/type-aliases/AuthScheme), [`AuthRefs`](/api/@eodash/stac/interfaces/AuthRefs) |
| Pre-aggregated dates | [`PreAggregationLink`](/api/@eodash/stac/interfaces/PreAggregationLink), [`AggregationCollection`](/api/@eodash/stac/interfaces/AggregationCollection) |
| Raster forms | [`RasterForm`](/api/@eodash/stac/interfaces/RasterForm) |
| Flat styles | [`EodashStyleJson`](/api/@eodash/stac/type-aliases/EodashStyleJson) |

## Extending the baseline

`STACItem` and `STACCollection` combine standard STAC specifications with eodash-supported extensions:

```ts
type STACItem = BaseItem<ItemExtensions, STACLink, STACAsset>;
```

[`BaseItem`](/api/@eodash/stac/type-aliases/BaseItem), [`BaseCollection`](/api/@eodash/stac/type-aliases/BaseCollection), and [`BaseAsset`](/api/@eodash/stac/type-aliases/BaseAsset) accept extension interfaces as generic parameters. If your catalog includes custom metadata fields, you can type them without redeclaring base STAC properties:

```ts
import type { BaseItem } from "@eodash/stac";

interface MyExtensions {
  "my:quality"?: number;
}

type MyItem = BaseItem<MyExtensions>;
```

Base STAC types are adapted from [stac-ts](https://github.com/gadomski/stac-ts).
