### Benchmarks

Previous run → this run. Baseline [`2df0aabd4b14d881f55bb81f437f0b53db797194`](https://github.com/eodash/eodash/commit/2df0aabd4b14d881f55bb81f437f0b53db797194), 2026-10-28T09:03:07.139Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 116.1 → 119.0 | 6.8 → 6.7 | 8.1 → 8.2 | 9.2 → 9.2 | 10.6 → 8.9 | 17.4 → 21.4 | ±14.22% → ±19.58% | 20 → 20 | = |
| date snap | 88.3 → 87.4 | 7.7 → 8.1 | 12.0 → 12.3 | 12.4 → 12.6 | 14.4 → 14.3 | 22.9 → 23.4 | ±15.33% → ±16.10% | 20 → 20 | = |
| layer datetime | 90.1 → 95.1 | 8.9 → 8.9 | 11.1 → 9.8 | 13.4 → 10.9 | 12.6 → 12.5 | 52.1 → 16.3 | ±39.44% → ±9.64% | 20 → 20 | = |
| links=10 | 56.7 → 57.1 | 16.5 → 16.0 | 17.6 → 17.5 | 17.6 → 17.5 | 17.8 → 17.8 | 18.5 → 18.0 | ±1.24% → ±1.17% | 20 → 20 | = |
| links=1 | 57.7 → 57.7 | 16.4 → 16.1 | 17.1 → 17.2 | 17.4 → 17.4 | 17.6 → 17.8 | 18.5 → 18.4 | ±1.51% → ±1.58% | 20 → 20 | = |
| links=100 | 51.6 → 51.7 | 17.7 → 17.4 | 19.0 → 18.8 | 19.5 → 19.5 | 19.6 → 20.3 | 25.1 → 25.0 | ±4.34% → ±5.25% | 20 → 20 | = |
| geozarr bands | 21.7 → 23.9 | 34.7 → 26.9 | 46.9 → 44.5 | 46.6 → 44.0 | 48.0 → 47.0 | 55.1 → 69.5 | ±4.97% → ±10.77% | 20 → 20 | = |
| poi selection | 15.3 → 22.8 | 39.9 → 37.8 | 71.5 → 41.8 | 70.3 → 45.7 | 76.8 → 47.5 | 132.6 → 85.5 | ±14.44% → ±12.35% | 20 → 20 | -41.6% |
| select indicator | 11.0 → 11.7 | 61.9 → 42.6 | 100.5 → 92.6 | 95.7 → 90.6 | 109.7 → 104.9 | 126.0 → 115.0 | ±10.02% → ±10.22% | 20 → 20 | = |
| vector rendering | 14.0 → 14.1 | 61.9 → 56.1 | 69.7 → 66.9 | 73.1 → 76.1 | 75.8 → 76.5 | 106.5 → 165.9 | ±8.11% → ±16.76% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.5 → 305.6 | 305.5 → 305.6 | 305.6 → 305.7 | 305.8 → 306.0 | ±0.02% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 448.0 → 454.4 | 476.8 → 487.7 | 480.1 → 484.8 | 481.7 → 491.0 | 542.4 → 534.9 | ±2.35% → ±1.93% | 20 → 20 | = |
| mirrored selection | 0.9 → 1.0 | 1020.2 → 1010.1 | 1050.5 → 1043.2 | 1063.6 → 1053.1 | 1076.5 → 1071.7 | 1168.9 → 1153.5 | ±1.71% → ±1.83% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
