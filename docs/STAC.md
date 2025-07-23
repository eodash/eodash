# STAC

eodash leverages the SpatioTemporal Asset Catalog (STAC) specification to discover and display geospatial data. The implementation uses a two-tiered structure of collections and a set of STAC extensions to handle various data types and services.

## Two-level Collections

eodash expects STAC collections in two levels to provide a user-friendly experience for data exploration.

### 1. Indicators (Collection of Collections)

The top level consists of "Indicators," which are STAC Collections that group together other STAC Collections. Users primarily interact with these Indicators. When a user selects an Indicator and a specific datetime, the client renders the most relevant STAC Item from each of the nested collections, creating a unified view of different datasets for that point in time.

#### Indicator Link Properties

The links from an indicator collection to a data collection can contain several metadata properties that describe the linked collection. Here is an example of properties found in such a link:

| Property | Description |
|---|---|
| `id` | A unique identifier for the linked collection. |
| `rel` | Relationship to the linked collection (`child`). |
| `href` | URL to the linked collection's JSON file. |
| `type` | Media type of the linked resource (e.g., `application/json`). |
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

The second level consists of standard STAC Collections that contain STAC Items. These items hold the actual visualization data, such as map services links or direct data assets. The items are typically cover the same geographical location on different datetimes.

#### Link properties

To support various data sources and visualization needs, eodash uses several custom and standard properties within STAC Items, Assets, and Links. It expects specific properties from an Item to be bubbled up to its link. Here is a list of key properties that can live in links inside a collection:

| Property | Description |
|---|---|
| `id` | Unique identifier. |
| `title` | Display title for the layer or feature. |
| `href` | The URL of the resource. |
| `rel` | The relationship of the link to the Item (e.g., `wms`, `wmts`, `xyz`). |
| `type` | The media type of the asset. |
| `proj:epsg` | The EPSG code of the spatial reference system. |
| `eodash:proj4_def` | A proj4 definition string for custom projections. |
| `roles` | Describes the role of the asset or link (e.g., `data`, `visual`, `thumbnail`). |
| `attribution` | Attribution text to be displayed on the map. |
| `latlng` | Latitude and longitude for GeoDB observation points. |
| `datetime` | The timestamp for the data. |
| `start_datetime` | The start timestamp for a time range. |
| `matrixSet` | The tile matrix set for WMTS layers. |
| `wms:tilesize` | The tile size for WMS layers. |
| `wms:layers` | The layer name(s) for WMS requests. |
| `wms:version` | The WMS service version. |
| `wms:dimensions` | Custom dimensions for WMS requests. |
| `cog_href` | A link to a Cloud-Optimized GeoTIFF |
| `endpoint` | The endpoint URL for a custom data service. |
| `method` | The HTTP method for service requests (e.g., `GET`, `POST`). |
| `body` | The request body for service requests. |
| `eox:flatstyle` | A custom style definition |
| `dataId` | An identifier for data used in a processing |

## Layer Configuration

eodash creates map layers by processing STAC Items from these collections. It uses information from web map links (like WMS, WMTS), and direct data assets like Cloud-Optimized GeoTIFFs (COGs) and vector data (GeoJSON, FlatGeobuf).

## STAC Extensions

eodash utilizes the following STAC extensions to enhance its capabilities:

- **[Projection Extension](https://github.com/stac-extensions/projection)**: Used to specify coordinate reference systems for layers via the `proj:epsg` property.
- **[Web Map Links Extension](https://github.com/stac-extensions/web-map-links)**: While not a formal extension, eodash follows the convention of using `wms:*` properties to configure WMS layers.
- **EOX Custom Extensions**: eodash employs custom properties with the `eox:` and `eodash:` prefixes for functionalities not covered by standard extensions, such as `eox:colorlegend`, `eox:flatstyle`, and `eodash:proj4_def`.