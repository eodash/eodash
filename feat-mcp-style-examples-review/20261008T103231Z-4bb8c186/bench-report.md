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
| explore item | 75.7 → 71.4 | 9.3 → 7.0 | 14.3 → 14.3 | 14.0 → 16.2 | 15.2 → 17.2 | 21.7 → 38.5 | ±11.95% → ±21.83% | 20 → 20 | = |
| date snap | 95.6 → 98.1 | 7.9 → 7.7 | 10.1 → 10.6 | 10.9 → 10.7 | 12.3 → 12.1 | 15.7 → 15.0 | ±10.56% → ±10.24% | 20 → 20 | = |
| layer datetime | 94.1 → 95.4 | 8.8 → 8.8 | 10.5 → 10.4 | 11.2 → 10.8 | 12.5 → 12.6 | 19.8 → 13.9 | ±12.46% → ±8.42% | 20 → 20 | = |
| links=1 | 60.4 → 65.4 | 13.5 → 13.3 | 17.1 → 15.8 | 16.7 → 15.5 | 17.3 → 17.1 | 17.9 → 18.0 | ±3.29% → ±5.30% | 20 → 20 | -7.3% |
| links=10 | 58.0 → 67.8 | 16.8 → 13.9 | 17.2 → 14.2 | 17.2 → 14.8 | 17.4 → 15.4 | 17.9 → 17.4 | ±0.90% → ±3.57% | 20 → 20 | -17.4% |
| links=100 | 47.6 → 48.1 | 18.8 → 18.9 | 21.3 → 20.9 | 21.1 → 20.9 | 21.7 → 21.7 | 25.0 → 24.8 | ±3.49% → ±3.78% | 20 → 20 | = |
| geozarr bands | 29.0 → 31.3 | 22.1 → 21.9 | 36.3 → 36.9 | 36.7 → 34.2 | 42.4 → 39.7 | 60.4 → 48.7 | ±12.27% → ±11.99% | 20 → 20 | = |
| poi selection | 18.9 → 19.3 | 36.4 → 37.4 | 59.7 → 58.7 | 55.4 → 55.4 | 64.1 → 66.3 | 73.0 → 76.2 | ±9.88% → ±11.97% | 20 → 20 | = |
| select indicator | 13.8 → 15.8 | 42.5 → 47.1 | 73.8 → 62.2 | 76.2 → 65.6 | 90.2 → 74.8 | 103.6 → 90.9 | ±10.38% → ±9.68% | 20 → 20 | -15.8% |
| vector rendering | 13.9 → 14.0 | 53.3 → 54.0 | 83.7 → 74.2 | 76.4 → 76.0 | 91.7 → 91.4 | 107.0 → 106.1 | ±11.79% → ±12.25% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.5 → 305.5 | 306.7 → 305.5 | 305.7 → 305.6 | 323.7 → 305.8 | ±0.76% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 425.2 → 445.4 | 479.1 → 474.8 | 479.7 → 476.3 | 486.5 → 487.0 | 508.6 → 528.9 | ±1.73% → ±2.30% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 943.6 → 942.9 | 994.2 → 993.5 | 1011.6 → 1001.8 | 1043.5 → 1007.8 | 1121.9 → 1168.3 | ±2.43% → ±2.71% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| **explore item** | **1 → 1–2** | **0 → 0–1** | **0 → 0–0K** |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–8** | **0 → 0** |
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
|  | `/tests/support/assets/tile.png` | 0 | 2 | 0K | 200 |
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 5 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 16 | 0 | 404 |
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
