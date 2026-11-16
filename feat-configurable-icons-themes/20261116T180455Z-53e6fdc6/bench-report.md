### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- geozarr bands: dragging a band rebuilds the source
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 113.8 → 136.9 | 2.7 → 4.3 | 10.0 → 7.3 | 9.8 → 7.6 | 10.2 → 7.6 | 14.4 → 12.1 | ±10.47% → ±9.81% | 20 → 20 | -26.9% |
| explore item | 209.7 → 140.1 | 3.5 → 4.5 | 4.8 → 7.1 | 4.9 → 8.4 | 5.4 → 7.8 | 5.8 → 21.6 | ±6.37% → ±25.66% | 20 → 20 | +49.0% |
| layer datetime | 112.9 → 98.8 | 8.5 → 8.6 | 8.7 → 8.9 | 8.9 → 12.8 | 8.8 → 11.3 | 11.1 → 52.1 | ±3.36% → ±41.63% | 20 → 20 | = |
| links=1 | 71.4 → 68.5 | 13.0 → 13.1 | 13.2 → 13.6 | 14.2 → 15.3 | 15.8 → 15.8 | 17.2 → 31.4 | ±5.10% → ±14.51% | 20 → 20 | = |
| links=10 | 71.1 → 68.7 | 13.3 → 13.4 | 13.5 → 13.7 | 14.2 → 14.7 | 13.8 → 16.3 | 17.2 → 18.2 | ±4.58% → ±5.32% | 20 → 20 | = |
| links=100 | 59.4 → 60.2 | 15.3 → 14.8 | 16.8 → 17.2 | 17.0 → 16.7 | 17.9 → 17.7 | 21.0 → 19.4 | ±4.46% → ±4.01% | 20 → 20 | = |
| poi selection | 32.8 → 31.8 | 25.1 → 25.3 | 29.8 → 30.8 | 31.3 → 32.2 | 33.3 → 37.7 | 44.0 → 42.8 | ±8.05% → ±7.69% | 20 → 20 | = |
| select indicator | 17.0 → 16.2 | 38.2 → 29.0 | 61.0 → 70.2 | 62.7 → 68.2 | 75.7 → 79.9 | 94.9 → 118.1 | ±12.49% → ±14.43% | 20 → 20 | = |
| geozarr bands | 30.2 → 22.1 | 26.1 → 39.6 | 30.5 → 44.7 | 35.1 → 45.5 | 42.7 → 46.1 | 55.1 → 54.4 | ±12.28% → ±3.62% | 20 → 20 | +46.2% |
| vector rendering | 18.9 → 17.5 | 45.5 → 46.3 | 49.9 → 54.9 | 54.5 → 59.0 | 57.6 → 61.3 | 89.7 → 87.1 | ±9.98% → ±9.36% | 20 → 20 | = |
| geotiff rendering | 2.3 → 3.1 | 411.6 → 63.1 | 440.9 → 410.8 | 442.1 → 400.1 | 453.4 → 425.7 | 483.9 → 453.6 | ±2.25% → ±9.48% | 20 → 20 | -6.8% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.0 | 305.3 → 305.2 | 305.3 → 305.3 | 305.5 → 305.4 | 305.6 → 305.5 | ±0.02% → ±0.02% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.5 | 716.3 → 609.6 | 751.3 → 662.9 | 773.8 → 666.2 | 790.6 → 677.6 | 923.8 → 739.2 | ±3.65% → ±2.21% | 20 → 20 | -11.8% |

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
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
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
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
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
