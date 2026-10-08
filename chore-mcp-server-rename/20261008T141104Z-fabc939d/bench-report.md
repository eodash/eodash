### Benchmarks

Previous run → this run. Baseline [`e3e70cad52ad367cb999c58df4a75152ab11b671`](https://github.com/eodash/eodash/commit/e3e70cad52ad367cb999c58df4a75152ab11b671), 2026-10-08T13:57:23.000Z.

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
| layer datetime | 92.2 → 94.7 | 8.9 → 8.7 | 10.5 → 9.4 | 11.4 → 12.4 | 12.5 → 12.2 | 20.1 → 43.5 | ±12.24% → ±34.56% | 20 → 20 | = |
| explore item | 70.3 → 77.1 | 8.3 → 9.4 | 14.6 → 12.3 | 15.8 → 14.0 | 17.2 → 15.5 | 34.3 → 23.4 | ±18.37% → ±14.29% | 20 → 20 | = |
| links=1 | 58.7 → 60.4 | 14.8 → 13.4 | 17.0 → 16.9 | 17.1 → 16.7 | 17.6 → 17.4 | 18.1 → 18.4 | ±2.07% → ±3.48% | 20 → 20 | = |
| links=10 | 57.2 → 59.6 | 16.9 → 13.9 | 17.5 → 17.4 | 17.5 → 16.9 | 17.6 → 17.7 | 17.9 → 18.3 | ±0.68% → ±3.78% | 20 → 20 | = |
| links=100 | 47.4 → 49.6 | 19.1 → 18.7 | 20.9 → 19.5 | 21.2 → 20.3 | 21.5 → 21.5 | 24.1 → 23.0 | ±2.51% → ±3.35% | 20 → 20 | -6.9% |
| geozarr bands | 30.9 → 28.6 | 25.2 → 22.6 | 30.6 → 40.6 | 34.0 → 37.2 | 34.2 → 43.2 | 55.6 → 52.8 | ±11.84% → ±11.22% | 20 → 20 | = |
| poi selection | 15.3 → 18.7 | 45.1 → 35.7 | 69.1 → 56.0 | 68.4 → 56.6 | 79.2 → 67.7 | 92.2 → 77.3 | ±9.94% → ±10.93% | 20 → 20 | = |
| select indicator | 14.2 → 15.2 | 44.8 → 38.2 | 81.3 → 69.1 | 75.7 → 69.9 | 89.3 → 81.7 | 106.1 → 105.0 | ±12.22% → ±11.89% | 20 → 20 | = |
| vector rendering | 13.3 → 13.4 | 57.5 → 53.2 | 75.6 → 89.5 | 79.2 → 81.3 | 90.5 → 92.1 | 135.6 → 143.7 | ±11.94% → ±14.26% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.5 → 305.3 | 305.7 → 305.6 | 305.8 → 305.6 | 305.9 → 305.7 | 306.8 → 306.0 | ±0.05% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.0 → 2.1 | 471.9 → 451.4 | 491.0 → 482.8 | 497.3 → 489.4 | 496.6 → 519.2 | 581.0 → 551.4 | ±2.63% → ±3.12% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 980.3 → 944.6 | 1033.9 → 987.8 | 1051.3 → 995.8 | 1075.8 → 996.1 | 1200.4 → 1103.6 | ±2.90% → ±1.86% | 20 → 20 | -4.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1–2** | **0 → 0** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–6 → 0–7** | **0 → 0** |
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
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 26 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 31 | 0 | 404 |
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
