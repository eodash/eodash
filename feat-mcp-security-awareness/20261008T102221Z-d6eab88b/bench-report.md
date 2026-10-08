### Benchmarks

Previous run → this run. Baseline [`2f0b70e56f38a670ef02544ad2d2d8edcc9c5843`](https://github.com/eodash/eodash/commit/2f0b70e56f38a670ef02544ad2d2d8edcc9c5843), 2026-10-07T13:20:15.990Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
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
| explore item | 75.7 → 122.1 | 9.3 → 2.3 | 14.3 → 9.3 | 14.0 → 9.7 | 15.2 → 10.1 | 21.7 → 18.4 | ±11.95% → ±16.27% | 20 → 20 | -34.6% |
| date snap | 95.6 → 109.4 | 7.9 → 7.7 | 10.1 → 9.1 | 10.9 → 9.2 | 12.3 → 9.7 | 15.7 → 11.5 | ±10.56% → ±4.78% | 20 → 20 | = |
| layer datetime | 94.1 → 103.1 | 8.8 → 8.6 | 10.5 → 8.9 | 11.2 → 12.9 | 12.5 → 9.6 | 19.8 → 66.0 | ±12.46% → ±56.60% | 20 → 20 | -16.1% |
| links=1 | 60.4 → 68.3 | 13.5 → 13.0 | 17.1 → 13.5 | 16.7 → 15.7 | 17.3 → 15.9 | 17.9 → 37.6 | ±3.29% → ±19.25% | 20 → 20 | -20.8% |
| links=10 | 58.0 → 70.1 | 16.8 → 13.2 | 17.2 → 14.0 | 17.2 → 14.3 | 17.4 → 15.1 | 17.9 → 16.5 | ±0.90% → ±3.49% | 20 → 20 | -18.6% |
| links=100 | 47.6 → 59.0 | 18.8 → 15.7 | 21.3 → 16.3 | 21.1 → 17.0 | 21.7 → 18.0 | 25.0 → 19.4 | ±3.49% → ±3.52% | 20 → 20 | -23.5% |
| geozarr bands | 29.0 → 32.2 | 22.1 → 19.3 | 36.3 → 31.9 | 36.7 → 33.8 | 42.4 → 43.0 | 60.4 → 49.0 | ±12.27% → ±13.48% | 20 → 20 | = |
| poi selection | 18.9 → 30.4 | 36.4 → 26.5 | 59.7 → 30.6 | 55.4 → 35.5 | 64.1 → 34.8 | 73.0 → 78.0 | ±9.88% → ±17.37% | 20 → 20 | -48.8% |
| select indicator | 13.8 → 20.3 | 42.5 → 26.6 | 73.8 → 53.5 | 76.2 → 57.1 | 90.2 → 61.1 | 103.6 → 146.2 | ±10.38% → ±23.23% | 20 → 20 | -27.6% |
| vector rendering | 13.9 → 17.9 | 53.3 → 46.9 | 83.7 → 50.4 | 76.4 → 59.1 | 91.7 → 67.3 | 107.0 → 96.0 | ±11.79% → ±12.39% | 20 → 20 | -39.7% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.0 | 305.5 → 305.2 | 306.7 → 305.3 | 305.7 → 305.3 | 323.7 → 305.7 | ±0.76% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.4 | 425.2 → 389.4 | 479.1 → 414.3 | 479.7 → 418.5 | 486.5 → 430.2 | 508.6 → 469.8 | ±1.73% → ±2.47% | 20 → 20 | -13.5% |
| mirrored selection | 1.0 → 1.6 | 943.6 → 588.9 | 994.2 → 629.4 | 1011.6 → 639.4 | 1043.5 → 654.3 | 1121.9 → 737.3 | ±2.43% → ±3.03% | 20 → 20 | -36.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–7** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 16 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 7 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11958K | 206 |

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
