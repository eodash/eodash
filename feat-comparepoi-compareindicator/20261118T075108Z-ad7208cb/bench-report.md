### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 113.8 → 116.9 | 2.7 → 3.6 | 10.0 → 9.4 | 9.8 → 9.4 | 10.2 → 10.1 | 14.4 → 16.3 | ±10.47% → ±13.82% | 20 → 20 | = |
| explore item | 209.7 → 155.1 | 3.5 → 5.0 | 4.8 → 6.6 | 4.9 → 6.6 | 5.4 → 7.1 | 5.8 → 8.7 | ±6.37% → ±7.65% | 20 → 20 | +36.5% |
| layer datetime | 112.9 → 111.8 | 8.5 → 8.5 | 8.7 → 8.7 | 8.9 → 9.0 | 8.8 → 8.8 | 11.1 → 11.6 | ±3.36% → ±4.25% | 20 → 20 | = |
| links=1 | 71.4 → 68.0 | 13.0 → 13.0 | 13.2 → 13.4 | 14.2 → 15.6 | 15.8 → 15.8 | 17.2 → 35.6 | ±5.10% → ±17.60% | 20 → 20 | = |
| links=10 | 71.1 → 68.3 | 13.3 → 13.3 | 13.5 → 13.6 | 14.2 → 14.9 | 13.8 → 16.0 | 17.2 → 19.8 | ±4.58% → ±6.72% | 20 → 20 | = |
| links=100 | 59.4 → 57.1 | 15.3 → 15.6 | 16.8 → 17.9 | 17.0 → 17.7 | 17.9 → 18.7 | 21.0 → 21.5 | ±4.46% → ±4.73% | 20 → 20 | = |
| poi selection | 32.8 → 21.8 | 25.1 → 29.9 | 29.8 → 51.1 | 31.3 → 50.0 | 33.3 → 62.1 | 44.0 → 76.4 | ±8.05% → ±13.66% | 20 → 20 | +71.8% |
| geozarr bands | 30.2 → 22.9 | 26.1 → 42.6 | 30.5 → 43.3 | 35.1 → 43.7 | 42.7 → 43.6 | 55.1 → 46.8 | ±12.28% → ±1.37% | 20 → 20 | = |
| vector rendering | 18.9 → 17.0 | 45.5 → 44.7 | 49.9 → 57.0 | 54.5 → 61.6 | 57.6 → 70.0 | 89.7 → 97.1 | ±9.98% → ±11.36% | 20 → 20 | = |
| select indicator | 17.0 → 15.1 | 38.2 → 46.9 | 61.0 → 69.7 | 62.7 → 68.7 | 75.7 → 76.8 | 94.9 → 92.3 | ±12.49% → ±8.96% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.9 | 411.6 → 65.3 | 440.9 → 443.9 | 442.1 → 425.3 | 453.4 → 454.1 | 483.9 → 480.9 | ±2.25% → ±9.53% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 304.9 | 305.3 → 305.1 | 305.3 → 305.2 | 305.5 → 305.2 | 305.6 → 305.6 | ±0.02% → ±0.03% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.2 | 716.3 → 792.6 | 751.3 → 825.1 | 773.8 → 848.4 | 790.6 → 874.0 | 923.8 → 963.1 | ±3.65% → ±2.90% | 20 → 20 | +9.8% |

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
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10123K | 206 |

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
