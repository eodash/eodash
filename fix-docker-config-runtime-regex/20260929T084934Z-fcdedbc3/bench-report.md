### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 113.7 → 66.3 | 7.1 → 8.0 | 8.8 → 15.4 | 9.3 → 16.3 | 9.5 → 18.6 | 17.8 → 25.9 | ±13.55% → ±13.11% | 20 → 20 | +76.6% |
| date snap | 126.0 → 84.2 | 2.2 → 8.6 | 9.6 → 12.1 | 9.1 → 12.6 | 10.0 → 13.5 | 11.3 → 22.5 | ±10.67% → ±13.23% | 20 → 20 | +25.9% |
| layer datetime | 108.7 → 88.2 | 8.4 → 9.2 | 8.7 → 12.0 | 12.1 → 13.6 | 8.9 → 12.7 | 62.7 → 51.9 | ±57.19% → ±38.52% | 20 → 20 | +38.7% |
| links=1 | 75.5 → 58.7 | 12.8 → 15.7 | 13.0 → 17.0 | 13.3 → 17.0 | 13.2 → 17.4 | 14.8 → 18.4 | ±2.19% → ±1.86% | 20 → 20 | +30.8% |
| links=10 | 73.6 → 57.3 | 13.1 → 16.5 | 13.3 → 17.4 | 13.6 → 17.5 | 13.7 → 17.4 | 15.1 → 19.7 | ±2.46% → ±2.04% | 20 → 20 | +30.8% |
| links=100 | 62.0 → 46.3 | 15.5 → 19.7 | 15.7 → 21.4 | 16.2 → 21.6 | 16.2 → 22.0 | 19.7 → 23.8 | ±3.29% → ±2.20% | 20 → 20 | +36.3% |
| geozarr bands | 32.0 → 26.7 | 18.3 → 23.6 | 34.4 → 43.4 | 33.3 → 41.8 | 40.8 → 47.9 | 44.6 → 66.6 | ±11.50% → ±15.28% | 20 → 20 | +26.0% |
| poi selection | 35.0 → 14.9 | 23.1 → 43.2 | 28.9 → 68.0 | 28.9 → 70.0 | 31.2 → 81.2 | 34.7 → 89.0 | ±5.17% → ±9.10% | 20 → 20 | +135.7% |
| select indicator | 24.6 → 13.3 | 27.1 → 45.5 | 44.5 → 86.8 | 43.6 → 80.6 | 51.6 → 92.1 | 67.0 → 111.8 | ±12.50% → ±11.44% | 20 → 20 | +95.1% |
| vector rendering | 18.6 → 14.4 | 47.0 → 56.1 | 49.1 → 62.9 | 56.4 → 73.5 | 52.5 → 90.0 | 96.1 → 120.0 | ±12.65% → ±12.51% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.5 | 305.0 → 305.6 | 305.0 → 305.7 | 305.1 → 305.7 | 305.3 → 306.0 | ±0.02% → ±0.02% | 20 → 20 | +0.2% |
| geotiff rendering | 2.4 → 2.1 | 369.6 → 442.4 | 406.3 → 471.6 | 424.7 → 477.4 | 414.6 → 479.9 | 645.3 → 553.2 | ±7.50% → ±2.46% | 20 → 20 | +16.1% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 971.1 | 569.2 → 1022.0 | 580.2 → 1049.3 | 584.0 → 1084.7 | 690.4 → 1265.2 | ±3.35% → ±3.50% | 20 → 20 | +79.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–7** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 23 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 4 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10429K | 206 |

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
