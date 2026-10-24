### Benchmarks

Previous run → this run. Baseline [`e880fd7aa750ebb66202660e5accf4435a08b5d7`](https://github.com/eodash/eodash/commit/e880fd7aa750ebb66202660e5accf4435a08b5d7), 2026-10-24T15:20:45.905Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 138.2 → 171.9 | 6.0 → 4.0 | 6.9 → 5.7 | 7.6 → 6.5 | 8.2 → 6.5 | 15.7 → 15.2 | ±15.03% → ±20.86% | 20 → 20 | -18.0% |
| date snap | 111.4 → 110.3 | 5.7 → 4.7 | 9.0 → 9.4 | 9.8 → 9.4 | 11.1 → 9.8 | 18.7 → 13.3 | ±15.53% → ±8.47% | 20 → 20 | = |
| layer datetime | 89.0 → 101.4 | 8.8 → 8.6 | 11.4 → 9.0 | 14.8 → 10.2 | 12.6 → 11.4 | 57.9 → 17.2 | ±41.78% → ±10.79% | 20 → 20 | = |
| links=1 | 62.3 → 73.4 | 13.2 → 13.0 | 17.0 → 13.2 | 16.2 → 13.7 | 17.1 → 13.4 | 17.3 → 16.4 | ±4.31% → ±3.79% | 20 → 20 | -22.4% |
| links=10 | 61.9 → 67.9 | 13.5 → 13.4 | 17.1 → 14.2 | 16.3 → 14.9 | 17.3 → 16.5 | 18.1 → 17.5 | ±4.65% → ±4.80% | 20 → 20 | = |
| links=100 | 53.7 → 59.2 | 16.8 → 15.5 | 18.5 → 16.2 | 18.7 → 17.0 | 19.2 → 18.6 | 21.1 → 19.5 | ±2.82% → ±4.07% | 20 → 20 | -12.7% |
| poi selection | 25.0 → 21.0 | 32.5 → 30.7 | 41.8 → 50.3 | 41.1 → 51.4 | 43.4 → 64.1 | 60.1 → 74.7 | ±8.26% → ±12.62% | 20 → 20 | +20.5% |
| geozarr bands | 25.1 → 22.9 | 23.9 → 33.8 | 38.5 → 43.0 | 53.8 → 45.9 | 84.5 → 43.1 | 120.3 → 98.3 | ±27.96% → ±15.74% | 20 → 20 | = |
| select indicator | 14.8 → 18.9 | 37.9 → 34.4 | 71.9 → 53.4 | 76.5 → 56.1 | 87.3 → 66.4 | 160.3 → 79.0 | ±18.29% → ±10.93% | 20 → 20 | = |
| vector rendering | 15.0 → 16.4 | 50.6 → 49.1 | 66.8 → 61.3 | 68.3 → 62.3 | 72.3 → 66.9 | 91.8 → 84.5 | ±7.91% → ±6.78% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 304.9 | 305.3 → 305.1 | 305.3 → 305.1 | 305.4 → 305.2 | 305.6 → 305.4 | ±0.02% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.2 → 2.3 | 400.2 → 415.2 | 449.9 → 438.1 | 448.7 → 441.5 | 456.3 → 445.7 | 486.4 → 489.7 | ±2.22% → ±2.14% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.2 | 912.2 → 792.9 | 972.8 → 821.0 | 981.9 → 844.4 | 1008.4 → 865.2 | 1125.4 → 942.9 | ±2.53% → ±2.63% | 20 → 20 | -15.6% |

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
| **geozarr bands** | **0 → 0** | **0–3 → 0–1** | **0 → 0** |
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
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10735K | 206 |

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
