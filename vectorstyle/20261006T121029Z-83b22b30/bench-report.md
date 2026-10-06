### Benchmarks

Previous run → this run. Baseline [`d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10`](https://github.com/eodash/eodash/commit/d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10), 2026-10-01T09:19:13.552Z.

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
| date snap | 93.1 → 93.4 | 7.9 → 7.3 | 10.8 → 11.6 | 11.2 → 11.4 | 13.0 → 13.5 | 15.6 → 16.0 | ±10.35% → ±11.44% | 20 → 20 | = |
| layer datetime | 96.3 → 98.4 | 8.7 → 8.8 | 9.4 → 9.0 | 12.2 → 14.0 | 12.1 → 11.1 | 43.4 → 77.5 | ±35.27% → ±61.98% | 20 → 20 | = |
| explore item | 70.7 → 70.8 | 9.8 → 9.7 | 13.9 → 14.7 | 15.1 → 15.1 | 17.3 → 16.1 | 24.6 → 24.1 | ±12.79% → ±12.61% | 20 → 20 | = |
| links=1 | 63.5 → 56.4 | 13.5 → 13.9 | 16.6 → 17.2 | 15.9 → 19.5 | 17.1 → 17.6 | 17.9 → 55.2 | ±4.81% → ±24.96% | 20 → 20 | +3.6% |
| links=10 | 58.8 → 59.7 | 14.1 → 14.0 | 17.4 → 17.2 | 17.1 → 16.8 | 17.6 → 17.4 | 18.4 → 17.7 | ±3.28% → ±3.03% | 20 → 20 | = |
| links=100 | 47.5 → 46.7 | 18.9 → 19.1 | 21.3 → 21.5 | 21.1 → 21.5 | 21.8 → 22.1 | 23.1 → 23.2 | ±2.52% → ±2.29% | 20 → 20 | = |
| geozarr bands | 30.3 → 29.2 | 25.3 → 21.8 | 35.7 → 38.2 | 34.7 → 37.1 | 40.2 → 44.1 | 50.6 → 56.4 | ±10.82% → ±13.11% | 20 → 20 | = |
| poi selection | 19.4 → 17.9 | 35.6 → 38.4 | 56.5 → 61.5 | 54.9 → 58.7 | 64.2 → 67.4 | 85.1 → 80.9 | ±12.22% → ±10.08% | 20 → 20 | = |
| select indicator | 15.6 → 14.5 | 55.2 → 40.4 | 63.7 → 69.4 | 65.1 → 74.1 | 68.9 → 93.7 | 85.2 → 104.1 | ±5.71% → ±12.17% | 20 → 20 | = |
| vector rendering | 14.1 → 10.5 | 53.5 → 75.2 | 77.9 → 98.1 | 74.8 → 95.7 | 91.8 → 98.9 | 95.2 → 102.7 | ±11.00% → ±3.50% | 20 → 20 | +25.8% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.3 | 305.5 → 305.5 | 305.5 → 305.6 | 305.6 → 305.6 | 306.0 → 305.9 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 454.8 → 428.0 | 480.0 → 483.6 | 485.7 → 479.2 | 487.4 → 490.1 | 579.5 → 549.4 | ±2.87% → ±2.66% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 941.2 → 948.6 | 980.4 → 990.7 | 1000.4 → 1010.8 | 1027.0 → 1044.5 | 1137.6 → 1150.1 | ±2.52% → ±2.54% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–15** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| **vector rendering** | **4 → 5** | **1 → 1** | **1123K → 1123K** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 11 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 18 | 0 | 404 |
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
|  | `/styled-vector-style.json` | 40 | 0 | 0 | mocked |
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
