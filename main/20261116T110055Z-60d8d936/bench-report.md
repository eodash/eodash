### Benchmarks

Previous run → this run. Baseline [`ac821ce063de68183a669c762c93c1f2686c7c39`](https://github.com/eodash/eodash/commit/ac821ce063de68183a669c762c93c1f2686c7c39), 2026-11-12T11:25:31.039Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
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
| date snap | 88.2 → 113.8 | 7.4 → 2.7 | 12.2 → 10.0 | 12.5 → 9.8 | 13.9 → 10.2 | 25.0 → 14.4 | ±16.60% → ±10.47% | 20 → 20 | = |
| explore item | 116.8 → 209.7 | 6.4 → 3.5 | 8.0 → 4.8 | 9.5 → 4.9 | 9.0 → 5.4 | 23.3 → 5.8 | ±21.24% → ±6.37% | 20 → 20 | -40.0% |
| layer datetime | 91.7 → 112.9 | 8.8 → 8.5 | 10.7 → 8.7 | 12.9 → 8.9 | 12.6 → 8.8 | 45.7 → 11.1 | ±35.00% → ±3.36% | 20 → 20 | -18.7% |
| links=1 | 58.0 → 71.4 | 15.7 → 13.0 | 17.3 → 13.2 | 17.3 → 14.2 | 17.6 → 15.8 | 18.6 → 17.2 | ±1.59% → ±5.10% | 20 → 20 | -23.5% |
| links=10 | 56.6 → 71.1 | 16.4 → 13.3 | 17.5 → 13.5 | 17.7 → 14.2 | 17.9 → 13.8 | 20.1 → 17.2 | ±2.13% → ±4.58% | 20 → 20 | -23.1% |
| links=100 | 52.0 → 59.4 | 17.3 → 15.3 | 19.1 → 16.8 | 19.4 → 17.0 | 19.4 → 17.9 | 25.5 → 21.0 | ±4.86% → ±4.46% | 20 → 20 | -11.8% |
| poi selection | 20.3 → 32.8 | 34.8 → 25.1 | 45.7 → 29.8 | 53.8 → 31.3 | 69.0 → 33.3 | 91.6 → 44.0 | ±15.30% → ±8.05% | 20 → 20 | -34.9% |
| geozarr bands | 21.8 → 30.2 | 43.0 → 26.1 | 46.7 → 30.5 | 46.1 → 35.1 | 47.3 → 42.7 | 50.7 → 55.1 | ±2.47% → ±12.28% | 20 → 20 | -34.5% |
| select indicator | 11.4 → 17.0 | 58.8 → 38.2 | 94.4 → 61.0 | 92.5 → 62.7 | 96.0 → 75.7 | 164.5 → 94.9 | ±12.21% → ±12.49% | 20 → 20 | -35.5% |
| vector rendering | 14.6 → 18.9 | 52.5 → 45.5 | 65.2 → 49.9 | 72.4 → 54.5 | 70.9 → 57.6 | 137.1 → 89.7 | ±14.09% → ±9.98% | 20 → 20 | -23.5% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.3 → 305.3 | 305.4 → 305.3 | 305.4 → 305.5 | 305.7 → 305.6 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.0 → 2.3 | 446.7 → 411.6 | 487.1 → 440.9 | 490.1 → 442.1 | 490.7 → 453.4 | 595.5 → 483.9 | ±3.28% → ±2.25% | 20 → 20 | -9.5% |
| mirrored selection | 0.9 → 1.3 | 1006.1 → 716.3 | 1026.8 → 751.3 | 1057.6 → 773.8 | 1085.4 → 790.6 | 1207.9 → 923.8 | ±2.47% → ±3.65% | 20 → 20 | -26.8% |

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
