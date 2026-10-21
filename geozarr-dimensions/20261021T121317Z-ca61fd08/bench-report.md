### Benchmarks

Previous run → this run. Baseline [`fb7b93c9e60068648de4088647a067aac2398681`](https://github.com/eodash/eodash/commit/fb7b93c9e60068648de4088647a067aac2398681), 2026-10-19T08:44:29.274Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 67.5 → 109.5 | 9.9 → 6.6 | 15.0 → 9.3 | 15.8 → 10.2 | 17.4 → 10.1 | 25.7 → 26.2 | ±12.67% → ±22.21% | 20 → 20 | -37.5% |
| date snap | 98.1 → 80.9 | 6.1 → 8.2 | 10.5 → 12.6 | 11.1 → 12.9 | 12.4 → 14.1 | 22.2 → 19.7 | ±16.23% → ±9.79% | 20 → 20 | = |
| layer datetime | 93.1 → 92.5 | 8.8 → 8.8 | 10.9 → 11.4 | 11.2 → 11.3 | 12.6 → 12.6 | 17.9 → 17.7 | ±10.81% → ±10.56% | 20 → 20 | = |
| links=10 | 57.4 → 57.4 | 17.1 → 16.6 | 17.4 → 17.4 | 17.4 → 17.4 | 17.5 → 17.8 | 17.9 → 18.6 | ±0.52% → ±1.45% | 20 → 20 | = |
| links=1 | 58.4 → 57.2 | 16.5 → 16.7 | 17.1 → 17.4 | 17.1 → 17.5 | 17.4 → 17.7 | 17.8 → 21.3 | ±1.03% → ±3.02% | 20 → 20 | = |
| links=100 | 47.3 → 50.9 | 19.3 → 17.6 | 21.4 → 19.6 | 21.2 → 19.8 | 21.9 → 20.6 | 22.9 → 23.6 | ±2.43% → ±3.96% | 20 → 20 | = |
| geozarr bands | 27.7 → 21.8 | 23.7 → 27.6 | 40.2 → 46.6 | 38.2 → 47.9 | 45.9 → 48.0 | 52.2 → 87.2 | ±10.90% → ±11.99% | 20 → 20 | +15.8% |
| poi selection | 17.1 → 16.3 | 39.0 → 40.8 | 66.4 → 70.1 | 63.2 → 66.5 | 72.4 → 76.6 | 105.2 → 99.0 | ±13.62% → ±13.10% | 20 → 20 | = |
| vector rendering | 13.7 → 14.6 | 54.8 → 59.3 | 81.9 → 64.7 | 77.4 → 71.6 | 91.1 → 69.5 | 115.0 → 134.1 | ±11.74% → ±12.82% | 20 → 20 | = |
| select indicator | 13.7 → 11.9 | 53.5 → 60.9 | 76.6 → 92.2 | 75.8 → 87.0 | 86.2 → 98.6 | 105.2 → 115.3 | ±9.37% → ±8.73% | 20 → 20 | +20.4% |
| geotiff rendering | 2.1 → 2.7 | 448.6 → 63.6 | 465.4 → 487.3 | 471.4 → 469.3 | 486.2 → 496.3 | 520.8 → 528.6 | ±2.05% → ±9.70% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.6 → 305.3 | 305.6 → 305.3 | 305.7 → 305.4 | 306.0 → 305.6 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| mirrored selection | 1.0 → 1.0 | 962.1 → 991.8 | 992.4 → 1052.8 | 1022.8 → 1053.4 | 1021.4 → 1062.9 | 1186.5 → 1172.4 | ±3.24% → ±2.15% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–11 → 0–2** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
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
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/.zmetadata` | 0 | 1 | 0 | 404 |
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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
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
