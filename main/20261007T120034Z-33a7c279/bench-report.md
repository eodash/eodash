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
| date snap | 93.1 → 132.9 | 7.9 → 4.2 | 10.8 → 7.6 | 11.2 → 7.8 | 13.0 → 7.9 | 15.6 → 11.5 | ±10.35% → ±8.26% | 20 → 20 | -29.6% |
| layer datetime | 96.3 → 106.4 | 8.7 → 8.4 | 9.4 → 8.7 | 12.2 → 10.8 | 12.1 → 8.8 | 43.4 → 31.5 | ±35.27% → ±27.91% | 20 → 20 | -7.0% |
| explore item | 70.7 → 81.5 | 9.8 → 8.6 | 13.9 → 11.8 | 15.1 → 13.2 | 17.3 → 13.6 | 24.6 → 28.4 | ±12.79% → ±16.72% | 20 → 20 | -14.7% |
| links=1 | 63.5 → 71.5 | 13.5 → 12.9 | 16.6 → 13.1 | 15.9 → 15.0 | 17.1 → 14.4 | 17.9 → 38.1 | ±4.81% → ±20.90% | 20 → 20 | -20.8% |
| links=10 | 58.8 → 72.9 | 14.1 → 13.1 | 17.4 → 13.3 | 17.1 → 13.8 | 17.6 → 13.8 | 18.4 → 15.4 | ±3.28% → ±2.92% | 20 → 20 | -23.8% |
| links=100 | 47.5 → 61.7 | 18.9 → 15.6 | 21.3 → 16.1 | 21.1 → 16.2 | 21.8 → 16.6 | 23.1 → 17.5 | ±2.52% → ±1.62% | 20 → 20 | -24.4% |
| geozarr bands | 30.3 → 34.3 | 25.3 → 19.6 | 35.7 → 29.9 | 34.7 → 31.5 | 40.2 → 35.6 | 50.6 → 60.8 | ±10.82% → ±15.31% | 20 → 20 | = |
| poi selection | 19.4 → 31.1 | 35.6 → 23.9 | 56.5 → 32.2 | 54.9 → 33.3 | 64.2 → 34.8 | 85.1 → 49.5 | ±12.22% → ±9.31% | 20 → 20 | -43.0% |
| select indicator | 15.6 → 22.2 | 55.2 → 25.2 | 63.7 → 51.1 | 65.1 → 51.9 | 68.9 → 68.6 | 85.2 → 86.0 | ±5.71% → ±17.43% | 20 → 20 | -19.7% |
| vector rendering | 14.1 → 18.5 | 53.5 → 45.8 | 77.9 → 49.1 | 74.8 → 56.2 | 91.8 → 57.7 | 95.2 → 85.1 | ±11.00% → ±10.58% | 20 → 20 | -37.0% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.0 | 305.5 → 305.3 | 305.5 → 305.3 | 305.6 → 305.4 | 306.0 → 305.7 | ±0.03% → ±0.03% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.4 | 454.8 → 383.4 | 480.0 → 396.1 | 485.7 → 413.9 | 487.4 → 410.5 | 579.5 → 532.1 | ±2.87% → ±4.65% | 20 → 20 | -17.5% |
| mirrored selection | 1.0 → 1.5 | 941.2 → 602.4 | 980.4 → 639.2 | 1000.4 → 658.4 | 1027.0 → 676.0 | 1137.6 → 820.1 | ±2.52% → ±4.08% | 20 → 20 | -34.8% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–13** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 15 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 7 | 0 | 404 |
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
