### Benchmarks

Previous run → this run. Baseline [`deb95578cb44065609eec1f0fcd7483ef6227b02`](https://github.com/eodash/eodash/commit/deb95578cb44065609eec1f0fcd7483ef6227b02), 2026-10-08T14:20:29.298Z.

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
| explore item | 60.1 → 71.4 | 11.8 → 7.2 | 15.7 → 14.3 | 18.9 → 16.3 | 18.3 → 16.1 | 43.1 → 37.7 | ±21.96% → ±22.13% | 20 → 20 | = |
| date snap | 92.6 → 83.2 | 5.0 → 7.9 | 11.7 → 13.4 | 12.0 → 13.2 | 13.1 → 16.2 | 26.2 → 19.7 | ±18.01% → ±13.96% | 20 → 20 | +14.5% |
| layer datetime | 94.2 → 93.6 | 9.0 → 8.8 | 10.6 → 10.5 | 10.9 → 11.1 | 12.3 → 12.9 | 14.9 → 15.0 | ±8.17% → ±8.98% | 20 → 20 | = |
| links=1 | 58.7 → 56.7 | 15.6 → 15.0 | 17.1 → 17.2 | 17.1 → 18.2 | 17.3 → 17.6 | 19.1 → 34.1 | ±2.12% → ±11.81% | 20 → 20 | = |
| links=10 | 58.6 → 57.5 | 14.1 → 15.9 | 17.3 → 17.5 | 17.1 → 17.4 | 17.5 → 17.7 | 18.6 → 18.8 | ±2.63% → ±1.68% | 20 → 20 | = |
| links=100 | 47.2 → 43.8 | 19.4 → 19.9 | 21.4 → 22.1 | 21.3 → 23.1 | 21.8 → 24.2 | 23.6 → 28.5 | ±2.47% → ±5.36% | 20 → 20 | +3.5% |
| geozarr bands | 29.9 → 26.7 | 25.0 → 23.8 | 31.6 → 41.4 | 34.9 → 39.3 | 42.4 → 43.7 | 47.6 → 53.3 | ±9.79% → ±9.73% | 20 → 20 | = |
| poi selection | 15.7 → 16.0 | 41.6 → 40.9 | 69.6 → 71.1 | 66.8 → 66.7 | 76.3 → 77.7 | 87.0 → 95.4 | ±9.62% → ±11.50% | 20 → 20 | = |
| select indicator | 14.9 → 14.0 | 43.2 → 52.4 | 71.8 → 69.6 | 72.4 → 76.6 | 91.3 → 89.5 | 102.0 → 119.3 | ±12.46% → ±13.45% | 20 → 20 | = |
| vector rendering | 13.5 → 13.0 | 57.0 → 53.2 | 71.8 → 88.6 | 78.1 → 82.6 | 96.8 → 96.4 | 105.8 → 130.4 | ±11.00% → ±12.70% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.2 | 305.6 → 305.6 | 305.6 → 306.3 | 305.7 → 305.8 | 306.3 → 316.5 | ±0.04% → ±0.45% | 20 → 20 | = |
| geotiff rendering | 2.1 → 1.9 | 430.2 → 469.7 | 461.8 → 516.8 | 471.6 → 527.1 | 474.3 → 535.5 | 554.7 → 582.1 | ±2.94% → ±2.56% | 20 → 20 | +11.9% |
| mirrored selection | 1.0 → 1.0 | 956.8 → 955.8 | 973.3 → 1012.8 | 999.8 → 1020.6 | 1026.4 → 1042.2 | 1167.6 → 1126.7 | ±2.63% → ±2.13% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| **explore item** | **1 → 1–2** | **0 → 0** | **0 → 0** |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–6 → 0–4** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 1 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 15 | 0 | 404 |
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
