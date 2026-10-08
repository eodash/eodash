### Benchmarks

Previous run → this run. Baseline [`2f0b70e56f38a670ef02544ad2d2d8edcc9c5843`](https://github.com/eodash/eodash/commit/2f0b70e56f38a670ef02544ad2d2d8edcc9c5843), 2026-10-07T13:20:15.990Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
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
| date snap | 95.6 → 90.0 | 7.9 → 5.6 | 10.1 → 11.8 | 10.9 → 12.2 | 12.3 → 13.8 | 15.7 → 23.0 | ±10.56% → ±15.13% | 20 → 20 | = |
| explore item | 75.7 → 71.4 | 9.3 → 7.3 | 14.3 → 14.1 | 14.0 → 16.3 | 15.2 → 16.4 | 21.7 → 38.5 | ±11.95% → ±22.70% | 20 → 20 | = |
| layer datetime | 94.1 → 97.8 | 8.8 → 8.8 | 10.5 → 9.4 | 11.2 → 10.5 | 12.5 → 12.2 | 19.8 → 14.1 | ±12.46% → ±8.14% | 20 → 20 | = |
| links=1 | 60.4 → 61.0 | 13.5 → 13.4 | 17.1 → 16.8 | 16.7 → 17.7 | 17.3 → 17.3 | 17.9 → 43.1 | ±3.29% → ±20.01% | 20 → 20 | = |
| links=10 | 58.0 → 61.0 | 16.8 → 13.9 | 17.2 → 17.3 | 17.2 → 16.6 | 17.4 → 17.6 | 17.9 → 18.3 | ±0.90% → ±4.49% | 20 → 20 | = |
| links=100 | 47.6 → 48.7 | 18.8 → 18.9 | 21.3 → 20.6 | 21.1 → 20.7 | 21.7 → 21.8 | 25.0 → 23.3 | ±3.49% → ±3.62% | 20 → 20 | = |
| geozarr bands | 29.0 → 30.4 | 22.1 → 22.4 | 36.3 → 37.9 | 36.7 → 35.0 | 42.4 → 40.2 | 60.4 → 46.7 | ±12.27% → ±11.05% | 20 → 20 | = |
| poi selection | 18.9 → 18.1 | 36.4 → 40.9 | 59.7 → 58.3 | 55.4 → 58.0 | 64.1 → 67.1 | 73.0 → 80.2 | ±9.88% → ±10.94% | 20 → 20 | = |
| select indicator | 13.8 → 15.1 | 42.5 → 41.7 | 73.8 → 71.7 | 76.2 → 73.1 | 90.2 → 94.1 | 103.6 → 105.0 | ±10.38% → ±14.50% | 20 → 20 | = |
| vector rendering | 13.9 → 13.7 | 53.3 → 53.3 | 83.7 → 86.9 | 76.4 → 76.5 | 91.7 → 90.1 | 107.0 → 95.1 | ±11.79% → ±10.15% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.3 | 305.5 → 305.6 | 306.7 → 305.6 | 305.7 → 305.7 | 323.7 → 306.2 | ±0.76% → ±0.04% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 425.2 → 428.7 | 479.1 → 461.4 | 479.7 → 471.6 | 486.5 → 483.4 | 508.6 → 550.4 | ±1.73% → ±2.98% | 20 → 20 | -3.7% |
| mirrored selection | 1.0 → 1.0 | 943.6 → 944.1 | 994.2 → 993.6 | 1011.6 → 1018.4 | 1043.5 → 1029.3 | 1121.9 → 1216.6 | ±2.43% → ±3.35% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1** | **0 → 0–1** | **0 → 0–0K** |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–4** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
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
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/tile.png` | 0 | 1 | 0K | 200 |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 25 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 5 | 0 | 404 |
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
