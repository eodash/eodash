### Benchmarks

Previous run → this run. Baseline [`2f0b70e56f38a670ef02544ad2d2d8edcc9c5843`](https://github.com/eodash/eodash/commit/2f0b70e56f38a670ef02544ad2d2d8edcc9c5843), 2026-10-07T13:20:15.990Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 95.6 → 102.1 | 7.9 → 5.5 | 10.1 → 9.2 | 10.9 → 10.8 | 12.3 → 12.0 | 15.7 → 21.6 | ±10.56% → ±17.17% | 20 → 20 | = |
| layer datetime | 94.1 → 107.2 | 8.8 → 8.6 | 10.5 → 8.9 | 11.2 → 9.4 | 12.5 → 9.3 | 19.8 → 12.3 | ±12.46% → ±5.84% | 20 → 20 | = |
| explore item | 75.7 → 82.0 | 9.3 → 8.7 | 14.3 → 13.1 | 14.0 → 13.0 | 15.2 → 15.1 | 21.7 → 18.9 | ±11.95% → ±11.71% | 20 → 20 | = |
| links=1 | 60.4 → 68.0 | 13.5 → 13.1 | 17.1 → 15.3 | 16.7 → 14.8 | 17.3 → 15.9 | 17.9 → 16.4 | ±3.29% → ±4.06% | 20 → 20 | -10.6% |
| links=10 | 58.0 → 68.2 | 16.8 → 13.5 | 17.2 → 14.2 | 17.2 → 14.8 | 17.4 → 15.5 | 17.9 → 17.6 | ±0.90% → ±3.78% | 20 → 20 | -17.4% |
| links=100 | 47.6 → 53.2 | 18.8 → 16.9 | 21.3 → 19.2 | 21.1 → 18.9 | 21.7 → 19.8 | 25.0 → 21.5 | ±3.49% → ±3.32% | 20 → 20 | -9.9% |
| geozarr bands | 29.0 → 31.1 | 22.1 → 21.1 | 36.3 → 33.4 | 36.7 → 33.7 | 42.4 → 38.8 | 60.4 → 44.9 | ±12.27% → ±9.88% | 20 → 20 | = |
| poi selection | 18.9 → 24.8 | 36.4 → 30.7 | 59.7 → 39.3 | 55.4 → 42.7 | 64.1 → 49.8 | 73.0 → 65.1 | ±9.88% → ±12.04% | 20 → 20 | -34.1% |
| select indicator | 13.8 → 19.6 | 42.5 → 34.5 | 73.8 → 50.9 | 76.2 → 55.2 | 90.2 → 65.3 | 103.6 → 101.0 | ±10.38% → ±14.74% | 20 → 20 | -31.1% |
| vector rendering | 13.9 → 15.5 | 53.3 → 47.9 | 83.7 → 59.9 | 76.4 → 69.1 | 91.7 → 88.6 | 107.0 → 93.5 | ±11.79% → ±12.84% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.2 | 305.5 → 305.3 | 306.7 → 305.4 | 305.7 → 305.5 | 323.7 → 305.6 | ±0.76% → ±0.02% | 20 → 20 | -0.0% |
| geotiff rendering | 2.1 → 2.2 | 425.2 → 420.6 | 479.1 → 438.2 | 479.7 → 458.5 | 486.5 → 454.3 | 508.6 → 649.3 | ±1.73% → ±5.92% | 20 → 20 | -8.5% |
| mirrored selection | 1.0 → 1.2 | 943.6 → 762.4 | 994.2 → 803.1 | 1011.6 → 822.2 | 1043.5 → 855.9 | 1121.9 → 965.1 | ±2.43% → ±3.45% | 20 → 20 | -19.2% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–15** | **0 → 0** |
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
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 6 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 31 | 0 | 404 |
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
