### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 113.8 → 123.9 | 2.7 → 4.4 | 10.0 → 7.6 | 9.8 → 8.9 | 10.2 → 8.9 | 14.4 → 18.6 | ±10.47% → ±17.65% | 20 → 20 | -23.9% |
| explore item | 209.7 → 143.1 | 3.5 → 4.8 | 4.8 → 7.1 | 4.9 → 7.2 | 5.4 → 8.4 | 5.8 → 9.3 | ±6.37% → ±8.60% | 20 → 20 | +47.9% |
| layer datetime | 112.9 → 102.4 | 8.5 → 8.6 | 8.7 → 8.9 | 8.9 → 13.1 | 8.8 → 9.4 | 11.1 → 68.8 | ±3.36% → ±57.57% | 20 → 20 | = |
| links=10 | 71.1 → 66.0 | 13.3 → 13.4 | 13.5 → 14.0 | 14.2 → 15.4 | 13.8 → 17.2 | 17.2 → 18.9 | ±4.58% → ±5.88% | 20 → 20 | = |
| links=1 | 71.4 → 67.7 | 13.0 → 13.4 | 13.2 → 14.1 | 14.2 → 14.9 | 15.8 → 16.4 | 17.2 → 18.6 | ±5.10% → ±5.10% | 20 → 20 | = |
| links=100 | 59.4 → 56.7 | 15.3 → 15.3 | 16.8 → 18.0 | 17.0 → 17.7 | 17.9 → 18.5 | 21.0 → 19.2 | ±4.46% → ±2.97% | 20 → 20 | = |
| poi selection | 32.8 → 21.8 | 25.1 → 29.7 | 29.8 → 48.7 | 31.3 → 49.4 | 33.3 → 61.3 | 44.0 → 69.0 | ±8.05% → ±12.47% | 20 → 20 | +63.5% |
| geozarr bands | 30.2 → 21.9 | 26.1 → 39.1 | 30.5 → 43.3 | 35.1 → 47.0 | 42.7 → 46.4 | 55.1 → 77.0 | ±12.28% → ±9.50% | 20 → 20 | = |
| select indicator | 17.0 → 15.6 | 38.2 → 46.4 | 61.0 → 69.7 | 62.7 → 68.2 | 75.7 → 81.3 | 94.9 → 104.8 | ±12.49% → ±11.95% | 20 → 20 | = |
| vector rendering | 18.9 → 17.0 | 45.5 → 47.3 | 49.9 → 60.2 | 54.5 → 60.5 | 57.6 → 65.3 | 89.7 → 85.4 | ±9.98% → ±8.04% | 20 → 20 | +20.7% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.1 | 305.3 → 305.3 | 305.3 → 305.4 | 305.5 → 305.3 | 305.6 → 306.8 | ±0.02% → ±0.06% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.3 | 411.6 → 411.3 | 440.9 → 422.4 | 442.1 → 429.9 | 453.4 → 427.2 | 483.9 → 506.6 | ±2.25% → ±2.76% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.5 | 716.3 → 617.6 | 751.3 → 662.7 | 773.8 → 685.5 | 790.6 → 712.4 | 923.8 → 850.2 | ±3.65% → ±4.62% | 20 → 20 | -11.8% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
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
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| explore item | none | | | | |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
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
