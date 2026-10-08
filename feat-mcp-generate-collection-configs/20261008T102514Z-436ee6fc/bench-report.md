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
| date snap | 95.6 → 153.4 | 7.9 → 2.2 | 10.1 → 7.0 | 10.9 → 7.1 | 12.3 → 7.5 | 15.7 → 10.0 | ±10.56% → ±10.27% | 20 → 20 | -30.7% |
| explore item | 75.7 → 103.5 | 9.3 → 4.1 | 14.3 → 9.8 | 14.0 → 12.2 | 15.2 → 12.5 | 21.7 → 43.3 | ±11.95% → ±35.35% | 20 → 20 | -31.8% |
| layer datetime | 94.1 → 105.0 | 8.8 → 8.3 | 10.5 → 8.7 | 11.2 → 13.6 | 12.5 → 8.8 | 19.8 → 75.9 | ±12.46% → ±61.41% | 20 → 20 | -17.5% |
| links=1 | 60.4 → 67.3 | 13.5 → 13.3 | 17.1 → 14.5 | 16.7 → 15.0 | 17.3 → 16.4 | 17.9 → 16.9 | ±3.29% → ±4.19% | 20 → 20 | -14.7% |
| links=10 | 58.0 → 68.3 | 16.8 → 13.5 | 17.2 → 14.2 | 17.2 → 14.7 | 17.4 → 15.5 | 17.9 → 17.0 | ±0.90% → ±3.63% | 20 → 20 | -17.4% |
| links=100 | 47.6 → 54.6 | 18.8 → 16.4 | 21.3 → 18.7 | 21.1 → 18.4 | 21.7 → 18.9 | 25.0 → 20.3 | ±3.49% → ±2.67% | 20 → 20 | -12.4% |
| geozarr bands | 29.0 → 33.2 | 22.1 → 19.0 | 36.3 → 33.9 | 36.7 → 32.9 | 42.4 → 40.2 | 60.4 → 46.8 | ±12.27% → ±13.39% | 20 → 20 | = |
| poi selection | 18.9 → 28.7 | 36.4 → 27.2 | 59.7 → 35.2 | 55.4 → 36.5 | 64.1 → 40.3 | 73.0 → 58.5 | ±9.88% → ±11.50% | 20 → 20 | -41.0% |
| select indicator | 13.8 → 18.1 | 42.5 → 31.4 | 73.8 → 62.8 | 76.2 → 59.6 | 90.2 → 71.8 | 103.6 → 82.0 | ±10.38% → ±11.94% | 20 → 20 | -15.0% |
| vector rendering | 13.9 → 17.7 | 53.3 → 46.0 | 83.7 → 53.6 | 76.4 → 58.7 | 91.7 → 70.9 | 107.0 → 77.1 | ±11.79% → ±9.54% | 20 → 20 | -35.9% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.0 | 305.5 → 305.1 | 306.7 → 305.1 | 305.7 → 305.1 | 323.7 → 305.4 | ±0.76% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.5 | 425.2 → 374.8 | 479.1 → 398.8 | 479.7 → 408.1 | 486.5 → 422.4 | 508.6 → 468.5 | ±1.73% → ±2.77% | 20 → 20 | -16.8% |
| mirrored selection | 1.0 → 1.6 | 943.6 → 567.4 | 994.2 → 611.7 | 1011.6 → 622.2 | 1043.5 → 634.4 | 1121.9 → 729.9 | ±2.43% → ±3.19% | 20 → 20 | -38.5% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1–2** | **0 → 0** | **0 → 0** |
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
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 3 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 15 | 0 | 404 |
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
