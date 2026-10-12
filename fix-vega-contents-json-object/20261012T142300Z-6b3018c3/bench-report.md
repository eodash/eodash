### Benchmarks

Previous run → this run. Baseline [`deb95578cb44065609eec1f0fcd7483ef6227b02`](https://github.com/eodash/eodash/commit/deb95578cb44065609eec1f0fcd7483ef6227b02), 2026-10-08T14:20:29.298Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geotiff rendering, vector rendering: draws a styled layer of each source type
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 92.6 → 110.8 | 5.0 → 5.3 | 11.7 → 9.1 | 12.0 → 9.4 | 13.1 → 10.0 | 26.2 → 14.2 | ±18.01% → ±9.58% | 20 → 20 | = |
| explore item | 60.1 → 78.6 | 11.8 → 8.3 | 15.7 → 13.0 | 18.9 → 14.3 | 18.3 → 17.0 | 43.1 → 29.4 | ±21.96% → ±18.64% | 20 → 20 | -16.9% |
| layer datetime | 94.2 → 103.7 | 9.0 → 8.6 | 10.6 → 8.8 | 10.9 → 10.4 | 12.3 → 10.4 | 14.9 → 25.4 | ±8.17% → ±19.96% | 20 → 20 | -16.6% |
| links=1 | 58.7 → 64.9 | 15.6 → 13.2 | 17.1 → 15.5 | 17.1 → 16.6 | 17.3 → 16.0 | 19.1 → 41.5 | ±2.12% → ±20.42% | 20 → 20 | -9.1% |
| links=10 | 58.6 → 68.3 | 14.1 → 13.5 | 17.3 → 13.8 | 17.1 → 14.8 | 17.5 → 15.7 | 18.6 → 18.0 | ±2.63% → ±4.53% | 20 → 20 | -20.5% |
| links=100 | 47.2 → 53.5 | 19.4 → 16.7 | 21.4 → 18.9 | 21.3 → 18.8 | 21.8 → 19.9 | 23.6 → 21.8 | ±2.47% → ±3.77% | 20 → 20 | -11.9% |
| geotiff rendering | 2.1 → 5.0 | 430.2 → 18.0 | 461.8 → 429.0 | 471.6 → 411.4 | 474.3 → 433.4 | 554.7 → 465.3 | ±2.94% → ±10.66% | 20 → 20 | -7.1% |
| geozarr bands | 29.9 → 31.7 | 25.0 → 20.7 | 31.6 → 32.4 | 34.9 → 33.3 | 42.4 → 37.7 | 47.6 → 49.7 | ±9.79% → ±11.10% | 20 → 20 | = |
| poi selection | 15.7 → 27.4 | 41.6 → 26.1 | 69.6 → 34.5 | 66.8 → 38.7 | 76.3 → 46.3 | 87.0 → 62.1 | ±9.62% → ±12.45% | 20 → 20 | -50.4% |
| select indicator | 14.9 → 18.7 | 43.2 → 33.4 | 71.8 → 55.0 | 72.4 → 56.8 | 91.3 → 66.7 | 102.0 → 87.3 | ±12.46% → ±11.41% | 20 → 20 | = |
| vector rendering | 13.5 → 17.0 | 57.0 → 46.1 | 71.8 → 49.9 | 78.1 → 64.1 | 96.8 → 84.4 | 105.8 → 96.4 | ±11.00% → ±15.18% | 20 → 20 | -30.4% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.6 → 305.2 | 305.6 → 305.3 | 305.7 → 305.4 | 306.3 → 305.7 | ±0.04% → ±0.02% | 20 → 20 | -0.1% |
| mirrored selection | 1.0 → 1.3 | 956.8 → 744.5 | 973.3 → 787.1 | 999.8 → 801.5 | 1026.4 → 816.2 | 1167.6 → 950.8 | ±2.63% → ±3.02% | 20 → 20 | -19.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1–2** | **0 → 0–1** | **0 → 0–0K** |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–6 → 0–7** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
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
|  | `/tests/support/assets/tile.png` | 0 | 1 | 0K | 200 |
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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 6 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 9 | 0 | 404 |
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
