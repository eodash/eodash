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
| explore item | 138.2 → 160.2 | 6.0 → 4.4 | 6.9 → 6.4 | 7.6 → 6.5 | 8.2 → 7.7 | 15.7 → 8.8 | ±15.03% → ±10.28% | 20 → 20 | = |
| date snap | 111.4 → 132.6 | 5.7 → 6.5 | 9.0 → 7.2 | 9.8 → 8.0 | 11.1 → 7.6 | 18.7 → 17.0 | ±15.53% → ±15.72% | 20 → 20 | -20.0% |
| layer datetime | 89.0 → 110.4 | 8.8 → 8.5 | 11.4 → 8.9 | 14.8 → 9.1 | 12.6 → 9.0 | 57.9 → 12.3 | ±41.78% → ±5.00% | 20 → 20 | -22.4% |
| links=1 | 62.3 → 68.5 | 13.2 → 13.1 | 17.0 → 14.4 | 16.2 → 14.7 | 17.1 → 16.2 | 17.3 → 16.7 | ±4.31% → ±4.43% | 20 → 20 | = |
| links=10 | 61.9 → 68.9 | 13.5 → 13.4 | 17.1 → 13.7 | 16.3 → 14.7 | 17.3 → 16.1 | 18.1 → 17.6 | ±4.65% → ±5.01% | 20 → 20 | -20.2% |
| links=100 | 53.7 → 57.0 | 16.8 → 15.7 | 18.5 → 17.9 | 18.7 → 17.6 | 19.2 → 18.3 | 21.1 → 20.6 | ±2.82% → ±3.47% | 20 → 20 | = |
| geozarr bands | 25.1 → 23.7 | 23.9 → 28.0 | 38.5 → 43.6 | 53.8 → 43.0 | 84.5 → 45.1 | 120.3 → 50.8 | ±27.96% → ±6.06% | 20 → 20 | = |
| poi selection | 25.0 → 26.5 | 32.5 → 28.1 | 41.8 → 35.3 | 41.1 → 43.8 | 43.4 → 41.8 | 60.1 → 125.3 | ±8.26% → ±26.85% | 20 → 20 | = |
| select indicator | 14.8 → 15.1 | 37.9 → 43.8 | 71.9 → 71.1 | 76.5 → 69.5 | 87.3 → 78.4 | 160.3 → 94.1 | ±18.29% → ±10.27% | 20 → 20 | = |
| vector rendering | 15.0 → 17.1 | 50.6 → 48.6 | 66.8 → 56.0 | 68.3 → 60.4 | 72.3 → 66.5 | 91.8 → 85.1 | ±7.91% → ±9.45% | 20 → 20 | -16.1% |
| geotiff rendering | 2.2 → 3.1 | 400.2 → 49.9 | 449.9 → 443.5 | 448.7 → 425.4 | 456.3 → 444.7 | 486.4 → 539.3 | ±2.22% → ±10.23% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 304.9 | 305.3 → 305.1 | 305.3 → 305.1 | 305.4 → 305.2 | 305.6 → 305.4 | ±0.02% → ±0.02% | 20 → 20 | -0.1% |
| mirrored selection | 1.0 → 1.2 | 912.2 → 784.6 | 972.8 → 831.0 | 981.9 → 854.5 | 1008.4 → 886.9 | 1125.4 → 995.7 | ±2.53% → ±3.38% | 20 → 20 | -14.6% |

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
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
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
