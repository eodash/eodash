### Benchmarks

Previous run → this run. Baseline [`2c245b9bc376783753255bab7a170801c9bff320`](https://github.com/eodash/eodash/commit/2c245b9bc376783753255bab7a170801c9bff320), 2026-11-11T17:05:28.114Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
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
| explore item | 115.7 → 116.8 | 6.4 → 6.4 | 8.0 → 8.0 | 9.5 → 9.5 | 10.5 → 9.0 | 20.9 → 23.3 | ±18.68% → ±21.24% | 20 → 20 | = |
| date snap | 83.6 → 88.2 | 7.2 → 7.4 | 13.1 → 12.2 | 13.6 → 12.5 | 15.3 → 13.9 | 25.8 → 25.0 | ±18.29% → ±16.60% | 20 → 20 | = |
| layer datetime | 91.4 → 91.7 | 8.8 → 8.8 | 11.3 → 10.7 | 13.6 → 12.9 | 12.5 → 12.6 | 57.1 → 45.7 | ±43.96% → ±35.00% | 20 → 20 | = |
| links=1 | 56.4 → 58.0 | 16.9 → 15.7 | 17.3 → 17.3 | 18.0 → 17.3 | 17.5 → 17.6 | 28.0 → 18.6 | ±7.49% → ±1.59% | 20 → 20 | = |
| links=10 | 56.9 → 56.6 | 16.8 → 16.4 | 17.6 → 17.5 | 17.6 → 17.7 | 17.6 → 17.9 | 19.4 → 20.1 | ±1.53% → ±2.13% | 20 → 20 | = |
| links=100 | 52.1 → 52.0 | 17.3 → 17.3 | 19.3 → 19.1 | 19.4 → 19.4 | 20.2 → 19.4 | 25.4 → 25.5 | ±5.01% → ±4.86% | 20 → 20 | = |
| poi selection | 22.7 → 20.3 | 37.8 → 34.8 | 43.4 → 45.7 | 44.3 → 53.8 | 47.8 → 69.0 | 51.2 → 91.6 | ±4.17% → ±15.30% | 20 → 20 | = |
| geozarr bands | 22.0 → 21.8 | 28.1 → 43.0 | 46.5 → 46.7 | 47.2 → 46.1 | 50.1 → 47.3 | 64.2 → 50.7 | ±8.31% → ±2.47% | 20 → 20 | = |
| vector rendering | 14.4 → 14.6 | 58.2 → 52.5 | 67.8 → 65.2 | 71.1 → 72.4 | 72.8 → 70.9 | 107.1 → 137.1 | ±8.38% → ±14.09% | 20 → 20 | = |
| select indicator | 11.3 → 11.4 | 62.4 → 58.8 | 94.9 → 94.4 | 93.8 → 92.5 | 103.6 → 96.0 | 159.7 → 164.5 | ±12.31% → ±12.21% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.2 | 305.4 → 305.3 | 305.4 → 305.4 | 305.5 → 305.4 | 306.0 → 305.7 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.5 → 2.0 | 84.7 → 446.7 | 486.6 → 487.1 | 466.3 → 490.1 | 494.6 → 490.7 | 540.5 → 595.5 | ±9.31% → ±3.28% | 20 → 20 | = |
| mirrored selection | 0.9 → 0.9 | 1012.3 → 1006.1 | 1052.0 → 1026.8 | 1060.2 → 1057.6 | 1077.3 → 1085.4 | 1155.2 → 1207.9 | ±1.62% → ±2.47% | 20 → 20 | -2.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
