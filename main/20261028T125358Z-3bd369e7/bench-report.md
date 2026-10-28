### Benchmarks

Previous run → this run. Baseline [`2df0aabd4b14d881f55bb81f437f0b53db797194`](https://github.com/eodash/eodash/commit/2df0aabd4b14d881f55bb81f437f0b53db797194), 2026-10-28T09:03:07.139Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
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
| explore item | 116.1 → 156.2 | 6.8 → 5.2 | 8.1 → 6.4 | 9.2 → 6.6 | 10.6 → 7.2 | 17.4 → 8.6 | ±14.22% → ±7.78% | 20 → 20 | -20.5% |
| date snap | 88.3 → 112.6 | 7.7 → 7.2 | 12.0 → 8.9 | 12.4 → 9.3 | 14.4 → 10.2 | 22.9 → 14.3 | ±15.33% → ±11.58% | 20 → 20 | = |
| layer datetime | 90.1 → 103.3 | 8.9 → 8.5 | 11.1 → 8.9 | 13.4 → 11.3 | 12.6 → 9.9 | 52.1 → 40.8 | ±39.44% → ±35.52% | 20 → 20 | -20.2% |
| links=1 | 57.7 → 66.0 | 16.4 → 13.3 | 17.1 → 15.8 | 17.4 → 15.3 | 17.6 → 16.9 | 18.5 → 17.4 | ±1.51% → ±5.25% | 20 → 20 | -7.9% |
| links=10 | 56.7 → 65.7 | 16.5 → 13.5 | 17.6 → 15.3 | 17.6 → 15.4 | 17.8 → 16.9 | 18.5 → 18.5 | ±1.24% → ±5.48% | 20 → 20 | -13.6% |
| links=100 | 51.6 → 54.9 | 17.7 → 15.8 | 19.0 → 18.4 | 19.5 → 18.3 | 19.6 → 18.8 | 25.1 → 20.2 | ±4.34% → ±2.77% | 20 → 20 | -3.7% |
| poi selection | 15.3 → 24.1 | 39.9 → 29.3 | 71.5 → 36.0 | 70.3 → 46.5 | 76.8 → 61.1 | 132.6 → 81.1 | ±14.44% → ±17.68% | 20 → 20 | -49.6% |
| select indicator | 11.0 → 16.9 | 61.9 → 33.8 | 100.5 → 68.3 | 95.7 → 65.1 | 109.7 → 80.9 | 126.0 → 92.1 | ±10.02% → ±13.31% | 20 → 20 | -32.1% |
| geozarr bands | 21.7 → 22.5 | 34.7 → 42.2 | 46.9 → 44.0 | 46.6 → 44.5 | 48.0 → 45.4 | 55.1 → 48.6 | ±4.97% → ±1.90% | 20 → 20 | = |
| vector rendering | 14.0 → 16.4 | 61.9 → 46.0 | 69.7 → 59.3 | 73.1 → 64.2 | 75.8 → 63.0 | 106.5 → 112.1 | ±8.11% → ±13.03% | 20 → 20 | -14.8% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.0 | 305.5 → 305.2 | 305.5 → 305.3 | 305.6 → 305.3 | 305.8 → 305.7 | ±0.02% → ±0.03% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.2 | 448.0 → 427.3 | 476.8 → 451.0 | 480.1 → 458.3 | 481.7 → 462.3 | 542.4 → 562.6 | ±2.35% → ±3.66% | 20 → 20 | -5.4% |
| mirrored selection | 0.9 → 1.2 | 1020.2 → 808.1 | 1050.5 → 850.9 | 1063.6 → 871.5 | 1076.5 → 919.4 | 1168.9 → 965.4 | ±1.71% → ±3.20% | 20 → 20 | -19.0% |

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
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
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
