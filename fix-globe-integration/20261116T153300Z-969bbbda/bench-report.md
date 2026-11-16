### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- geozarr bands: dragging a band rebuilds the source
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 113.8 → 139.6 | 2.7 → 3.0 | 10.0 → 7.4 | 9.8 → 7.9 | 10.2 → 9.6 | 14.4 → 12.0 | ±10.47% → ±13.64% | 20 → 20 | -26.9% |
| explore item | 209.7 → 221.5 | 3.5 → 3.9 | 4.8 → 4.4 | 4.9 → 4.6 | 5.4 → 4.9 | 5.8 → 6.5 | ±6.37% → ±7.86% | 20 → 20 | = |
| layer datetime | 112.9 → 114.5 | 8.5 → 8.5 | 8.7 → 8.7 | 8.9 → 8.7 | 8.8 → 8.8 | 11.1 → 9.0 | ±3.36% → ±0.74% | 20 → 20 | = |
| links=1 | 71.4 → 72.9 | 13.0 → 13.0 | 13.2 → 13.2 | 14.2 → 13.8 | 15.8 → 14.1 | 17.2 → 16.6 | ±5.10% → ±4.09% | 20 → 20 | = |
| links=10 | 71.1 → 70.2 | 13.3 → 13.2 | 13.5 → 13.4 | 14.2 → 14.4 | 13.8 → 15.4 | 17.2 → 16.9 | ±4.58% → ±4.54% | 20 → 20 | = |
| links=100 | 59.4 → 61.4 | 15.3 → 15.1 | 16.8 → 16.2 | 17.0 → 16.4 | 17.9 → 17.5 | 21.0 → 18.4 | ±4.46% → ±3.48% | 20 → 20 | = |
| poi selection | 32.8 → 30.2 | 25.1 → 26.6 | 29.8 → 31.8 | 31.3 → 34.4 | 33.3 → 37.7 | 44.0 → 53.1 | ±8.05% → ±10.38% | 20 → 20 | = |
| select indicator | 17.0 → 19.6 | 38.2 → 29.9 | 61.0 → 55.9 | 62.7 → 56.4 | 75.7 → 65.0 | 94.9 → 98.8 | ±12.49% → ±15.07% | 20 → 20 | = |
| vector rendering | 18.9 → 19.1 | 45.5 → 46.9 | 49.9 → 49.2 | 54.5 → 53.0 | 57.6 → 56.9 | 89.7 → 68.4 | ±9.98% → ±5.94% | 20 → 20 | = |
| geozarr bands | 30.2 → 3.2 | 26.1 → 50.4 | 30.5 → 432.5 | 35.1 → 416.3 | 42.7 → 445.1 | 55.1 → 454.6 | ±12.28% → ±9.76% | 20 → 20 | +1315.5% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.1 | 305.3 → 305.3 | 305.3 → 305.3 | 305.5 → 305.3 | 305.6 → 305.7 | ±0.02% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.3 | 411.6 → 418.5 | 440.9 → 441.2 | 442.1 → 440.8 | 453.4 → 449.9 | 483.9 → 469.0 | ±2.25% → ±1.57% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.3 | 716.3 → 721.0 | 751.3 → 747.9 | 773.8 → 755.3 | 790.6 → 772.1 | 923.8 → 805.4 | ±3.65% → ±1.47% | 20 → 20 | = |

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
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| **geozarr bands** | **0 → 0** | **0–1 → 1–10** | **0 → 0** |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 20 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b01/c/0/0` | 0 | 57 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b03/c/0/0` | 0 | 57 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b02/c/0/0` | 0 | 57 | 0 | 200, 206 |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 9818K | 206 |

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
