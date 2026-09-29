### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

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
| date snap | 126.0 → 90.2 | 2.2 → 8.1 | 9.6 → 11.3 | 9.1 → 11.6 | 10.0 → 13.2 | 11.3 → 15.8 | ±10.67% → ±10.11% | 20 → 20 | +17.1% |
| layer datetime | 108.7 → 92.3 | 8.4 → 9.0 | 8.7 → 11.6 | 12.1 → 11.1 | 8.9 → 12.8 | 62.7 → 14.4 | ±57.19% → ±8.09% | 20 → 20 | +34.7% |
| explore item | 113.7 → 57.4 | 7.1 → 11.8 | 8.8 → 17.8 | 9.3 → 18.6 | 9.5 → 20.4 | 17.8 → 32.4 | ±13.55% → ±13.25% | 20 → 20 | +102.9% |
| links=1 | 75.5 → 59.1 | 12.8 → 16.0 | 13.0 → 16.9 | 13.3 → 16.9 | 13.2 → 17.2 | 14.8 → 17.7 | ±2.19% → ±1.20% | 20 → 20 | +30.0% |
| links=10 | 73.6 → 57.2 | 13.1 → 16.5 | 13.3 → 17.5 | 13.6 → 17.5 | 13.7 → 17.6 | 15.1 → 18.6 | ±2.46% → ±1.13% | 20 → 20 | +31.6% |
| links=100 | 62.0 → 45.6 | 15.5 → 20.4 | 15.7 → 21.6 | 16.2 → 22.0 | 16.2 → 21.9 | 19.7 → 26.3 | ±3.29% → ±3.01% | 20 → 20 | +37.6% |
| geozarr bands | 32.0 → 29.8 | 18.3 → 24.9 | 34.4 → 31.6 | 33.3 → 35.3 | 40.8 → 43.7 | 44.6 → 54.3 | ±11.50% → ±11.56% | 20 → 20 | = |
| poi selection | 35.0 → 17.8 | 23.1 → 39.6 | 28.9 → 63.2 | 28.9 → 59.1 | 31.2 → 68.2 | 34.7 → 80.6 | ±5.17% → ±10.23% | 20 → 20 | +119.1% |
| select indicator | 24.6 → 12.8 | 27.1 → 51.5 | 44.5 → 83.3 | 43.6 → 81.6 | 51.6 → 90.4 | 67.0 → 109.1 | ±12.50% → ±9.39% | 20 → 20 | +87.1% |
| vector rendering | 18.6 → 13.2 | 47.0 → 55.4 | 49.1 → 89.9 | 56.4 → 81.3 | 52.5 → 97.9 | 96.1 → 110.0 | ±12.65% → ±12.27% | 20 → 20 | +83.4% |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.4 | 305.0 → 305.6 | 305.0 → 305.7 | 305.1 → 305.7 | 305.3 → 306.4 | ±0.02% → ±0.04% | 20 → 20 | +0.2% |
| geotiff rendering | 2.4 → 2.1 | 369.6 → 456.6 | 406.3 → 470.8 | 424.7 → 479.5 | 414.6 → 477.9 | 645.3 → 581.1 | ±7.50% → ±3.05% | 20 → 20 | +15.9% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 956.2 | 569.2 → 1016.9 | 580.2 → 1029.6 | 584.0 → 1061.7 | 690.4 → 1149.2 | ±3.35% → ±2.49% | 20 → 20 | +78.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1** | **0 → 0–1** | **0 → 0–0K** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–10** | **0 → 0** |
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
|  | `/tests/support/assets/tile.png` | 0 | 1 | 0K | 200 |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 31 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 28 | 0 | 404 |
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
