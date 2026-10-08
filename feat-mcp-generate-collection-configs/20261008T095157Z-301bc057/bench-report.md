### Benchmarks

Previous run → this run. Baseline [`2f0b70e56f38a670ef02544ad2d2d8edcc9c5843`](https://github.com/eodash/eodash/commit/2f0b70e56f38a670ef02544ad2d2d8edcc9c5843), 2026-10-07T13:20:15.990Z.

- geozarr bands: dragging a band rebuilds the source
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| geozarr bands | 29.0 → 38.4 | 22.1 → 8.1 | 36.3 → 31.7 | 36.7 → 30.6 | 42.4 → 34.1 | 60.4 → 54.3 | ±12.27% → ±15.94% | 20 → 20 | = |
| explore item | 75.7 → 91.8 | 9.3 → 8.3 | 14.3 → 11.0 | 14.0 → 11.7 | 15.2 → 12.9 | 21.7 → 20.6 | ±11.95% → ±14.04% | 20 → 20 | = |
| layer datetime | 94.1 → 108.0 | 8.8 → 8.6 | 10.5 → 8.7 | 11.2 → 11.9 | 12.5 → 8.9 | 19.8 → 58.3 | ±12.46% → ±53.16% | 20 → 20 | -17.5% |
| links=1 | 60.4 → 70.2 | 13.5 → 13.1 | 17.1 → 13.3 | 16.7 → 14.4 | 17.3 → 15.3 | 17.9 → 20.4 | ±3.29% → ±6.41% | 20 → 20 | -22.0% |
| links=10 | 58.0 → 69.0 | 16.8 → 13.4 | 17.2 → 13.6 | 17.2 → 14.6 | 17.4 → 15.8 | 17.9 → 17.6 | ±0.90% → ±4.56% | 20 → 20 | -20.9% |
| links=100 | 47.6 → 55.3 | 18.8 → 16.7 | 21.3 → 17.9 | 21.1 → 18.2 | 21.7 → 19.2 | 25.0 → 20.4 | ±3.49% → ±3.33% | 20 → 20 | -16.0% |
| poi selection | 18.9 → 24.8 | 36.4 → 30.0 | 59.7 → 38.3 | 55.4 → 43.4 | 64.1 → 56.0 | 73.0 → 67.9 | ±9.88% → ±13.54% | 20 → 20 | -35.9% |
| select indicator | 13.8 → 18.7 | 42.5 → 34.9 | 73.8 → 54.1 | 76.2 → 56.8 | 90.2 → 63.9 | 103.6 → 90.7 | ±10.38% → ±12.45% | 20 → 20 | -26.7% |
| vector rendering | 13.9 → 16.9 | 53.3 → 47.0 | 83.7 → 52.1 | 76.4 → 64.3 | 91.7 → 83.5 | 107.0 → 112.4 | ±11.79% → ±15.38% | 20 → 20 | -37.7% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.5 → 305.3 | 306.7 → 305.3 | 305.7 → 305.4 | 323.7 → 305.6 | ±0.76% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.2 | 425.2 → 418.7 | 479.1 → 453.6 | 479.7 → 461.1 | 486.5 → 479.2 | 508.6 → 516.9 | ±1.73% → ±2.81% | 20 → 20 | -5.3% |
| mirrored selection | 1.0 → 1.2 | 943.6 → 762.7 | 994.2 → 800.0 | 1011.6 → 810.3 | 1043.5 → 813.5 | 1121.9 → 932.1 | ±2.43% → ±2.46% | 20 → 20 | -19.5% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| **geozarr bands** | **0 → 0** | **0–20 → 0–8** | **0 → 0** |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 10 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 2 | 0 | 404 |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
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
