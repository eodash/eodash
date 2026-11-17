### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

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
| explore item | 209.7 → 191.7 | 3.5 → 4.1 | 4.8 → 5.2 | 4.9 → 5.3 | 5.4 → 5.6 | 5.8 → 6.5 | ±6.37% → ±5.17% | 20 → 20 | = |
| date snap | 113.8 → 116.3 | 2.7 → 4.2 | 10.0 → 10.1 | 9.8 → 9.2 | 10.2 → 10.6 | 14.4 → 13.1 | ±10.47% → ±11.29% | 20 → 20 | = |
| layer datetime | 112.9 → 114.1 | 8.5 → 8.4 | 8.7 → 8.6 | 8.9 → 8.8 | 8.8 → 8.7 | 11.1 → 11.3 | ±3.36% → ±3.87% | 20 → 20 | = |
| links=1 | 71.4 → 71.2 | 13.0 → 13.0 | 13.2 → 13.1 | 14.2 → 14.2 | 15.8 → 15.5 | 17.2 → 16.5 | ±5.10% → ±4.55% | 20 → 20 | = |
| links=10 | 71.1 → 71.1 | 13.3 → 13.3 | 13.5 → 13.5 | 14.2 → 14.2 | 13.8 → 14.7 | 17.2 → 17.2 | ±4.58% → ±4.22% | 20 → 20 | = |
| links=100 | 59.4 → 62.3 | 15.3 → 15.2 | 16.8 → 15.5 | 17.0 → 16.1 | 17.9 → 16.4 | 21.0 → 18.9 | ±4.46% → ±3.50% | 20 → 20 | = |
| poi selection | 32.8 → 28.0 | 25.1 → 26.0 | 29.8 → 34.4 | 31.3 → 38.4 | 33.3 → 39.1 | 44.0 → 65.4 | ±8.05% → ±14.47% | 20 → 20 | +15.8% |
| geozarr bands | 30.2 → 28.5 | 26.1 → 26.6 | 30.5 → 35.0 | 35.1 → 35.6 | 42.7 → 36.3 | 55.1 → 44.3 | ±12.28% → ±5.48% | 20 → 20 | = |
| select indicator | 17.0 → 20.7 | 38.2 → 27.6 | 61.0 → 53.5 | 62.7 → 54.9 | 75.7 → 67.2 | 94.9 → 103.0 | ±12.49% → ±17.15% | 20 → 20 | = |
| vector rendering | 18.9 → 18.6 | 45.5 → 45.3 | 49.9 → 52.0 | 54.5 → 55.5 | 57.6 → 59.8 | 89.7 → 84.7 | ±9.98% → ±9.48% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.1 | 305.3 → 305.4 | 305.3 → 305.3 | 305.5 → 305.4 | 305.6 → 305.6 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.3 | 411.6 → 416.7 | 440.9 → 444.7 | 442.1 → 444.3 | 453.4 → 458.1 | 483.9 → 488.6 | ±2.25% → ±2.15% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.3 | 716.3 → 727.0 | 751.3 → 757.7 | 773.8 → 772.7 | 790.6 → 779.6 | 923.8 → 877.1 | ±3.65% → ±2.86% | 20 → 20 | = |

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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11652K | 206 |

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
