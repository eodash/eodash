### Benchmarks

Previous run → this run. Baseline [`deb95578cb44065609eec1f0fcd7483ef6227b02`](https://github.com/eodash/eodash/commit/deb95578cb44065609eec1f0fcd7483ef6227b02), 2026-10-08T14:20:29.298Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 92.6 → 91.8 | 5.0 → 7.5 | 11.7 → 11.4 | 12.0 → 11.4 | 13.1 → 11.6 | 26.2 → 16.8 | ±18.01% → ±10.09% | 20 → 20 | = |
| layer datetime | 94.2 → 95.8 | 9.0 → 8.9 | 10.6 → 10.2 | 10.9 → 10.7 | 12.3 → 12.3 | 14.9 → 13.2 | ±8.17% → ±7.49% | 20 → 20 | = |
| explore item | 60.1 → 73.3 | 11.8 → 9.6 | 15.7 → 13.7 | 18.9 → 14.7 | 18.3 → 17.4 | 43.1 → 23.0 | ±21.96% → ±13.24% | 20 → 20 | = |
| links=1 | 58.7 → 59.6 | 15.6 → 13.5 | 17.1 → 17.1 | 17.1 → 16.9 | 17.3 → 17.4 | 19.1 → 17.6 | ±2.12% → ±2.88% | 20 → 20 | = |
| links=10 | 58.6 → 59.0 | 14.1 → 14.0 | 17.3 → 17.4 | 17.1 → 17.1 | 17.5 → 17.8 | 18.6 → 18.4 | ±2.63% → ±3.37% | 20 → 20 | = |
| links=100 | 47.2 → 48.7 | 19.4 → 18.9 | 21.4 → 20.8 | 21.3 → 20.6 | 21.8 → 21.5 | 23.6 → 23.8 | ±2.47% → ±3.48% | 20 → 20 | = |
| geozarr bands | 29.9 → 28.5 | 25.0 → 24.2 | 31.6 → 34.9 | 34.9 → 37.6 | 42.4 → 44.0 | 47.6 → 57.3 | ±9.79% → ±12.75% | 20 → 20 | = |
| poi selection | 15.7 → 16.8 | 41.6 → 39.2 | 69.6 → 65.2 | 66.8 → 62.7 | 76.3 → 71.1 | 87.0 → 82.9 | ±9.62% → ±9.91% | 20 → 20 | = |
| vector rendering | 13.5 → 14.0 | 57.0 → 52.9 | 71.8 → 89.9 | 78.1 → 76.2 | 96.8 → 92.6 | 105.8 → 95.7 | ±11.00% → ±11.45% | 20 → 20 | = |
| select indicator | 14.9 → 15.7 | 43.2 → 53.0 | 71.8 → 60.4 | 72.4 → 65.8 | 91.3 → 69.3 | 102.0 → 91.2 | ±12.46% → ±9.01% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.3 | 305.6 → 305.7 | 305.6 → 305.7 | 305.7 → 305.8 | 306.3 → 306.1 | ±0.04% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 430.2 → 450.0 | 461.8 → 468.9 | 471.6 → 485.6 | 474.3 → 481.8 | 554.7 → 648.5 | ±2.94% → ±4.91% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 956.8 → 955.9 | 973.3 → 1010.3 | 999.8 → 1024.1 | 1026.4 → 1034.3 | 1167.6 → 1164.9 | ±2.63% → ±2.88% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1–2** | **0 → 0** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–6 → 0–6** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
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
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 24 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 28 | 0 | 404 |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
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
