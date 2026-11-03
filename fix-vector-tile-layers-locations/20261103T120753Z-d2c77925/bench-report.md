### Benchmarks

Previous run → this run. Baseline [`3bd369e7258db23481438a2fdf67b2ed97d6cf6b`](https://github.com/eodash/eodash/commit/3bd369e7258db23481438a2fdf67b2ed97d6cf6b), 2026-10-28T12:53:57.683Z.

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
| date snap | 112.6 → 118.6 | 7.2 → 3.9 | 8.9 → 8.8 | 9.3 → 9.1 | 10.2 → 9.8 | 14.3 → 15.7 | ±11.58% → ±13.38% | 20 → 20 | = |
| explore item | 156.2 → 150.6 | 5.2 → 5.5 | 6.4 → 6.3 | 6.6 → 7.0 | 7.2 → 7.4 | 8.6 → 15.1 | ±7.78% → ±16.24% | 20 → 20 | = |
| layer datetime | 103.3 → 102.3 | 8.5 → 8.6 | 8.9 → 8.9 | 11.3 → 10.0 | 9.9 → 11.4 | 40.8 → 13.3 | ±35.52% → ±8.06% | 20 → 20 | = |
| links=1 | 66.0 → 66.2 | 13.3 → 13.3 | 15.8 → 15.9 | 15.3 → 15.3 | 16.9 → 16.5 | 17.4 → 17.7 | ±5.25% → ±4.94% | 20 → 20 | = |
| links=10 | 65.7 → 65.2 | 13.5 → 13.5 | 15.3 → 16.2 | 15.4 → 15.5 | 16.9 → 17.2 | 18.5 → 17.8 | ±5.48% → ±5.30% | 20 → 20 | = |
| links=100 | 54.9 → 54.0 | 15.8 → 16.8 | 18.4 → 18.6 | 18.3 → 18.6 | 18.8 → 18.9 | 20.2 → 21.0 | ±2.77% → ±2.43% | 20 → 20 | = |
| poi selection | 24.1 → 19.7 | 29.3 → 34.0 | 36.0 → 58.7 | 46.5 → 54.1 | 61.1 → 63.2 | 81.1 → 76.3 | ±17.68% → ±11.39% | 20 → 20 | = |
| select indicator | 16.9 → 17.1 | 33.8 → 36.0 | 68.3 → 58.4 | 65.1 → 65.4 | 80.9 → 78.7 | 92.1 → 124.0 | ±13.31% → ±17.24% | 20 → 20 | = |
| geozarr bands | 22.5 → 22.6 | 42.2 → 42.2 | 44.0 → 43.4 | 44.5 → 44.3 | 45.4 → 44.5 | 48.6 → 50.0 | ±1.90% → ±2.53% | 20 → 20 | = |
| vector rendering | 16.4 → 15.9 | 46.0 → 48.2 | 59.3 → 63.7 | 64.2 → 64.5 | 63.0 → 67.9 | 112.1 → 90.1 | ±13.03% → ±8.03% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.0 → 305.0 | 305.2 → 305.2 | 305.3 → 305.2 | 305.3 → 305.3 | 305.7 → 305.6 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.2 | 427.3 → 423.5 | 451.0 → 448.7 | 458.3 → 452.9 | 462.3 → 461.2 | 562.6 → 539.8 | ±3.66% → ±3.10% | 20 → 20 | = |
| mirrored selection | 1.2 → 1.2 | 808.1 → 807.5 | 850.9 → 831.6 | 871.5 → 856.2 | 919.4 → 875.7 | 965.4 → 1027.2 | ±3.20% → ±3.17% | 20 → 20 | = |

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
| **vector rendering** | **4 → 6** | **1 → 1** | **1123K → 1123K** |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| **geotiff rendering** | **4 → 6** | **0 → 0** | **0 → 0** |
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
|  | `/styled-vector-style.json` | 60 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 60 | 0 | 0 | mocked |
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
