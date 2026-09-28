### Benchmarks

Previous run → this run. Baseline [`6c762401a4e35131e58d22198b8ce0040e3278db`](https://github.com/eodash/eodash/commit/6c762401a4e35131e58d22198b8ce0040e3278db), 2026-09-28T08:57:13.319Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
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
| date snap | 30.0 → 126.0 | 29.9 → 2.2 | 33.3 → 9.6 | 33.4 → 9.1 | 33.8 → 10.0 | 36.7 → 11.3 | ±1.86% → ±10.67% | 20 → 20 | -71.0% |
| explore item | 103.7 → 113.7 | 7.6 → 7.1 | 8.9 → 8.8 | 10.0 → 9.3 | 10.7 → 9.5 | 16.0 → 17.8 | ±10.36% → ±13.55% | 20 → 20 | = |
| layer datetime | 105.0 → 108.7 | 8.6 → 8.4 | 8.8 → 8.7 | 9.9 → 12.1 | 10.1 → 8.9 | 16.9 → 62.7 | ±10.75% → ±57.19% | 20 → 20 | -1.7% |
| links=1 | 69.9 → 75.5 | 13.2 → 12.8 | 13.4 → 13.0 | 14.4 → 13.3 | 15.9 → 13.2 | 17.0 → 14.8 | ±4.74% → ±2.19% | 20 → 20 | -3.3% |
| links=10 | 68.4 → 73.6 | 13.8 → 13.1 | 14.2 → 13.3 | 14.7 → 13.6 | 15.2 → 13.7 | 16.8 → 15.1 | ±3.03% → ±2.46% | 20 → 20 | -6.3% |
| links=100 | 45.2 → 62.0 | 20.2 → 15.5 | 22.2 → 15.7 | 22.2 → 16.2 | 22.8 → 16.2 | 25.6 → 19.7 | ±2.89% → ±3.29% | 20 → 20 | -29.3% |
| geozarr bands | 36.3 → 32.0 | 20.2 → 18.3 | 31.0 → 34.4 | 29.2 → 33.3 | 33.2 → 40.8 | 48.9 → 44.6 | ±12.35% → ±11.50% | 20 → 20 | +11.1% |
| poi selection | 20.8 → 35.0 | 34.3 → 23.1 | 47.6 → 28.9 | 49.6 → 28.9 | 52.6 → 31.2 | 82.1 → 34.7 | ±9.90% → ±5.17% | 20 → 20 | -39.5% |
| select indicator | 10.3 → 24.6 | 79.8 → 27.1 | 95.7 → 44.5 | 98.1 → 43.6 | 106.8 → 51.6 | 122.1 → 67.0 | ±5.47% → ±12.50% | 20 → 20 | -53.5% |
| vector rendering | 16.6 → 18.6 | 46.3 → 47.0 | 52.6 → 49.1 | 66.7 → 56.4 | 78.1 → 52.5 | 133.2 → 96.1 | ±17.56% → ±12.65% | 20 → 20 | -6.7% |
| mosaic scrub | 3.2 → 3.3 | 309.4 → 304.8 | 309.6 → 305.0 | 309.6 → 305.0 | 309.7 → 305.1 | 310.1 → 305.3 | ±0.03% → ±0.02% | 20 → 20 | -1.5% |
| geotiff rendering | 2.8 → 2.4 | 71.6 → 369.6 | 455.4 → 406.3 | 435.1 → 424.7 | 466.6 → 414.6 | 495.4 → 645.3 | ±9.47% → ±7.50% | 20 → 20 | -10.8% |
| mirrored selection | 0.6 → 1.7 | 1560.0 → 541.3 | 1705.1 → 569.2 | 1720.6 → 580.2 | 1760.3 → 584.0 | 1962.6 → 690.4 | ±2.77% → ±3.35% | 20 → 20 | -66.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–10** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 2 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **3 → 2** | **1 → 6** | **0 → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 20 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 6 | 0 | 404 |
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
