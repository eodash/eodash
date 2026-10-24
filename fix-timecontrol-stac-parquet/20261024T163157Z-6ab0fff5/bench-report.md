### Benchmarks

Previous run → this run. Baseline [`e880fd7aa750ebb66202660e5accf4435a08b5d7`](https://github.com/eodash/eodash/commit/e880fd7aa750ebb66202660e5accf4435a08b5d7), 2026-10-24T15:20:45.905Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 111.4 → 147.1 | 5.7 → 3.1 | 9.0 → 7.1 | 9.8 → 7.1 | 11.1 → 7.5 | 18.7 → 9.8 | ±15.53% → ±8.14% | 20 → 20 | -21.7% |
| explore item | 138.2 → 170.1 | 6.0 → 3.4 | 6.9 → 6.0 | 7.6 → 6.6 | 8.2 → 6.6 | 15.7 → 17.9 | ±15.03% → ±23.78% | 20 → 20 | -12.9% |
| layer datetime | 89.0 → 109.5 | 8.8 → 8.5 | 11.4 → 8.7 | 14.8 → 9.3 | 12.6 → 9.1 | 57.9 → 12.0 | ±41.78% → ±6.02% | 20 → 20 | -23.7% |
| links=1 | 62.3 → 71.8 | 13.2 → 13.0 | 17.0 → 13.2 | 16.2 → 14.0 | 17.1 → 15.1 | 17.3 → 16.9 | ±4.31% → ±4.74% | 20 → 20 | -22.1% |
| links=10 | 61.9 → 71.0 | 13.5 → 13.2 | 17.1 → 13.5 | 16.3 → 14.2 | 17.3 → 14.3 | 18.1 → 16.9 | ±4.65% → ±4.19% | 20 → 20 | -21.1% |
| links=100 | 53.7 → 59.5 | 16.8 → 15.5 | 18.5 → 16.2 | 18.7 → 16.9 | 19.2 → 18.1 | 21.1 → 19.4 | ±2.82% → ±3.71% | 20 → 20 | -12.7% |
| geozarr bands | 25.1 → 22.9 | 23.9 → 31.0 | 38.5 → 43.1 | 53.8 → 44.5 | 84.5 → 44.5 | 120.3 → 70.2 | ±27.96% → ±8.37% | 20 → 20 | = |
| poi selection | 25.0 → 22.1 | 32.5 → 31.9 | 41.8 → 46.2 | 41.1 → 48.5 | 43.4 → 60.5 | 60.1 → 71.7 | ±8.26% → ±12.73% | 20 → 20 | +10.5% |
| vector rendering | 15.0 → 17.0 | 50.6 → 47.0 | 66.8 → 56.9 | 68.3 → 61.4 | 72.3 → 62.8 | 91.8 → 99.9 | ±7.91% → ±11.34% | 20 → 20 | -14.8% |
| select indicator | 14.8 → 15.1 | 37.9 → 47.6 | 71.9 → 68.2 | 76.5 → 70.2 | 87.3 → 84.8 | 160.3 → 109.8 | ±18.29% → ±11.89% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.0 | 305.3 → 305.1 | 305.3 → 305.1 | 305.4 → 305.2 | 305.6 → 305.4 | ±0.02% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.2 → 2.3 | 400.2 → 420.7 | 449.9 → 428.1 | 448.7 → 434.8 | 456.3 → 430.2 | 486.4 → 501.9 | ±2.22% → ±2.20% | 20 → 20 | -4.9% |
| mirrored selection | 1.0 → 1.2 | 912.2 → 791.5 | 972.8 → 822.7 | 981.9 → 837.3 | 1008.4 → 854.6 | 1125.4 → 933.6 | ±2.53% → ±2.26% | 20 → 20 | -15.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–3 → 0–1** | **0 → 0** |
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
