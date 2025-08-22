# STAC

eodash leverages the SpatioTemporal Asset Catalog (STAC) specification to discover and display geospatial data. The implementation uses a two-tiered structure of collections and a set of STAC extensions to handle various data types and services.

## Two-level Collections

eodash expects STAC collections in two levels to provide a user-friendly experience for data exploration.

### 1. Indicators (Collection of Collections)

The top level consists of "Indicators", which are STAC Collections that group together other STAC Collections. Users primarily interact with these Indicators. When a user selects an Indicator and a specific datetime, the client renders the most relevant STAC Item from each of the nested collections, creating a unified view of different datasets for that point in time.

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
| `thumbnail` | A URL to a thumbnail image for the collection. |
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
### Data Assets
eodash renders Item assets with the role `data` assigned, for example:
```json
{
  ...
 "assets": {
   "example_data":{
    "href":	"https://example.com/geotiff.tiff",
    "type":	"image/tiff",
    "title": "Example GeoTiFF Asset",
    "roles":["data"]
   }
  ...	
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
eodash Flat Styles extend the standard [OpenLayers Flat Styles](https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html) to support dynamic, user-configurable styling. This extension introduces additional properties to the style object to enable interactive visualizations, legends, and tooltips.

The core of this extension is the ability to define style `variables` that can be dynamically updated by the user through a `jsonform`. This allows users to adjust visualization parameters like colors or filter values as well as `tooltip` properties directly from the user interface and update the legend scale.

- **`variables`**: A key-value map where style properties can be defined as variables.
- **`jsonform`**: A [EOxJSONForm]() JSON Schema that defines a form. This form is rendered in the UI, allowing users to modify the `variables` at runtime.
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

Processing in eodash takes different types of inputs in the shape of URLs and user‑defined forms and produces two kinds of outputs:
- Charts (Vega/Vega-Lite)
- Visualized map layers (vector or raster)

Form values are injected into service link URLs and POST bodies using Mustache templating (e.g., {{bbox}}, {{metric}}). For POST bodies, the referenced template is fetched as plain text and rendered before submission.

### Collection-level properties

Provide these non-standard properties on a processing-enabled Collection:

- `eodash:jsonform` (string, URL): [EOxJSONForm]() JSON Schema describing input parameters. The schema can include:
  - top-level `options.execute` (boolean): if true, automatically executes processing when form values change.
  - top-level `options.multiQuery` (string or string[]): one or more property names that contain array values; this triggers multiple requests whose results are merged and injected into the Vega definition.
- `eodash:vegadefinition` (string, URL): A Vega/Vega-Lite spec. Data will be injected into this spec from the service links described below.


Notes about form value handling:
- GeoJSON inputs are converted to stringified geometry objects before templating. For multi-geometry fields the value becomes an array of geometry strings.
- Bounding boxes use the exact key whose schema has `format: "bounding-box"`.

### Service links for processing

Processing relies on `links` with `rel: "service"` on the Collection. eodash separates links into two groups:
- Standard links (no `endpoint` property): handled synchronously, directly fetch data/assets
- Custom endpoint links (have `endpoint`): handled by dedicated adapters (async jobs, external APIs)
  

#### Synchronous links

Charts data sources:
- `type: "application/json"`: fetched and injected into the Vega spec. Supports `method: "GET" | "POST"`.
  - For `POST`, provide `body` pointing to a request-body template that is rendered with form values.
- `type: "text/csv"`: the form is rendered into the URL and injected into the Vega spec as `data.url`.
- Optional `eox:flatstyle` on the link can point to a style JSON whose variables are also available for mustache templating (e.g., thresholds, palette names).

Map layers outputs:
- Vector: `type: "application/geo+json"` → creates a Vector layer. Supports `eox:flatstyle` to provide style. The form is rendered into the link `href`.
- Static image: `type: "image/png"` → creates a static raster layer using the form’s bounding box as extent; the form is rendered into the link `href`.
- GeoTIFF/COG: `type: "image/tiff"` → creates a WebGLTile GeoTIFF layer. Multiple links may be combined; `eox:flatstyle` can style/normalize; projection may be applied from `eodash:mapProjection.name`.

Example synchronous links:

```json
{
  "links": [
    {
      "rel": "service",
      "id": "timeseries-json",
      "type": "application/json",
      "href": "https://api.example.com/series?bbox={{bbox}}&metric={{metric}}",
      "method": "GET",
      "eox:flatstyle": "https://styles.example.com/ts-style.json"
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

Where the referenced template is a plain text Mustache JSON, e.g.:

```json
{"metric": "{{metric}}", "bbox": {{bbox}}, "geom": {{aoi}}}
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

#### Custom endpoints

Custom endpoints allow deeper integrations. eodash currently supports:

1) Sentinel Hub time‑series for charts
- Link: `rel: "service"`, `endpoint: "sentinelhub"`, `href`: Sentinel Hub Aggregation API endpoint
- Collection or child Collections/Items must provide an `example` link with `title: "evalscript"` whose `href` contains the evalscript text; the link must also carry a `dataId` indicating the dataset type used by SH.
- The JSON form must include a bbox field (format `bounding-box`). Optional `start_date`, `end_date`, `distribution` (daily|weekly|monthly|yearly) constrain sampling.
- Environment: client app must be configured with `EODASH_SENTINELHUB_CLIENT_ID` and `EODASH_SENTINELHUB_CLIENT_SECRET` for OAuth2.

Example:

```json
{
  "links": [
    { "rel": "example", "title": "evalscript", "href": "https://example.com/evalscripts/ndvi.js", "dataId": "S2L2A" },
    { "rel": "service", "endpoint": "sentinelhub", "href": "https://services.sentinel-hub.com/api/v1/statistics" }
  ]
}
```

2) NASA VEDA statistics for charts
- Link: `rel: "service"`, `endpoint: "veda"`, `href`: VEDA statistics endpoint
- eodash gathers COG endpoints and dates from the Indicator’s Collection or its children by reading `links` with `rel: "item"` where each link has `cog_href` and a bubbled datetime property on the link (see “Bubbling datetime to links”).
- The form must include an AOI geometry. Prefer a `geojson`-typed field; if a `bounding-box` is used, provide the value as a GeoJSON geometry string (temporary limitation).

Example child/Item links used to discover inputs:

```json
{
  "rel": "item",
  "href": "./items/2020-01-01.json",
  "cog_href": "https://veda.nasa.gov/cogs/.../cog.tif",
  "datetime": "2020-01-01T00:00:00Z"
}
```

3) EOxHub Workspaces asynchronous processing for map layers
- Link: `rel: "service"`, `endpoint: "eoxhub_workspaces"`, `href`: job submission URL
- Provide `body` pointing to a JSON template used as POST body; rendered with form values.
- Optional `eox:flatstyle` for styling returned outputs. It can be:
  - string URL to a single style JSON, or
  - array of `{ id, url }` where `id` matches a result key, or
  - object mapping result keys to style URLs

Expected server responses:
- POST returns a `Location` header pointing to a job status JSON.
- Polling the job status JSON must eventually return `{ status: "successful" | "running" | "failed", links: [...] }`. eodash follows a link to fetch the results JSON. Include a results link with `rel` containing `results` and `type: "application/json"`.
- Results JSON (any of):
  - `{ "urls": ["https://.../a.tif", "https://.../b.tif"] }` → treated as GeoTIFF outputs
  - `{ "vector": { "urls": ["https://.../out.geojson"], "mimetype": "application/geo+json" }, "raster": { "urls": ["https://.../a.tif"], "mimetype": "image/tiff" } }`

eodash converts the results into layers and adds them under the Analysis group. Styles are matched by result keys.

Example EOxHub link:

```json
{
  "rel": "service",
  "id": "my-analysis",
  "endpoint": "eoxhub_workspaces",
  "href": "https://api.example.com/process",
  "body": "https://api.example.com/templates/my-analysis.mustache",
  "eox:flatstyle": [ { "id": "vector", "url": "https://styles.example.com/vector-style.json" } ]
}
```

### Loading a POI STAC as a processing output

To open another STAC Collection as a processing result, provide a service link with:

- `rel: "service"`
- `type: "application/json; profile=collection"`
- `endpoint: "STAC"`

The `href` is rendered with the form values. eodash loads the returned Collection into the UI.
Example:

```json
{
  "rel": "service",
  "endpoint": "STAC",
  "type": "application/json; profile=collection",
  "href": "https://stac.example.com/poi/{{collection}}.json"
}
```

## STAC Extensions

eodash utilizes the following STAC extensions to enhance its capabilities:

- **Projection Extension**: https://github.com/stac-extensions/projection
- **Web Map Links Extension**: https://github.com/stac-extensions/web-map-links