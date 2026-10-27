### Benchmarks

Previous run → this run. Baseline [`e880fd7aa750ebb66202660e5accf4435a08b5d7`](https://github.com/eodash/eodash/commit/e880fd7aa750ebb66202660e5accf4435a08b5d7), 2026-10-24T15:20:45.905Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
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
| explore item | 138.2 → 117.7 | 6.0 → 6.3 | 6.9 → 8.4 | 7.6 → 9.3 | 8.2 → 10.3 | 15.7 → 19.8 | ±15.03% → ±18.05% | 20 → 20 | +20.9% |
| date snap | 111.4 → 89.9 | 5.7 → 8.3 | 9.0 → 11.3 | 9.8 → 11.6 | 11.1 → 12.8 | 18.7 → 18.7 | ±15.53% → ±10.93% | 20 → 20 | +25.6% |
| layer datetime | 89.0 → 98.1 | 8.8 → 8.8 | 11.4 → 9.4 | 14.8 → 10.4 | 12.6 → 12.2 | 57.9 → 12.9 | ±41.78% → ±7.16% | 20 → 20 | = |
| links=1 | 62.3 → 57.6 | 13.2 → 16.2 | 17.0 → 17.3 | 16.2 → 17.4 | 17.1 → 17.4 | 17.3 → 19.8 | ±4.31% → ±2.08% | 20 → 20 | +1.8% |
| links=10 | 61.9 → 57.1 | 13.5 → 16.9 | 17.1 → 17.5 | 16.3 → 17.5 | 17.3 → 17.7 | 18.1 → 18.2 | ±4.65% → ±0.93% | 20 → 20 | = |
| links=100 | 53.7 → 50.2 | 16.8 → 17.4 | 18.5 → 19.8 | 18.7 → 20.2 | 19.2 → 20.8 | 21.1 → 25.9 | ±2.82% → ±5.40% | 20 → 20 | +6.5% |
| geozarr bands | 25.1 → 22.8 | 23.9 → 27.0 | 38.5 → 42.1 | 53.8 → 58.0 | 84.5 → 91.7 | 120.3 → 128.5 | ±27.96% → ±27.17% | 20 → 20 | = |
| poi selection | 25.0 → 16.5 | 32.5 → 36.7 | 41.8 → 67.7 | 41.1 → 66.9 | 43.4 → 78.9 | 60.1 → 121.7 | ±8.26% → ±15.17% | 20 → 20 | +61.8% |
| select indicator | 14.8 → 12.6 | 37.9 → 48.0 | 71.9 → 90.6 | 76.5 → 83.6 | 87.3 → 98.0 | 160.3 → 105.6 | ±18.29% → ±10.31% | 20 → 20 | = |
| vector rendering | 15.0 → 14.2 | 50.6 → 58.2 | 66.8 → 65.3 | 68.3 → 73.9 | 72.3 → 75.0 | 91.8 → 131.9 | ±7.91% → ±13.09% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.2 | 305.3 → 305.3 | 305.3 → 305.4 | 305.4 → 305.5 | 305.6 → 305.7 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.1 | 400.2 → 433.6 | 449.9 → 475.2 | 448.7 → 476.4 | 456.3 → 480.0 | 486.4 → 521.0 | ±2.22% → ±2.17% | 20 → 20 | +5.6% |
| mirrored selection | 1.0 → 1.0 | 912.2 → 986.7 | 972.8 → 1028.9 | 981.9 → 1041.2 | 1008.4 → 1042.2 | 1125.4 → 1195.4 | ±2.53% → ±2.30% | 20 → 20 | +5.8% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–3 → 0–2** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11041K | 206 |

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
