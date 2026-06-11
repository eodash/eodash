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

The form is whatever the collection's `eodash:jsonform` schema describes — eodash renders the schema as-is, so the available inputs are defined by the dataset, not by the widget see [STAC processing](/STAC#processing). On top of standard JSON Schema fields, two things are eodash-specific:

- **Spatial selection.** A schema field can declare a drawtools input, which lets the user draw on the map. The supported geometries are **bounding box**, **point**, **polygon**, and **feature selection** (clicking existing features of a layer). The drawn geometry is written back into the form value.
- **Schema options.**
  - `options.execute: true` — auto-execute. The process runs on every form change instead of showing an **Execute** button.
  - `options.multiQuery` — when a field holds multiple selections, eodash issues one request per value and aggregates the responses into a single result.

## Outputs

The process output is determined by the `service` links returned for the collection, matched on the link `type`:

| Link `type` | Output |
| --- | --- |
| `application/json`, `text/csv` | Chart data injected into a [Vega-Lite](https://vega.github.io/vega-lite/) spec, rendered by [`EodashChart`](/widgets/internal-widgets/EodashChart). Supports `GET` and `POST` (with a body template). |
| `image/tiff` | A COG / GeoTIFF map layer. |
| `image/png` | A static image map layer placed over the request bounding box. |
| `application/geo+json` | A vector map layer, optionally styled from an `eox:flatstyle` link. |
| `application/json; profile=collection` (with `endpoint: "STAC"`) | Loads another STAC collection as the output — currently used for points-of-interest collections. |

Chart output is shared through the [eodash store](/eodash-store): `EodashProcess` writes `chartSpec` and `chartData`, and `EodashChart` reads them. Map layers are added to the active map.

## Custom endpoints

When a `service` link carries an `endpoint` identifier, eodash routes it to a dedicated handler instead of fetching it directly. These cover backends that need their own request/response handling:

- **SentinelHub** *(chart)* — runs a [SentinelHub Statistics](https://docs.sentinel-hub.com/api/latest/api/statistical/) request and feeds the result into the chart.
- **VEDA** *(chart)* — reads cloud-optimized GeoTIFFs from a [VEDA](https://www.earthdata.nasa.gov/dashboard) collection for charting.
- **EOxHub Workspaces** *(layers, asynchronous)* — submits the work as a job to an [EOxHub](https://hub.eox.at/) workspace and turns the finished result into map layers.

Each handler only acts on links addressed to it, so a collection can mix custom-endpoint links with ordinary `service` links.

## Synchronous vs. asynchronous
The widget supports both types of processes:

- **Synchronous** is the default: the request returns the result directly and the output appears as soon as it resolves.
- **Asynchronous** is used when the collection has EOxHub Workspaces links. The process is submitted as a job and polled until it finishes. The panel tracks each job's `status` (`running` / `successful` / `failed`) and progress, and renders the output once the job is `successful`.


<!-- @widget-props -->

## See also

- [EodashChart](/widgets/internal-widgets/EodashChart) — renders the chart output produced here.
- [Map Layer Visualization](/STAC#map-layer-visualization) — how the layer output is shown on the map.
- [Eodash Store](/eodash-store) — the shared `chartSpec` / `chartData` state the chart reads.