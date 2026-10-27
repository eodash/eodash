### Benchmarks

Previous run → this run. Baseline [`e880fd7aa750ebb66202660e5accf4435a08b5d7`](https://github.com/eodash/eodash/commit/e880fd7aa750ebb66202660e5accf4435a08b5d7), 2026-10-24T15:20:45.905Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
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
| date snap | 111.4 → 112.9 | 5.7 → 3.7 | 9.0 → 9.0 | 9.8 → 10.0 | 11.1 → 12.0 | 18.7 → 17.7 | ±15.53% → ±16.38% | 20 → 20 | = |
| explore item | 138.2 → 128.6 | 6.0 → 5.5 | 6.9 → 7.8 | 7.6 → 8.1 | 8.2 → 9.0 | 15.7 → 14.2 | ±15.03% → ±11.73% | 20 → 20 | = |
| layer datetime | 89.0 → 96.4 | 8.8 → 8.7 | 11.4 → 9.3 | 14.8 → 11.9 | 12.6 → 11.8 | 57.9 → 37.9 | ±41.78% → ±30.24% | 20 → 20 | = |
| links=1 | 62.3 → 64.1 | 13.2 → 13.5 | 17.0 → 16.5 | 16.2 → 15.7 | 17.1 → 16.8 | 17.3 → 18.0 | ±4.31% → ±4.59% | 20 → 20 | = |
| links=10 | 61.9 → 59.1 | 13.5 → 14.0 | 17.1 → 17.1 | 16.3 → 17.0 | 17.3 → 17.3 | 18.1 → 17.5 | ±4.65% → ±2.00% | 20 → 20 | = |
| links=100 | 53.7 → 54.2 | 16.8 → 17.0 | 18.5 → 18.2 | 18.7 → 18.5 | 19.2 → 18.5 | 21.1 → 21.4 | ±2.82% → ±2.62% | 20 → 20 | = |
| poi selection | 25.0 → 23.6 | 32.5 → 29.1 | 41.8 → 36.9 | 41.1 → 46.7 | 43.4 → 61.0 | 60.1 → 73.5 | ±8.26% → ±15.50% | 20 → 20 | = |
| geozarr bands | 25.1 → 22.3 | 23.9 → 42.1 | 38.5 → 43.1 | 53.8 → 46.2 | 84.5 → 44.4 | 120.3 → 86.0 | ±27.96% → ±11.76% | 20 → 20 | = |
| select indicator | 14.8 → 15.4 | 37.9 → 43.5 | 71.9 → 76.1 | 76.5 → 68.6 | 87.3 → 83.2 | 160.3 → 85.9 | ±18.29% → ±10.82% | 20 → 20 | = |
| vector rendering | 15.0 → 16.8 | 50.6 → 46.1 | 66.8 → 57.3 | 68.3 → 63.7 | 72.3 → 64.1 | 91.8 → 119.7 | ±7.91% → ±14.91% | 20 → 20 | -14.1% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.3 → 305.3 | 305.3 → 305.3 | 305.4 → 305.4 | 305.6 → 305.6 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.3 | 400.2 → 399.2 | 449.9 → 425.3 | 448.7 → 430.7 | 456.3 → 433.7 | 486.4 → 521.6 | ±2.22% → ±3.31% | 20 → 20 | -5.5% |
| mirrored selection | 1.0 → 1.4 | 912.2 → 648.8 | 972.8 → 684.2 | 981.9 → 692.8 | 1008.4 → 712.4 | 1125.4 → 798.9 | ±2.53% → ±2.75% | 20 → 20 | -29.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
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
