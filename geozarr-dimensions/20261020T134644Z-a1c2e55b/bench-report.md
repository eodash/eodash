### Benchmarks

Previous run → this run. Baseline [`fb7b93c9e60068648de4088647a067aac2398681`](https://github.com/eodash/eodash/commit/fb7b93c9e60068648de4088647a067aac2398681), 2026-10-19T08:44:29.274Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 67.5 → 155.4 | 9.9 → 4.8 | 15.0 → 6.3 | 15.8 → 6.8 | 17.4 → 6.8 | 25.7 → 14.5 | ±12.67% → ±15.79% | 20 → 20 | -58.2% |
| date snap | 98.1 → 106.3 | 6.1 → 6.6 | 10.5 → 9.8 | 11.1 → 9.7 | 12.4 → 10.7 | 22.2 → 13.1 | ±16.23% → ±8.23% | 20 → 20 | = |
| layer datetime | 93.1 → 109.4 | 8.8 → 8.5 | 10.9 → 8.6 | 11.2 → 13.1 | 12.6 → 8.8 | 17.9 → 80.2 | ±10.81% → ±70.09% | 20 → 20 | -21.1% |
| links=1 | 58.4 → 70.0 | 16.5 → 13.0 | 17.1 → 13.3 | 17.1 → 14.4 | 17.4 → 15.9 | 17.8 → 16.8 | ±1.03% → ±4.86% | 20 → 20 | -21.9% |
| links=10 | 57.4 → 68.1 | 17.1 → 13.3 | 17.4 → 14.3 | 17.4 → 14.8 | 17.5 → 15.9 | 17.9 → 17.1 | ±0.52% → ±4.55% | 20 → 20 | -18.1% |
| links=100 | 47.3 → 56.3 | 19.3 → 15.4 | 21.4 → 18.5 | 21.2 → 17.9 | 21.9 → 18.7 | 22.9 → 20.1 | ±2.43% → ±3.80% | 20 → 20 | -13.6% |
| geozarr bands | 27.7 → 30.7 | 23.7 → 20.5 | 40.2 → 32.5 | 38.2 → 34.4 | 45.9 → 37.8 | 52.2 → 48.8 | ±10.90% → ±10.86% | 20 → 20 | = |
| poi selection | 17.1 → 29.0 | 39.0 → 27.4 | 66.4 → 33.3 | 63.2 → 36.7 | 72.4 → 37.5 | 105.2 → 82.2 | ±13.62% → ±17.25% | 20 → 20 | -50.0% |
| vector rendering | 13.7 → 18.1 | 54.8 → 44.5 | 81.9 → 52.3 | 77.4 → 56.9 | 91.1 → 66.2 | 115.0 → 80.2 | ±11.74% → ±9.16% | 20 → 20 | -36.2% |
| select indicator | 13.7 → 14.9 | 53.5 → 44.7 | 76.6 → 71.3 | 75.8 → 72.8 | 86.2 → 88.5 | 105.2 → 116.6 | ±9.37% → ±13.74% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 304.9 | 305.6 → 305.1 | 305.6 → 305.1 | 305.7 → 305.1 | 306.0 → 305.4 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.3 | 448.6 → 423.8 | 465.4 → 439.4 | 471.4 → 445.2 | 486.2 → 441.8 | 520.8 → 517.7 | ±2.05% → ±2.33% | 20 → 20 | -5.6% |
| mirrored selection | 1.0 → 1.2 | 962.1 → 773.3 | 992.4 → 802.7 | 1022.8 → 821.6 | 1021.4 → 848.9 | 1186.5 → 932.4 | ±3.24% → ±2.42% | 20 → 20 | -19.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–11 → 0–2** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 20 | 0 | 200 |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
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
