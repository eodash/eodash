### Benchmarks

Previous run → this run. Baseline [`6c762401a4e35131e58d22198b8ce0040e3278db`](https://github.com/eodash/eodash/commit/6c762401a4e35131e58d22198b8ce0040e3278db), 2026-09-28T08:57:13.319Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- geozarr bands: dragging a band rebuilds the source
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 30.0 → 86.3 | 29.9 → 8.0 | 33.3 → 12.0 | 33.4 → 12.2 | 33.8 → 14.2 | 36.7 → 19.1 | ±1.86% → ±11.23% | 20 → 20 | -64.1% |
| layer datetime | 105.0 → 89.6 | 8.6 → 8.9 | 8.8 → 11.8 | 9.9 → 16.0 | 10.1 → 12.7 | 16.9 → 93.4 | ±10.75% → ±66.31% | 20 → 20 | +34.1% |
| explore item | 103.7 → 68.8 | 7.6 → 9.5 | 8.9 → 14.9 | 10.0 → 15.6 | 10.7 → 17.6 | 16.0 → 27.5 | ±10.36% → ±13.59% | 20 → 20 | +66.5% |
| geozarr bands | 36.3 → 29.8 | 20.2 → 12.4 | 31.0 → 39.8 | 29.2 → 37.9 | 33.2 → 45.4 | 48.9 → 54.6 | ±12.35% → ±13.87% | 20 → 20 | +28.2% |
| links=1 | 69.9 → 55.2 | 13.2 → 16.7 | 13.4 → 17.3 | 14.4 → 19.0 | 15.9 → 17.8 | 17.0 → 41.0 | ±4.74% → ±15.49% | 20 → 20 | +28.6% |
| links=10 | 68.4 → 57.1 | 13.8 → 16.9 | 14.2 → 17.5 | 14.7 → 17.5 | 15.2 → 17.7 | 16.8 → 18.1 | ±3.03% → ±0.85% | 20 → 20 | +23.2% |
| links=100 | 45.2 → 46.9 | 20.2 → 19.0 | 22.2 → 21.5 | 22.2 → 21.4 | 22.8 → 22.3 | 25.6 → 23.8 | ±2.89% → ±3.11% | 20 → 20 | = |
| poi selection | 20.8 → 23.0 | 34.3 → 34.7 | 47.6 → 41.5 | 49.6 → 45.3 | 52.6 → 45.8 | 82.1 → 69.0 | ±9.90% → ±10.74% | 20 → 20 | -12.8% |
| select indicator | 10.3 → 13.4 | 79.8 → 49.0 | 95.7 → 76.0 | 98.1 → 79.1 | 106.8 → 96.0 | 122.1 → 105.5 | ±5.47% → ±10.85% | 20 → 20 | -20.6% |
| vector rendering | 16.6 → 13.8 | 46.3 → 53.3 | 52.6 → 74.9 | 66.7 → 78.4 | 78.1 → 89.3 | 133.2 → 139.0 | ±17.56% → ±14.69% | 20 → 20 | = |
| mosaic scrub | 3.2 → 3.3 | 309.4 → 305.2 | 309.6 → 305.5 | 309.6 → 305.6 | 309.7 → 305.6 | 310.1 → 306.1 | ±0.03% → ±0.03% | 20 → 20 | -1.3% |
| geotiff rendering | 2.8 → 2.1 | 71.6 → 443.6 | 455.4 → 460.2 | 435.1 → 466.4 | 466.6 → 472.0 | 495.4 → 517.1 | ±9.47% → ±1.86% | 20 → 20 | = |
| mirrored selection | 0.6 → 1.0 | 1560.0 → 965.9 | 1705.1 → 1007.9 | 1720.6 → 1032.7 | 1760.3 → 1047.8 | 1962.6 → 1255.8 | ±2.77% → ±3.47% | 20 → 20 | -40.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–16** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 12 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 32 | 0 | 404 |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
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
