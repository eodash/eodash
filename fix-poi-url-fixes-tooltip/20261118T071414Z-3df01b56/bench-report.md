### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

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
| date snap | 113.8 → 117.7 | 2.7 → 3.1 | 10.0 → 9.4 | 9.8 → 9.4 | 10.2 → 10.0 | 14.4 → 16.8 | ±10.47% → ±13.75% | 20 → 20 | = |
| explore item | 209.7 → 158.8 | 3.5 → 4.5 | 4.8 → 6.1 | 4.9 → 7.1 | 5.4 → 6.6 | 5.8 → 18.8 | ±6.37% → ±24.26% | 20 → 20 | +27.1% |
| layer datetime | 112.9 → 110.4 | 8.5 → 8.4 | 8.7 → 8.6 | 8.9 → 9.8 | 8.8 → 8.7 | 11.1 → 25.8 | ±3.36% → ±21.95% | 20 → 20 | = |
| links=1 | 71.4 → 69.8 | 13.0 → 13.2 | 13.2 → 13.4 | 14.2 → 14.5 | 15.8 → 15.8 | 17.2 → 17.9 | ±5.10% → ±5.36% | 20 → 20 | = |
| links=10 | 71.1 → 70.7 | 13.3 → 13.3 | 13.5 → 13.7 | 14.2 → 14.3 | 13.8 → 14.0 | 17.2 → 17.8 | ±4.58% → ±4.58% | 20 → 20 | = |
| links=100 | 59.4 → 52.7 | 15.3 → 16.0 | 16.8 → 18.6 | 17.0 → 19.1 | 17.9 → 19.7 | 21.0 → 23.0 | ±4.46% → ±3.90% | 20 → 20 | +10.7% |
| geozarr bands | 30.2 → 25.6 | 26.1 → 25.5 | 30.5 → 43.3 | 35.1 → 42.0 | 42.7 → 45.6 | 55.1 → 75.9 | ±12.28% → ±13.57% | 20 → 20 | = |
| poi selection | 32.8 → 27.0 | 25.1 → 29.7 | 29.8 → 35.3 | 31.3 → 38.6 | 33.3 → 45.2 | 44.0 → 60.6 | ±8.05% → ±10.84% | 20 → 20 | +18.7% |
| select indicator | 17.0 → 16.2 | 38.2 → 34.8 | 61.0 → 71.1 | 62.7 → 66.7 | 75.7 → 76.8 | 94.9 → 97.7 | ±12.49% → ±12.47% | 20 → 20 | = |
| vector rendering | 18.9 → 16.5 | 45.5 → 44.9 | 49.9 → 60.5 | 54.5 → 62.4 | 57.6 → 66.0 | 89.7 → 93.9 | ±9.98% → ±9.11% | 20 → 20 | +21.4% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 304.9 | 305.3 → 305.1 | 305.3 → 305.2 | 305.5 → 305.3 | 305.6 → 305.5 | ±0.02% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.3 → 2.2 | 411.6 → 424.9 | 440.9 → 446.4 | 442.1 → 461.9 | 453.4 → 464.2 | 483.9 → 675.1 | ±2.25% → ±6.42% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.2 | 716.3 → 794.1 | 751.3 → 845.4 | 773.8 → 867.0 | 790.6 → 886.4 | 923.8 → 1055.1 | ±3.65% → ±3.78% | 20 → 20 | +12.5% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
