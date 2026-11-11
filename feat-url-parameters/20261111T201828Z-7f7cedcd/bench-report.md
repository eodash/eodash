### Benchmarks

Previous run → this run. Baseline [`2c245b9bc376783753255bab7a170801c9bff320`](https://github.com/eodash/eodash/commit/2c245b9bc376783753255bab7a170801c9bff320), 2026-11-11T17:05:28.114Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 115.7 → 129.3 | 6.4 → 5.9 | 8.0 → 7.8 | 9.5 → 8.2 | 10.5 → 8.5 | 20.9 → 17.1 | ±18.68% → ±15.50% | 20 → 20 | = |
| date snap | 83.6 → 95.5 | 7.2 → 7.8 | 13.1 → 11.2 | 13.6 → 11.1 | 15.3 → 12.4 | 25.8 → 18.5 | ±18.29% → ±12.21% | 20 → 20 | = |
| layer datetime | 91.4 → 96.0 | 8.8 → 8.6 | 11.3 → 9.3 | 13.6 → 10.9 | 12.5 → 12.5 | 57.1 → 18.2 | ±43.96% → ±11.61% | 20 → 20 | = |
| links=1 | 56.4 → 61.3 | 16.9 → 13.3 | 17.3 → 16.8 | 18.0 → 16.5 | 17.5 → 17.0 | 28.0 → 19.7 | ±7.49% → ±4.98% | 20 → 20 | -2.9% |
| links=10 | 56.9 → 59.0 | 16.8 → 13.8 | 17.6 → 17.5 | 17.6 → 17.1 | 17.6 → 17.7 | 19.4 → 19.1 | ±1.53% → ±3.98% | 20 → 20 | = |
| links=100 | 52.1 → 52.4 | 17.3 → 16.9 | 19.3 → 18.8 | 19.4 → 19.3 | 20.2 → 19.6 | 25.4 → 24.7 | ±5.01% → ±5.02% | 20 → 20 | = |
| poi selection | 22.7 → 17.7 | 37.8 → 37.0 | 43.4 → 64.5 | 44.3 → 61.4 | 47.8 → 70.6 | 51.2 → 99.4 | ±4.17% → ±13.74% | 20 → 20 | +48.7% |
| geozarr bands | 22.0 → 20.9 | 28.1 → 39.6 | 46.5 → 46.9 | 47.2 → 49.0 | 50.1 → 50.3 | 64.2 → 74.5 | ±8.31% → ±8.07% | 20 → 20 | = |
| select indicator | 11.3 → 12.2 | 62.4 → 53.1 | 94.9 → 89.4 | 93.8 → 85.8 | 103.6 → 98.7 | 159.7 → 111.0 | ±12.31% → ±9.83% | 20 → 20 | = |
| vector rendering | 14.4 → 14.3 | 58.2 → 59.8 | 67.8 → 65.7 | 71.1 → 73.1 | 72.8 → 70.2 | 107.1 → 134.9 | ±8.38% → ±12.85% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.0 | 305.4 → 305.3 | 305.4 → 305.3 | 305.5 → 305.4 | 306.0 → 305.7 | ±0.03% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.5 → 2.0 | 84.7 → 446.5 | 486.6 → 489.8 | 466.3 → 495.6 | 494.6 → 516.0 | 540.5 → 570.6 | ±9.31% → ±2.94% | 20 → 20 | = |
| mirrored selection | 0.9 → 1.0 | 1012.3 → 994.8 | 1052.0 → 1044.1 | 1060.2 → 1053.5 | 1077.3 → 1071.6 | 1155.2 → 1139.8 | ±1.62% → ±1.90% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| explore item | none | | | | |
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
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
