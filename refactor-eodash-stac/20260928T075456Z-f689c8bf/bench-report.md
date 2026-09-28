### Benchmarks

Previous run → this run. Baseline [`2b8f9b9758ba8b714ec14a3dadf53f5c12a74c3d`](https://github.com/eodash/eodash/commit/2b8f9b9758ba8b714ec14a3dadf53f5c12a74c3d), 2026-09-28T07:46:17.151Z.

- layer datetime: changing one layer's date replaces only that layer
- geozarr bands: dragging a band rebuilds the source
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geotiff rendering, vector rendering: draws a styled layer of each source type
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| layer datetime | 95.5 → 91.9 | 8.9 → 9.0 | 9.8 → 11.9 | 10.7 → 11.2 | 12.5 → 12.8 | 13.6 → 14.6 | ±7.58% → ±8.30% | 20 → 20 | = |
| geozarr bands | 28.2 → 29.8 | 22.0 → 9.3 | 37.1 → 42.1 | 37.2 → 39.6 | 39.5 → 44.5 | 54.4 → 55.3 | ±9.98% → ±13.15% | 20 → 20 | +13.2% |
| explore item | 74.5 → 80.4 | 10.8 → 10.0 | 13.1 → 11.9 | 13.9 → 12.9 | 15.4 → 14.2 | 20.4 → 19.1 | ±9.39% → ±9.82% | 20 → 20 | = |
| links=1 | 58.9 → 60.1 | 15.4 → 13.8 | 17.0 → 16.9 | 17.0 → 16.7 | 17.3 → 17.3 | 17.9 → 18.5 | ±1.47% → ±3.33% | 20 → 20 | = |
| links=10 | 55.8 → 55.6 | 17.3 → 17.4 | 18.0 → 17.9 | 17.9 → 18.0 | 18.0 → 18.1 | 18.5 → 19.1 | ±0.75% → ±1.12% | 20 → 20 | = |
| links=100 | 37.7 → 36.0 | 24.9 → 25.2 | 26.4 → 27.8 | 26.6 → 27.8 | 26.9 → 28.4 | 30.0 → 32.2 | ±2.26% → ±2.75% | 20 → 20 | +5.1% |
| geotiff rendering | 5.8 → 10.2 | 32.9 → 30.1 | 471.1 → 454.3 | 376.1 → 308.4 | 483.1 → 481.9 | 527.2 → 529.7 | ±22.89% → ±32.43% | 20 → 20 | = |
| vector rendering | 13.1 → 13.4 | 55.1 → 54.3 | 87.9 → 87.1 | 84.0 → 80.4 | 93.4 → 92.2 | 161.7 → 128.1 | ±15.94% → ±13.24% | 20 → 20 | = |
| poi selection | 12.9 → 14.4 | 59.7 → 55.6 | 76.1 → 64.6 | 81.6 → 72.4 | 96.6 → 77.9 | 121.8 → 106.1 | ±11.14% → ±10.60% | 20 → 20 | = |
| select indicator | 6.7 → 6.8 | 130.4 → 132.5 | 149.4 → 146.2 | 149.2 → 148.2 | 155.2 → 152.0 | 176.7 → 181.8 | ±4.00% → ±3.74% | 20 → 20 | = |
| mosaic scrub | 3.2 → 3.2 | 309.5 → 309.6 | 309.7 → 309.8 | 309.8 → 309.8 | 309.8 → 309.9 | 310.1 → 310.4 | ±0.02% → ±0.03% | 20 → 20 | = |
| mirrored selection | 0.4 → 0.4 | 2282.0 → 2252.8 | 2332.9 → 2327.0 | 2362.2 → 2360.3 | 2368.1 → 2411.1 | 2537.5 → 2565.5 | ±1.68% → ±1.79% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–4** | **0 → 0** |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| mosaic scrub | 2 → 2 | 0 → 0 | 0 → 0 |
| mirrored selection | 3 → 3 | 1 → 1 | 0 → 0 |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 18 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 6 | 0 | 404 |
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
