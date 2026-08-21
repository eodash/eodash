# Types

`@eodash/stac` ships its own types, generated into the [type reference](/api/packages/stac/src/types/). They cover two things: the STAC documents the package reads, and the shapes it hands back.

## STAC Documents

Every STAC extension and custom property eodash understands is typed. The [STAC](/STAC) page describes them from the catalog author's side; the table maps each concept to the type that describes it.

| Concept | Types |
|---|---|
| Items and collections with the eodash fields | [`STACItem`](/api/packages/stac/src/types/type-aliases/STACItem), [`STACCollection`](/api/packages/stac/src/types/type-aliases/STACCollection) |
| The eodash fields themselves | [`ItemExtensions`](/api/packages/stac/src/types/interfaces/ItemExtensions), [`CollectionExtensions`](/api/packages/stac/src/types/interfaces/CollectionExtensions) |
| Web map links | [`WMSLink`](/api/packages/stac/src/types/interfaces/WMSLink), [`WMTSLink`](/api/packages/stac/src/types/interfaces/WMTSLink), [`XYZLink`](/api/packages/stac/src/types/interfaces/XYZLink), [`TileJSONLink`](/api/packages/stac/src/types/interfaces/TileJSONLink), [`VectorTileLink`](/api/packages/stac/src/types/interfaces/VectorTileLink), [`MapboxStyleDocumentLink`](/api/packages/stac/src/types/interfaces/MapboxStyleDocumentLink) |
| Data assets | [`GeoTIFFAsset`](/api/packages/stac/src/types/interfaces/GeoTIFFAsset), [`GeoJSONAsset`](/api/packages/stac/src/types/interfaces/GeoJSONAsset), [`FlatGeobufAsset`](/api/packages/stac/src/types/interfaces/FlatGeobufAsset), [`GeoZarrAsset`](/api/packages/stac/src/types/interfaces/GeoZarrAsset), [`GeoDBAsset`](/api/packages/stac/src/types/interfaces/GeoDBAsset) |
| Projections | [`Projection`](/api/packages/stac/src/types/type-aliases/Projection) |
| Render extension | [`Render`](/api/packages/stac/src/types/interfaces/Render) |
| Authentication | [`AuthScheme`](/api/packages/stac/src/types/type-aliases/AuthScheme), [`AuthRefs`](/api/packages/stac/src/types/interfaces/AuthRefs) |
| Pre-aggregated dates | [`PreAggregationLink`](/api/packages/stac/src/types/interfaces/PreAggregationLink), [`AggregationCollection`](/api/packages/stac/src/types/interfaces/AggregationCollection) |
| Raster form | [`RasterForm`](/api/packages/stac/src/types/interfaces/RasterForm) |
| Flat styles | [`EodashStyleJson`](/api/packages/stac/src/types/type-aliases/EodashStyleJson) |

## Extending the Baseline

`STACItem` and `STACCollection` are not written out field by field. They are the STAC baseline with the eodash fields applied to it:

```ts
type STACItem = BaseItem<ItemExtensions, STACLink, STACAsset>;
```

[`BaseItem`](/api/packages/stac/src/types/type-aliases/BaseItem), [`BaseCollection`](/api/packages/stac/src/types/type-aliases/BaseCollection) and [`BaseAsset`](/api/packages/stac/src/types/type-aliases/BaseAsset) each take the extensions the entity carries as a parameter, along with the link and asset types it holds. A catalog carrying its own properties describes them the same way, without redeclaring STAC:

```ts
import type { BaseItem } from "@eodash/stac";

interface MyExtensions {
  "my:quality"?: number;
}

type MyItem = BaseItem<MyExtensions>;
```

The baseline itself is adapted from [stac-ts](https://github.com/gadomski/stac-ts), with `stac_version` widened to a string because catalogs are on 1.1.0.
