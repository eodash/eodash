### Benchmarks

Previous run → this run. Baseline [`fb7b93c9e60068648de4088647a067aac2398681`](https://github.com/eodash/eodash/commit/fb7b93c9e60068648de4088647a067aac2398681), 2026-10-19T08:44:29.274Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=100, links=10: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 67.5 → 120.6 | 9.9 → 6.4 | 15.0 → 8.0 | 15.8 → 9.1 | 17.4 → 9.2 | 25.7 → 20.7 | ±12.67% → ±18.82% | 20 → 20 | -46.8% |
| date snap | 98.1 → 95.2 | 6.1 → 6.7 | 10.5 → 11.5 | 11.1 → 11.2 | 12.4 → 12.2 | 22.2 → 20.5 | ±16.23% → ±13.53% | 20 → 20 | = |
| layer datetime | 93.1 → 100.3 | 8.8 → 8.8 | 10.9 → 9.2 | 11.2 → 10.4 | 12.6 → 11.2 | 17.9 → 17.9 | ±10.81% → ±11.26% | 20 → 20 | = |
| links=1 | 58.4 → 58.7 | 16.5 → 14.6 | 17.1 → 17.1 | 17.1 → 17.1 | 17.4 → 17.3 | 17.8 → 19.5 | ±1.03% → ±2.68% | 20 → 20 | = |
| links=100 | 47.3 → 51.8 | 19.3 → 17.1 | 21.4 → 19.4 | 21.2 → 19.5 | 21.9 → 19.7 | 22.9 → 25.2 | ±2.43% → ±4.51% | 20 → 20 | -9.3% |
| links=10 | 57.4 → 56.4 | 17.1 → 17.4 | 17.4 → 17.7 | 17.4 → 17.7 | 17.5 → 17.7 | 17.9 → 18.5 | ±0.52% → ±0.74% | 20 → 20 | +1.7% |
| geozarr bands | 27.7 → 20.3 | 23.7 → 29.0 | 40.2 → 50.1 | 38.2 → 51.2 | 45.9 → 52.1 | 52.2 → 89.4 | ±10.90% → ±11.10% | 20 → 20 | +24.5% |
| select indicator | 13.7 → 14.3 | 53.5 → 37.7 | 76.6 → 69.5 | 75.8 → 75.3 | 86.2 → 87.5 | 105.2 → 110.7 | ±9.37% → ±12.56% | 20 → 20 | = |
| poi selection | 17.1 → 17.2 | 39.0 → 39.5 | 66.4 → 65.3 | 63.2 → 62.3 | 72.4 → 75.1 | 105.2 → 86.5 | ±13.62% → ±11.99% | 20 → 20 | = |
| vector rendering | 13.7 → 14.7 | 54.8 → 54.4 | 81.9 → 65.6 | 77.4 → 70.3 | 91.1 → 70.4 | 115.0 → 107.0 | ±11.74% → ±9.84% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.6 → 305.2 | 305.6 → 305.3 | 305.7 → 305.3 | 306.0 → 305.6 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.2 | 448.6 → 419.3 | 465.4 → 441.4 | 471.4 → 446.3 | 486.2 → 455.0 | 520.8 → 491.7 | ±2.05% → ±2.24% | 20 → 20 | -5.2% |
| mirrored selection | 1.0 → 1.0 | 962.1 → 983.8 | 992.4 → 1020.8 | 1022.8 → 1036.7 | 1021.4 → 1052.3 | 1186.5 → 1121.7 | ±3.24% → ±1.93% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–11 → 0–2** | **0 → 0** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
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
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/.zmetadata` | 0 | 1 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/zarr.json` | 0 | 1 | 0 | 200 |
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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
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
