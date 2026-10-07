### Benchmarks

Previous run → this run. Baseline [`2f0b70e56f38a670ef02544ad2d2d8edcc9c5843`](https://github.com/eodash/eodash/commit/2f0b70e56f38a670ef02544ad2d2d8edcc9c5843), 2026-10-07T13:20:15.990Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- geozarr bands: dragging a band rebuilds the source
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 95.6 → 93.2 | 7.9 → 7.9 | 10.1 → 11.0 | 10.9 → 11.2 | 12.3 → 12.9 | 15.7 → 15.2 | ±10.56% → ±9.52% | 20 → 20 | = |
| layer datetime | 94.1 → 99.0 | 8.8 → 8.9 | 10.5 → 9.2 | 11.2 → 10.3 | 12.5 → 11.6 | 19.8 → 14.0 | ±12.46% → ±7.78% | 20 → 20 | = |
| explore item | 75.7 → 71.7 | 9.3 → 9.3 | 14.3 → 14.4 | 14.0 → 14.5 | 15.2 → 15.5 | 21.7 → 23.2 | ±11.95% → ±10.42% | 20 → 20 | = |
| geozarr bands | 29.0 → 32.8 | 22.1 → 12.0 | 36.3 → 37.9 | 36.7 → 34.4 | 42.4 → 41.9 | 60.4 → 51.0 | ±12.27% → ±14.32% | 20 → 20 | = |
| links=1 | 60.4 → 54.2 | 13.5 → 13.6 | 17.1 → 17.4 | 16.7 → 23.6 | 17.3 → 21.1 | 17.9 → 107.3 | ±3.29% → ±48.69% | 20 → 20 | = |
| links=10 | 58.0 → 64.3 | 16.8 → 13.9 | 17.2 → 15.1 | 17.2 → 15.7 | 17.4 → 17.0 | 17.9 → 17.7 | ±0.90% → ±4.32% | 20 → 20 | -12.2% |
| links=100 | 47.6 → 46.6 | 18.8 → 18.9 | 21.3 → 21.4 | 21.1 → 21.6 | 21.7 → 23.0 | 25.0 → 25.8 | ±3.49% → ±4.11% | 20 → 20 | = |
| select indicator | 13.8 → 15.7 | 42.5 → 38.0 | 73.8 → 63.2 | 76.2 → 67.9 | 90.2 → 80.6 | 103.6 → 102.9 | ±10.38% → ±12.42% | 20 → 20 | -14.4% |
| poi selection | 18.9 → 17.0 | 36.4 → 38.9 | 59.7 → 67.3 | 55.4 → 61.9 | 64.1 → 69.3 | 73.0 → 82.8 | ±9.88% → ±10.13% | 20 → 20 | +12.9% |
| vector rendering | 13.9 → 13.4 | 53.3 → 53.8 | 83.7 → 84.0 | 76.4 → 79.6 | 91.7 → 93.7 | 107.0 → 107.6 | ±11.79% → ±12.04% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.3 | 305.5 → 305.5 | 306.7 → 305.6 | 305.7 → 305.7 | 323.7 → 306.1 | ±0.76% → ±0.04% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.0 | 425.2 → 433.3 | 479.1 → 465.1 | 479.7 → 494.1 | 486.5 → 504.8 | 508.6 → 653.2 | ±1.73% → ±5.73% | 20 → 20 | -2.9% |
| mirrored selection | 1.0 → 1.0 | 943.6 → 967.1 | 994.2 → 1016.3 | 1011.6 → 1020.2 | 1043.5 → 1033.4 | 1121.9 → 1160.2 | ±2.43% → ±2.19% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–20** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
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
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 7 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 31 | 0 | 404 |
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
