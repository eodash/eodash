# STAC

eodash leverages the SpatioTemporal Asset Catalog (STAC) specification to discover and display geospatial data. The implementation uses a two-tiered structure of collections and a set of STAC extensions to handle various data types and services.

## Two-level Collections

eodash expects STAC collections in two levels to provide a user-friendly experience for data exploration.

### 1. Indicators (Collection of Collections)

The top level consists of "Indicators," which are STAC Collections that group together other STAC Collections. Users primarily interact with these Indicators. When a user selects an Indicator and a specific datetime, the client renders the most relevant STAC Item from each of the nested collections, creating a unified view of different datasets for that point in time.

#### Indicator Link Properties

The links in a Catalog pointing to indicator collections can contain several metadata properties that describe it's visual products. [EodashItemFilter]() uses the properties to create filters and display overviews of these products.

| Property | Description |
|---|---|
| `title` | The display title for the linked collection. |
| `subtitle` | A longer description of the collection's content. |
| `code` | A code or identifier for the indicator. |
| `subcode` | A subcode or identifier for the indicator. |
| `themes` | An array of thematic categories. |
| `satellite` | An array of satellites used for data acquisition. |
| `sensor` | An array of sensors used for data acquisition. |
| `cities` | An array of relevant cities. |
| `countries` | An array of relevant countries. |
| `thumbnail` | An array of URLs to a thumbnail image for the collection. |
| `tags` | An array of keywords or tags. |
| `agency` | An array of contributing agencies. |


### 2. Data Collections

The second level consists of standard STAC Collections that contain STAC Items. These items hold the actual visualization data, such as map service links or direct data assets. The items typically cover the same geographical location across different datetimes.

To support various data sources and visualization needs, eodash uses several custom and standard properties within STAC Items, Assets, and Links and expects specific properties from an Item to be bubbled up to its link.

