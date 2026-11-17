### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

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
| explore item | 209.7 → 101.7 | 3.5 → 7.0 | 4.8 → 10.0 | 4.9 → 11.1 | 5.4 → 11.5 | 5.8 → 21.9 | ±6.37% → ±19.63% | 20 → 20 | +108.3% |
| date snap | 113.8 → 86.7 | 2.7 → 8.2 | 10.0 → 12.4 | 9.8 → 12.3 | 10.2 → 14.2 | 14.4 → 19.9 | ±10.47% → ±12.12% | 20 → 20 | +23.9% |
| layer datetime | 112.9 → 92.9 | 8.5 → 8.9 | 8.7 → 10.8 | 8.9 → 11.2 | 8.8 → 12.6 | 11.1 → 15.8 | ±3.36% → ±9.31% | 20 → 20 | +23.6% |
| links=1 | 71.4 → 58.6 | 13.0 → 14.8 | 13.2 → 17.2 | 14.2 → 17.1 | 15.8 → 17.5 | 17.2 → 18.4 | ±5.10% → ±2.00% | 20 → 20 | +30.3% |
| links=10 | 71.1 → 57.2 | 13.3 → 16.0 | 13.5 → 17.6 | 14.2 → 17.5 | 13.8 → 17.7 | 17.2 → 18.6 | ±4.58% → ±1.52% | 20 → 20 | +30.4% |
| links=100 | 59.4 → 48.7 | 15.3 → 18.5 | 16.8 → 20.4 | 17.0 → 20.7 | 17.9 → 21.6 | 21.0 → 26.1 | ±4.46% → ±4.56% | 20 → 20 | +21.4% |
| geozarr bands | 30.2 → 23.8 | 26.1 → 24.9 | 30.5 → 43.1 | 35.1 → 43.6 | 42.7 → 46.9 | 55.1 → 57.8 | ±12.28% → ±8.38% | 20 → 20 | = |
| poi selection | 32.8 → 21.5 | 25.1 → 37.0 | 29.8 → 42.6 | 31.3 → 51.1 | 33.3 → 48.7 | 44.0 → 113.3 | ±8.05% → ±19.15% | 20 → 20 | +43.4% |
| select indicator | 17.0 → 11.6 | 38.2 → 59.0 | 61.0 → 94.3 | 62.7 → 90.3 | 75.7 → 105.6 | 94.9 → 114.3 | ±12.49% → ±9.61% | 20 → 20 | +54.7% |
| vector rendering | 18.9 → 14.0 | 45.5 → 59.5 | 49.9 → 68.4 | 54.5 → 74.5 | 57.6 → 77.4 | 89.7 → 123.8 | ±9.98% → ±11.26% | 20 → 20 | +37.3% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.2 | 305.3 → 305.4 | 305.3 → 305.5 | 305.5 → 305.5 | 305.6 → 305.9 | ±0.02% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.0 | 411.6 → 454.3 | 440.9 → 488.0 | 442.1 → 490.9 | 453.4 → 502.5 | 483.9 → 554.4 | ±2.25% → ±2.32% | 20 → 20 | +10.7% |
| mirrored selection | 1.3 → 0.9 | 716.3 → 1014.4 | 751.3 → 1058.6 | 773.8 → 1081.2 | 790.6 → 1088.1 | 923.8 → 1242.1 | ±3.65% → ±2.76% | 20 → 20 | +40.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
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
