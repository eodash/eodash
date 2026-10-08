### Benchmarks

Previous run → this run. Baseline [`2f0b70e56f38a670ef02544ad2d2d8edcc9c5843`](https://github.com/eodash/eodash/commit/2f0b70e56f38a670ef02544ad2d2d8edcc9c5843), 2026-10-07T13:20:15.990Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 95.6 → 113.6 | 7.9 → 7.2 | 10.1 → 8.7 | 10.9 → 9.1 | 12.3 → 9.6 | 15.7 → 14.5 | ±10.56% → ±10.13% | 20 → 20 | -13.9% |
| explore item | 75.7 → 83.6 | 9.3 → 8.5 | 14.3 → 11.6 | 14.0 → 13.1 | 15.2 → 14.5 | 21.7 → 24.7 | ±11.95% → ±16.44% | 20 → 20 | = |
| layer datetime | 94.1 → 105.5 | 8.8 → 8.5 | 10.5 → 8.7 | 11.2 → 13.4 | 12.5 → 8.8 | 19.8 → 70.7 | ±12.46% → ±57.45% | 20 → 20 | -17.5% |
| links=1 | 60.4 → 71.1 | 13.5 → 13.1 | 17.1 → 13.4 | 16.7 → 14.2 | 17.3 → 15.4 | 17.9 → 16.5 | ±3.29% → ±4.07% | 20 → 20 | -21.7% |
| links=10 | 58.0 → 69.1 | 16.8 → 13.4 | 17.2 → 14.2 | 17.2 → 14.5 | 17.4 → 15.3 | 17.9 → 16.4 | ±0.90% → ±3.41% | 20 → 20 | -17.7% |
| links=100 | 47.6 → 52.9 | 18.8 → 17.0 | 21.3 → 19.1 | 21.1 → 18.9 | 21.7 → 19.4 | 25.0 → 20.4 | ±3.49% → ±2.09% | 20 → 20 | -10.3% |
| geozarr bands | 29.0 → 28.5 | 22.1 → 21.8 | 36.3 → 34.8 | 36.7 → 39.7 | 42.4 → 44.2 | 60.4 → 90.4 | ±12.27% → ±20.00% | 20 → 20 | = |
| select indicator | 13.8 → 18.4 | 42.5 → 28.0 | 73.8 → 58.5 | 76.2 → 58.6 | 90.2 → 71.1 | 103.6 → 83.4 | ±10.38% → ±11.91% | 20 → 20 | -20.8% |
| poi selection | 18.9 → 25.2 | 36.4 → 30.4 | 59.7 → 37.6 | 55.4 → 44.3 | 64.1 → 46.2 | 73.0 → 115.5 | ±9.88% → ±22.75% | 20 → 20 | -36.9% |
| vector rendering | 13.9 → 14.9 | 53.3 → 50.0 | 83.7 → 67.4 | 76.4 → 72.1 | 91.7 → 89.8 | 107.0 → 97.9 | ±11.79% → ±12.57% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.5 → 305.3 | 306.7 → 305.4 | 305.7 → 305.5 | 323.7 → 305.9 | ±0.76% → ±0.03% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.3 | 425.2 → 423.6 | 479.1 → 435.1 | 479.7 → 446.6 | 486.5 → 440.5 | 508.6 → 581.2 | ±1.73% → ±4.16% | 20 → 20 | -9.2% |
| mirrored selection | 1.0 → 1.2 | 943.6 → 755.5 | 994.2 → 806.0 | 1011.6 → 835.7 | 1043.5 → 858.0 | 1121.9 → 1013.9 | ±2.43% → ±3.64% | 20 → 20 | -18.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–30** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 16 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 38 | 0 | 404 |
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
