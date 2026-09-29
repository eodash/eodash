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
| date snap | 126.0 → 88.5 | 2.2 → 8.0 | 9.6 → 11.9 | 9.1 → 11.9 | 10.0 → 13.7 | 11.3 → 18.8 | ±10.67% → ±11.39% | 20 → 20 | +23.3% |
| layer datetime | 108.7 → 89.7 | 8.4 → 9.0 | 8.7 → 11.6 | 12.1 → 13.1 | 8.9 → 12.7 | 62.7 → 45.6 | ±57.19% → ±34.27% | 20 → 20 | +34.1% |
| explore item | 113.7 → 68.5 | 7.1 → 9.9 | 8.8 → 14.4 | 9.3 → 16.2 | 9.5 → 16.5 | 17.8 → 36.5 | ±13.55% → ±19.33% | 20 → 20 | +65.1% |
| links=1 | 75.5 → 58.4 | 12.8 → 15.6 | 13.0 → 17.1 | 13.3 → 17.1 | 13.2 → 17.4 | 14.8 → 17.9 | ±2.19% → ±1.40% | 20 → 20 | +31.9% |
| links=10 | 73.6 → 57.3 | 13.1 → 16.9 | 13.3 → 17.4 | 13.6 → 17.4 | 13.7 → 17.7 | 15.1 → 18.0 | ±2.46% → ±0.81% | 20 → 20 | +30.8% |
| links=100 | 62.0 → 47.3 | 15.5 → 19.6 | 15.7 → 21.4 | 16.2 → 21.2 | 16.2 → 21.6 | 19.7 → 22.9 | ±3.29% → ±2.11% | 20 → 20 | +36.0% |
| geozarr bands | 32.0 → 28.5 | 18.3 → 23.9 | 34.4 → 40.1 | 33.3 → 37.9 | 40.8 → 41.7 | 44.6 → 65.8 | ±11.50% → ±13.82% | 20 → 20 | = |
| poi selection | 35.0 → 19.7 | 23.1 → 37.4 | 28.9 → 50.1 | 28.9 → 53.8 | 31.2 → 64.2 | 34.7 → 83.5 | ±5.17% → ±11.90% | 20 → 20 | +73.8% |
| select indicator | 24.6 → 13.8 | 27.1 → 50.5 | 44.5 → 81.3 | 43.6 → 76.0 | 51.6 → 88.3 | 67.0 → 100.9 | ±12.50% → ±9.88% | 20 → 20 | +82.6% |
| vector rendering | 18.6 → 13.7 | 47.0 → 53.4 | 49.1 → 88.9 | 56.4 → 77.7 | 52.5 → 91.3 | 96.1 → 111.9 | ±12.65% → ±11.61% | 20 → 20 | +81.2% |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.4 | 305.0 → 305.8 | 305.0 → 305.8 | 305.1 → 305.9 | 305.3 → 306.7 | ±0.02% → ±0.05% | 20 → 20 | +0.3% |
| geotiff rendering | 2.4 → 2.1 | 369.6 → 450.9 | 406.3 → 463.5 | 424.7 → 471.6 | 414.6 → 478.0 | 645.3 → 536.5 | ±7.50% → ±2.21% | 20 → 20 | +14.1% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 958.1 | 569.2 → 1000.9 | 580.2 → 1028.0 | 584.0 → 1048.8 | 690.4 → 1206.9 | ±3.35% → ±3.32% | 20 → 20 | +75.8% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–8** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 4 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 13 | 0 | 404 |
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
