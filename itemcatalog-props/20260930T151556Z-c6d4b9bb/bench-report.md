### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

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
| date snap | 126.0 → 106.5 | 2.2 → 7.2 | 9.6 → 8.4 | 9.1 → 10.5 | 10.0 → 12.6 | 11.3 → 23.0 | ±10.67% → ±19.71% | 20 → 20 | = |
| explore item | 113.7 → 82.6 | 7.1 → 8.7 | 8.8 → 12.0 | 9.3 → 12.6 | 9.5 → 14.6 | 17.8 → 16.9 | ±13.55% → ±9.72% | 20 → 20 | +37.7% |
| layer datetime | 108.7 → 98.0 | 8.4 → 8.8 | 8.7 → 9.1 | 12.1 → 10.5 | 8.9 → 12.4 | 62.7 → 13.0 | ±57.19% → ±7.81% | 20 → 20 | = |
| links=1 | 75.5 → 67.9 | 12.8 → 13.4 | 13.0 → 15.0 | 13.3 → 14.8 | 13.2 → 15.6 | 14.8 → 17.0 | ±2.19% → ±3.73% | 20 → 20 | +15.8% |
| links=10 | 73.6 → 68.8 | 13.1 → 13.5 | 13.3 → 14.0 | 13.6 → 14.6 | 13.7 → 15.0 | 15.1 → 16.9 | ±2.46% → ±3.45% | 20 → 20 | = |
| links=100 | 62.0 → 55.3 | 15.5 → 16.2 | 15.7 → 18.4 | 16.2 → 18.1 | 16.2 → 18.8 | 19.7 → 19.5 | ±3.29% → ±2.55% | 20 → 20 | +17.2% |
| geozarr bands | 32.0 → 32.3 | 18.3 → 20.5 | 34.4 → 32.7 | 33.3 → 32.3 | 40.8 → 36.2 | 44.6 → 43.0 | ±11.50% → ±9.33% | 20 → 20 | = |
| poi selection | 35.0 → 23.4 | 23.1 → 31.3 | 28.9 → 40.0 | 28.9 → 45.6 | 31.2 → 57.7 | 34.7 → 66.3 | ±5.17% → ±12.41% | 20 → 20 | +38.8% |
| select indicator | 24.6 → 16.9 | 27.1 → 36.6 | 44.5 → 58.2 | 43.6 → 63.1 | 51.6 → 69.3 | 67.0 → 106.1 | ±12.50% → ±12.72% | 20 → 20 | +30.7% |
| vector rendering | 18.6 → 15.8 | 47.0 → 47.5 | 49.1 → 65.5 | 56.4 → 69.3 | 52.5 → 83.3 | 96.1 → 128.1 | ±12.65% → ±15.57% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.2 | 305.0 → 305.4 | 305.0 → 305.5 | 305.1 → 305.5 | 305.3 → 306.5 | ±0.02% → ±0.05% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.4 | 369.6 → 397.7 | 406.3 → 421.5 | 424.7 → 421.6 | 414.6 → 429.7 | 645.3 → 466.8 | ±7.50% → ±1.90% | 20 → 20 | = |
| mirrored selection | 1.7 → 1.5 | 541.3 → 624.0 | 569.2 → 637.6 | 580.2 → 655.3 | 584.0 → 670.0 | 690.4 → 755.0 | ±3.35% → ±2.55% | 20 → 20 | +12.0% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–11** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 12 | 0 | 404 |
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
