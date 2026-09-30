### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 126.0 → 96.5 | 2.2 → 4.8 | 9.6 → 11.3 | 9.1 → 11.0 | 10.0 → 12.3 | 11.3 → 15.6 | ±10.67% → ±10.21% | 20 → 20 | +17.1% |
| layer datetime | 108.7 → 103.8 | 8.4 → 8.7 | 8.7 → 9.0 | 12.1 → 9.8 | 8.9 → 11.3 | 62.7 → 12.4 | ±57.19% → ±6.62% | 20 → 20 | = |
| explore item | 113.7 → 74.9 | 7.1 → 9.3 | 8.8 → 13.0 | 9.3 → 14.8 | 9.5 → 15.7 | 17.8 → 34.7 | ±13.55% → ±20.15% | 20 → 20 | +48.0% |
| links=1 | 75.5 → 66.1 | 12.8 → 13.2 | 13.0 → 15.8 | 13.3 → 15.3 | 13.2 → 16.3 | 14.8 → 17.4 | ±2.19% → ±4.86% | 20 → 20 | +21.5% |
| links=10 | 73.6 → 67.7 | 13.1 → 13.7 | 13.3 → 14.0 | 13.6 → 14.9 | 13.7 → 15.7 | 15.1 → 18.3 | ±2.46% → ±4.53% | 20 → 20 | = |
| links=100 | 62.0 → 48.4 | 15.5 → 18.4 | 15.7 → 20.8 | 16.2 → 20.7 | 16.2 → 21.3 | 19.7 → 23.9 | ±3.29% → ±3.24% | 20 → 20 | +32.5% |
| geozarr bands | 32.0 → 28.1 | 18.3 → 23.8 | 34.4 → 37.7 | 33.3 → 37.9 | 40.8 → 46.0 | 44.6 → 52.0 | ±11.50% → ±11.59% | 20 → 20 | = |
| poi selection | 35.0 → 17.5 | 23.1 → 38.2 | 28.9 → 61.6 | 28.9 → 59.9 | 31.2 → 67.0 | 34.7 → 76.7 | ±5.17% → ±9.82% | 20 → 20 | +113.5% |
| vector rendering | 18.6 → 13.1 | 47.0 → 53.8 | 49.1 → 87.2 | 56.4 → 81.4 | 52.5 → 93.8 | 96.1 → 112.9 | ±12.65% → ±11.46% | 20 → 20 | +77.8% |
| select indicator | 24.6 → 14.7 | 27.1 → 54.5 | 44.5 → 61.8 | 43.6 → 71.5 | 51.6 → 86.8 | 67.0 → 96.7 | ±12.50% → ±10.68% | 20 → 20 | +38.9% |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.2 | 305.0 → 305.4 | 305.0 → 305.4 | 305.1 → 305.5 | 305.3 → 305.8 | ±0.02% → ±0.02% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.0 | 369.6 → 445.6 | 406.3 → 498.4 | 424.7 → 502.4 | 414.6 → 516.3 | 645.3 → 631.8 | ±7.50% → ±4.06% | 20 → 20 | +22.7% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 939.6 | 569.2 → 1005.0 | 580.2 → 1013.4 | 584.0 → 1042.5 | 690.4 → 1164.3 | ±3.35% → ±2.65% | 20 → 20 | +76.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–15** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 23 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 16 | 0 | 404 |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11346K | 206 |

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
