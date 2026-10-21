### Benchmarks

Previous run → this run. Baseline [`fb7b93c9e60068648de4088647a067aac2398681`](https://github.com/eodash/eodash/commit/fb7b93c9e60068648de4088647a067aac2398681), 2026-10-19T08:44:29.274Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 98.1 → 100.7 | 6.1 → 5.4 | 10.5 → 10.7 | 11.1 → 10.9 | 12.4 → 11.8 | 22.2 → 21.1 | ±16.23% → ±15.84% | 20 → 20 | = |
| layer datetime | 93.1 → 89.7 | 8.8 → 8.9 | 10.9 → 11.1 | 11.2 → 12.4 | 12.6 → 13.2 | 17.9 → 30.5 | ±10.81% → ±21.01% | 20 → 20 | = |
| explore item | 67.5 → 69.0 | 9.9 → 9.7 | 15.0 → 14.8 | 15.8 → 15.0 | 17.4 → 15.9 | 25.7 → 21.5 | ±12.67% → ±8.71% | 20 → 20 | = |
| links=1 | 58.4 → 58.5 | 16.5 → 15.1 | 17.1 → 17.1 | 17.1 → 17.1 | 17.4 → 17.3 | 17.8 → 18.0 | ±1.03% → ±1.67% | 20 → 20 | = |
| links=10 | 57.4 → 57.8 | 17.1 → 16.9 | 17.4 → 17.3 | 17.4 → 17.3 | 17.5 → 17.5 | 17.9 → 17.9 | ±0.52% → ±0.77% | 20 → 20 | = |
| links=100 | 47.3 → 47.8 | 19.3 → 18.5 | 21.4 → 21.1 | 21.2 → 21.0 | 21.9 → 21.5 | 22.9 → 23.5 | ±2.43% → ±2.63% | 20 → 20 | = |
| geozarr bands | 27.7 → 28.8 | 23.7 → 23.7 | 40.2 → 38.4 | 38.2 → 37.5 | 45.9 → 46.3 | 52.2 → 57.3 | ±10.90% → ±13.34% | 20 → 20 | = |
| poi selection | 17.1 → 16.5 | 39.0 → 42.3 | 66.4 → 65.9 | 63.2 → 63.4 | 72.4 → 70.1 | 105.2 → 83.6 | ±13.62% → ±9.30% | 20 → 20 | = |
| select indicator | 13.7 → 13.5 | 53.5 → 49.9 | 76.6 → 84.7 | 75.8 → 78.8 | 86.2 → 95.2 | 105.2 → 107.0 | ±9.37% → ±11.61% | 20 → 20 | = |
| vector rendering | 13.7 → 12.8 | 54.8 → 57.1 | 81.9 → 88.7 | 77.4 → 82.9 | 91.1 → 96.8 | 115.0 → 123.9 | ±11.74% → ±11.73% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.2 | 305.6 → 305.4 | 305.6 → 305.5 | 305.7 → 305.6 | 306.0 → 306.4 | ±0.03% → ±0.04% | 20 → 20 | -0.0% |
| geotiff rendering | 2.1 → 1.8 | 448.6 → 506.4 | 465.4 → 540.8 | 471.4 → 542.5 | 486.2 → 547.4 | 520.8 → 577.7 | ±2.05% → ±1.41% | 20 → 20 | +16.2% |
| mirrored selection | 1.0 → 1.0 | 962.1 → 934.7 | 992.4 → 976.5 | 1022.8 → 1002.8 | 1021.4 → 1022.2 | 1186.5 → 1196.0 | ±3.24% → ±3.47% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1–2** | **0 → 0** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–11 → 0–7** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
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
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 5 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 5 | 0 | 404 |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11652K | 206 |

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
