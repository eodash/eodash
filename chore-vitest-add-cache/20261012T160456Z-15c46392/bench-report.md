### Benchmarks

Previous run → this run. Baseline [`deb95578cb44065609eec1f0fcd7483ef6227b02`](https://github.com/eodash/eodash/commit/deb95578cb44065609eec1f0fcd7483ef6227b02), 2026-10-08T14:20:29.298Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- geozarr bands: dragging a band rebuilds the source
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 92.6 → 88.8 | 5.0 → 8.0 | 11.7 → 11.8 | 12.0 → 12.1 | 13.1 → 13.6 | 26.2 → 24.5 | ±18.01% → ±15.74% | 20 → 20 | = |
| layer datetime | 94.2 → 93.4 | 9.0 → 8.9 | 10.6 → 10.5 | 10.9 → 11.2 | 12.3 → 12.5 | 14.9 → 19.9 | ±8.17% → ±12.22% | 20 → 20 | = |
| explore item | 60.1 → 61.9 | 11.8 → 10.3 | 15.7 → 16.0 | 18.9 → 18.0 | 18.3 → 22.2 | 43.1 → 37.5 | ±21.96% → ±18.07% | 20 → 20 | = |
| geozarr bands | 29.9 → 32.6 | 25.0 → 10.5 | 31.6 → 38.3 | 34.9 → 35.2 | 42.4 → 41.5 | 47.6 → 55.6 | ±9.79% → ±14.45% | 20 → 20 | = |
| links=1 | 58.7 → 59.1 | 15.6 → 13.9 | 17.1 → 17.1 | 17.1 → 17.0 | 17.3 → 17.5 | 19.1 → 18.4 | ±2.12% → ±2.82% | 20 → 20 | = |
| links=10 | 58.6 → 56.6 | 14.1 → 16.9 | 17.3 → 17.6 | 17.1 → 17.7 | 17.5 → 17.9 | 18.6 → 18.5 | ±2.63% → ±1.13% | 20 → 20 | = |
| links=100 | 47.2 → 45.2 | 19.4 → 20.6 | 21.4 → 21.8 | 21.3 → 22.2 | 21.8 → 22.4 | 23.6 → 26.2 | ±2.47% → ±2.96% | 20 → 20 | = |
| poi selection | 15.7 → 21.7 | 41.6 → 37.3 | 69.6 → 42.6 | 66.8 → 48.4 | 76.3 → 50.5 | 87.0 → 75.5 | ±9.62% → ±11.89% | 20 → 20 | -38.8% |
| select indicator | 14.9 → 14.4 | 43.2 → 49.0 | 71.8 → 77.6 | 72.4 → 73.9 | 91.3 → 86.8 | 102.0 → 104.7 | ±12.46% → ±11.29% | 20 → 20 | = |
| vector rendering | 13.5 → 13.8 | 57.0 → 54.7 | 71.8 → 76.4 | 78.1 → 77.5 | 96.8 → 91.5 | 105.8 → 119.7 | ±11.00% → ±12.46% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.5 | 305.6 → 305.8 | 305.6 → 305.8 | 305.7 → 305.9 | 306.3 → 306.4 | ±0.04% → ±0.04% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 430.2 → 460.6 | 461.8 → 474.1 | 471.6 → 483.5 | 474.3 → 478.0 | 554.7 → 568.4 | ±2.94% → ±2.69% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 956.8 → 970.7 | 973.3 → 1037.1 | 999.8 → 1049.3 | 1026.4 → 1058.1 | 1167.6 → 1220.5 | ±2.63% → ±2.59% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–6 → 0–10** | **0 → 0** |
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
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 5 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 17 | 0 | 404 |
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
