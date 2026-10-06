### Benchmarks

Previous run → this run. Baseline [`d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10`](https://github.com/eodash/eodash/commit/d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10), 2026-10-01T09:19:13.552Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
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
| date snap | 93.1 → 132.1 | 7.9 → 6.6 | 10.8 → 7.3 | 11.2 → 7.8 | 13.0 → 7.8 | 15.6 → 11.6 | ±10.35% → ±9.28% | 20 → 20 | -32.9% |
| explore item | 70.7 → 86.0 | 9.8 → 8.5 | 13.9 → 11.8 | 15.1 → 12.6 | 17.3 → 17.1 | 24.6 → 18.7 | ±12.79% → ±13.82% | 20 → 20 | -14.7% |
| layer datetime | 96.3 → 104.9 | 8.7 → 8.5 | 9.4 → 8.7 | 12.2 → 13.2 | 12.1 → 8.9 | 43.4 → 67.1 | ±35.27% → ±54.99% | 20 → 20 | -7.0% |
| links=1 | 63.5 → 67.4 | 13.5 → 13.2 | 16.6 → 13.5 | 15.9 → 16.0 | 17.1 → 16.1 | 17.9 → 40.3 | ±4.81% → ±20.85% | 20 → 20 | -18.7% |
| links=10 | 58.8 → 69.4 | 14.1 → 13.4 | 17.4 → 13.7 | 17.1 → 14.5 | 17.6 → 15.7 | 18.4 → 16.6 | ±3.28% → ±3.85% | 20 → 20 | -21.8% |
| links=100 | 47.5 → 53.3 | 18.9 → 17.0 | 21.3 → 19.1 | 21.1 → 18.8 | 21.8 → 19.6 | 23.1 → 21.5 | ±2.52% → ±3.52% | 20 → 20 | -10.1% |
| geozarr bands | 30.3 → 32.8 | 25.3 → 19.7 | 35.7 → 32.8 | 34.7 → 32.1 | 40.2 → 34.2 | 50.6 → 51.9 | ±10.82% → ±11.43% | 20 → 20 | = |
| poi selection | 19.4 → 26.9 | 35.6 → 28.9 | 56.5 → 36.4 | 54.9 → 38.4 | 64.2 → 40.6 | 85.1 → 54.6 | ±12.22% → ±9.52% | 20 → 20 | -35.4% |
| select indicator | 15.6 → 19.4 | 55.2 → 34.4 | 63.7 → 50.1 | 65.1 → 55.7 | 68.9 → 70.5 | 85.2 → 87.7 | ±5.71% → ±13.71% | 20 → 20 | -21.2% |
| vector rendering | 14.1 → 17.0 | 53.5 → 47.0 | 77.9 → 50.3 | 74.8 → 63.9 | 91.8 → 85.3 | 95.2 → 106.0 | ±11.00% → ±15.32% | 20 → 20 | -35.5% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.5 → 305.2 | 305.5 → 305.3 | 305.6 → 305.3 | 306.0 → 305.7 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.2 | 454.8 → 421.2 | 480.0 → 436.3 | 485.7 → 446.7 | 487.4 → 457.2 | 579.5 → 519.3 | ±2.87% → ±2.89% | 20 → 20 | -9.1% |
| mirrored selection | 1.0 → 1.2 | 941.2 → 765.2 | 980.4 → 807.3 | 1000.4 → 810.1 | 1027.0 → 821.3 | 1137.6 → 874.8 | ±2.52% → ±1.82% | 20 → 20 | -17.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–23** | **0 → 0** |
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
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 6 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 34 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 9818K | 206 |

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
