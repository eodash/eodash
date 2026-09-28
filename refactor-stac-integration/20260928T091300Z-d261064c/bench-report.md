### Benchmarks

Previous run → this run. Baseline [`6c762401a4e35131e58d22198b8ce0040e3278db`](https://github.com/eodash/eodash/commit/6c762401a4e35131e58d22198b8ce0040e3278db), 2026-09-28T08:57:13.319Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 30.0 → 91.4 | 29.9 → 7.9 | 33.3 → 11.6 | 33.4 → 11.3 | 33.8 → 12.0 | 36.7 → 17.1 | ±1.86% → ±9.09% | 20 → 20 | -65.3% |
| layer datetime | 105.0 → 89.4 | 8.6 → 9.1 | 8.8 → 10.2 | 9.9 → 13.4 | 10.1 → 12.9 | 16.9 → 48.2 | ±10.75% → ±35.57% | 20 → 20 | = |
| explore item | 103.7 → 57.4 | 7.6 → 13.1 | 8.9 → 16.6 | 10.0 → 18.5 | 10.7 → 19.2 | 16.0 → 33.7 | ±10.36% → ±13.53% | 20 → 20 | +85.5% |
| links=10 | 68.4 → 57.7 | 13.8 → 15.4 | 14.2 → 17.5 | 14.7 → 17.4 | 15.2 → 17.7 | 16.8 → 18.2 | ±3.03% → ±1.64% | 20 → 20 | +23.2% |
| links=1 | 69.9 → 58.9 | 13.2 → 16.1 | 13.4 → 16.9 | 14.4 → 17.0 | 15.9 → 17.3 | 17.0 → 18.1 | ±4.74% → ±1.38% | 20 → 20 | +25.7% |
| links=100 | 45.2 → 46.4 | 20.2 → 19.2 | 22.2 → 21.4 | 22.2 → 21.7 | 22.8 → 21.8 | 25.6 → 25.1 | ±2.89% → ±3.24% | 20 → 20 | = |
| geozarr bands | 36.3 → 29.5 | 20.2 → 26.0 | 31.0 → 33.7 | 29.2 → 35.3 | 33.2 → 42.1 | 48.9 → 48.6 | ±12.35% → ±9.91% | 20 → 20 | = |
| poi selection | 20.8 → 23.5 | 34.3 → 33.5 | 47.6 → 42.1 | 49.6 → 44.1 | 52.6 → 46.5 | 82.1 → 69.3 | ±9.90% → ±9.91% | 20 → 20 | -11.6% |
| select indicator | 10.3 → 15.7 | 79.8 → 53.8 | 95.7 → 61.6 | 98.1 → 65.5 | 106.8 → 66.1 | 122.1 → 101.9 | ±5.47% → ±9.37% | 20 → 20 | -35.6% |
| vector rendering | 16.6 → 13.5 | 46.3 → 54.5 | 52.6 → 82.6 | 66.7 → 78.8 | 78.1 → 90.7 | 133.2 → 126.3 | ±17.56% → ±12.17% | 20 → 20 | = |
| mosaic scrub | 3.2 → 3.3 | 309.4 → 305.3 | 309.6 → 305.5 | 309.6 → 305.5 | 309.7 → 305.6 | 310.1 → 306.0 | ±0.03% → ±0.03% | 20 → 20 | -1.3% |
| geotiff rendering | 2.8 → 2.1 | 71.6 → 443.6 | 455.4 → 484.1 | 435.1 → 488.4 | 466.6 → 492.0 | 495.4 → 549.8 | ±9.47% → ±2.48% | 20 → 20 | +6.3% |
| mirrored selection | 0.6 → 0.8 | 1560.0 → 1173.4 | 1705.1 → 1223.0 | 1720.6 → 1244.8 | 1760.3 → 1251.5 | 1962.6 → 1451.1 | ±2.77% → ±2.71% | 20 → 20 | -28.3% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–6** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 2 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **3 → 2** | **1 → 6** | **0 → 338K–644K** |

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
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 28 | 0 | 404 |
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
