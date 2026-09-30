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
| explore item | 113.7 → 87.3 | 7.1 → 4.9 | 8.8 → 11.9 | 9.3 → 13.4 | 9.5 → 15.6 | 17.8 → 27.3 | ±13.55% → ±19.55% | 20 → 20 | +36.0% |
| date snap | 126.0 → 118.8 | 2.2 → 6.6 | 9.6 → 7.8 | 9.1 → 8.7 | 10.0 → 9.7 | 11.3 → 13.7 | ±10.67% → ±9.79% | 20 → 20 | -18.7% |
| layer datetime | 108.7 → 103.0 | 8.4 → 8.7 | 8.7 → 8.9 | 12.1 → 9.9 | 8.9 → 11.3 | 62.7 → 12.7 | ±57.19% → ±7.60% | 20 → 20 | = |
| links=1 | 75.5 → 67.8 | 12.8 → 13.2 | 13.0 → 13.5 | 13.3 → 15.8 | 13.2 → 15.5 | 14.8 → 38.6 | ±2.19% → ±19.77% | 20 → 20 | +3.8% |
| links=10 | 73.6 → 69.4 | 13.1 → 13.4 | 13.3 → 13.8 | 13.6 → 14.5 | 13.7 → 15.4 | 15.1 → 16.9 | ±2.46% → ±3.46% | 20 → 20 | = |
| links=100 | 62.0 → 51.7 | 15.5 → 16.9 | 15.7 → 19.4 | 16.2 → 19.4 | 16.2 → 19.8 | 19.7 → 20.7 | ±3.29% → ±1.96% | 20 → 20 | +23.6% |
| geozarr bands | 32.0 → 29.7 | 18.3 → 22.3 | 34.4 → 34.2 | 33.3 → 35.3 | 40.8 → 41.9 | 44.6 → 47.3 | ±11.50% → ±10.02% | 20 → 20 | = |
| poi selection | 35.0 → 25.5 | 23.1 → 29.5 | 28.9 → 37.8 | 28.9 → 41.1 | 31.2 → 43.8 | 34.7 → 66.6 | ±5.17% → ±11.26% | 20 → 20 | +30.8% |
| select indicator | 24.6 → 18.7 | 27.1 → 36.7 | 44.5 → 56.9 | 43.6 → 56.7 | 51.6 → 67.8 | 67.0 → 81.7 | ±12.50% → ±11.58% | 20 → 20 | +28.0% |
| vector rendering | 18.6 → 16.1 | 47.0 → 45.3 | 49.1 → 53.4 | 56.4 → 68.3 | 52.5 → 91.9 | 96.1 → 100.6 | ±12.65% → ±15.06% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.1 | 305.0 → 305.3 | 305.0 → 305.3 | 305.1 → 305.3 | 305.3 → 305.5 | ±0.02% → ±0.02% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.3 | 369.6 → 417.6 | 406.3 → 432.7 | 424.7 → 435.5 | 414.6 → 439.0 | 645.3 → 465.1 | ±7.50% → ±1.42% | 20 → 20 | = |
| mirrored selection | 1.7 → 1.2 | 541.3 → 762.3 | 569.2 → 797.7 | 580.2 → 819.8 | 584.0 → 836.8 | 690.4 → 958.4 | ±3.35% → ±3.21% | 20 → 20 | +40.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–10** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 8 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 20 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10735K | 206 |

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
