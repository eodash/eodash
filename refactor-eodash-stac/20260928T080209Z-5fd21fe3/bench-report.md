### Benchmarks

Previous run → this run. Baseline [`2b8f9b9758ba8b714ec14a3dadf53f5c12a74c3d`](https://github.com/eodash/eodash/commit/2b8f9b9758ba8b714ec14a3dadf53f5c12a74c3d), 2026-09-28T07:46:17.151Z.

- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- geotiff rendering, vector rendering: draws a styled layer of each source type
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 74.5 → 105.0 | 10.8 → 7.3 | 13.1 → 9.1 | 13.9 → 9.9 | 15.4 → 10.5 | 20.4 → 16.1 | ±9.39% → ±10.22% | 20 → 20 | -29.9% |
| layer datetime | 95.5 → 103.8 | 8.9 → 8.7 | 9.8 → 8.9 | 10.7 → 11.7 | 12.5 → 9.4 | 13.6 → 48.6 | ±7.58% → ±42.91% | 20 → 20 | -8.7% |
| links=1 | 58.9 → 59.2 | 15.4 → 13.7 | 17.0 → 17.0 | 17.0 → 16.9 | 17.3 → 17.2 | 17.9 → 18.5 | ±1.47% → ±2.65% | 20 → 20 | = |
| links=10 | 55.8 → 61.0 | 17.3 → 14.3 | 18.0 → 17.6 | 17.9 → 16.6 | 18.0 → 17.9 | 18.5 → 18.2 | ±0.75% → ±4.61% | 20 → 20 | -1.7% |
| links=100 | 37.7 → 40.1 | 24.9 → 22.9 | 26.4 → 25.2 | 26.6 → 25.0 | 26.9 → 26.2 | 30.0 → 28.0 | ±2.26% → ±2.71% | 20 → 20 | -4.9% |
| geozarr bands | 28.2 → 26.4 | 22.0 → 24.2 | 37.1 → 40.1 | 37.2 → 39.3 | 39.5 → 42.6 | 54.4 → 47.7 | ±9.98% → ±8.03% | 20 → 20 | +7.9% |
| geotiff rendering | 5.8 → 6.5 | 32.9 → 32.0 | 471.1 → 491.3 | 376.1 → 391.4 | 483.1 → 502.9 | 527.2 → 557.5 | ±22.89% → ±23.74% | 20 → 20 | +4.3% |
| vector rendering | 13.1 → 14.3 | 55.1 → 49.9 | 87.9 → 84.4 | 84.0 → 75.0 | 93.4 → 93.7 | 161.7 → 95.9 | ±15.94% → ±12.30% | 20 → 20 | = |
| poi selection | 12.9 → 17.0 | 59.7 → 51.2 | 76.1 → 56.9 | 81.6 → 60.5 | 96.6 → 59.6 | 121.8 → 93.3 | ±11.14% → ±9.15% | 20 → 20 | -25.2% |
| select indicator | 6.7 → 7.6 | 130.4 → 111.3 | 149.4 → 129.1 | 149.2 → 132.8 | 155.2 → 143.0 | 176.7 → 163.7 | ±4.00% → ±4.83% | 20 → 20 | -13.6% |
| mosaic scrub | 3.2 → 3.2 | 309.5 → 309.3 | 309.7 → 309.6 | 309.8 → 309.6 | 309.8 → 309.7 | 310.1 → 309.9 | ±0.02% → ±0.02% | 20 → 20 | -0.0% |
| mirrored selection | 0.4 → 0.5 | 2282.0 → 1915.8 | 2332.9 → 1958.2 | 2362.2 → 1984.1 | 2368.1 → 1987.7 | 2537.5 → 2172.8 | ±1.68% → ±1.80% | 20 → 20 | -16.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–3** | **0 → 0** |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
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
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 18 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 9 | 0 | 404 |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
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
