### Benchmarks

Previous run → this run. Baseline [`d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10`](https://github.com/eodash/eodash/commit/d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10), 2026-10-01T09:19:13.552Z.

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
| layer datetime | 96.3 → 91.2 | 8.7 → 8.7 | 9.4 → 11.0 | 12.2 → 15.9 | 12.1 → 12.8 | 43.4 → 93.6 | ±35.27% → ±67.26% | 20 → 20 | = |
| explore item | 70.7 → 72.8 | 9.8 → 9.7 | 13.9 → 13.9 | 15.1 → 14.3 | 17.3 → 15.9 | 24.6 → 21.3 | ±12.79% → ±10.07% | 20 → 20 | = |
| links=1 | 63.5 → 59.2 | 13.5 → 13.4 | 16.6 → 16.8 | 15.9 → 17.3 | 17.1 → 17.1 | 17.9 → 27.8 | ±4.81% → ±8.76% | 20 → 20 | = |
| links=10 | 58.8 → 58.4 | 14.1 → 14.3 | 17.4 → 17.3 | 17.1 → 17.1 | 17.6 → 17.4 | 18.4 → 17.7 | ±3.28% → ±1.90% | 20 → 20 | = |
| geozarr bands | 30.3 → 30.2 | 25.3 → 17.5 | 35.7 → 38.3 | 34.7 → 35.7 | 40.2 → 41.3 | 50.6 → 49.9 | ±10.82% → ±12.05% | 20 → 20 | = |
| links=100 | 47.5 → 44.7 | 18.9 → 20.3 | 21.3 → 22.1 | 21.1 → 22.4 | 21.8 → 22.7 | 23.1 → 25.2 | ±2.52% → ±2.76% | 20 → 20 | +4.0% |
| poi selection | 19.4 → 16.7 | 35.6 → 37.0 | 56.5 → 71.9 | 54.9 → 66.3 | 64.2 → 82.0 | 85.1 → 96.7 | ±12.22% → ±14.11% | 20 → 20 | +27.4% |
| select indicator | 15.6 → 15.5 | 55.2 → 46.0 | 63.7 → 59.2 | 65.1 → 68.2 | 68.9 → 84.9 | 85.2 → 97.6 | ±5.71% → ±12.04% | 20 → 20 | = |
| vector rendering | 14.1 → 13.3 | 53.5 → 55.3 | 77.9 → 87.2 | 74.8 → 78.5 | 91.8 → 90.4 | 95.2 → 98.8 | ±11.00% → ±9.63% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.2 | 305.5 → 305.5 | 305.5 → 305.5 | 305.6 → 305.7 | 306.0 → 306.1 | ±0.03% → ±0.04% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 454.8 → 448.4 | 480.0 → 470.3 | 485.7 → 479.0 | 487.4 → 488.1 | 579.5 → 545.3 | ±2.87% → ±2.69% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 941.2 → 963.4 | 980.4 → 1010.1 | 1000.4 → 1026.0 | 1027.0 → 1056.8 | 1137.6 → 1184.3 | ±2.52% → ±2.75% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–8** | **0 → 0** |
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
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 8 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 11 | 0 | 404 |
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
