### Benchmarks

Previous run → this run. Baseline [`e880fd7aa750ebb66202660e5accf4435a08b5d7`](https://github.com/eodash/eodash/commit/e880fd7aa750ebb66202660e5accf4435a08b5d7), 2026-10-24T15:20:45.905Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- geozarr bands: dragging a band rebuilds the source
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 138.2 → 119.3 | 6.0 → 6.0 | 6.9 → 8.6 | 7.6 → 9.2 | 8.2 → 9.4 | 15.7 → 19.0 | ±15.03% → ±17.88% | 20 → 20 | +23.0% |
| date snap | 111.4 → 96.7 | 5.7 → 7.3 | 9.0 → 10.8 | 9.8 → 11.1 | 11.1 → 13.2 | 18.7 → 18.0 | ±15.53% → ±13.10% | 20 → 20 | = |
| layer datetime | 89.0 → 101.7 | 8.8 → 8.4 | 11.4 → 8.9 | 14.8 → 10.5 | 12.6 → 12.3 | 57.9 → 20.7 | ±41.78% → ±14.97% | 20 → 20 | -22.4% |
| geozarr bands | 25.1 → 26.8 | 23.9 → 11.4 | 38.5 → 43.5 | 53.8 → 41.9 | 84.5 → 46.3 | 120.3 → 52.1 | ±27.96% → ±10.59% | 20 → 20 | = |
| links=1 | 62.3 → 65.2 | 13.2 → 13.2 | 17.0 → 16.3 | 16.2 → 15.6 | 17.1 → 17.0 | 17.3 → 17.8 | ±4.31% → ±5.38% | 20 → 20 | = |
| links=10 | 61.9 → 66.7 | 13.5 → 13.5 | 17.1 → 13.9 | 16.3 → 15.2 | 17.3 → 17.1 | 18.1 → 19.1 | ±4.65% → ±5.96% | 20 → 20 | -18.7% |
| links=100 | 53.7 → 52.7 | 16.8 → 16.4 | 18.5 → 19.4 | 18.7 → 19.0 | 19.2 → 19.5 | 21.1 → 21.0 | ±2.82% → ±2.40% | 20 → 20 | = |
| poi selection | 25.0 → 25.1 | 32.5 → 33.6 | 41.8 → 40.3 | 41.1 → 40.5 | 43.4 → 42.8 | 60.1 → 55.4 | ±8.26% → ±6.22% | 20 → 20 | = |
| select indicator | 14.8 → 12.3 | 37.9 → 53.0 | 71.9 → 89.6 | 76.5 → 84.7 | 87.3 → 96.5 | 160.3 → 103.7 | ±18.29% → ±8.87% | 20 → 20 | = |
| vector rendering | 15.0 → 14.7 | 50.6 → 58.3 | 66.8 → 65.4 | 68.3 → 69.8 | 72.3 → 68.1 | 91.8 → 111.6 | ±7.91% → ±9.10% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.2 | 305.3 → 305.3 | 305.3 → 305.4 | 305.4 → 305.4 | 305.6 → 305.9 | ±0.02% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.0 | 400.2 → 468.9 | 449.9 → 483.0 | 448.7 → 491.3 | 456.3 → 504.4 | 486.4 → 543.6 | ±2.22% → ±1.99% | 20 → 20 | +7.4% |
| mirrored selection | 1.0 → 1.0 | 912.2 → 1004.0 | 972.8 → 1030.3 | 981.9 → 1039.4 | 1008.4 → 1053.7 | 1125.4 → 1141.3 | ±2.53% → ±1.60% | 20 → 20 | +5.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–3 → 0–1** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
