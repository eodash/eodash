# STAC

eodash leverages the SpatioTemporal Asset Catalog (STAC) specification to discover and display geospatial data. The implementation uses a two-tiered collection structure and a set of STAC extensions to handle various data types and services.

## Two-Level Collections

eodash uses a two-level STAC collection hierarchy to provide a user-friendly experience for data exploration.

### 1. Indicators (Collection of Collections)

The top level consists of "Indicators", which are STAC Collections that group together other STAC Collections. Users primarily interact with these Indicators. When a user selects an Indicator and a specific datetime, the client renders the most relevant STAC Item from each of the nested collections, creating a unified view of different datasets for that point in time.

#### Indicator Link Properties

The links in a catalog pointing to indicator collections can contain several metadata properties that describe their visual products. The [EOxItemfilter](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-itemfilter--docs) component uses these properties to create filters and display overviews of these products.

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
| `thumbnail` | A URL to a thumbnail image for the collection. |
| `tags` | An array of keywords or tags. |
| `agency` | An array of contributing agencies. |


### 2. Data Collections

The second level consists of standard STAC Collections that contain STAC Items. These items hold the actual visualization data, such as map service links or direct data assets. Items typically cover the same geographical location across different time periods.

To support various data sources and visualization needs, eodash uses several custom and standard properties within STAC Items, Assets, and Links. The system expects specific properties from an Item to be bubbled up to its link.

## Map Layer Visualization

