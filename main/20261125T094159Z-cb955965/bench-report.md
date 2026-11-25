### Benchmarks

Previous run → this run. Baseline [`8ba8f75881568d0e1f0256498b7d032749358b7a`](https://github.com/eodash/eodash/commit/8ba8f75881568d0e1f0256498b7d032749358b7a), 2026-11-18T11:11:17.895Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- geozarr bands: dragging a band rebuilds the source
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 201.2 → 209.7 | 3.4 → 3.9 | 4.9 → 4.6 | 5.2 → 5.0 | 5.8 → 5.5 | 9.7 → 7.9 | ±13.01% → ±11.45% | 20 → 20 | = |
| date snap | 119.0 → 103.4 | 6.1 → 7.2 | 9.6 → 10.1 | 8.9 → 9.8 | 10.2 → 10.4 | 13.2 → 10.8 | ±11.07% → ±4.88% | 20 → 20 | = |
| layer datetime | 114.8 → 102.0 | 8.5 → 8.6 | 8.6 → 8.9 | 8.7 → 11.3 | 8.7 → 10.2 | 9.7 → 38.5 | ±1.62% → ±32.74% | 20 → 20 | +2.9% |
| links=10 | 70.9 → 63.4 | 13.2 → 13.6 | 13.5 → 16.5 | 14.2 → 16.0 | 15.2 → 17.3 | 16.9 → 20.8 | ±4.26% → ±5.97% | 20 → 20 | +23.0% |
| links=1 | 72.8 → 58.5 | 13.0 → 15.8 | 13.2 → 17.1 | 13.8 → 17.1 | 13.8 → 17.5 | 16.5 → 18.1 | ±4.12% → ±1.57% | 20 → 20 | +29.9% |
| links=100 | 62.0 → 53.1 | 15.1 → 17.7 | 16.2 → 18.8 | 16.2 → 18.8 | 16.8 → 19.0 | 17.8 → 20.0 | ±2.78% → ±1.42% | 20 → 20 | +16.0% |
| poi selection | 31.6 → 29.3 | 24.3 → 24.7 | 30.5 → 32.8 | 33.1 → 36.0 | 35.4 → 40.2 | 55.8 → 56.8 | ±11.48% → ±12.12% | 20 → 20 | = |
| select indicator | 22.3 → 17.9 | 22.4 → 29.8 | 50.7 → 61.0 | 49.1 → 64.2 | 57.9 → 80.0 | 71.9 → 131.1 | ±13.04% → ±18.73% | 20 → 20 | = |
| vector rendering | 19.2 → 19.4 | 47.9 → 47.3 | 49.0 → 48.9 | 53.3 → 52.1 | 51.4 → 53.3 | 81.6 → 63.0 | ±8.43% → ±5.23% | 20 → 20 | = |
| geozarr bands | 3.1 → 3.0 | 53.2 → 57.8 | 436.3 → 457.2 | 424.1 → 436.0 | 443.5 → 462.4 | 494.9 → 478.0 | ±9.88% → ±9.64% | 20 → 20 | +4.8% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.3 → 305.4 | 305.4 → 305.4 | 305.4 → 305.5 | 305.7 → 306.4 | ±0.02% → ±0.05% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.2 | 412.8 → 422.6 | 434.1 → 450.3 | 435.9 → 452.7 | 444.5 → 458.7 | 480.6 → 493.8 | ±2.01% → ±1.71% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.3 | 713.4 → 728.4 | 742.3 → 773.7 | 747.9 → 784.0 | 759.8 → 795.8 | 831.2 → 904.2 | ±1.88% → ±2.96% | 20 → 20 | +4.2% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| **geozarr bands** | **0 → 0** | **1–10 → 1–10** | **0 → 0** |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| explore item | none | | | | |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 20 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b01/c/0/0` | 0 | 57 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b03/c/0/0` | 0 | 57 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b02/c/0/0` | 0 | 57 | 0 | 200, 206 |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 9818K | 206 |

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
