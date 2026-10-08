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
| date snap | 95.6 → 115.5 | 7.9 → 7.1 | 10.1 → 8.7 | 10.9 → 8.8 | 12.3 → 9.0 | 15.7 → 12.5 | ±10.56% → ±7.58% | 20 → 20 | -14.4% |
| explore item | 75.7 → 93.0 | 9.3 → 7.4 | 14.3 → 10.8 | 14.0 → 11.5 | 15.2 → 12.2 | 21.7 → 21.7 | ±11.95% → ±14.69% | 20 → 20 | = |
| layer datetime | 94.1 → 93.2 | 8.8 → 8.8 | 10.5 → 9.9 | 11.2 → 12.8 | 12.5 → 12.5 | 19.8 → 47.4 | ±12.46% → ±37.24% | 20 → 20 | = |
| links=1 | 60.4 → 74.1 | 13.5 → 12.9 | 17.1 → 13.1 | 16.7 → 13.5 | 17.3 → 13.5 | 17.9 → 15.3 | ±3.29% → ±2.76% | 20 → 20 | -23.2% |
| links=10 | 58.0 → 69.1 | 16.8 → 13.2 | 17.2 → 14.4 | 17.2 → 14.6 | 17.4 → 15.6 | 17.9 → 16.3 | ±0.90% → ±3.81% | 20 → 20 | -16.6% |
| links=100 | 47.6 → 59.9 | 18.8 → 15.6 | 21.3 → 16.1 | 21.1 → 16.7 | 21.7 → 17.5 | 25.0 → 18.4 | ±3.49% → ±2.78% | 20 → 20 | -24.2% |
| geozarr bands | 29.0 → 32.2 | 22.1 → 19.4 | 36.3 → 31.2 | 36.7 → 33.4 | 42.4 → 38.5 | 60.4 → 55.2 | ±12.27% → ±13.66% | 20 → 20 | = |
| poi selection | 18.9 → 27.4 | 36.4 → 29.7 | 59.7 → 34.7 | 55.4 → 38.1 | 64.1 → 40.1 | 73.0 → 65.1 | ±9.88% → ±11.27% | 20 → 20 | -41.8% |
| select indicator | 13.8 → 17.0 | 42.5 → 42.1 | 73.8 → 67.3 | 76.2 → 62.7 | 90.2 → 69.7 | 103.6 → 100.6 | ±10.38% → ±12.08% | 20 → 20 | = |
| vector rendering | 13.9 → 16.2 | 53.3 → 48.1 | 83.7 → 57.3 | 76.4 → 66.2 | 91.7 → 78.5 | 107.0 → 108.9 | ±11.79% → ±13.47% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.2 | 305.5 → 305.3 | 306.7 → 305.3 | 305.7 → 305.4 | 323.7 → 305.7 | ±0.76% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.3 | 425.2 → 400.3 | 479.1 → 423.6 | 479.7 → 429.9 | 486.5 → 441.0 | 508.6 → 495.3 | ±1.73% → ±2.81% | 20 → 20 | -11.6% |
| mirrored selection | 1.0 → 1.6 | 943.6 → 587.2 | 994.2 → 628.0 | 1011.6 → 644.1 | 1043.5 → 666.8 | 1121.9 → 747.5 | ±2.43% → ±3.37% | 20 → 20 | -36.8% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–6** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 13 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 2 | 0 | 404 |
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
