### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 209.7 → 181.3 | 3.5 → 3.5 | 4.8 → 5.3 | 4.9 → 5.9 | 5.4 → 6.8 | 5.8 → 9.3 | ±6.37% → ±12.00% | 20 → 20 | = |
| date snap | 113.8 → 117.9 | 2.7 → 6.9 | 10.0 → 8.6 | 9.8 → 8.9 | 10.2 → 9.2 | 14.4 → 15.4 | ±10.47% → ±11.89% | 20 → 20 | -14.9% |
| layer datetime | 112.9 → 116.6 | 8.5 → 8.4 | 8.7 → 8.6 | 8.9 → 8.6 | 8.8 → 8.6 | 11.1 → 8.8 | ±3.36% → ±0.61% | 20 → 20 | = |
| links=1 | 71.4 → 73.2 | 13.0 → 13.0 | 13.2 → 13.3 | 14.2 → 13.7 | 15.8 → 13.8 | 17.2 → 17.0 | ±5.10% → ±3.62% | 20 → 20 | = |
| links=10 | 71.1 → 73.0 | 13.3 → 13.2 | 13.5 → 13.4 | 14.2 → 13.8 | 13.8 → 13.6 | 17.2 → 16.3 | ±4.58% → ±2.95% | 20 → 20 | = |
| links=100 | 59.4 → 63.8 | 15.3 → 14.9 | 16.8 → 15.4 | 17.0 → 15.7 | 17.9 → 15.8 | 21.0 → 18.1 | ±4.46% → ±2.92% | 20 → 20 | = |
| select indicator | 17.0 → 19.3 | 38.2 → 25.5 | 61.0 → 57.5 | 62.7 → 57.3 | 75.7 → 72.9 | 94.9 → 81.6 | ±12.49% → ±13.71% | 20 → 20 | = |
| poi selection | 32.8 → 27.9 | 25.1 → 27.4 | 29.8 → 32.9 | 31.3 → 37.9 | 33.3 → 43.3 | 44.0 → 60.9 | ±8.05% → ±12.54% | 20 → 20 | = |
| geozarr bands | 30.2 → 21.6 | 26.1 → 42.6 | 30.5 → 46.4 | 35.1 → 46.7 | 42.7 → 47.0 | 55.1 → 61.3 | ±12.28% → ±4.63% | 20 → 20 | +51.9% |
| vector rendering | 18.9 → 18.0 | 45.5 → 45.4 | 49.9 → 54.9 | 54.5 → 57.8 | 57.6 → 61.0 | 89.7 → 97.5 | ±9.98% → ±10.92% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.0 | 305.3 → 305.2 | 305.3 → 305.2 | 305.5 → 305.2 | 305.6 → 305.5 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.4 | 411.6 → 402.9 | 440.9 → 413.8 | 442.1 → 417.7 | 453.4 → 423.3 | 483.9 → 463.7 | ±2.25% → ±1.73% | 20 → 20 | -6.2% |
| mirrored selection | 1.3 → 1.5 | 716.3 → 609.3 | 751.3 → 677.2 | 773.8 → 685.2 | 790.6 → 694.8 | 923.8 → 806.2 | ±3.65% → ±3.65% | 20 → 20 | -9.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
