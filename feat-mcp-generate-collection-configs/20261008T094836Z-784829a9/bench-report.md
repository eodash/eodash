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
| date snap | 95.6 → 99.8 | 7.9 → 5.0 | 10.1 → 10.8 | 10.9 → 10.9 | 12.3 → 13.0 | 15.7 → 15.3 | ±10.56% → ±12.57% | 20 → 20 | = |
| layer datetime | 94.1 → 94.5 | 8.8 → 8.8 | 10.5 → 9.2 | 11.2 → 12.6 | 12.5 → 11.9 | 19.8 → 46.3 | ±12.46% → ±36.59% | 20 → 20 | = |
| explore item | 75.7 → 69.9 | 9.3 → 9.9 | 14.3 → 13.6 | 14.0 → 15.2 | 15.2 → 16.3 | 21.7 → 27.0 | ±11.95% → ±13.58% | 20 → 20 | = |
| links=1 | 60.4 → 63.3 | 13.5 → 13.3 | 17.1 → 16.6 | 16.7 → 15.9 | 17.3 → 16.9 | 17.9 → 17.4 | ±3.29% → ±4.08% | 20 → 20 | = |
| links=10 | 58.0 → 62.6 | 16.8 → 13.8 | 17.2 → 16.9 | 17.2 → 16.1 | 17.4 → 17.2 | 17.9 → 18.0 | ±0.90% → ±4.43% | 20 → 20 | = |
| links=100 | 47.6 → 48.1 | 18.8 → 18.7 | 21.3 → 21.4 | 21.1 → 20.9 | 21.7 → 22.0 | 25.0 → 23.2 | ±3.49% → ±3.34% | 20 → 20 | = |
| geozarr bands | 29.0 → 28.2 | 22.1 → 22.0 | 36.3 → 37.7 | 36.7 → 38.0 | 42.4 → 43.0 | 60.4 → 56.0 | ±12.27% → ±12.17% | 20 → 20 | = |
| poi selection | 18.9 → 18.7 | 36.4 → 34.1 | 59.7 → 58.6 | 55.4 → 56.8 | 64.1 → 67.8 | 73.0 → 74.6 | ±9.88% → ±10.79% | 20 → 20 | = |
| select indicator | 13.8 → 15.3 | 42.5 → 40.7 | 73.8 → 66.5 | 76.2 → 69.5 | 90.2 → 80.6 | 103.6 → 99.2 | ±10.38% → ±11.71% | 20 → 20 | = |
| vector rendering | 13.9 → 13.7 | 53.3 → 54.3 | 83.7 → 87.4 | 76.4 → 77.2 | 91.7 → 91.4 | 107.0 → 98.0 | ±11.79% → ±10.50% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.3 | 305.5 → 305.5 | 306.7 → 305.6 | 305.7 → 305.6 | 323.7 → 306.1 | ±0.76% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 425.2 → 428.6 | 479.1 → 470.0 | 479.7 → 472.8 | 486.5 → 489.9 | 508.6 → 534.3 | ±1.73% → ±2.82% | 20 → 20 | -1.9% |
| mirrored selection | 1.0 → 1.0 | 943.6 → 947.7 | 994.2 → 1003.4 | 1011.6 → 1019.4 | 1043.5 → 1040.4 | 1121.9 → 1144.0 | ±2.43% → ±2.60% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–10** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 15 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 6 | 0 | 404 |
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
