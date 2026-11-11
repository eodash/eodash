### Benchmarks

Previous run → this run. Baseline [`3bd369e7258db23481438a2fdf67b2ed97d6cf6b`](https://github.com/eodash/eodash/commit/3bd369e7258db23481438a2fdf67b2ed97d6cf6b), 2026-10-28T12:53:57.683Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- geozarr bands: dragging a band rebuilds the source
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 156.2 → 133.9 | 5.2 → 6.2 | 6.4 → 7.4 | 6.6 → 8.0 | 7.2 → 7.6 | 8.6 → 17.3 | ±7.78% → ±16.48% | 20 → 20 | = |
| date snap | 112.6 → 96.4 | 7.2 → 8.1 | 8.9 → 10.2 | 9.3 → 10.6 | 10.2 → 11.3 | 14.3 → 13.0 | ±11.58% → ±6.42% | 20 → 20 | = |
| layer datetime | 103.3 → 103.8 | 8.5 → 8.7 | 8.9 → 8.8 | 11.3 → 9.9 | 9.9 → 10.3 | 40.8 → 13.5 | ±35.52% → ±8.17% | 20 → 20 | = |
| links=1 | 66.0 → 69.2 | 13.3 → 13.2 | 15.8 → 13.5 | 15.3 → 14.6 | 16.9 → 16.4 | 17.4 → 18.0 | ±5.25% → ±5.45% | 20 → 20 | = |
| links=10 | 65.7 → 66.7 | 13.5 → 13.7 | 15.3 → 13.9 | 15.4 → 15.1 | 16.9 → 16.8 | 18.5 → 17.5 | ±5.48% → ±4.81% | 20 → 20 | = |
| links=100 | 54.9 → 52.7 | 15.8 → 16.6 | 18.4 → 19.2 | 18.3 → 19.0 | 18.8 → 19.4 | 20.2 → 20.4 | ±2.77% → ±2.39% | 20 → 20 | +4.6% |
| poi selection | 24.1 → 18.4 | 29.3 → 35.8 | 36.0 → 62.2 | 46.5 → 58.4 | 61.1 → 68.1 | 81.1 → 77.3 | ±17.68% → ±11.66% | 20 → 20 | = |
| select indicator | 16.9 → 14.4 | 33.8 → 41.4 | 68.3 → 69.9 | 65.1 → 74.1 | 80.9 → 90.0 | 92.1 → 104.5 | ±13.31% → ±11.67% | 20 → 20 | = |
| vector rendering | 16.4 → 16.2 | 46.0 → 47.6 | 59.3 → 62.9 | 64.2 → 64.7 | 63.0 → 66.6 | 112.1 → 105.3 | ±13.03% → ±11.50% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.5 | 427.3 → 74.4 | 451.0 → 502.3 | 458.3 → 488.1 | 462.3 → 532.9 | 562.6 → 544.8 | ±3.66% → ±9.59% | 20 → 20 | +11.4% |
| mosaic scrub | 3.3 → 3.3 | 305.0 → 305.1 | 305.2 → 305.3 | 305.3 → 305.3 | 305.3 → 305.3 | 305.7 → 305.8 | ±0.03% → ±0.03% | 20 → 20 | = |
| geozarr bands | 22.5 → 2.1 | 42.2 → 466.4 | 44.0 → 474.1 | 44.5 → 483.6 | 45.4 → 490.4 | 48.6 → 529.6 | ±1.90% → ±1.92% | 20 → 20 | +977.5% |
| mirrored selection | 1.2 → 1.0 | 808.1 → 1001.7 | 850.9 → 1039.6 | 871.5 → 1048.3 | 919.4 → 1061.3 | 965.4 → 1161.4 | ±3.20% → ±2.11% | 20 → 20 | +22.2% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 10–12** | **0 → 0** |
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
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 20 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b01/c/0/0` | 0 | 60 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b03/c/0/0` | 0 | 61 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b02/c/0/0` | 0 | 61 | 0 | 200, 206 |
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