## Map Layers Visualization
eodash creates map layers by processing STAC Items from these collections. It uses information from [web map links](https://github.com/stac-extensions/web-map-links) (like WMS, WMTS), and direct data assets like Cloud-Optimized GeoTIFFs (COGs) and vector data (GeoJSON, FlatGeobuf).

To choose the correct Item to visualize, eodash expects the Item's `datetime` or `start_datetime` and `end_datetime` properties to be present on the link pointing to it in the Collection.

### Layer Organization

eodash organizes map layers into three distinct groups based on the web map link or asset `roles` property:

1. **Data Layers**: Contain the main visualized products and datasets. Default assignment when neither overlay nor baselayer roles are present, you can use `"data"` to explicitly marks a layer as containing primary data

2. **Overlays**: Displayed on top of data layers to add contextual metadata such as administrative boundaries or reference grids. Roles containing `"overlay"` will be classified as overlays.

3. **Base Layers**: Provide background context (satellite imagery, terrain, etc.). Roles containing `"baselayer"` will be classified as overlays


Additionally, the initial visibility of a layer is controlled by the `"visible"` and `"invisible"` roles. If the `roles` array includes `"visible"`, the layer will be shown on the map by default. Otherwise, it will be hidden initially but can be enabled by the user. This is particularly useful for managing multiple baselayers or overlays, allowing users to toggle them on or off.

for example:
```json
{
 "id": "OSM",
 "rel": "xyz",
 "href": "//s2maps-tiles.eu/wmts/1.0.0/osm_3857/default/g/{z}/{y}/{x}.jpeg",
 "type": "image/jpeg",
 "title": "OSM Background",
 "roles": [
   "baselayer",
   "invisible"
 ]
},
```

### Web Map Link Properties

eodash supports various properties in [web map links](https://github.com/stac-extensions/web-map-links) based on standard and custom extensions:

```json
{
  "id":"identifier",
  "rel": "wmts",
  "href": "https://maps.example.com/wmts",
  "type": "image/png",
  "title": "RGB composite visualized through a WMTS",
  "wmts:layer": [
    "streets",
    "satellite"
  ],
  "proj:epsg": 4326
}
```

### Observation Points

eodash can render Items as observation points on the map when specific conditions are met. This visualization mode is particularly useful for displaying point-based location data.

#### Configuration

A Collection is rendered as observation points when either:
- `endpointtype` is set to `"geodb"`
- `locations` is set to `true`

#### Point Generation
When configured for observation points, eodash:
1. Searches for `latlng` properties in the Collection's Items links
2. Creates a GeoJSON FeatureCollection from these coordinates
3. Styles the points based on the Collection's `themes` property

The `latlng` property should contain coordinates in the format `"latitude,longitude"` (comma-separated string):

```json
{
  "type": "Collection",
  "id": "agricultural_production_productive_area",
  "themes": [
    "agriculture"
  ],
  "locations": true,
  "endpointtype": "GeoDB",
  ...
  "links": [
    {
      "rel": "root",
      "href": "../../catalog.json",
      "type": "application/json",
      "title": "Earth Observing Dashboard"
    },
    {
      "rel": "child",
      "href": "./DE11/collection.json",
      "type": "application/json",
      "title": "Brandenburg",
      "id": "DE11",
      "latlng": "52.13141,13.09063",
      "country": "DE",
      "name": "Brandenburg"
    },
    {
      "rel": "child",
      "href": "./ES8/collection.json",
      "type": "application/json",
      "title": "Huelva (Lagunas de las Madres)",
      "id": "ES8",
      "latlng": "37.18316,-6.84888",
      "country": "ES",
      "name": "Huelva (Lagunas de las Madres)"
    },
    {
      "rel": "parent",
      "href": "../collection.json",
      "type": "application/json",
      "title": "Agricultural production - productive area"
    }
  ],
  ...
}
```

### Projection Configuration

eodash supports multiple approaches for defining coordinate reference systems (CRS) and map projections to accommodate different data sources and visualization requirements. The projection configuration can live on the Collection, Item, Link or Asset levels.

#### Standard EPSG Codes
For standard coordinate reference systems, eodash uses the `proj:epsg` property from the [Projection Extension](https://github.com/stac-extensions/projection) to define EPSG codes:

#### Custom Projections
For custom or specialized projections not covered by standard EPSG codes, eodash provides two custom properties:

**`eodash:mapProjection`** - Used for map-specific projections with predefined extents, can exist in the top level of Items or Collections:

```json
{
  "eodash:mapProjection": {
    "name": "EPSG:3411",
    "def": "+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +x_0=0 +y_0=0 +a=6378273 +b=6356889.449 +units=m +no_defs +type=crs",
    "extent": [-3314763.31, -3314763.31, 3314763.31, 3314763.31]
  }
}
```

**`eodash:proj4_def`** - Used for custom Proj4 projection definitions, can exist in Link, Asset, or inside Item `properties`:
```json
{
  "eodash:proj4_def": {
    "name": "ORTHO:680500",
    "def": "+proj=ortho +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs",
    "extent": [-3314763.31, -3314763.31, 3314763.31, 3314763.31]
  }
}
```

##### Projection Property Structure
Both custom projection properties contain the following fields:
- **`name`**: A unique identifier for the projection (can be EPSG code or custom name)
- **`def`**: The Proj4 definition string specifying the projection parameters
- **`extent`**: The valid coordinate bounds as `[minX, minY, maxX, maxY]` in the projection's units

These projection definitions enable eodash to properly transform and display geospatial data across different coordinate systems, ensuring accurate visualization regardless of the source data's native projection.

### Layer Attribution

Attribution text to be displayed on the map can be set using the `attribution` property on web map links or assets:

```json
{
  "href": "https://example.com/wms",
  "type": "image/png",
  "rel": "wms",
  "attribution": "© Example Data Provider 2024"
}
```


### eodash Flat Styles 
...


## Processing
...


## STAC Extensions

eodash utilizes the following STAC extensions to enhance its capabilities:

- **Projection Extension**: https://github.com/stac-extensions/projection
- **Web Map Links Extension**: https://github.com/stac-extensions/web-map-links