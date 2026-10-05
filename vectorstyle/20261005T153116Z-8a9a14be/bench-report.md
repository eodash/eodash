### Benchmarks

Previous run → this run. Baseline [`d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10`](https://github.com/eodash/eodash/commit/d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10), 2026-10-01T09:19:13.552Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
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
| explore item | 70.7 → 109.9 | 9.8 → 3.0 | 13.9 → 9.2 | 15.1 → 14.8 | 17.3 → 10.8 | 24.6 → 84.5 | ±12.79% → ±63.63% | 20 → 20 | -33.8% |
| date snap | 93.1 → 133.3 | 7.9 → 4.5 | 10.8 → 7.4 | 11.2 → 8.0 | 13.0 → 7.9 | 15.6 → 16.3 | ±10.35% → ±15.00% | 20 → 20 | -31.5% |
| layer datetime | 96.3 → 107.6 | 8.7 → 8.5 | 9.4 → 8.7 | 12.2 → 9.9 | 12.1 → 8.8 | 43.4 → 22.0 | ±35.27% → ±16.98% | 20 → 20 | -7.0% |
| links=1 | 63.5 → 69.7 | 13.5 → 13.0 | 16.6 → 13.3 | 15.9 → 15.5 | 17.1 → 15.5 | 17.9 → 39.0 | ±4.81% → ±20.94% | 20 → 20 | -19.9% |
| links=10 | 58.8 → 71.8 | 14.1 → 13.2 | 17.4 → 13.5 | 17.1 → 14.0 | 17.6 → 14.7 | 18.4 → 16.0 | ±3.28% → ±3.21% | 20 → 20 | -22.9% |
| links=100 | 47.5 → 59.4 | 18.9 → 15.7 | 21.3 → 16.7 | 21.1 → 16.9 | 21.8 → 17.4 | 23.1 → 19.1 | ±2.52% → ±2.79% | 20 → 20 | -21.8% |
| geozarr bands | 30.3 → 32.6 | 25.3 → 20.3 | 35.7 → 32.8 | 34.7 → 32.2 | 40.2 → 35.3 | 50.6 → 46.6 | ±10.82% → ±10.49% | 20 → 20 | = |
| select indicator | 15.6 → 22.6 | 55.2 → 22.3 | 63.7 → 47.7 | 65.1 → 48.8 | 68.9 → 55.2 | 85.2 → 81.4 | ±5.71% → ±14.83% | 20 → 20 | -25.1% |
| poi selection | 19.4 → 34.4 | 35.6 → 23.2 | 56.5 → 28.3 | 54.9 → 29.7 | 64.2 → 30.4 | 85.1 → 40.0 | ±12.22% → ±7.62% | 20 → 20 | -49.9% |
| vector rendering | 14.1 → 18.5 | 53.5 → 46.3 | 77.9 → 48.9 | 74.8 → 57.2 | 91.8 → 58.3 | 95.2 → 105.8 | ±11.00% → ±13.73% | 20 → 20 | -37.3% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 304.8 | 305.5 → 305.0 | 305.5 → 305.0 | 305.6 → 305.0 | 306.0 → 305.2 | ±0.03% → ±0.01% | 20 → 20 | -0.2% |
| geotiff rendering | 2.1 → 2.5 | 454.8 → 376.2 | 480.0 → 408.4 | 485.7 → 408.2 | 487.4 → 421.1 | 579.5 → 450.7 | ±2.87% → ±2.17% | 20 → 20 | -14.9% |
| mirrored selection | 1.0 → 1.6 | 941.2 → 567.2 | 980.4 → 606.4 | 1000.4 → 613.9 | 1027.0 → 638.2 | 1137.6 → 695.9 | ±2.52% → ±2.92% | 20 → 20 | -38.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–15** | **0 → 0** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 4 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 25 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 9512K | 206 |

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
