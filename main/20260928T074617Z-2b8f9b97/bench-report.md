### Benchmarks

Previous run → this run. The baseline predates provenance, so what it measured is unknown.

- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- geotiff rendering, vector rendering: draws a styled layer of each source type
- date snap: moving the date rebuilds all six collections' layers
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| layer datetime | 95.5 | 8.9 | 9.8 | 10.7 | 12.5 | 13.6 | ±7.58% | 20 | new |
| explore item | 74.5 | 10.8 | 13.1 | 13.9 | 15.4 | 20.4 | ±9.39% | 20 | new |
| links=1 | 58.9 | 15.4 | 17.0 | 17.0 | 17.3 | 17.9 | ±1.47% | 20 | new |
| links=10 | 55.8 | 17.3 | 18.0 | 17.9 | 18.0 | 18.5 | ±0.75% | 20 | new |
| geozarr bands | 28.2 | 22.0 | 37.1 | 37.2 | 39.5 | 54.4 | ±9.98% | 20 | new |
| links=100 | 37.7 | 24.9 | 26.4 | 26.6 | 26.9 | 30.0 | ±2.26% | 20 | new |
| geotiff rendering | 5.8 | 32.9 | 471.1 | 376.1 | 483.1 | 527.2 | ±22.89% | 20 | new |
| date snap | 26.7 | 33.3 | 37.4 | 37.8 | 39.6 | 45.1 | ±4.11% | 20 | new |
| vector rendering | 13.1 | 55.1 | 87.9 | 84.0 | 93.4 | 161.7 | ±15.94% | 20 | new |
| poi selection | 12.9 | 59.7 | 76.1 | 81.6 | 96.6 | 121.8 | ±11.14% | 20 | new |
| select indicator | 6.7 | 130.4 | 149.4 | 149.2 | 155.2 | 176.7 | ±4.00% | 20 | new |
| mosaic scrub | 3.2 | 309.5 | 309.7 | 309.8 | 309.8 | 310.1 | ±0.02% | 20 | new |
| mirrored selection | 0.4 | 2282.0 | 2332.9 | 2362.2 | 2368.1 | 2537.5 | ±1.68% | 20 | new |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| layer datetime | 1 | 0 | 0 |
| explore item | 1 | 0 | 0 |
| links=1 | 3 | 0 | 0 |
| links=10 | 3 | 0 | 0 |
| **geozarr bands** | **0** | **0–10** | **0** |
| links=100 | 3 | 0 | 0 |
| geotiff rendering | 4 | 0 | 0 |
| date snap | 6 | 0 | 0 |
| vector rendering | 4 | 1 | 1123K |
| poi selection | 2 | 1 | 0 |
| select indicator | 7 | 1 | 0 |
| mosaic scrub | 2 | 0 | 0 |
| mirrored selection | 3 | 1 | 0 |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 5 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 11 | 0 | 404 |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
|  | `/stac/aggregations/mosaicked.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 20 | 0 | 0 | mocked |

</details>

<details><summary>Glossary</summary>

| column | meaning |
| --- | --- |
| hz | runs per second |
| min | fastest sample |
| p50 | median; what the last column compares |
| mean | average |
| p75 | 75th percentile |
| p99 | 99th percentile |
| rme | relative margin of error |
| samples | timed iterations |
| median Δ | change in the median (p50) when it leaves the middle two thirds of the baseline's samples; `=` inside |
| requests | requests the application issued through its HTTP client per run; the tests resolve them from fixtures (`mocked`), so nothing is transferred |
| fetches | requests the browser issued over the network per run: tiles, data files, anything the tests do not intercept |
| bytes | encoded body size of the responses; 0 where the origin sends no `timing-allow-origin` header |
| status | `mocked` where the tests resolved the request; HTTP codes where the browser fetched it; both where the application did both |

</details>
