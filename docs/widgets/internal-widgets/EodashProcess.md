# EodashProcess

A panel that runs an [OGC API – Processes](https://ogcapi.ogc.org/processes/) style workflow against the selected dataset and shows the result as a chart, map layers, or another STAC collection.

It reads an `eodash:jsonform` URL from the selected STAC collection, fetches that [JSON Schema](https://json-schema.org/) form definition, and renders it with [`eox-jsonform`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-jsonform--docs). Spatial inputs (bounding box, point, polygon, or feature selection) are drawn on the map through [`eox-drawtools`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-drawtools--docs), which the form schema injects. The form values fill the `service` links on the collection (templated with [Mustache](https://mustache.github.io/)), and the responses become the output.

## Example

A process panel placed next to the map:

```js
{
  id: "process",
  title: "Analysis",
  type: "internal",
  layout: { x: 9, y: 0, w: 3, h: 8 },
  widget: {
    name: "EodashProcess",
    properties: {
      vegaEmbedOptions: { actions: true },
    },
  },
}
```

A compare-mode panel bound to the second map (see [compare mode](/widgets/internal-widgets#compare-mode)):

```js
widget: {
  name: "EodashProcess",
  properties: { enableCompare: true },
}
```

## Inputs

The form is whatever the collection's `eodash:jsonform` schema describes - eodash renders the schema as-is, so the available inputs are defined by the dataset, not by the widget see [STAC processing](/STAC#processing). On top of standard JSON Schema fields, two things are eodash-specific:

- **Spatial selection.** A schema field can declare a drawtools input, which lets the user draw on the map. The supported geometries are **bounding box**, **point**, **polygon**, and **feature selection** (clicking existing features of a layer). The drawn geometry is written back into the form value.
- **Schema options.**
  - `options.execute: true` - auto-execute. The process runs on every form change instead of showing an **Execute** button.
  - `options.multiQuery` - when a field holds multiple selections, eodash issues one request per value and aggregates the responses into a single result.
- **Vega options.**
  - `eodash:disableClickDateToMap` - when set to `true` in the Vega spec, disables updating the global dashboard datetime on chart item click.

## Initial processing dates

The panel makes a best-effort guess at date inputs using their existing property names and formats. No additional schema fields are required. For example, both `date_start` / `date_end` and `beginDate` / `endDate` are recognized:

```json
{
  "type": "object",
  "properties": {
    "beginDate": {
      "type": "string",
      "format": "date",
      "default": "2024-01-01"
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "default": "2024-12-31"
    }
  }
}
```

Names are split at underscores, hyphens, and camel-case boundaries, then matched case-insensitively as whole words:

- **Start:** `start`, `begin`, `beginning`, or `from`.
- **End:** `end`, `finish`, `stop`, or `to`.
- **Date hints:** `date`, `time`, or `datetime`. Unformatted string fields need one of these hints. A `date`, `date-time`, or `datetime-local` format is sufficient evidence by itself, so formatted fields named `from` and `to` also work. Substrings such as `runtime`, `timeout`, and `weekend` do not count as hints.

Exactly one start and one end input in the same object form a range. The initial range is the collection temporal extent. 

A single date input uses the selected dashboard datetime, constrained by the collection extent. Nested objects and explicit `allOf`, `anyOf`, or `oneOf` branches are examined independently; references and array items are not expanded.

Date-only inputs receive `YYYY-MM-DD`; `date-time` inputs receive UTC ISO datetimes, and `datetime-local` inputs receive the corresponding UTC components without a timezone suffix. Unformatted inputs keep an existing valid ISO default's date/time precision, or use date-only values otherwise.

## Outputs

The process output is determined by the `service` links returned for the collection, matched on the link `type`:

| Link `type` | Output |
| --- | --- |
| `application/json`, `text/csv` | Chart data injected into a [Vega-Lite](https://vega.github.io/vega-lite/) spec, rendered by [`EodashChart`](/widgets/internal-widgets/EodashChart). Supports `GET` and `POST` (with a body template). |
| `image/tiff` | A COG / GeoTIFF map layer. |
| `image/png` | A static image map layer placed over the request bounding box. |
| `application/geo+json` | A vector map layer, optionally styled from an `eox:flatstyle` link. |
| `application/json; profile=collection` (with `endpoint: "STAC"`) | Loads another STAC collection as the output - currently used for points-of-interest collections. |

Chart output is shared through the [eodash store](/eodash-store): `EodashProcess` writes `chartSpec` and `chartData`, and `EodashChart` reads them. Map layers are added to the active map.

By default, the display title of the generated results layers on the map is `"Results "` followed by the collection or layer ID. If a `title` property is present on the STAC link, that title is preferred and used as the layer's display title in the layer control instead.

## Custom endpoints

When a `service` link carries an `endpoint` identifier, eodash routes it to a dedicated handler instead of fetching it directly. These cover backends that need their own request/response handling:

- **SentinelHub** *(chart)* - runs a [SentinelHub Statistics](https://docs.sentinel-hub.com/api/latest/api/statistical/) request and feeds the result into the chart.
- **VEDA** *(chart)* - reads cloud-optimized GeoTIFFs from a [VEDA](https://www.earthdata.nasa.gov/dashboard) collection for charting.
- **EOxHub Workspaces** *(layers, asynchronous)* - submits the work as a job to an [EOxHub](https://hub.eox.at/) workspace and turns the finished result into map layers.

Each handler only acts on links addressed to it, so a collection can mix custom-endpoint links with ordinary `service` links.

## Synchronous vs. asynchronous
The widget supports both types of processes:

- **Synchronous** is the default: the request returns the result directly and the output appears as soon as it resolves.
- **Asynchronous** is used when the collection has EOxHub Workspaces links. The process is submitted as a job and polled until it finishes. The panel tracks each job's `status` (`running` / `successful` / `failed`) and progress, and renders the output once the job is `successful`.


<!-- @widget-props -->

## See also

- [EodashChart](/widgets/internal-widgets/EodashChart) - renders the chart output produced here.
- [Map Layer Visualization](/STAC#map-layer-visualization) - how the layer output is shown on the map.
- [Eodash Store](/eodash-store) - the shared `chartSpec` / `chartData` state the chart reads.
