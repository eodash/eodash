### Benchmarks

Previous run → this run. Baseline [`00be46d9aa84b7497bf6c84f2b1baf04e71cf47f`](https://github.com/eodash/eodash/commit/00be46d9aa84b7497bf6c84f2b1baf04e71cf47f), 2026-10-23T14:03:22.965Z.

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
| date snap | 93.0 → 111.4 | 8.1 → 5.7 | 11.0 → 9.0 | 11.3 → 9.8 | 12.7 → 11.1 | 17.8 → 18.7 | ±10.92% → ±15.53% | 20 → 20 | = |
| explore item | 69.6 → 138.2 | 9.5 → 6.0 | 14.4 → 6.9 | 15.3 → 7.6 | 16.7 → 8.2 | 27.1 → 15.7 | ±13.14% → ±15.03% | 20 → 20 | -51.7% |
| layer datetime | 90.9 → 89.0 | 8.9 → 8.8 | 11.5 → 11.4 | 13.2 → 14.8 | 12.5 → 12.6 | 50.4 → 57.9 | ±38.66% → ±41.78% | 20 → 20 | = |
| links=1 | 58.3 → 62.3 | 14.7 → 13.2 | 17.3 → 17.0 | 17.2 → 16.2 | 17.5 → 17.1 | 17.9 → 17.3 | ±1.87% → ±4.31% | 20 → 20 | = |
| links=10 | 58.2 → 61.9 | 14.7 → 13.5 | 17.5 → 17.1 | 17.2 → 16.3 | 17.6 → 17.3 | 18.4 → 18.1 | ±2.33% → ±4.65% | 20 → 20 | = |
| links=100 | 48.2 → 53.7 | 18.5 → 16.8 | 21.0 → 18.5 | 20.8 → 18.7 | 21.7 → 19.2 | 23.7 → 21.1 | ±3.08% → ±2.82% | 20 → 20 | -11.7% |
| geozarr bands | 29.6 → 25.1 | 21.6 → 23.9 | 38.4 → 38.5 | 37.3 → 53.8 | 42.7 → 84.5 | 64.5 → 120.3 | ±15.24% → ±27.96% | 20 → 20 | = |
| poi selection | 20.1 → 25.0 | 36.4 → 32.5 | 48.3 → 41.8 | 52.9 → 41.1 | 63.8 → 43.4 | 84.5 → 60.1 | ±12.57% → ±8.26% | 20 → 20 | = |
| select indicator | 15.9 → 14.8 | 39.0 → 37.9 | 67.0 → 71.9 | 67.3 → 76.5 | 85.9 → 87.3 | 90.5 → 160.3 | ±12.16% → ±18.29% | 20 → 20 | = |
| vector rendering | 14.0 → 15.0 | 53.2 → 50.6 | 74.2 → 66.8 | 78.6 → 68.3 | 91.5 → 72.3 | 143.3 → 91.8 | ±15.81% → ±7.91% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.2 | 305.5 → 305.3 | 305.6 → 305.3 | 305.6 → 305.4 | 306.1 → 305.6 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.2 | 449.6 → 400.2 | 461.8 → 449.9 | 468.9 → 448.7 | 472.5 → 456.3 | 529.2 → 486.4 | ±2.09% → ±2.22% | 20 → 20 | -2.6% |
| mirrored selection | 1.0 → 1.0 | 957.9 → 912.2 | 979.5 → 972.8 | 1009.0 → 981.9 | 1035.2 → 1008.4 | 1207.7 → 1125.4 | ±3.16% → ±2.53% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 0 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–23 → 0–3** | **0 → 0** |
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
| explore item | none | | | | |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/zarr.json` | 0 | 1 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b02/c/0/0` | 0 | 2 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b03/c/0/0` | 0 | 2 | 0 | 200, 206 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10123K | 206 |

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
