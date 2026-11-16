### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- geotiff rendering, vector rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 113.8 → 114.1 | 2.7 → 3.2 | 10.0 → 9.6 | 9.8 → 9.6 | 10.2 → 9.9 | 14.4 → 16.4 | ±10.47% → ±12.14% | 20 → 20 | = |
| explore item | 209.7 → 159.5 | 3.5 → 4.5 | 4.8 → 5.8 | 4.9 → 7.5 | 5.4 → 7.3 | 5.8 → 23.5 | ±6.37% → ±30.39% | 20 → 20 | +19.8% |
| layer datetime | 112.9 → 108.6 | 8.5 → 8.4 | 8.7 → 8.6 | 8.9 → 11.9 | 8.8 → 8.8 | 11.1 → 58.2 | ±3.36% → ±53.10% | 20 → 20 | = |
| links=1 | 71.4 → 69.1 | 13.0 → 13.0 | 13.2 → 15.1 | 14.2 → 14.6 | 15.8 → 15.7 | 17.2 → 16.2 | ±5.10% → ±4.15% | 20 → 20 | = |
| links=10 | 71.1 → 72.0 | 13.3 → 13.2 | 13.5 → 13.4 | 14.2 → 14.0 | 13.8 → 13.8 | 17.2 → 16.7 | ±4.58% → ±3.96% | 20 → 20 | = |
| links=100 | 59.4 → 60.2 | 15.3 → 15.1 | 16.8 → 16.9 | 17.0 → 16.7 | 17.9 → 17.9 | 21.0 → 19.8 | ±4.46% → ±4.10% | 20 → 20 | = |
| poi selection | 32.8 → 33.3 | 25.1 → 25.6 | 29.8 → 30.4 | 31.3 → 30.4 | 33.3 → 32.5 | 44.0 → 37.8 | ±8.05% → ±5.73% | 20 → 20 | = |
| geozarr bands | 30.2 → 23.3 | 26.1 → 29.7 | 30.5 → 43.3 | 35.1 → 44.2 | 42.7 → 44.3 | 55.1 → 66.4 | ±12.28% → ±8.53% | 20 → 20 | = |
| geotiff rendering | 2.3 → 4.2 | 411.6 → 34.5 | 440.9 → 451.5 | 442.1 → 413.3 | 453.4 → 470.6 | 483.9 → 481.0 | ±2.25% → ±14.28% | 20 → 20 | = |
| select indicator | 17.0 → 17.9 | 38.2 → 36.0 | 61.0 → 53.6 | 62.7 → 60.2 | 75.7 → 75.0 | 94.9 → 91.4 | ±12.49% → ±13.51% | 20 → 20 | = |
| vector rendering | 18.9 → 18.5 | 45.5 → 47.4 | 49.9 → 50.2 | 54.5 → 55.3 | 57.6 → 62.7 | 89.7 → 73.2 | ±9.98% → ±7.50% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.1 | 305.3 → 305.2 | 305.3 → 305.3 | 305.5 → 305.4 | 305.6 → 305.6 | ±0.02% → ±0.03% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.3 | 716.3 → 723.7 | 751.3 → 756.6 | 773.8 → 788.1 | 790.6 → 842.2 | 923.8 → 941.5 | ±3.65% → ±3.89% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
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
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
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