eodash creates map layers by processing STAC Items from these collections. It uses information from [web map links](https://github.com/stac-extensions/web-map-links) (such as WMS, WMTS, or XYZ sources) and direct data assets like Cloud-Optimized GeoTIFFs (COGs) and vector data (GeoJSON, FlatGeobuf).

To select the correct Item for visualization, eodash requires the Item's `datetime` or `start_datetime` and `end_datetime` properties to be present on the link pointing to it in the Collection.

### Layer Organization

eodash organizes map layers into three distinct groups based on the web map link or asset `roles` property:

1. **Data Layers**: Contain the main visualized products and datasets. This is the default assignment when neither overlay nor baselayer roles are present. You can use `"data"` to explicitly mark a layer as containing primary data.

2. **Overlays**: Displayed on top of data layers to add contextual metadata such as administrative boundaries or reference grids. Roles containing `"overlay"` will be classified as overlays.

3. **Base Layers**: Provide background context (satellite imagery, terrain, etc.). Roles containing `"baselayer"` will be classified as base layers.


Additionally, the initial visibility of a layer is controlled by the `"visible"` and `"invisible"` roles. If the `roles` array includes `"visible"`, the layer will be shown on the map by default. Otherwise, it will be hidden initially but can be enabled by the user. This is particularly useful for managing multiple base layers or overlays, allowing users to toggle them on or off.

For example:
```json
{
 "id": "OSM",
 "rel": "xyz",
 "href": "//s2maps-tiles.eu/wmts/1.0.0/osm_3857/default/g/{z}/{y}/{x}.jpeg",
 "type": "image/jpeg",
 "title": "OSM Background",
 "roles": [
   "baselayer",
   "visible"
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
### Data Assets

eodash renders Item assets with the `data` role assigned. For example:
```json
{
  "assets": {
    "example_data": {
      "href": "https://example.com/geotiff.tiff",
      "type": "image/tiff",
      "title": "Example GeoTIFF Asset",
      "roles": ["data"]
    }
  }
}
```
### Observation Points

eodash can render Items as observation points on the map when specific conditions are met. This visualization mode is particularly useful for displaying point-based location data.

#### Configuration

A Collection is rendered as observation points when either:
- `endpointtype` is set to `"GeoDB"`
- `locations` is set to `true`

#### Point Generation

When configured for observation points, eodash:
1. Searches for `latlng` properties in the Collection's child or Item links
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

eodash supports multiple approaches for defining coordinate reference systems (CRS) and map projections to accommodate different data sources and visualization requirements. The projection configuration can be defined at the Collection, Item, Link, or Asset levels.

#### Standard EPSG Codes

For standard coordinate reference systems, eodash uses the `proj:epsg` property from the [Projection Extension](https://github.com/stac-extensions/projection) to define EPSG codes.

#### Custom Projections

For custom or specialized projections not covered by standard EPSG codes, eodash provides two custom properties:

**`eodash:mapProjection`** - Used for map-specific projections with predefined extents. Can exist at the top level of Items or Collections:

```json
{
  "eodash:mapProjection": {
    "name": "EPSG:3411",
    "def": "+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +x_0=0 +y_0=0 +a=6378273 +b=6356889.449 +units=m +no_defs +type=crs",
    "extent": [-3314763.31, -3314763.31, 3314763.31, 3314763.31]
  }
}
```

**`eodash:proj4_def`** - Used for custom Proj4 projection definitions. Can exist in Link, Asset, or inside Item `properties`:
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

eodash Flat Styles extend the standard [OpenLayers Flat Styles](https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html) to support dynamic, user-configurable styling. This extension introduces additional properties to the style object to enable interactive visualizations, legends, and tooltips.

The core of this extension is the ability to define style `variables` that can be dynamically updated by the user through a `jsonform`. This allows users to adjust visualization parameters like colors or filter values, as well as `tooltip` properties, directly in [EOxLayerControl](https://eox-a.github.io/EOxElements/?path=/story/elements-eox-layercontrol--layer-styles-config) and update the legend scale.

- **`variables`**: A key-value map where style properties can be defined as variables.
- **`jsonform`**: A [EOxJSONForm](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-jsonform--docs) JSON Schema that defines a form. This form is rendered in the UI, allowing users to modify the `variables` at runtime.
- **`legend`**: Configuration for displaying a layer's legend.
- **`tooltip`**: Configuration for defining interactive tooltips that appear on feature hover or click.

```ts
type EodashStyleJson = import("ol/style/flat").FlatStyleLike & {
  variables?: Record<string, string | number | boolean | null | undefined>;
  legend?: import("@eox/layercontrol/src/components/layer-config.js").EOxLayerControlLayerConfig["layerConfig"]["legend"];
  jsonform?: import("json-schema").JSONSchema7;
  tooltip?: { id: string; title?: string; appendix?: string }[];
};
```


## Processing

eodash processing transforms user inputs into dynamic visualizations through STAC service links. Users fill forms that are injected into service URLs using Mustache templating (e.g., <code v-pre>{{bbox}}</code>, <code v-pre>{{metric}}</code>), generating real-time charts and map layers.

### Outputs

- **Charts**: Vega/Vega-Lite visualizations from data APIs
- **Map Layers**: Vector or raster layers from geospatial services
- **STAC Collections**: metadata, map services, and further processing.


### Required Collection Properties

| Property | Type | Description |
|----------|------|-------------|
| `eodash:jsonform` | URL | JSON Schema defining user input form |
| `eodash:vegadefinition` | URL | Vega/Vega-Lite specification for chart output |

#### Form Configuration Options

- `options.execute` (boolean): Auto-execute when form values change
- `options.multiQuery` (string[]): Properties triggering multiple parallel requests


### Service Links

Processing uses Collection `links` with `rel: "service"`. Choose the appropriate type:

- **Synchronous**: Direct API calls for immediate results (charts/simple layers)
- **Custom Endpoints**: Specialized integrations for complex workflows (SentinelHub, VEDA, EOxHub)

#### 1. Synchronous Links (Direct Processing)
Standard links without an `endpoint` property are processed immediately.

**Chart Data Sources:**

- `type: "application/json"` - JSON data injected into Vega spec
  - Supports `method: "GET"` or `"POST"`
  - For POST: use `body` property pointing to a JSON file, can be a Mustache template
- `type: "text/csv"` - CSV data loaded as `data.url` in Vega spec
- Optional `eox:flatstyle` on the link can point to a style JSON whose variables are also available for Mustache templating (e.g., thresholds, palette names)

**Map Layer Outputs:**
- Vector: `type: "application/geo+json"` → creates a Vector layer. Supports `eox:flatstyle` to provide style. The form is rendered into the link `href`.
- Static image: `type: "image/png"` → creates a static raster layer using the form’s bounding box as extent; the form is rendered into the link `href`.
- GeoTIFF/COG: `type: "image/tiff"` → creates a WebGLTile GeoTIFF layer. Multiple links may be combined; `eox:flatstyle` can style/normalize; projection may be applied from `eodash:mapProjection`.

**Example:**

```json
{
  "links": [
    {
      "rel": "service",
      "id": "timeseries-json",
      "type": "application/json",
      "href": "https://api.example.com/series?bbox={{bbox}}&metric={{metric}}",
      "method": "GET",
      "eox:flatstyle": "https://example.com/style.json"
    },
    {
      "rel": "service",
      "id": "footprints",
      "type": "application/geo+json",
      "href": "https://api.example.com/footprints?geom={{aoi}}",
      "eox:flatstyle": "https://styles.example.com/footprints-style.json"
    },
    {
      "rel": "service",
      "id": "result-cog",
      "type": "image/tiff",
      "href": "https://api.example.com/cog?expr={{expr}}"
    }
  ]
}
```

Link POST body template example:

```json
{
  "rel": "service",
  "id": "timeseries-json-post",
  "type": "application/json",
  "href": "https://api.example.com/series",
  "method": "POST",
  "body": "https://api.example.com/templates/series_body.json"
}
```

Where the referenced template is a plain text Mustache JSON template, for example:

```json
{"metric": "{{metric}}", "bbox": "{{bbox}}", "geom": "{{aoi}}"}
```
CSV example:

```json
{
  "rel": "service",
  "id": "timeseries-csv",
  "type": "text/csv",
  "href": "https://api.example.com/series.csv?bbox={{bbox}}&metric={{metric}}"
}
```

#### 2. Custom Endpoints (Specialized Processing)

Links with an `endpoint` property are handled by dedicated adapters for external services.

**Available Endpoints:**

##### Sentinel Hub (`endpoint: "sentinelhub"`)
For time-series chart generation using Sentinel Hub Aggregation API.

**Requirements:**
- Link: `rel: "service"`, `endpoint: "sentinelhub"`, `href: [SH API endpoint]`
- Evalscript: `rel: "example"`, `title: "evalscript"`, `href: [evalscript URL]`, `dataId: [dataset]`
- Environment: Set `EODASH_SENTINELHUB_CLIENT_ID` and `EODASH_SENTINELHUB_CLIENT_SECRET`

```json
{
  "links": [
    { 
      "rel": "example", 
      "title": "evalscript", 
      "href": "https://example.com/evalscripts/ndvi.js", 
      "dataId": "S2L2A" 
    },
    { 
      "rel": "service", 
      "endpoint": "sentinelhub", 
      "href": "https://services.sentinel-hub.com/api/v1/statistics" 
    }
  ]
}
```

2) NASA VEDA statistics for charts
- Link: `rel: "service"`, `endpoint: "veda"`, `href`: VEDA statistics endpoint
- eodash gathers COG endpoints and dates from the Indicator’s Collection or its children by reading `links` with `rel: "item"` where each link has `cog_href` and a bubbled `datetime` property on the link.

Example child/Item links used to discover inputs:

```json
{
  "rel": "item",
  "href": "./items/2020-01-01.json",
  "cog_href": "https://veda.nasa.gov/cogs/.../cog.tif",
  "datetime": "2020-01-01T00:00:00Z"
}
```

##### EOxHub Workspaces (`endpoint: "eoxhub_workspaces"`)
For asynchronous processing workflows that generate map layers.

**Requirements:**
- Link: `rel: "service"`, `endpoint: "eoxhub_workspaces"`, `href: [job URL]`
- Template: `body` property pointing to POST request template
- Styling: Optional `eox:flatstyle` (URL, array of `{id, url}`, or object)

**Workflow:**

1. POST request creates job → returns `Location` header
2. Poll job status → `{status: "successful|running|failed", links: [...]}`
3. Fetch results → `{urls: [...]}` or `{vector: {...}, raster: {...}}`

```json
{
  "rel": "service",
  "endpoint": "eoxhub_workspaces",
  "href": "https://api.example.com/process",
  "body": "https://api.example.com/templates/analysis.json",
  "eox:flatstyle": [{"id": "vector", "url": "https://styles.example.com/vector.json"}]
}
```

### STAC Collection Output

To load another STAC Collection as a processing result:

```json
{
  "rel": "service",
  "endpoint": "STAC", 
  "type": "application/json; profile=collection",
  "href": "https://stac.example.com/{{collection}}.json"
}
```

The `href` uses form values via Mustache templating. eodash loads the returned Collection into the UI.

## STAC Extensions

eodash utilizes the following STAC community extensions to enhance its capabilities:

- **Projection Extension**: https://github.com/stac-extensions/projection
- **Web Map Links Extension**: https://github.com/stac-extensions/web-map-links