### Benchmarks

Previous run → this run. Baseline [`6c762401a4e35131e58d22198b8ce0040e3278db`](https://github.com/eodash/eodash/commit/6c762401a4e35131e58d22198b8ce0040e3278db), 2026-09-28T08:57:13.319Z.

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
| date snap | 30.0 → 91.6 | 29.9 → 7.9 | 33.3 → 10.9 | 33.4 → 11.5 | 33.8 → 13.8 | 36.7 → 17.8 | ±1.86% → ±11.84% | 20 → 20 | -67.1% |
| layer datetime | 105.0 → 95.3 | 8.6 → 8.8 | 8.8 → 10.5 | 9.9 → 10.7 | 10.1 → 12.1 | 16.9 → 13.6 | ±10.75% → ±7.27% | 20 → 20 | = |
| explore item | 103.7 → 64.2 | 7.6 → 11.5 | 8.9 → 15.4 | 10.0 → 16.4 | 10.7 → 17.3 | 16.0 → 25.1 | ±10.36% → ±11.75% | 20 → 20 | +72.1% |
| links=1 | 69.9 → 57.2 | 13.2 → 16.7 | 13.4 → 17.1 | 14.4 → 17.6 | 15.9 → 17.6 | 17.0 → 22.4 | ±4.74% → ±3.80% | 20 → 20 | +27.5% |
| links=10 | 68.4 → 57.3 | 13.8 → 17.1 | 14.2 → 17.4 | 14.7 → 17.5 | 15.2 → 17.6 | 16.8 → 18.0 | ±3.03% → ±0.71% | 20 → 20 | +22.5% |
| links=100 | 45.2 → 48.2 | 20.2 → 19.0 | 22.2 → 21.3 | 22.2 → 20.9 | 22.8 → 21.7 | 25.6 → 23.9 | ±2.89% → ±3.51% | 20 → 20 | = |
| geozarr bands | 36.3 → 28.6 | 20.2 → 24.9 | 31.0 → 40.7 | 29.2 → 37.2 | 33.2 → 42.6 | 48.9 → 53.8 | ±12.35% → ±11.65% | 20 → 20 | +31.3% |
| poi selection | 20.8 → 23.0 | 34.3 → 33.8 | 47.6 → 43.1 | 49.6 → 45.8 | 52.6 → 49.1 | 82.1 → 80.2 | ±9.90% → ±12.22% | 20 → 20 | -9.7% |
| select indicator | 10.3 → 16.2 | 79.8 → 52.7 | 95.7 → 57.0 | 98.1 → 64.2 | 106.8 → 67.5 | 122.1 → 96.2 | ±5.47% → ±10.62% | 20 → 20 | -40.4% |
| vector rendering | 16.6 → 13.4 | 46.3 → 56.5 | 52.6 → 86.8 | 66.7 → 79.5 | 78.1 → 90.7 | 133.2 → 126.8 | ±17.56% → ±12.49% | 20 → 20 | = |
| mosaic scrub | 3.2 → 3.3 | 309.4 → 305.4 | 309.6 → 305.6 | 309.6 → 305.6 | 309.7 → 305.7 | 310.1 → 305.9 | ±0.03% → ±0.03% | 20 → 20 | -1.3% |
| geotiff rendering | 2.8 → 2.1 | 71.6 → 449.0 | 455.4 → 476.8 | 435.1 → 480.4 | 466.6 → 483.3 | 495.4 → 548.0 | ±9.47% → ±2.29% | 20 → 20 | +4.7% |
| mirrored selection | 0.6 → 0.8 | 1560.0 → 1176.4 | 1705.1 → 1210.9 | 1720.6 → 1231.9 | 1760.3 → 1259.2 | 1962.6 → 1354.4 | ±2.77% → ±1.90% | 20 → 20 | -29.0% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–11** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 2 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **3 → 2** | **1 → 6** | **0 → 338K–644K** |

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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 26 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 30 | 0 | 404 |
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
