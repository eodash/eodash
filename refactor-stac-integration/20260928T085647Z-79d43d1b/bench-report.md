### Benchmarks

Previous run → this run. Baseline [`2b8f9b9758ba8b714ec14a3dadf53f5c12a74c3d`](https://github.com/eodash/eodash/commit/2b8f9b9758ba8b714ec14a3dadf53f5c12a74c3d), 2026-09-28T07:46:17.151Z.

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
| date snap | 26.7 → 112.0 | 33.3 → 4.0 | 37.4 → 9.2 | 37.8 → 9.8 | 39.6 → 10.6 | 45.1 → 18.4 | ±4.11% → ±14.97% | 20 → 20 | -75.5% |
| layer datetime | 95.5 → 104.9 | 8.9 → 8.6 | 9.8 → 8.8 | 10.7 → 11.6 | 12.5 → 9.3 | 13.6 → 47.4 | ±7.58% → ±42.14% | 20 → 20 | -9.7% |
| explore item | 74.5 → 83.7 | 10.8 → 9.3 | 13.1 → 12.0 | 13.9 → 12.3 | 15.4 → 13.2 | 20.4 → 16.7 | ±9.39% → ±8.84% | 20 → 20 | = |
| links=1 | 58.9 → 66.6 | 15.4 → 13.2 | 17.0 → 14.4 | 17.0 → 15.5 | 17.3 → 16.3 | 17.9 → 27.5 | ±1.47% → ±11.17% | 20 → 20 | -15.2% |
| links=10 | 55.8 → 66.7 | 17.3 → 13.6 | 18.0 → 14.8 | 17.9 → 15.1 | 18.0 → 16.6 | 18.5 → 17.3 | ±0.75% → ±4.66% | 20 → 20 | -17.8% |
| links=100 | 37.7 → 52.4 | 24.9 → 16.9 | 26.4 → 19.1 | 26.6 → 19.1 | 26.9 → 19.6 | 30.0 → 21.4 | ±2.26% → ±2.57% | 20 → 20 | -27.6% |
| geozarr bands | 28.2 → 33.9 | 22.0 → 24.1 | 37.1 → 31.9 | 37.2 → 30.1 | 39.5 → 32.6 | 54.4 → 35.4 | ±9.98% → ±6.49% | 20 → 20 | = |
| poi selection | 12.9 → 28.1 | 59.7 → 29.6 | 76.1 → 35.4 | 81.6 → 36.2 | 96.6 → 37.4 | 121.8 → 47.4 | ±11.14% → ±6.61% | 20 → 20 | -53.4% |
| select indicator | 6.7 → 17.6 | 130.4 → 32.0 | 149.4 → 55.8 | 149.2 → 61.2 | 155.2 → 66.6 | 176.7 → 117.7 | ±4.00% → ±14.73% | 20 → 20 | -62.6% |
| vector rendering | 13.1 → 15.5 | 55.1 → 47.7 | 87.9 → 54.8 | 84.0 → 71.3 | 93.4 → 94.4 | 161.7 → 108.3 | ±15.94% → ±15.24% | 20 → 20 | -37.7% |
| mosaic scrub | 3.2 → 3.3 | 309.5 → 305.2 | 309.7 → 305.3 | 309.8 → 305.3 | 309.8 → 305.5 | 310.1 → 305.6 | ±0.02% → ±0.02% | 20 → 20 | -1.4% |
| geotiff rendering | 5.8 → 2.3 | 32.9 → 420.7 | 471.1 → 432.5 | 376.1 → 433.6 | 483.1 → 437.8 | 527.2 → 457.0 | ±22.89% → ±1.06% | 20 → 20 | = |
| mirrored selection | 0.4 → 1.0 | 2282.0 → 953.2 | 2332.9 → 989.1 | 2362.2 → 1015.0 | 2368.1 → 1030.6 | 2537.5 → 1192.0 | ±1.68% → ±2.87% | 20 → 20 | -57.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| geozarr bands | 0 → 0 | 0–10 → 0 | 0 → 0 |
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
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | none | | | | |
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
