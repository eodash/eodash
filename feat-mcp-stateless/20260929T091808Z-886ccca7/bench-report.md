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
| date snap | 126.0 → 140.1 | 2.2 → 4.2 | 9.6 → 7.1 | 9.1 → 7.6 | 10.0 → 7.3 | 11.3 → 15.3 | ±10.67% → ±15.22% | 20 → 20 | -26.4% |
| explore item | 113.7 → 95.2 | 7.1 → 7.8 | 8.8 → 9.9 | 9.3 → 11.5 | 9.5 → 12.5 | 17.8 → 28.1 | ±13.55% → ±20.60% | 20 → 20 | = |
| layer datetime | 108.7 → 104.6 | 8.4 → 8.5 | 8.7 → 8.7 | 12.1 → 12.8 | 8.9 → 9.6 | 62.7 → 68.2 | ±57.19% → ±58.82% | 20 → 20 | = |
| links=1 | 75.5 → 67.4 | 12.8 → 13.1 | 13.0 → 14.5 | 13.3 → 15.2 | 13.2 → 16.6 | 14.8 → 22.7 | ±2.19% → ±8.11% | 20 → 20 | +11.5% |
| links=10 | 73.6 → 65.1 | 13.1 → 13.4 | 13.3 → 16.5 | 13.6 → 15.5 | 13.7 → 17.1 | 15.1 → 17.6 | ±2.46% → ±5.30% | 20 → 20 | +23.7% |
| links=100 | 62.0 → 52.5 | 15.5 → 16.8 | 15.7 → 19.2 | 16.2 → 19.1 | 16.2 → 19.9 | 19.7 → 21.1 | ±3.29% → ±3.21% | 20 → 20 | +22.3% |
| geozarr bands | 32.0 → 31.4 | 18.3 → 21.6 | 34.4 → 35.0 | 33.3 → 34.0 | 40.8 → 38.5 | 44.6 → 47.2 | ±11.50% → ±11.59% | 20 → 20 | = |
| poi selection | 35.0 → 28.5 | 23.1 → 25.1 | 28.9 → 34.2 | 28.9 → 37.1 | 31.2 → 42.5 | 34.7 → 58.1 | ±5.17% → ±12.34% | 20 → 20 | +18.5% |
| select indicator | 24.6 → 18.7 | 27.1 → 31.5 | 44.5 → 54.2 | 43.6 → 57.2 | 51.6 → 64.9 | 67.0 → 96.3 | ±12.50% → ±12.80% | 20 → 20 | = |
| vector rendering | 18.6 → 16.5 | 47.0 → 47.5 | 49.1 → 57.0 | 56.4 → 64.0 | 52.5 → 76.2 | 96.1 → 94.5 | ±12.65% → ±11.89% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.3 | 305.0 → 305.4 | 305.0 → 305.4 | 305.1 → 305.5 | 305.3 → 305.8 | ±0.02% → ±0.02% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.2 | 369.6 → 427.2 | 406.3 → 446.0 | 424.7 → 453.4 | 414.6 → 461.1 | 645.3 → 539.5 | ±7.50% → ±2.97% | 20 → 20 | +9.8% |
| mirrored selection | 1.7 → 1.3 | 541.3 → 700.6 | 569.2 → 731.0 | 580.2 → 756.1 | 584.0 → 765.7 | 690.4 → 924.0 | ±3.35% → ±4.03% | 20 → 20 | +28.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–4** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 9 | 0 | 404 |
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
