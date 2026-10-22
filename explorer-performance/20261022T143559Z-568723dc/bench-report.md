### Benchmarks

Previous run → this run. Baseline [`c20e0bd5461962e8a2351fc787a8c67562753b5f`](https://github.com/eodash/eodash/commit/c20e0bd5461962e8a2351fc787a8c67562753b5f), 2026-10-21T15:33:59.775Z.

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
| layer datetime | 89.7 → 93.8 | 8.9 → 8.8 | 11.1 → 10.2 | 12.4 → 11.2 | 13.2 → 12.6 | 30.5 → 17.0 | ±21.01% → ±10.96% | 20 → 20 | = |
| explore item | 69.0 → 79.5 | 9.7 → 8.9 | 14.8 → 12.9 | 15.0 → 13.5 | 15.9 → 15.4 | 21.5 → 23.8 | ±8.71% → ±14.13% | 20 → 20 | = |
| links=10 | 57.8 → 70.0 | 16.9 → 13.4 | 17.3 → 13.8 | 17.3 → 14.4 | 17.5 → 15.0 | 17.9 → 16.7 | ±0.77% → ±3.20% | 20 → 20 | -20.2% |
| links=1 | 58.5 → 63.0 | 15.1 → 13.6 | 17.1 → 16.7 | 17.1 → 16.0 | 17.3 → 16.9 | 18.0 → 17.5 | ±1.67% → ±4.02% | 20 → 20 | -2.3% |
| links=100 | 47.8 → 54.0 | 18.5 → 16.2 | 21.1 → 17.9 | 21.0 → 19.3 | 21.5 → 19.1 | 23.5 → 33.5 | ±2.63% → ±11.87% | 20 → 20 | -15.2% |
| geozarr bands | 28.8 → 29.5 | 23.7 → 21.1 | 38.4 → 35.8 | 37.5 → 35.5 | 46.3 → 39.8 | 57.3 → 49.2 | ±13.34% → ±10.20% | 20 → 20 | = |
| poi selection | 16.5 → 21.3 | 42.3 → 30.7 | 65.9 → 43.1 | 63.4 → 55.1 | 70.1 → 62.6 | 83.6 → 141.4 | ±9.30% → ±24.39% | 20 → 20 | -34.5% |
| select indicator | 13.5 → 19.1 | 49.9 → 34.5 | 84.7 → 54.7 | 78.8 → 55.9 | 95.2 → 67.9 | 107.0 → 87.7 | ±11.61% → ±12.35% | 20 → 20 | -35.4% |
| vector rendering | 12.8 → 16.0 | 57.1 → 46.5 | 88.7 → 55.7 | 82.9 → 67.0 | 96.8 → 86.8 | 123.9 → 92.0 | ±11.73% → ±12.83% | 20 → 20 | -37.3% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.2 | 305.4 → 305.3 | 305.5 → 305.5 | 305.6 → 305.4 | 306.4 → 308.0 | ±0.04% → ±0.11% | 20 → 20 | = |
| geotiff rendering | 1.8 → 2.3 | 506.4 → 408.4 | 540.8 → 431.0 | 542.5 → 447.1 | 547.4 → 460.5 | 577.7 → 552.4 | ±1.41% → ±4.07% | 20 → 20 | -20.3% |
| mirrored selection | 1.0 → 1.6 | 934.7 → 604.6 | 976.5 → 630.4 | 1002.8 → 643.2 | 1022.2 → 641.2 | 1196.0 → 760.0 | ±3.47% → ±2.94% | 20 → 20 | -35.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1–2 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–7 → 0–7** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 14 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 7 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10735K | 206 |

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
