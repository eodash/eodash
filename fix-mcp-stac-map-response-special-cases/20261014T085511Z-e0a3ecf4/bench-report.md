### Benchmarks

Previous run → this run. Baseline [`75e4613f849d770bd18c18c490289cf6525cb7d6`](https://github.com/eodash/eodash/commit/75e4613f849d770bd18c18c490289cf6525cb7d6), 2026-10-13T10:12:50.134Z.

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
| date snap | 88.6 → 114.8 | 7.5 → 7.1 | 11.1 → 8.9 | 12.4 → 9.0 | 14.3 → 10.3 | 20.2 → 13.6 | ±14.92% → ±9.63% | 20 → 20 | = |
| explore item | 68.8 → 82.3 | 7.1 → 8.2 | 14.4 → 12.8 | 16.8 → 13.1 | 17.6 → 15.7 | 40.3 → 20.0 | ±21.97% → ±13.28% | 20 → 20 | = |
| layer datetime | 92.0 → 103.4 | 8.9 → 8.6 | 9.5 → 8.8 | 13.0 → 10.0 | 13.0 → 11.9 | 48.5 → 15.7 | ±37.52% → ±9.96% | 20 → 20 | -7.3% |
| links=1 | 56.8 → 67.9 | 14.5 → 13.1 | 17.1 → 13.7 | 18.8 → 15.8 | 17.3 → 15.5 | 45.0 → 39.4 | ±19.00% → ±20.31% | 20 → 20 | -19.9% |
| links=10 | 57.8 → 67.7 | 16.8 → 13.5 | 17.2 → 14.8 | 17.3 → 14.9 | 17.6 → 15.8 | 18.4 → 17.1 | ±1.15% → ±3.79% | 20 → 20 | -14.2% |
| links=100 | 47.1 → 53.2 | 18.6 → 16.8 | 21.5 → 19.1 | 21.4 → 18.8 | 22.2 → 19.4 | 25.7 → 20.5 | ±4.08% → ±2.29% | 20 → 20 | -11.2% |
| geozarr bands | 28.6 → 35.5 | 22.6 → 19.4 | 39.4 → 31.5 | 37.7 → 30.2 | 42.1 → 33.5 | 54.3 → 56.8 | ±12.27% → ±14.35% | 20 → 20 | = |
| poi selection | 22.3 → 28.1 | 34.2 → 29.2 | 43.2 → 34.9 | 47.6 → 36.1 | 52.1 → 37.2 | 75.4 → 45.2 | ±12.80% → ±6.10% | 20 → 20 | -19.1% |
| select indicator | 14.7 → 19.4 | 47.6 → 31.1 | 73.6 → 51.3 | 71.5 → 56.1 | 84.4 → 66.0 | 98.0 → 91.5 | ±10.73% → ±14.38% | 20 → 20 | -30.3% |
| vector rendering | 14.2 → 15.3 | 53.5 → 48.4 | 74.2 → 62.4 | 74.6 → 70.0 | 91.7 → 89.5 | 96.5 → 95.8 | ±11.06% → ±12.90% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.6 → 305.3 | 305.6 → 305.3 | 305.7 → 305.4 | 306.0 → 305.7 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.2 | 454.0 → 418.2 | 463.0 → 437.2 | 474.6 → 452.0 | 479.4 → 446.8 | 543.2 → 584.6 | ±2.49% → ±4.61% | 20 → 20 | -5.6% |
| mirrored selection | 1.0 → 1.2 | 957.8 → 751.7 | 1000.6 → 789.1 | 1014.3 → 804.2 | 1046.5 → 838.3 | 1120.8 → 911.8 | ±2.02% → ±2.75% | 20 → 20 | -21.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–9 → 0–2** | **0 → 0** |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 11 | 0 | 200 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 8289K | 206 |

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
