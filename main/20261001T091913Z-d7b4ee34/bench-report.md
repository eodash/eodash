### Benchmarks

Previous run → this run. Baseline [`43546bbbb08c74a5fc511718631e01e32ccc8d62`](https://github.com/eodash/eodash/commit/43546bbbb08c74a5fc511718631e01e32ccc8d62), 2026-10-01T08:22:17.884Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 116.4 → 93.1 | 3.7 → 7.9 | 9.2 → 10.8 | 9.4 → 11.2 | 9.7 → 13.0 | 19.1 → 15.6 | ±15.71% → ±10.35% | 20 → 20 | +17.4% |
| layer datetime | 110.0 → 96.3 | 8.5 → 8.7 | 8.6 → 9.4 | 13.2 → 12.2 | 8.7 → 12.1 | 81.9 → 43.4 | ±71.54% → ±35.27% | 20 → 20 | +8.7% |
| explore item | 91.5 → 70.7 | 8.2 → 9.8 | 11.3 → 13.9 | 11.6 → 15.1 | 12.8 → 17.3 | 18.6 → 24.6 | ±11.95% → ±12.79% | 20 → 20 | +23.6% |
| links=1 | 68.9 → 63.5 | 13.1 → 13.5 | 13.3 → 16.6 | 16.1 → 15.9 | 15.5 → 17.1 | 46.6 → 17.9 | ±25.99% → ±4.81% | 20 → 20 | +25.3% |
| links=10 | 70.2 → 58.8 | 13.4 → 14.1 | 13.6 → 17.4 | 14.3 → 17.1 | 15.3 → 17.6 | 16.5 → 18.4 | ±3.56% → ±3.28% | 20 → 20 | +28.3% |
| links=100 | 54.1 → 47.5 | 16.8 → 18.9 | 19.0 → 21.3 | 18.6 → 21.1 | 19.7 → 21.8 | 20.3 → 23.1 | ±3.38% → ±2.52% | 20 → 20 | +12.4% |
| geozarr bands | 31.4 → 30.3 | 20.4 → 25.3 | 34.5 → 35.7 | 34.2 → 34.7 | 42.4 → 40.2 | 44.8 → 50.6 | ±11.62% → ±10.82% | 20 → 20 | = |
| poi selection | 27.2 → 19.4 | 26.8 → 35.6 | 35.1 → 56.5 | 39.3 → 54.9 | 46.3 → 64.2 | 61.9 → 85.1 | ±13.21% → ±12.22% | 20 → 20 | +61.1% |
| vector rendering | 17.3 → 14.1 | 48.0 → 53.5 | 54.1 → 77.9 | 60.9 → 74.8 | 76.0 → 91.8 | 89.8 → 95.2 | ±11.53% → ±11.00% | 20 → 20 | = |
| select indicator | 18.7 → 15.6 | 32.2 → 55.2 | 54.6 → 63.7 | 57.4 → 65.1 | 69.5 → 68.9 | 92.9 → 85.2 | ±12.98% → ±5.71% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 304.9 → 305.2 | 305.1 → 305.5 | 305.2 → 305.5 | 305.2 → 305.6 | 305.5 → 306.0 | ±0.02% → ±0.03% | 20 → 20 | +0.1% |
| geotiff rendering | 2.2 → 2.1 | 426.6 → 454.8 | 447.4 → 480.0 | 463.8 → 485.7 | 480.4 → 487.4 | 580.7 → 579.5 | ±4.08% → ±2.87% | 20 → 20 | = |
| mirrored selection | 1.2 → 1.0 | 745.5 → 941.2 | 781.2 → 980.4 | 804.9 → 1000.4 | 833.1 → 1027.0 | 967.5 → 1137.6 | ±3.74% → ±2.52% | 20 → 20 | +25.5% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–8 → 0–13** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 28 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 37 | 0 | 404 |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11041K | 206 |

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
