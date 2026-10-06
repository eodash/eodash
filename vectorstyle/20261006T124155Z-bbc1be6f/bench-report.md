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
| date snap | 93.1 → 91.3 | 7.9 → 7.7 | 10.8 → 11.1 | 11.2 → 11.6 | 13.0 → 13.3 | 15.6 → 20.9 | ±10.35% → ±13.20% | 20 → 20 | = |
| layer datetime | 96.3 → 90.7 | 8.7 → 9.0 | 9.4 → 11.2 | 12.2 → 13.5 | 12.1 → 12.5 | 43.4 → 55.8 | ±35.27% → ±42.91% | 20 → 20 | = |
| explore item | 70.7 → 68.3 | 9.8 → 9.5 | 13.9 → 14.0 | 15.1 → 16.1 | 17.3 → 16.2 | 24.6 → 35.4 | ±12.79% → ±18.55% | 20 → 20 | = |
| links=1 | 63.5 → 59.6 | 13.5 → 13.7 | 16.6 → 17.0 | 15.9 → 16.8 | 17.1 → 17.3 | 17.9 → 18.0 | ±4.81% → ±2.66% | 20 → 20 | = |
| links=10 | 58.8 → 57.9 | 14.1 → 16.1 | 17.4 → 17.1 | 17.1 → 17.3 | 17.6 → 17.7 | 18.4 → 18.5 | ±3.28% → ±1.72% | 20 → 20 | = |
| links=100 | 47.5 → 48.4 | 18.9 → 19.0 | 21.3 → 21.3 | 21.1 → 20.7 | 21.8 → 21.7 | 23.1 → 22.9 | ±2.52% → ±3.01% | 20 → 20 | = |
| geozarr bands | 30.3 → 28.8 | 25.3 → 25.4 | 35.7 → 33.7 | 34.7 → 36.1 | 40.2 → 43.3 | 50.6 → 47.3 | ±10.82% → ±9.57% | 20 → 20 | = |
| poi selection | 19.4 → 23.1 | 35.6 → 36.5 | 56.5 → 44.0 | 54.9 → 43.9 | 64.2 → 47.6 | 85.1 → 56.1 | ±12.22% → ±5.88% | 20 → 20 | = |
| select indicator | 15.6 → 13.2 | 55.2 → 56.2 | 63.7 → 75.4 | 65.1 → 78.8 | 68.9 → 91.4 | 85.2 → 107.1 | ±5.71% → ±9.95% | 20 → 20 | +18.4% |
| vector rendering | 14.1 → 10.0 | 53.5 → 90.1 | 77.9 → 98.3 | 74.8 → 100.3 | 91.8 → 99.3 | 95.2 → 114.8 | ±11.00% → ±2.95% | 20 → 20 | +26.1% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.3 | 305.5 → 305.6 | 305.5 → 305.6 | 305.6 → 305.7 | 306.0 → 306.0 | ±0.03% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 454.8 → 430.8 | 480.0 → 463.4 | 485.7 → 480.2 | 487.4 → 489.8 | 579.5 → 598.0 | ±2.87% → ±4.04% | 20 → 20 | -3.5% |
| mirrored selection | 1.0 → 1.0 | 941.2 → 955.8 | 980.4 → 1009.2 | 1000.4 → 1029.7 | 1027.0 → 1055.1 | 1137.6 → 1212.0 | ±2.52% → ±3.27% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–9** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 38 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 32 | 0 | 404 |
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
