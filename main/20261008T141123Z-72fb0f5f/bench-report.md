### Benchmarks

Previous run → this run. Baseline [`e3e70cad52ad367cb999c58df4a75152ab11b671`](https://github.com/eodash/eodash/commit/e3e70cad52ad367cb999c58df4a75152ab11b671), 2026-10-08T13:57:23.000Z.

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
| date snap | 90.0 → 91.6 | 7.7 → 7.9 | 11.0 → 11.3 | 11.9 → 11.6 | 14.8 → 13.0 | 17.2 → 18.4 | ±12.40% → ±12.12% | 20 → 20 | = |
| layer datetime | 92.2 → 91.3 | 8.9 → 8.9 | 10.5 → 11.1 | 11.4 → 13.0 | 12.5 → 12.4 | 20.1 → 47.1 | ±12.24% → ±36.34% | 20 → 20 | = |
| explore item | 70.3 → 64.4 | 8.3 → 10.0 | 14.6 → 16.1 | 15.8 → 16.3 | 17.2 → 17.5 | 34.3 → 23.4 | ±18.37% → ±10.59% | 20 → 20 | = |
| links=1 | 58.7 → 57.6 | 14.8 → 16.2 | 17.0 → 17.1 | 17.1 → 17.5 | 17.6 → 17.4 | 18.1 → 22.7 | ±2.07% → ±4.14% | 20 → 20 | = |
| links=10 | 57.2 → 57.8 | 16.9 → 16.3 | 17.5 → 17.4 | 17.5 → 17.3 | 17.6 → 17.5 | 17.9 → 18.0 | ±0.68% → ±0.99% | 20 → 20 | = |
| links=100 | 47.4 → 47.5 | 19.1 → 19.1 | 20.9 → 21.1 | 21.2 → 21.1 | 21.5 → 21.8 | 24.1 → 24.5 | ±2.51% → ±3.24% | 20 → 20 | = |
| geozarr bands | 30.9 → 28.9 | 25.2 → 23.3 | 30.6 → 40.1 | 34.0 → 37.9 | 34.2 → 46.4 | 55.6 → 57.9 | ±11.84% → ±14.13% | 20 → 20 | = |
| poi selection | 15.3 → 16.4 | 45.1 → 41.4 | 69.1 → 65.4 | 68.4 → 65.4 | 79.2 → 77.6 | 92.2 → 110.0 | ±9.94% → ±13.26% | 20 → 20 | = |
| select indicator | 14.2 → 14.3 | 44.8 → 46.9 | 81.3 → 72.6 | 75.7 → 73.4 | 89.3 → 84.2 | 106.1 → 102.8 | ±12.22% → ±10.47% | 20 → 20 | = |
| vector rendering | 13.3 → 13.8 | 57.5 → 55.2 | 75.6 → 86.0 | 79.2 → 76.9 | 90.5 → 90.1 | 135.6 → 108.7 | ±11.94% → ±11.41% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.5 → 305.3 | 305.7 → 305.6 | 305.8 → 305.6 | 305.9 → 305.7 | 306.8 → 305.9 | ±0.05% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.0 → 2.1 | 471.9 → 427.5 | 491.0 → 464.5 | 497.3 → 474.2 | 496.6 → 476.1 | 581.0 → 559.6 | ±2.63% → ±3.19% | 20 → 20 | -5.4% |
| mirrored selection | 1.0 → 1.0 | 980.3 → 955.5 | 1033.9 → 995.4 | 1051.3 → 1022.2 | 1075.8 → 1022.3 | 1200.4 → 1263.6 | ±2.90% → ±3.64% | 20 → 20 | -3.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–6 → 0–14** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 9 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 20 | 0 | 404 |
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
