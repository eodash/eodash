### Benchmarks

Previous run → this run. Baseline [`fb7b93c9e60068648de4088647a067aac2398681`](https://github.com/eodash/eodash/commit/fb7b93c9e60068648de4088647a067aac2398681), 2026-10-19T08:44:29.274Z.

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
| explore item | 67.5 → 148.5 | 9.9 → 5.9 | 15.0 → 6.5 | 15.8 → 7.3 | 17.4 → 6.8 | 25.7 → 18.8 | ±12.67% → ±21.58% | 20 → 20 | -56.9% |
| date snap | 98.1 → 88.9 | 6.1 → 7.4 | 10.5 → 13.1 | 11.1 → 12.1 | 12.4 → 13.8 | 22.2 → 19.2 | ±16.23% → ±12.72% | 20 → 20 | +24.9% |
| layer datetime | 93.1 → 94.6 | 8.8 → 8.8 | 10.9 → 11.6 | 11.2 → 10.9 | 12.6 → 12.5 | 17.9 → 13.2 | ±10.81% → ±7.73% | 20 → 20 | = |
| links=1 | 58.4 → 58.3 | 16.5 → 14.2 | 17.1 → 17.4 | 17.1 → 17.2 | 17.4 → 17.5 | 17.8 → 19.0 | ±1.03% → ±2.67% | 20 → 20 | = |
| links=10 | 57.4 → 56.9 | 17.1 → 17.0 | 17.4 → 17.6 | 17.4 → 17.6 | 17.5 → 17.9 | 17.9 → 18.3 | ±0.52% → ±1.06% | 20 → 20 | +1.4% |
| links=100 | 47.3 → 50.8 | 19.3 → 18.2 | 21.4 → 19.2 | 21.2 → 19.8 | 21.9 → 20.3 | 22.9 → 25.2 | ±2.43% → ±4.12% | 20 → 20 | -10.3% |
| geozarr bands | 27.7 → 24.9 | 23.7 → 25.2 | 40.2 → 43.3 | 38.2 → 44.6 | 45.9 → 46.4 | 52.2 → 102.8 | ±10.90% → ±19.16% | 20 → 20 | = |
| poi selection | 17.1 → 22.4 | 39.0 → 34.9 | 66.4 → 41.1 | 63.2 → 47.4 | 72.4 → 49.3 | 105.2 → 77.2 | ±13.62% → ±13.37% | 20 → 20 | -38.1% |
| select indicator | 13.7 → 14.1 | 53.5 → 41.0 | 76.6 → 76.5 | 75.8 → 77.6 | 86.2 → 94.8 | 105.2 → 113.1 | ±9.37% → ±13.53% | 20 → 20 | = |
| vector rendering | 13.7 → 15.0 | 54.8 → 55.1 | 81.9 → 65.0 | 77.4 → 68.5 | 91.1 → 71.1 | 115.0 → 107.0 | ±11.74% → ±9.30% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.0 | 305.6 → 305.3 | 305.6 → 305.3 | 305.7 → 305.4 | 306.0 → 305.8 | ±0.03% → ±0.03% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.0 | 448.6 → 458.7 | 465.4 → 484.7 | 471.4 → 489.8 | 486.2 → 489.8 | 520.8 → 570.9 | ±2.05% → ±2.70% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 962.1 → 1003.0 | 992.4 → 1026.0 | 1022.8 → 1042.1 | 1021.4 → 1057.8 | 1186.5 → 1116.6 | ±3.24% → ±1.53% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–11 → 0–1** | **0 → 0** |
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
