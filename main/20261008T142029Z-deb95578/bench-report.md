### Benchmarks

Previous run → this run. Baseline [`72fb0f5f855ea27d7a5c9ebf829ec76e991dc99a`](https://github.com/eodash/eodash/commit/72fb0f5f855ea27d7a5c9ebf829ec76e991dc99a), 2026-10-08T14:11:23.074Z.

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
| date snap | 91.6 → 92.6 | 7.9 → 5.0 | 11.3 → 11.7 | 11.6 → 12.0 | 13.0 → 13.1 | 18.4 → 26.2 | ±12.12% → ±18.01% | 20 → 20 | = |
| layer datetime | 91.3 → 94.2 | 8.9 → 9.0 | 11.1 → 10.6 | 13.0 → 10.9 | 12.4 → 12.3 | 47.1 → 14.9 | ±36.34% → ±8.17% | 20 → 20 | = |
| explore item | 64.4 → 60.1 | 10.0 → 11.8 | 16.1 → 15.7 | 16.3 → 18.9 | 17.5 → 18.3 | 23.4 → 43.1 | ±10.59% → ±21.96% | 20 → 20 | = |
| links=10 | 57.8 → 58.6 | 16.3 → 14.1 | 17.4 → 17.3 | 17.3 → 17.1 | 17.5 → 17.5 | 18.0 → 18.6 | ±0.99% → ±2.63% | 20 → 20 | = |
| links=1 | 57.6 → 58.7 | 16.2 → 15.6 | 17.1 → 17.1 | 17.5 → 17.1 | 17.4 → 17.3 | 22.7 → 19.1 | ±4.14% → ±2.12% | 20 → 20 | = |
| links=100 | 47.5 → 47.2 | 19.1 → 19.4 | 21.1 → 21.4 | 21.1 → 21.3 | 21.8 → 21.8 | 24.5 → 23.6 | ±3.24% → ±2.47% | 20 → 20 | = |
| geozarr bands | 28.9 → 29.9 | 23.3 → 25.0 | 40.1 → 31.6 | 37.9 → 34.9 | 46.4 → 42.4 | 57.9 → 47.6 | ±14.13% → ±9.79% | 20 → 20 | = |
| poi selection | 16.4 → 15.7 | 41.4 → 41.6 | 65.4 → 69.6 | 65.4 → 66.8 | 77.6 → 76.3 | 110.0 → 87.0 | ±13.26% → ±9.62% | 20 → 20 | = |
| select indicator | 14.3 → 14.9 | 46.9 → 43.2 | 72.6 → 71.8 | 73.4 → 72.4 | 84.2 → 91.3 | 102.8 → 102.0 | ±10.47% → ±12.46% | 20 → 20 | = |
| vector rendering | 13.8 → 13.5 | 55.2 → 57.0 | 86.0 → 71.8 | 76.9 → 78.1 | 90.1 → 96.8 | 108.7 → 105.8 | ±11.41% → ±11.00% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.3 | 305.6 → 305.6 | 305.6 → 305.6 | 305.7 → 305.7 | 305.9 → 306.3 | ±0.02% → ±0.04% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 427.5 → 430.2 | 464.5 → 461.8 | 474.2 → 471.6 | 476.1 → 474.3 | 559.6 → 554.7 | ±3.19% → ±2.94% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 955.5 → 956.8 | 995.4 → 973.3 | 1022.2 → 999.8 | 1022.3 → 1026.4 | 1263.6 → 1167.6 | ±3.64% → ±2.63% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–14 → 0–6** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 31 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 30 | 0 | 404 |
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
