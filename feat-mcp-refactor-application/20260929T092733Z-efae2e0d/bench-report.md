### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

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
| date snap | 126.0 → 85.3 | 2.2 → 8.3 | 9.6 → 11.5 | 9.1 → 12.2 | 10.0 → 14.8 | 11.3 → 16.5 | ±10.67% → ±9.60% | 20 → 20 | +19.7% |
| layer datetime | 108.7 → 96.2 | 8.4 → 8.9 | 8.7 → 10.2 | 12.1 → 10.6 | 8.9 → 12.0 | 62.7 → 12.9 | ±57.19% → ±6.71% | 20 → 20 | +17.3% |
| explore item | 113.7 → 62.9 | 7.1 → 9.8 | 8.8 → 17.0 | 9.3 → 16.9 | 9.5 → 19.2 | 17.8 → 24.3 | ±13.55% → ±11.22% | 20 → 20 | +94.9% |
| links=1 | 75.5 → 61.2 | 12.8 → 13.4 | 13.0 → 16.9 | 13.3 → 16.5 | 13.2 → 17.3 | 14.8 → 18.1 | ±2.19% → ±4.02% | 20 → 20 | +30.0% |
| links=10 | 73.6 → 63.8 | 13.1 → 13.8 | 13.3 → 16.5 | 13.6 → 15.8 | 13.7 → 17.0 | 15.1 → 18.0 | ±2.46% → ±4.45% | 20 → 20 | +23.7% |
| links=100 | 62.0 → 46.8 | 15.5 → 18.8 | 15.7 → 21.3 | 16.2 → 21.5 | 16.2 → 22.1 | 19.7 → 24.4 | ±3.29% → ±3.50% | 20 → 20 | +35.7% |
| geozarr bands | 32.0 → 29.3 | 18.3 → 24.5 | 34.4 → 36.0 | 33.3 → 35.6 | 40.8 → 42.3 | 44.6 → 47.4 | ±11.50% → ±9.63% | 20 → 20 | = |
| poi selection | 35.0 → 24.1 | 23.1 → 34.9 | 28.9 → 42.4 | 28.9 → 41.8 | 31.2 → 44.9 | 34.7 → 50.7 | ±5.17% → ±4.83% | 20 → 20 | +47.0% |
| select indicator | 24.6 → 15.4 | 27.1 → 43.2 | 44.5 → 64.9 | 43.6 → 69.4 | 51.6 → 87.0 | 67.0 → 96.7 | ±12.50% → ±12.29% | 20 → 20 | +46.0% |
| vector rendering | 18.6 → 13.8 | 47.0 → 53.2 | 49.1 → 89.3 | 56.4 → 78.1 | 52.5 → 92.6 | 96.1 → 120.8 | ±12.65% → ±12.94% | 20 → 20 | +82.0% |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.3 | 305.0 → 305.5 | 305.0 → 305.6 | 305.1 → 305.8 | 305.3 → 306.1 | ±0.02% → ±0.04% | 20 → 20 | +0.2% |
| geotiff rendering | 2.4 → 2.1 | 369.6 → 424.8 | 406.3 → 460.0 | 424.7 → 467.2 | 414.6 → 472.9 | 645.3 → 524.6 | ±7.50% → ±2.55% | 20 → 20 | +13.2% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 934.4 | 569.2 → 1001.0 | 580.2 → 1015.0 | 584.0 → 1022.6 | 690.4 → 1196.4 | ±3.35% → ±3.05% | 20 → 20 | +75.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–6** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 28 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 26 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10123K | 206 |

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
