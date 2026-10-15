### Benchmarks

Previous run → this run. Baseline [`75e4613f849d770bd18c18c490289cf6525cb7d6`](https://github.com/eodash/eodash/commit/75e4613f849d770bd18c18c490289cf6525cb7d6), 2026-10-13T10:12:50.134Z.

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
| date snap | 88.6 → 97.9 | 7.5 → 5.0 | 11.1 → 10.9 | 12.4 → 11.0 | 14.3 → 13.6 | 20.2 → 16.2 | ±14.92% → ±12.36% | 20 → 20 | = |
| layer datetime | 92.0 → 93.8 | 8.9 → 8.8 | 9.5 → 9.4 | 13.0 → 12.6 | 13.0 → 12.2 | 48.5 → 45.1 | ±37.52% → ±35.44% | 20 → 20 | = |
| explore item | 68.8 → 72.6 | 7.1 → 9.6 | 14.4 → 12.9 | 16.8 → 15.2 | 17.6 → 19.4 | 40.3 → 27.5 | ±21.97% → ±16.31% | 20 → 20 | = |
| links=1 | 56.8 → 62.2 | 14.5 → 13.6 | 17.1 → 16.6 | 18.8 → 16.2 | 17.3 → 16.9 | 45.0 → 17.6 | ±19.00% → ±3.62% | 20 → 20 | -2.9% |
| links=10 | 57.8 → 60.1 | 16.8 → 14.1 | 17.2 → 17.1 | 17.3 → 16.7 | 17.6 → 17.4 | 18.4 → 17.7 | ±1.15% → ±3.41% | 20 → 20 | = |
| links=100 | 47.1 → 46.7 | 18.6 → 18.9 | 21.5 → 21.5 | 21.4 → 21.6 | 22.2 → 22.0 | 25.7 → 26.7 | ±4.08% → ±4.45% | 20 → 20 | = |
| geozarr bands | 28.6 → 29.8 | 22.6 → 23.4 | 39.4 → 32.3 | 37.7 → 36.0 | 42.1 → 42.7 | 54.3 → 55.2 | ±12.27% → ±13.08% | 20 → 20 | = |
| poi selection | 22.3 → 18.5 | 34.2 → 42.2 | 43.2 → 58.0 | 47.6 → 56.5 | 52.1 → 65.1 | 75.4 → 77.6 | ±12.80% → ±9.86% | 20 → 20 | = |
| select indicator | 14.7 → 15.9 | 47.6 → 47.2 | 73.6 → 63.5 | 71.5 → 65.4 | 84.4 → 74.3 | 98.0 → 89.1 | ±10.73% → ±9.41% | 20 → 20 | = |
| vector rendering | 14.2 → 14.1 | 53.5 → 52.7 | 74.2 → 83.6 | 74.6 → 75.3 | 91.7 → 91.6 | 96.5 → 93.4 | ±11.06% → ±10.98% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.3 | 305.6 → 305.5 | 305.6 → 305.5 | 305.7 → 305.6 | 306.0 → 305.9 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 454.0 → 448.8 | 463.0 → 460.0 | 474.6 → 471.7 | 479.4 → 484.1 | 543.2 → 540.9 | ±2.49% → ±2.58% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 957.8 → 933.4 | 1000.6 → 994.0 | 1014.3 → 1001.0 | 1046.5 → 1019.9 | 1120.8 → 1112.7 | ±2.02% → ±2.16% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–9 → 0–7** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 29 | 0 | 404 |
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
