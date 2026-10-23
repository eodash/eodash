### Benchmarks

Previous run → this run. Baseline [`c20e0bd5461962e8a2351fc787a8c67562753b5f`](https://github.com/eodash/eodash/commit/c20e0bd5461962e8a2351fc787a8c67562753b5f), 2026-10-21T15:33:59.775Z.

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
| date snap | 100.7 → 90.5 | 5.4 → 8.3 | 10.7 → 11.7 | 10.9 → 11.5 | 11.8 → 13.3 | 21.1 → 15.0 | ±15.84% → ±9.26% | 20 → 20 | = |
| layer datetime | 89.7 → 95.9 | 8.9 → 8.8 | 11.1 → 9.2 | 12.4 → 11.4 | 13.2 → 11.9 | 30.5 → 28.6 | ±21.01% → ±21.22% | 20 → 20 | = |
| explore item | 69.0 → 77.1 | 9.7 → 9.4 | 14.8 → 12.5 | 15.0 → 13.7 | 15.9 → 15.0 | 21.5 → 23.7 | ±8.71% → ±12.67% | 20 → 20 | = |
| links=1 | 58.5 → 61.0 | 15.1 → 13.8 | 17.1 → 16.9 | 17.1 → 16.5 | 17.3 → 17.4 | 18.0 → 18.1 | ±1.67% → ±3.93% | 20 → 20 | = |
| links=10 | 57.8 → 61.6 | 16.9 → 14.0 | 17.3 → 17.0 | 17.3 → 16.4 | 17.5 → 17.5 | 17.9 → 17.8 | ±0.77% → ±4.04% | 20 → 20 | = |
| links=100 | 47.8 → 46.7 | 18.5 → 18.8 | 21.1 → 21.5 | 21.0 → 21.6 | 21.5 → 22.2 | 23.5 → 26.1 | ±2.63% → ±4.18% | 20 → 20 | = |
| geozarr bands | 28.8 → 26.2 | 23.7 → 22.2 | 38.4 → 42.2 | 37.5 → 41.6 | 46.3 → 51.5 | 57.3 → 57.1 | ±13.34% → ±13.03% | 20 → 20 | = |
| poi selection | 16.5 → 17.7 | 42.3 → 34.5 | 65.9 → 65.3 | 63.4 → 60.2 | 70.1 → 70.2 | 83.6 → 80.2 | ±9.30% → ±11.13% | 20 → 20 | = |
| select indicator | 13.5 → 14.7 | 49.9 → 49.1 | 84.7 → 73.7 | 78.8 → 71.5 | 95.2 → 83.2 | 107.0 → 96.8 | ±11.61% → ±10.32% | 20 → 20 | = |
| vector rendering | 12.8 → 12.9 | 57.1 → 53.5 | 88.7 → 86.6 | 82.9 → 88.8 | 96.8 → 90.6 | 123.9 → 234.0 | ±11.73% → ±23.52% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.0 | 305.4 → 305.5 | 305.5 → 305.4 | 305.6 → 305.5 | 306.4 → 305.8 | ±0.04% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 1.8 → 2.1 | 506.4 → 419.7 | 540.8 → 473.4 | 542.5 → 473.0 | 547.4 → 485.0 | 577.7 → 548.4 | ±1.41% → ±2.69% | 20 → 20 | -12.5% |
| mirrored selection | 1.0 → 1.0 | 934.7 → 938.5 | 976.5 → 988.2 | 1002.8 → 1002.5 | 1022.2 → 1031.1 | 1196.0 → 1087.7 | ±3.47% → ±2.02% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **explore item** | **1–2 → 1–2** | **0 → 0** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–7 → 0–5** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 27 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 1 | 0 | 404 |
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
