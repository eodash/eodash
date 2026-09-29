### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

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
| date snap | 126.0 → 105.3 | 2.2 → 3.7 | 9.6 → 10.7 | 9.1 → 10.6 | 10.0 → 12.8 | 11.3 → 17.2 | ±10.67% → ±14.06% | 20 → 20 | +11.4% |
| layer datetime | 108.7 → 96.7 | 8.4 → 8.6 | 8.7 → 9.1 | 12.1 → 13.2 | 8.9 → 12.4 | 62.7 → 59.4 | ±57.19% → ±48.12% | 20 → 20 | = |
| explore item | 113.7 → 82.8 | 7.1 → 9.0 | 8.8 → 11.4 | 9.3 → 13.3 | 9.5 → 13.3 | 17.8 → 26.1 | ±13.55% → ±17.78% | 20 → 20 | +29.7% |
| links=1 | 75.5 → 66.4 | 12.8 → 13.2 | 13.0 → 15.8 | 13.3 → 15.3 | 13.2 → 16.9 | 14.8 → 17.5 | ±2.19% → ±5.34% | 20 → 20 | +21.5% |
| links=10 | 73.6 → 65.2 | 13.1 → 13.6 | 13.3 → 15.9 | 13.6 → 15.5 | 13.7 → 16.6 | 15.1 → 17.7 | ±2.46% → ±4.61% | 20 → 20 | +19.5% |
| links=100 | 62.0 → 51.1 | 15.5 → 17.7 | 15.7 → 19.6 | 16.2 → 19.7 | 16.2 → 20.1 | 19.7 → 23.6 | ±3.29% → ±3.65% | 20 → 20 | +24.5% |
| geozarr bands | 32.0 → 32.2 | 18.3 → 19.8 | 34.4 → 33.0 | 33.3 → 33.3 | 40.8 → 39.8 | 44.6 → 47.4 | ±11.50% → ±11.87% | 20 → 20 | = |
| poi selection | 35.0 → 28.2 | 23.1 → 28.7 | 28.9 → 35.9 | 28.9 → 36.0 | 31.2 → 37.0 | 34.7 → 45.1 | ±5.17% → ±5.83% | 20 → 20 | +24.4% |
| select indicator | 24.6 → 17.1 | 27.1 → 35.6 | 44.5 → 58.7 | 43.6 → 65.6 | 51.6 → 73.1 | 67.0 → 138.2 | ±12.50% → ±18.53% | 20 → 20 | +32.0% |
| vector rendering | 18.6 → 16.0 | 47.0 → 46.1 | 49.1 → 55.1 | 56.4 → 67.9 | 52.5 → 90.3 | 96.1 → 96.6 | ±12.65% → ±13.99% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.1 | 305.0 → 305.3 | 305.0 → 305.4 | 305.1 → 305.4 | 305.3 → 305.7 | ±0.02% → ±0.03% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.2 | 369.6 → 420.7 | 406.3 → 447.2 | 424.7 → 454.1 | 414.6 → 456.5 | 645.3 → 523.8 | ±7.50% → ±2.69% | 20 → 20 | +10.1% |
| mirrored selection | 1.7 → 1.2 | 541.3 → 764.3 | 569.2 → 811.5 | 580.2 → 820.1 | 584.0 → 833.7 | 690.4 → 909.2 | ±3.35% → ±2.22% | 20 → 20 | +42.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–15** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 22 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 5 | 0 | 404 |
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
