### Benchmarks

Previous run → this run. Baseline [`e880fd7aa750ebb66202660e5accf4435a08b5d7`](https://github.com/eodash/eodash/commit/e880fd7aa750ebb66202660e5accf4435a08b5d7), 2026-10-24T15:20:45.905Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- geotiff rendering, vector rendering: draws a styled layer of each source type
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 138.2 → 126.7 | 6.0 → 6.2 | 6.9 → 7.8 | 7.6 → 8.2 | 8.2 → 8.7 | 15.7 → 14.6 | ±15.03% → ±11.59% | 20 → 20 | = |
| date snap | 111.4 → 100.0 | 5.7 → 7.7 | 9.0 → 10.4 | 9.8 → 10.5 | 11.1 → 12.0 | 18.7 → 17.7 | ±15.53% → ±11.99% | 20 → 20 | = |
| layer datetime | 89.0 → 100.1 | 8.8 → 8.7 | 11.4 → 9.1 | 14.8 → 10.2 | 12.6 → 11.6 | 57.9 → 13.5 | ±41.78% → ±7.71% | 20 → 20 | = |
| links=1 | 62.3 → 59.7 | 13.2 → 13.3 | 17.0 → 17.2 | 16.2 → 18.1 | 17.1 → 17.5 | 17.3 → 44.2 | ±4.31% → ±20.09% | 20 → 20 | = |
| links=10 | 61.9 → 64.0 | 13.5 → 13.7 | 17.1 → 16.7 | 16.3 → 15.8 | 17.3 → 17.4 | 18.1 → 17.8 | ±4.65% → ±5.13% | 20 → 20 | = |
| links=100 | 53.7 → 52.0 | 16.8 → 16.8 | 18.5 → 19.4 | 18.7 → 19.3 | 19.2 → 19.6 | 21.1 → 20.4 | ±2.82% → ±1.92% | 20 → 20 | = |
| geozarr bands | 25.1 → 21.7 | 23.9 → 32.9 | 38.5 → 46.1 | 53.8 → 47.8 | 84.5 → 48.0 | 120.3 → 88.6 | ±27.96% → ±12.03% | 20 → 20 | = |
| geotiff rendering | 2.2 → 3.5 | 400.2 → 36.0 | 449.9 → 448.8 | 448.7 → 429.6 | 456.3 → 452.3 | 486.4 → 494.7 | ±2.22% → ±10.35% | 20 → 20 | = |
| poi selection | 25.0 → 18.5 | 32.5 → 36.5 | 41.8 → 63.3 | 41.1 → 57.4 | 43.4 → 67.9 | 60.1 → 72.1 | ±8.26% → ±10.93% | 20 → 20 | +51.3% |
| select indicator | 14.8 → 14.0 | 37.9 → 41.8 | 71.9 → 82.7 | 76.5 → 76.3 | 87.3 → 90.2 | 160.3 → 105.1 | ±18.29% → ±11.63% | 20 → 20 | = |
| vector rendering | 15.0 → 14.9 | 50.6 → 55.1 | 66.8 → 64.9 | 68.3 → 70.0 | 72.3 → 70.6 | 91.8 → 127.7 | ±7.91% → ±11.94% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 304.9 | 305.3 → 305.3 | 305.3 → 305.3 | 305.4 → 305.4 | 305.6 → 305.6 | ±0.02% → ±0.03% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 912.2 → 979.2 | 972.8 → 1014.0 | 981.9 → 1024.9 | 1008.4 → 1042.0 | 1125.4 → 1103.3 | ±2.53% → ±1.83% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–3 → 0–1** | **0 → 0** |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
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
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10429K | 206 |

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
