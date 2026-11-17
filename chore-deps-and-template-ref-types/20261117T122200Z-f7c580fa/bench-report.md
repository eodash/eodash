### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- geozarr bands: dragging a band rebuilds the source
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 209.7 → 217.7 | 3.5 → 3.1 | 4.8 → 4.5 | 4.9 → 5.2 | 5.4 → 5.1 | 5.8 → 13.4 | ±6.37% → ±23.32% | 20 → 20 | = |
| date snap | 113.8 → 149.1 | 2.7 → 6.1 | 10.0 → 6.5 | 9.8 → 6.8 | 10.2 → 6.8 | 14.4 → 8.9 | ±10.47% → ±5.15% | 20 → 20 | -34.8% |
| layer datetime | 112.9 → 112.6 | 8.5 → 8.5 | 8.7 → 8.6 | 8.9 → 9.1 | 8.8 → 8.7 | 11.1 → 16.3 | ±3.36% → ±10.66% | 20 → 20 | = |
| links=1 | 71.4 → 70.7 | 13.0 → 13.0 | 13.2 → 13.9 | 14.2 → 14.2 | 15.8 → 15.4 | 17.2 → 16.1 | ±5.10% → ±3.85% | 20 → 20 | = |
| links=10 | 71.1 → 69.3 | 13.3 → 13.2 | 13.5 → 14.0 | 14.2 → 14.5 | 13.8 → 16.0 | 17.2 → 16.3 | ±4.58% → ±4.13% | 20 → 20 | = |
| links=100 | 59.4 → 59.3 | 15.3 → 15.1 | 16.8 → 16.8 | 17.0 → 17.0 | 17.9 → 18.3 | 21.0 → 19.1 | ±4.46% → ±3.92% | 20 → 20 | = |
| select indicator | 17.0 → 24.8 | 38.2 → 23.6 | 61.0 → 38.3 | 62.7 → 45.2 | 75.7 → 57.6 | 94.9 → 72.2 | ±12.49% → ±16.01% | 20 → 20 | -37.1% |
| poi selection | 32.8 → 30.3 | 25.1 → 25.4 | 29.8 → 30.6 | 31.3 → 36.0 | 33.3 → 37.4 | 44.0 → 65.7 | ±8.05% → ±16.26% | 20 → 20 | = |
| vector rendering | 18.9 → 19.5 | 45.5 → 46.9 | 49.9 → 49.0 | 54.5 → 52.2 | 57.6 → 52.0 | 89.7 → 84.5 | ±9.98% → ±8.47% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.1 | 305.3 → 305.3 | 305.3 → 305.3 | 305.5 → 305.4 | 305.6 → 305.7 | ±0.02% → ±0.02% | 20 → 20 | = |
| geozarr bands | 30.2 → 2.3 | 26.1 → 409.2 | 30.5 → 429.4 | 35.1 → 427.9 | 42.7 → 434.6 | 55.1 → 441.0 | ±12.28% → ±1.01% | 20 → 20 | +1305.6% |
| geotiff rendering | 2.3 → 2.3 | 411.6 → 416.1 | 440.9 → 437.8 | 442.1 → 439.3 | 453.4 → 449.7 | 483.9 → 482.5 | ±2.25% → ±1.88% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.3 | 716.3 → 709.9 | 751.3 → 733.6 | 773.8 → 745.3 | 790.6 → 760.7 | 923.8 → 847.4 | ±3.65% → ±2.28% | 20 → 20 | -2.4% |

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
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 10** | **0 → 0** |
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
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 20 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b01/c/0/0` | 0 | 60 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b03/c/0/0` | 0 | 60 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b02/c/0/0` | 0 | 60 | 0 | 200, 206 |
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
