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
| explore item | 113.7 → 79.8 | 7.1 → 6.4 | 8.8 → 12.8 | 9.3 → 13.6 | 9.5 → 15.7 | 17.8 → 23.1 | ±13.55% → ±13.31% | 20 → 20 | +46.3% |
| date snap | 126.0 → 104.2 | 2.2 → 7.6 | 9.6 → 9.5 | 9.1 → 10.0 | 10.0 → 10.8 | 11.3 → 15.3 | ±10.67% → ±10.23% | 20 → 20 | = |
| layer datetime | 108.7 → 99.3 | 8.4 → 8.7 | 8.7 → 9.0 | 12.1 → 12.6 | 8.9 → 11.3 | 62.7 → 56.2 | ±57.19% → ±47.26% | 20 → 20 | = |
| links=1 | 75.5 → 58.7 | 12.8 → 15.5 | 13.0 → 17.0 | 13.3 → 17.0 | 13.2 → 17.1 | 14.8 → 18.4 | ±2.19% → ±1.54% | 20 → 20 | +30.8% |
| links=10 | 73.6 → 57.4 | 13.1 → 17.0 | 13.3 → 17.5 | 13.6 → 17.4 | 13.7 → 17.5 | 15.1 → 18.0 | ±2.46% → ±0.69% | 20 → 20 | +31.6% |
| links=100 | 62.0 → 50.3 | 15.5 → 18.1 | 15.7 → 19.7 | 16.2 → 20.0 | 16.2 → 20.9 | 19.7 → 23.6 | ±3.29% → ±3.60% | 20 → 20 | +25.5% |
| geozarr bands | 32.0 → 28.9 | 18.3 → 24.7 | 34.4 → 37.5 | 33.3 → 37.5 | 40.8 → 45.8 | 44.6 → 56.0 | ±11.50% → ±13.55% | 20 → 20 | = |
| poi selection | 35.0 → 18.6 | 23.1 → 36.8 | 28.9 → 62.3 | 28.9 → 56.4 | 31.2 → 66.3 | 34.7 → 70.7 | ±5.17% → ±9.81% | 20 → 20 | +115.8% |
| select indicator | 24.6 → 14.5 | 27.1 → 42.9 | 44.5 → 82.3 | 43.6 → 74.2 | 51.6 → 90.0 | 67.0 → 111.6 | ±12.50% → ±12.70% | 20 → 20 | +84.9% |
| vector rendering | 18.6 → 13.3 | 47.0 → 53.0 | 49.1 → 90.9 | 56.4 → 80.4 | 52.5 → 94.1 | 96.1 → 110.2 | ±12.65% → ±11.74% | 20 → 20 | +85.3% |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.2 | 305.0 → 305.4 | 305.0 → 305.4 | 305.1 → 305.5 | 305.3 → 305.9 | ±0.02% → ±0.03% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.0 | 369.6 → 469.6 | 406.3 → 493.2 | 424.7 → 496.9 | 414.6 → 507.4 | 645.3 → 548.3 | ±7.50% → ±2.11% | 20 → 20 | +21.4% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 910.4 | 569.2 → 957.2 | 580.2 → 983.7 | 584.0 → 990.7 | 690.4 → 1211.0 | ±3.35% → ±3.68% | 20 → 20 | +68.2% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–5** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 22 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 2 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11958K | 206 |

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
