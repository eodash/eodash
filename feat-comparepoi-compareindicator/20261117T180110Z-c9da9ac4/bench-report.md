### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

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
| date snap | 113.8 → 159.9 | 2.7 → 3.2 | 10.0 → 6.5 | 9.8 → 6.5 | 10.2 → 6.6 | 14.4 → 8.6 | ±10.47% → ±7.26% | 20 → 20 | -35.8% |
| explore item | 209.7 → 206.6 | 3.5 → 3.9 | 4.8 → 4.8 | 4.9 → 5.0 | 5.4 → 5.7 | 5.8 → 6.6 | ±6.37% → ±8.19% | 20 → 20 | = |
| layer datetime | 112.9 → 112.1 | 8.5 → 8.4 | 8.7 → 8.7 | 8.9 → 9.0 | 8.8 → 8.7 | 11.1 → 12.7 | ±3.36% → ±6.01% | 20 → 20 | = |
| links=1 | 71.4 → 69.0 | 13.0 → 13.0 | 13.2 → 13.3 | 14.2 → 15.4 | 15.8 → 16.0 | 17.2 → 35.5 | ±5.10% → ±17.93% | 20 → 20 | = |
| links=10 | 71.1 → 70.8 | 13.3 → 13.3 | 13.5 → 13.5 | 14.2 → 14.2 | 13.8 → 14.9 | 17.2 → 17.1 | ±4.58% → ±4.16% | 20 → 20 | = |
| links=100 | 59.4 → 61.3 | 15.3 → 15.4 | 16.8 → 15.8 | 17.0 → 16.4 | 17.9 → 17.4 | 21.0 → 18.6 | ±4.46% → ±3.17% | 20 → 20 | = |
| geozarr bands | 30.2 → 25.5 | 26.1 → 26.5 | 30.5 → 43.1 | 35.1 → 40.6 | 42.7 → 43.4 | 55.1 → 47.1 | ±12.28% → ±7.66% | 20 → 20 | = |
| poi selection | 32.8 → 31.6 | 25.1 → 26.7 | 29.8 → 31.3 | 31.3 → 32.2 | 33.3 → 33.7 | 44.0 → 46.7 | ±8.05% → ±7.28% | 20 → 20 | = |
| select indicator | 17.0 → 20.0 | 38.2 → 28.9 | 61.0 → 55.1 | 62.7 → 56.1 | 75.7 → 71.5 | 94.9 → 87.3 | ±12.49% → ±15.49% | 20 → 20 | = |
| vector rendering | 18.9 → 18.9 | 45.5 → 47.1 | 49.9 → 49.8 | 54.5 → 54.1 | 57.6 → 57.7 | 89.7 → 77.2 | ±9.98% → ±7.61% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.1 | 305.3 → 305.4 | 305.3 → 305.4 | 305.5 → 305.5 | 305.6 → 305.6 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.3 | 411.6 → 411.8 | 440.9 → 435.4 | 442.1 → 437.6 | 453.4 → 446.5 | 483.9 → 476.4 | ±2.25% → ±1.81% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.3 | 716.3 → 696.7 | 751.3 → 731.0 | 773.8 → 746.0 | 790.6 → 759.2 | 923.8 → 872.3 | ±3.65% → ±2.87% | 20 → 20 | -2.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
| explore item | none | | | | |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
