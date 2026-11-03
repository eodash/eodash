### Benchmarks

Previous run → this run. Baseline [`3bd369e7258db23481438a2fdf67b2ed97d6cf6b`](https://github.com/eodash/eodash/commit/3bd369e7258db23481438a2fdf67b2ed97d6cf6b), 2026-10-28T12:53:57.683Z.

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
| explore item | 156.2 → 108.1 | 5.2 → 6.6 | 6.4 → 8.3 | 6.6 → 10.9 | 7.2 → 11.6 | 8.6 → 24.8 | ±7.78% → ±24.20% | 20 → 20 | +29.7% |
| date snap | 112.6 → 80.5 | 7.2 → 8.1 | 8.9 → 13.2 | 9.3 → 13.4 | 10.2 → 16.0 | 14.3 → 21.0 | ±11.58% → ±13.14% | 20 → 20 | +48.3% |
| layer datetime | 103.3 → 91.2 | 8.5 → 8.8 | 8.9 → 11.4 | 11.3 → 13.3 | 9.9 → 12.6 | 40.8 → 51.6 | ±35.52% → ±39.65% | 20 → 20 | +28.7% |
| links=1 | 66.0 → 56.1 | 13.3 → 16.1 | 15.8 → 17.4 | 15.3 → 18.1 | 16.9 → 18.3 | 17.4 → 26.8 | ±5.25% → ±6.97% | 20 → 20 | +10.1% |
| links=10 | 65.7 → 57.1 | 13.5 → 16.2 | 15.3 → 17.6 | 15.4 → 17.5 | 16.9 → 17.8 | 18.5 → 18.1 | ±5.48% → ±1.09% | 20 → 20 | +15.1% |
| links=100 | 54.9 → 48.0 | 15.8 → 18.3 | 18.4 → 20.6 | 18.3 → 21.0 | 18.8 → 21.6 | 20.2 → 27.3 | ±2.77% → ±4.86% | 20 → 20 | +12.3% |
| geozarr bands | 22.5 → 29.2 | 42.2 → 29.5 | 44.0 → 31.4 | 44.5 → 37.6 | 45.4 → 35.2 | 48.6 → 99.1 | ±1.90% → ±22.44% | 20 → 20 | -28.7% |
| poi selection | 24.1 → 13.2 | 29.3 → 48.6 | 36.0 → 80.1 | 46.5 → 79.0 | 61.1 → 88.4 | 81.1 → 100.5 | ±17.68% → ±8.61% | 20 → 20 | +122.4% |
| vector rendering | 16.4 → 14.7 | 46.0 → 56.9 | 59.3 → 64.1 | 64.2 → 70.2 | 63.0 → 73.5 | 112.1 → 113.7 | ±13.03% → ±10.08% | 20 → 20 | = |
| select indicator | 16.9 → 11.5 | 33.8 → 64.0 | 68.3 → 96.8 | 65.1 → 90.0 | 80.9 → 101.1 | 92.1 → 113.8 | ±13.31% → ±8.61% | 20 → 20 | +41.9% |
| mosaic scrub | 3.3 → 3.3 | 305.0 → 305.2 | 305.2 → 305.4 | 305.3 → 305.4 | 305.3 → 305.5 | 305.7 → 305.7 | ±0.03% → ±0.02% | 20 → 20 | +0.1% |
| geotiff rendering | 2.2 → 2.0 | 427.3 → 457.0 | 451.0 → 490.3 | 458.3 → 499.9 | 462.3 → 501.2 | 562.6 → 588.8 | ±3.66% → ±3.17% | 20 → 20 | +8.7% |
| mirrored selection | 1.2 → 0.9 | 808.1 → 1020.7 | 850.9 → 1056.0 | 871.5 → 1081.3 | 919.4 → 1092.2 | 965.4 → 1233.7 | ±3.20% → ±2.72% | 20 → 20 | +24.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| **vector rendering** | **4 → 6** | **1 → 1** | **1123K → 1123K** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| **geotiff rendering** | **4 → 6** | **0 → 0** | **0 → 0** |
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
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 60 | 0 | 0 | mocked |
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
|  | `/styled-geotiff-style.json` | 60 | 0 | 0 | mocked |
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
