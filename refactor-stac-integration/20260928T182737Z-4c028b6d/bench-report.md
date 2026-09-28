### Benchmarks

Previous run → this run. Baseline [`6c762401a4e35131e58d22198b8ce0040e3278db`](https://github.com/eodash/eodash/commit/6c762401a4e35131e58d22198b8ce0040e3278db), 2026-09-28T08:57:13.319Z.

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
| date snap | 30.0 → 90.8 | 29.9 → 5.3 | 33.3 → 11.9 | 33.4 → 12.1 | 33.8 → 13.8 | 36.7 → 20.7 | ±1.86% → ±14.41% | 20 → 20 | -64.4% |
| layer datetime | 105.0 → 92.4 | 8.6 → 8.8 | 8.8 → 10.2 | 9.9 → 12.8 | 10.1 → 12.3 | 16.9 → 45.7 | ±10.75% → ±35.21% | 20 → 20 | = |
| explore item | 103.7 → 65.8 | 7.6 → 9.8 | 8.9 → 14.6 | 10.0 → 16.8 | 10.7 → 17.7 | 16.0 → 34.2 | ±10.36% → ±17.72% | 20 → 20 | +63.1% |
| links=1 | 69.9 → 61.2 | 13.2 → 13.6 | 13.4 → 16.7 | 14.4 → 16.5 | 15.9 → 17.4 | 17.0 → 18.4 | ±4.74% → ±4.09% | 20 → 20 | +24.5% |
| links=10 | 68.4 → 60.2 | 13.8 → 14.2 | 14.2 → 17.2 | 14.7 → 16.7 | 15.2 → 17.3 | 16.8 → 17.8 | ±3.03% → ±3.25% | 20 → 20 | +21.1% |
| links=100 | 45.2 → 46.5 | 20.2 → 18.8 | 22.2 → 21.6 | 22.2 → 21.6 | 22.8 → 21.9 | 25.6 → 23.7 | ±2.89% → ±2.28% | 20 → 20 | = |
| geozarr bands | 36.3 → 28.0 | 20.2 → 24.0 | 31.0 → 39.4 | 29.2 → 36.9 | 33.2 → 41.9 | 48.9 → 43.8 | ±12.35% → ±8.03% | 20 → 20 | +26.9% |
| poi selection | 20.8 → 17.9 | 34.3 → 38.6 | 47.6 → 63.2 | 49.6 → 58.5 | 52.6 → 66.3 | 82.1 → 76.3 | ±9.90% → ±9.87% | 20 → 20 | +32.7% |
| select indicator | 10.3 → 14.4 | 79.8 → 42.2 | 95.7 → 79.2 | 98.1 → 74.0 | 106.8 → 87.5 | 122.1 → 100.5 | ±5.47% → ±11.25% | 20 → 20 | -17.2% |
| vector rendering | 16.6 → 13.2 | 46.3 → 53.5 | 52.6 → 88.1 | 66.7 → 82.6 | 78.1 → 94.1 | 133.2 → 156.0 | ±17.56% → ±15.52% | 20 → 20 | +67.6% |
| mosaic scrub | 3.2 → 3.3 | 309.4 → 305.4 | 309.6 → 305.6 | 309.6 → 305.6 | 309.7 → 305.7 | 310.1 → 306.1 | ±0.03% → ±0.03% | 20 → 20 | -1.3% |
| geotiff rendering | 2.8 → 2.1 | 71.6 → 444.9 | 455.4 → 476.6 | 435.1 → 477.5 | 466.6 → 492.6 | 495.4 → 520.5 | ±9.47% → ±2.07% | 20 → 20 | +4.7% |
| mirrored selection | 0.6 → 1.0 | 1560.0 → 953.1 | 1705.1 → 992.9 | 1720.6 → 1003.2 | 1760.3 → 1024.4 | 1962.6 → 1073.5 | ±2.77% → ±1.63% | 20 → 20 | -41.8% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–8** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 23 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 31 | 0 | 404 |
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
