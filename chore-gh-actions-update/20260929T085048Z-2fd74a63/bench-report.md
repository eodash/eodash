### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

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
| date snap | 126.0 → 87.5 | 2.2 → 6.5 | 9.6 → 12.0 | 9.1 → 12.2 | 10.0 → 12.9 | 11.3 → 19.2 | ±10.67% → ±12.61% | 20 → 20 | +24.4% |
| layer datetime | 108.7 → 92.3 | 8.4 → 9.0 | 8.7 → 11.7 | 12.1 → 11.1 | 8.9 → 12.7 | 62.7 → 13.8 | ±57.19% → ±7.81% | 20 → 20 | +34.7% |
| explore item | 113.7 → 59.8 | 7.1 → 10.1 | 8.8 → 16.4 | 9.3 → 18.8 | 9.5 → 18.5 | 17.8 → 46.5 | ±13.55% → ±21.50% | 20 → 20 | +88.0% |
| links=1 | 75.5 → 58.1 | 12.8 → 15.0 | 13.0 → 17.1 | 13.3 → 17.3 | 13.2 → 17.4 | 14.8 → 21.0 | ±2.19% → ±3.22% | 20 → 20 | +31.5% |
| links=10 | 73.6 → 57.3 | 13.1 → 16.7 | 13.3 → 17.4 | 13.6 → 17.5 | 13.7 → 17.6 | 15.1 → 18.1 | ±2.46% → ±0.92% | 20 → 20 | +30.8% |
| geozarr bands | 32.0 → 31.2 | 18.3 → 18.8 | 34.4 → 34.4 | 33.3 → 35.5 | 40.8 → 44.6 | 44.6 → 54.7 | ±11.50% → ±15.07% | 20 → 20 | = |
| links=100 | 62.0 → 46.1 | 15.5 → 19.6 | 15.7 → 21.7 | 16.2 → 21.7 | 16.2 → 21.9 | 19.7 → 24.6 | ±3.29% → ±2.28% | 20 → 20 | +37.9% |
| poi selection | 35.0 → 16.1 | 23.1 → 41.7 | 28.9 → 67.0 | 28.9 → 65.0 | 31.2 → 74.4 | 34.7 → 83.1 | ±5.17% → ±9.02% | 20 → 20 | +132.4% |
| vector rendering | 18.6 → 13.7 | 47.0 → 55.0 | 49.1 → 87.4 | 56.4 → 77.5 | 52.5 → 91.3 | 96.1 → 107.0 | ±12.65% → ±11.61% | 20 → 20 | +78.3% |
| select indicator | 24.6 → 12.3 | 27.1 → 60.0 | 44.5 → 91.3 | 43.6 → 84.7 | 51.6 → 97.2 | 67.0 → 110.7 | ±12.50% → ±9.50% | 20 → 20 | +105.1% |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.3 | 305.0 → 305.7 | 305.0 → 305.7 | 305.1 → 305.8 | 305.3 → 306.1 | ±0.02% → ±0.03% | 20 → 20 | +0.2% |
| geotiff rendering | 2.4 → 2.1 | 369.6 → 438.7 | 406.3 → 478.9 | 424.7 → 484.0 | 414.6 → 488.5 | 645.3 → 565.7 | ±7.50% → ±2.98% | 20 → 20 | +17.9% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 976.1 | 569.2 → 1028.1 | 580.2 → 1036.5 | 584.0 → 1039.1 | 690.4 → 1148.4 | ±3.35% → ±2.20% | 20 → 20 | +80.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1** | **0 → 0–1** | **0 → 0–0K** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–9** | **0 → 0** |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
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
|  | `/tests/support/assets/tile.png` | 0 | 1 | 0K | 200 |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 13 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 10 | 0 | 404 |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11958K | 206 |

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
