### Benchmarks

Previous run → this run. Baseline [`deb95578cb44065609eec1f0fcd7483ef6227b02`](https://github.com/eodash/eodash/commit/deb95578cb44065609eec1f0fcd7483ef6227b02), 2026-10-08T14:20:29.298Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 92.6 → 96.1 | 5.0 → 8.1 | 11.7 → 10.1 | 12.0 → 10.9 | 13.1 → 11.6 | 26.2 → 19.1 | ±18.01% → ±12.23% | 20 → 20 | = |
| layer datetime | 94.2 → 97.2 | 9.0 → 8.7 | 10.6 → 9.4 | 10.9 → 10.7 | 12.3 → 12.1 | 14.9 → 17.7 | ±8.17% → ±10.65% | 20 → 20 | = |
| explore item | 60.1 → 72.8 | 11.8 → 9.8 | 15.7 → 13.9 | 18.9 → 14.3 | 18.3 → 15.3 | 43.1 → 23.4 | ±21.96% → ±10.39% | 20 → 20 | = |
| links=10 | 58.6 → 58.8 | 14.1 → 14.2 | 17.3 → 17.3 | 17.1 → 17.1 | 17.5 → 17.5 | 18.6 → 18.0 | ±2.63% → ±2.69% | 20 → 20 | = |
| links=1 | 58.7 → 58.5 | 15.6 → 15.3 | 17.1 → 17.2 | 17.1 → 17.1 | 17.3 → 17.5 | 19.1 → 17.9 | ±2.12% → ±1.56% | 20 → 20 | = |
| links=100 | 47.2 → 47.5 | 19.4 → 18.8 | 21.4 → 21.4 | 21.3 → 21.2 | 21.8 → 21.8 | 23.6 → 23.6 | ±2.47% → ±3.08% | 20 → 20 | = |
| geozarr bands | 29.9 → 26.1 | 25.0 → 24.0 | 31.6 → 43.6 | 34.9 → 42.1 | 42.4 → 52.7 | 47.6 → 59.9 | ±9.79% → ±13.83% | 20 → 20 | +37.9% |
| select indicator | 14.9 → 15.7 | 43.2 → 37.4 | 71.8 → 71.1 | 72.4 → 69.1 | 91.3 → 81.1 | 102.0 → 104.5 | ±12.46% → ±13.22% | 20 → 20 | = |
| poi selection | 15.7 → 17.9 | 41.6 → 37.9 | 69.6 → 63.4 | 66.8 → 58.5 | 76.3 → 68.7 | 87.0 → 73.2 | ±9.62% → ±9.62% | 20 → 20 | = |
| vector rendering | 13.5 → 14.1 | 57.0 → 51.8 | 71.8 → 72.0 | 78.1 → 75.6 | 96.8 → 93.6 | 105.8 → 103.9 | ±11.00% → ±12.22% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.3 | 305.6 → 305.6 | 305.6 → 305.6 | 305.7 → 305.7 | 306.3 → 306.0 | ±0.04% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 430.2 → 453.1 | 461.8 → 474.2 | 471.6 → 480.9 | 474.3 → 476.9 | 554.7 → 563.6 | ±2.94% → ±2.61% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 956.8 → 939.6 | 973.3 → 999.4 | 999.8 → 1009.5 | 1026.4 → 1034.4 | 1167.6 → 1118.5 | ±2.63% → ±2.29% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–6 → 0–9** | **0 → 0** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 21 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 3 | 0 | 404 |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11041K | 206 |

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
