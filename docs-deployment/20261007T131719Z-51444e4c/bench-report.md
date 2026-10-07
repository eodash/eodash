### Benchmarks

Previous run → this run. Baseline [`33a7c279a9aa62e61a3274eb1de4af3afdca0a35`](https://github.com/eodash/eodash/commit/33a7c279a9aa62e61a3274eb1de4af3afdca0a35), 2026-10-07T12:00:33.743Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 132.9 → 86.3 | 4.2 → 8.1 | 7.6 → 11.5 | 7.8 → 12.3 | 7.9 → 13.6 | 11.5 → 22.5 | ±8.26% → ±13.66% | 20 → 20 | +52.0% |
| layer datetime | 106.4 → 89.8 | 8.4 → 9.0 | 8.7 → 10.5 | 10.8 → 14.3 | 8.8 → 12.6 | 31.5 → 64.0 | ±27.91% → ±47.26% | 20 → 20 | +20.7% |
| explore item | 81.5 → 69.0 | 8.6 → 9.4 | 11.8 → 15.5 | 13.2 → 15.6 | 13.6 → 18.1 | 28.4 → 23.7 | ±16.72% → ±12.76% | 20 → 20 | +30.8% |
| links=1 | 71.5 → 58.8 | 12.9 → 15.2 | 13.1 → 17.1 | 15.0 → 17.0 | 14.4 → 17.3 | 38.1 → 17.6 | ±20.90% → ±1.40% | 20 → 20 | +30.4% |
| links=10 | 72.9 → 57.6 | 13.1 → 16.9 | 13.3 → 17.4 | 13.8 → 17.4 | 13.8 → 17.4 | 15.4 → 17.8 | ±2.92% → ±0.65% | 20 → 20 | +30.5% |
| links=100 | 61.7 → 47.3 | 15.6 → 19.1 | 16.1 → 21.3 | 16.2 → 21.2 | 16.6 → 21.8 | 17.5 → 23.3 | ±1.62% → ±2.57% | 20 → 20 | +32.3% |
| geozarr bands | 34.3 → 29.6 | 19.6 → 24.6 | 29.9 → 31.4 | 31.5 → 35.4 | 35.6 → 42.0 | 60.8 → 50.2 | ±15.31% → ±10.56% | 20 → 20 | = |
| select indicator | 22.2 → 14.4 | 25.2 → 36.3 | 51.1 → 79.5 | 51.9 → 75.9 | 68.6 → 91.4 | 86.0 → 109.3 | ±17.43% → ±12.79% | 20 → 20 | +55.6% |
| poi selection | 31.1 → 16.3 | 23.9 → 38.8 | 32.2 → 69.1 | 33.3 → 65.3 | 34.8 → 73.5 | 49.5 → 99.1 | ±9.31% → ±11.41% | 20 → 20 | +114.4% |
| vector rendering | 18.5 → 13.6 | 45.8 → 54.4 | 49.1 → 89.6 | 56.2 → 78.3 | 57.7 → 91.9 | 85.1 → 107.0 | ±10.58% → ±11.50% | 20 → 20 | +82.4% |
| mosaic scrub | 3.3 → 3.3 | 305.0 → 305.3 | 305.3 → 305.5 | 305.3 → 305.5 | 305.4 → 305.6 | 305.7 → 306.0 | ±0.03% → ±0.03% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.1 | 383.4 → 457.3 | 396.1 → 482.7 | 413.9 → 484.8 | 410.5 → 487.1 | 532.1 → 545.8 | ±4.65% → ±2.21% | 20 → 20 | +21.9% |
| mirrored selection | 1.5 → 1.0 | 602.4 → 966.2 | 639.2 → 994.9 | 658.4 → 1025.1 | 676.0 → 1071.3 | 820.1 → 1136.6 | ±4.08% → ±2.58% | 20 → 20 | +55.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–6** | **0 → 0** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 31 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 26 | 0 | 404 |
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
