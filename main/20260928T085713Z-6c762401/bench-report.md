### Benchmarks

Previous run → this run. Baseline [`2b8f9b9758ba8b714ec14a3dadf53f5c12a74c3d`](https://github.com/eodash/eodash/commit/2b8f9b9758ba8b714ec14a3dadf53f5c12a74c3d), 2026-09-28T07:46:17.151Z.

- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- date snap: moving the date rebuilds all six collections' layers
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 74.5 → 103.7 | 10.8 → 7.6 | 13.1 → 8.9 | 13.9 → 10.0 | 15.4 → 10.7 | 20.4 → 16.0 | ±9.39% → ±10.36% | 20 → 20 | -31.4% |
| layer datetime | 95.5 → 105.0 | 8.9 → 8.6 | 9.8 → 8.8 | 10.7 → 9.9 | 12.5 → 10.1 | 13.6 → 16.9 | ±7.58% → ±10.75% | 20 → 20 | -9.7% |
| links=1 | 58.9 → 69.9 | 15.4 → 13.2 | 17.0 → 13.4 | 17.0 → 14.4 | 17.3 → 15.9 | 17.9 → 17.0 | ±1.47% → ±4.74% | 20 → 20 | -21.1% |
| links=10 | 55.8 → 68.4 | 17.3 → 13.8 | 18.0 → 14.2 | 17.9 → 14.7 | 18.0 → 15.2 | 18.5 → 16.8 | ±0.75% → ±3.03% | 20 → 20 | -20.9% |
| geozarr bands | 28.2 → 36.3 | 22.0 → 20.2 | 37.1 → 31.0 | 37.2 → 29.2 | 39.5 → 33.2 | 54.4 → 48.9 | ±9.98% → ±12.35% | 20 → 20 | = |
| links=100 | 37.7 → 45.2 | 24.9 → 20.2 | 26.4 → 22.2 | 26.6 → 22.2 | 26.9 → 22.8 | 30.0 → 25.6 | ±2.26% → ±2.89% | 20 → 20 | -16.1% |
| date snap | 26.7 → 30.0 | 33.3 → 29.9 | 37.4 → 33.3 | 37.8 → 33.4 | 39.6 → 33.8 | 45.1 → 36.7 | ±4.11% → ±1.86% | 20 → 20 | -10.8% |
| poi selection | 12.9 → 20.8 | 59.7 → 34.3 | 76.1 → 47.6 | 81.6 → 49.6 | 96.6 → 52.6 | 121.8 → 82.1 | ±11.14% → ±9.90% | 20 → 20 | -37.3% |
| vector rendering | 13.1 → 16.6 | 55.1 → 46.3 | 87.9 → 52.6 | 84.0 → 66.7 | 93.4 → 78.1 | 161.7 → 133.2 | ±15.94% → ±17.56% | 20 → 20 | -40.2% |
| geotiff rendering | 5.8 → 2.8 | 32.9 → 71.6 | 471.1 → 455.4 | 376.1 → 435.1 | 483.1 → 466.6 | 527.2 → 495.4 | ±22.89% → ±9.47% | 20 → 20 | = |
| select indicator | 6.7 → 10.3 | 130.4 → 79.8 | 149.4 → 95.7 | 149.2 → 98.1 | 155.2 → 106.8 | 176.7 → 122.1 | ±4.00% → ±5.47% | 20 → 20 | -36.0% |
| mosaic scrub | 3.2 → 3.2 | 309.5 → 309.4 | 309.7 → 309.6 | 309.8 → 309.6 | 309.8 → 309.7 | 310.1 → 310.1 | ±0.02% → ±0.03% | 20 → 20 | = |
| mirrored selection | 0.4 → 0.6 | 2282.0 → 1560.0 | 2332.9 → 1705.1 | 2362.2 → 1720.6 | 2368.1 → 1760.3 | 2537.5 → 1962.6 | ±1.68% → ±2.77% | 20 → 20 | -26.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–1** | **0 → 0** |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| mosaic scrub | 2 → 2 | 0 → 0 | 0 → 0 |
| mirrored selection | 3 → 3 | 1 → 1 | 0 → 0 |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 3 | 0 | 200 |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
|  | `/stac/aggregations/mosaicked.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 20 | 0 | 0 | mocked |

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
