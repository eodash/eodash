### Benchmarks

Previous run → this run. Baseline [`5d765c70201929b521382e5f9dc896937c1e1d1b`](https://github.com/eodash/eodash/commit/5d765c70201929b521382e5f9dc896937c1e1d1b), 2026-09-28T18:34:53.819Z.

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
| date snap | 126.0 → 104.7 | 2.2 → 4.1 | 9.6 → 9.3 | 9.1 → 10.9 | 10.0 → 12.4 | 11.3 → 21.7 | ±10.67% → ±19.01% | 20 → 20 | = |
| explore item | 113.7 → 77.4 | 7.1 → 7.2 | 8.8 → 13.3 | 9.3 → 14.4 | 9.5 → 16.1 | 17.8 → 28.2 | ±13.55% → ±17.17% | 20 → 20 | +52.0% |
| layer datetime | 108.7 → 98.9 | 8.4 → 8.8 | 8.7 → 9.3 | 12.1 → 10.4 | 8.9 → 12.2 | 62.7 → 12.9 | ±57.19% → ±7.60% | 20 → 20 | = |
| links=1 | 75.5 → 65.1 | 12.8 → 13.3 | 13.0 → 16.0 | 13.3 → 15.6 | 13.2 → 17.6 | 14.8 → 18.1 | ±2.19% → ±6.25% | 20 → 20 | +22.7% |
| links=10 | 73.6 → 62.2 | 13.1 → 13.9 | 13.3 → 17.0 | 13.6 → 16.2 | 13.7 → 17.4 | 15.1 → 17.9 | ±2.46% → ±4.29% | 20 → 20 | +27.8% |
| links=100 | 62.0 → 47.5 | 15.5 → 18.6 | 15.7 → 21.3 | 16.2 → 21.3 | 16.2 → 21.9 | 19.7 → 26.4 | ±3.29% → ±4.81% | 20 → 20 | +35.7% |
| geozarr bands | 32.0 → 27.8 | 18.3 → 21.6 | 34.4 → 41.0 | 33.3 → 40.1 | 40.8 → 49.0 | 44.6 → 62.0 | ±11.50% → ±14.92% | 20 → 20 | = |
| poi selection | 35.0 → 21.5 | 23.1 → 37.8 | 28.9 → 43.8 | 28.9 → 48.6 | 31.2 → 54.0 | 34.7 → 72.8 | ±5.17% → ±10.95% | 20 → 20 | +51.8% |
| select indicator | 24.6 → 14.6 | 27.1 → 48.8 | 44.5 → 72.3 | 43.6 → 71.8 | 51.6 → 85.6 | 67.0 → 99.4 | ±12.50% → ±10.62% | 20 → 20 | +62.5% |
| vector rendering | 18.6 → 13.7 | 47.0 → 54.5 | 49.1 → 90.9 | 56.4 → 78.2 | 52.5 → 92.7 | 96.1 → 108.9 | ±12.65% → ±11.81% | 20 → 20 | +85.2% |
| mosaic scrub | 3.3 → 3.3 | 304.8 → 305.1 | 305.0 → 305.5 | 305.0 → 305.5 | 305.1 → 305.6 | 305.3 → 305.9 | ±0.02% → ±0.03% | 20 → 20 | +0.2% |
| geotiff rendering | 2.4 → 2.1 | 369.6 → 450.2 | 406.3 → 464.5 | 424.7 → 467.0 | 414.6 → 475.7 | 645.3 → 490.9 | ±7.50% → ±1.30% | 20 → 20 | +14.3% |
| mirrored selection | 1.7 → 1.0 | 541.3 → 955.3 | 569.2 → 991.5 | 580.2 → 1008.6 | 584.0 → 1015.1 | 690.4 → 1162.5 | ±3.35% → ±2.63% | 20 → 20 | +74.2% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–10 → 0–16** | **0 → 0** |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 20 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 11 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11346K | 206 |

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
