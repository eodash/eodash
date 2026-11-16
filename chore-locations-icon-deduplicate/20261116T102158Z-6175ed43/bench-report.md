### Benchmarks

Previous run → this run. Baseline [`ac821ce063de68183a669c762c93c1f2686c7c39`](https://github.com/eodash/eodash/commit/ac821ce063de68183a669c762c93c1f2686c7c39), 2026-11-12T11:25:31.039Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 116.8 → 180.6 | 6.4 → 3.2 | 8.0 → 6.1 | 9.5 → 6.0 | 9.0 → 6.8 | 23.3 → 11.5 | ±21.24% → ±15.32% | 20 → 20 | -24.4% |
| date snap | 88.2 → 134.1 | 7.4 → 6.0 | 12.2 → 7.1 | 12.5 → 7.8 | 13.9 → 9.7 | 25.0 → 10.3 | ±16.60% → ±9.95% | 20 → 20 | -41.6% |
| layer datetime | 91.7 → 107.3 | 8.8 → 8.4 | 10.7 → 8.7 | 12.9 → 12.5 | 12.6 → 9.2 | 45.7 → 67.2 | ±35.00% → ±59.75% | 20 → 20 | -19.2% |
| links=1 | 58.0 → 72.4 | 15.7 → 12.9 | 17.3 → 13.2 | 17.3 → 13.9 | 17.6 → 15.0 | 18.6 → 16.7 | ±1.59% → ±4.34% | 20 → 20 | -23.5% |
| links=10 | 56.6 → 74.2 | 16.4 → 13.2 | 17.5 → 13.4 | 17.7 → 13.5 | 17.9 → 13.5 | 20.1 → 15.1 | ±2.13% → ±1.63% | 20 → 20 | -23.6% |
| links=100 | 52.0 → 62.2 | 17.3 → 15.1 | 19.1 → 15.5 | 19.4 → 16.2 | 19.4 → 16.3 | 25.5 → 20.8 | ±4.86% → ±4.80% | 20 → 20 | -18.9% |
| select indicator | 11.4 → 22.7 | 58.8 → 25.1 | 94.4 → 47.4 | 92.5 → 47.6 | 96.0 → 54.6 | 164.5 → 82.7 | ±12.21% → ±13.72% | 20 → 20 | -49.9% |
| poi selection | 20.3 → 32.1 | 34.8 → 25.7 | 45.7 → 28.8 | 53.8 → 32.9 | 69.0 → 34.2 | 91.6 → 60.1 | ±15.30% → ±13.40% | 20 → 20 | -37.1% |
| geozarr bands | 21.8 → 25.0 | 43.0 → 26.5 | 46.7 → 43.1 | 46.1 → 41.2 | 47.3 → 45.7 | 50.7 → 47.8 | ±2.47% → ±7.33% | 20 → 20 | -7.7% |
| vector rendering | 14.6 → 18.3 | 52.5 → 46.0 | 65.2 → 50.6 | 72.4 → 57.4 | 70.9 → 59.4 | 137.1 → 103.7 | ±14.09% → ±13.01% | 20 → 20 | -22.4% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.3 → 305.2 | 305.4 → 305.3 | 305.4 → 305.3 | 305.7 → 305.5 | ±0.02% → ±0.02% | 20 → 20 | -0.0% |
| geotiff rendering | 2.0 → 2.3 | 446.7 → 404.6 | 487.1 → 440.6 | 490.1 → 436.9 | 490.7 → 444.7 | 595.5 → 466.1 | ±3.28% → ±1.67% | 20 → 20 | -9.5% |
| mirrored selection | 0.9 → 1.3 | 1006.1 → 714.6 | 1026.8 → 740.2 | 1057.6 → 756.6 | 1085.4 → 765.8 | 1207.9 → 862.8 | ±2.47% → ±2.60% | 20 → 20 | -27.9% |

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
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
