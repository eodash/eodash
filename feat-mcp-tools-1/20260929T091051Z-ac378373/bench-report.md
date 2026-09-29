### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

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
| date snap | 126.0 → 101.6 | 2.2 → 3.8 | 9.6 → 10.0 | 9.1 → 11.2 | 10.0 → 12.3 | 11.3 → 21.0 | ±10.67% → ±16.90% | 20 → 20 | = |
| explore item | 113.7 → 70.1 | 7.1 → 7.0 | 8.8 → 14.4 | 9.3 → 15.3 | 9.5 → 16.9 | 17.8 → 25.5 | ±13.55% → ±12.36% | 20 → 20 | +64.0% |
| layer datetime | 108.7 → 97.9 | 8.4 → 8.8 | 8.7 → 9.2 | 12.1 → 12.0 | 8.9 → 11.6 | 62.7 → 43.7 | ±57.19% → ±36.11% | 20 → 20 | = |
| links=1 | 75.5 → 61.3 | 12.8 → 13.6 | 13.0 → 16.9 | 13.3 → 16.4 | 13.2 → 17.2 | 14.8 → 18.0 | ±2.19% → ±3.90% | 20 → 20 | +29.6% |
| links=10 | 73.6 → 58.8 | 13.1 → 14.0 | 13.3 → 17.4 | 13.6 → 17.1 | 13.7 → 17.6 | 15.1 → 17.9 | ±2.46% → ±2.91% | 20 → 20 | +30.8% |
| links=100 | 62.0 → 47.1 | 15.5 → 18.3 | 15.7 → 21.5 | 16.2 → 21.3 | 16.2 → 22.2 | 19.7 → 23.3 | ±3.29% → ±3.05% | 20 → 20 | +36.9% |
| geozarr bands | 32.0 → 30.5 | 18.3 → 24.3 | 34.4 → 36.8 | 33.3 → 34.7 | 40.8 → 41.5 | 44.6 → 48.9 | ±11.50% → ±11.24% | 20 → 20 | = |
| poi selection | 35.0 → 20.2 | 23.1 → 35.1 | 28.9 → 52.0 | 28.9 → 52.3 | 31.2 → 61.1 | 34.7 → 71.8 | ±5.17% → ±10.87% | 20 → 20 | +80.2% |
| select indicator | 24.6 → 15.0 | 27.1 → 48.3 | 44.5 → 71.2 | 43.6 → 69.6 | 51.6 → 80.8 | 67.0 → 91.8 | ±12.50% → ±9.55% | 20 → 20 | +60.0% |
| vector rendering | 18.6 → 14.1 | 47.0 → 53.2 | 49.1 → 81.9 | 56.4 → 75.2 | 52.5 → 92.1 | 96.1 → 97.8 | ±12.65% → ±11.21% | 20 → 20 | +66.9% |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.3 | 305.0 → 305.4 | 305.0 → 305.5 | 305.1 → 305.6 | 305.3 → 305.9 | ±0.02% → ±0.03% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.1 | 369.6 → 448.4 | 406.3 → 483.2 | 424.7 → 482.8 | 414.6 → 491.7 | 645.3 → 524.4 | ±7.50% → ±1.89% | 20 → 20 | +18.9% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 926.4 | 569.2 → 1002.2 | 580.2 → 1002.2 | 584.0 → 1035.7 | 690.4 → 1109.5 | ±3.35% → ±2.36% | 20 → 20 | +76.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–7** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 22 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 25 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11652K | 206 |

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
