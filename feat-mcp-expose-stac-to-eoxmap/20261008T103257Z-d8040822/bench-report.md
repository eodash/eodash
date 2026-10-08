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
| date snap | 95.6 → 80.9 | 7.9 → 8.7 | 10.1 → 12.2 | 10.9 → 13.3 | 12.3 → 14.9 | 15.7 → 24.0 | ±10.56% → ±14.18% | 20 → 20 | = |
| layer datetime | 94.1 → 89.5 | 8.8 → 9.0 | 10.5 → 11.6 | 11.2 → 13.4 | 12.5 → 12.7 | 19.8 → 49.9 | ±12.46% → ±37.41% | 20 → 20 | = |
| explore item | 75.7 → 46.6 | 9.3 → 13.7 | 14.3 → 20.2 | 14.0 → 24.1 | 15.2 → 27.2 | 21.7 → 45.7 | ±11.95% → ±18.77% | 20 → 20 | +41.3% |
| links=1 | 60.4 → 59.2 | 13.5 → 15.4 | 17.1 → 17.0 | 16.7 → 16.9 | 17.3 → 17.1 | 17.9 → 17.5 | ±3.29% → ±1.23% | 20 → 20 | = |
| links=10 | 58.0 → 57.4 | 16.8 → 17.2 | 17.2 → 17.4 | 17.2 → 17.4 | 17.4 → 17.5 | 17.9 → 18.0 | ±0.90% → ±0.64% | 20 → 20 | = |
| links=100 | 47.6 → 47.1 | 18.8 → 19.4 | 21.3 → 21.3 | 21.1 → 21.3 | 21.7 → 21.6 | 25.0 → 23.0 | ±3.49% → ±1.72% | 20 → 20 | = |
| geozarr bands | 29.0 → 27.4 | 22.1 → 23.9 | 36.3 → 40.3 | 36.7 → 39.4 | 42.4 → 47.6 | 60.4 → 56.9 | ±12.27% → ±12.39% | 20 → 20 | = |
| poi selection | 18.9 → 14.8 | 36.4 → 46.7 | 59.7 → 70.1 | 55.4 → 69.3 | 64.1 → 74.9 | 73.0 → 89.1 | ±9.88% → ±6.85% | 20 → 20 | +17.5% |
| select indicator | 13.8 → 14.1 | 42.5 → 49.6 | 73.8 → 73.4 | 76.2 → 75.0 | 90.2 → 93.1 | 103.6 → 99.8 | ±10.38% → ±11.38% | 20 → 20 | = |
| vector rendering | 13.9 → 13.5 | 53.3 → 57.3 | 83.7 → 79.7 | 76.4 → 78.3 | 91.7 → 88.6 | 107.0 → 114.0 | ±11.79% → ±11.37% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.4 | 305.5 → 305.7 | 306.7 → 305.7 | 305.7 → 305.8 | 323.7 → 306.1 | ±0.76% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 425.2 → 464.5 | 479.1 → 476.6 | 479.7 → 484.8 | 486.5 → 488.7 | 508.6 → 547.5 | ±1.73% → ±2.12% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 943.6 → 986.4 | 994.2 → 1022.9 | 1011.6 → 1032.4 | 1043.5 → 1066.8 | 1121.9 → 1126.2 | ±2.43% → ±1.94% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1–2** | **0 → 0–1** | **0 → 0–0K** |
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
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
|  | `/tests/support/assets/tile.png` | 0 | 1 | 0K | 200 |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 22 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11041K | 206 |

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
