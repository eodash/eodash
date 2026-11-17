### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

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
| explore item | 209.7 → 194.8 | 3.5 → 2.8 | 4.8 → 5.2 | 4.9 → 6.1 | 5.4 → 6.1 | 5.8 → 16.2 | ±6.37% → ±26.80% | 20 → 20 | = |
| date snap | 113.8 → 115.8 | 2.7 → 6.9 | 10.0 → 9.2 | 9.8 → 8.8 | 10.2 → 9.6 | 14.4 → 10.9 | ±10.47% → ±6.37% | 20 → 20 | = |
| layer datetime | 112.9 → 105.3 | 8.5 → 8.6 | 8.7 → 8.9 | 8.9 → 9.8 | 8.8 → 9.5 | 11.1 → 16.8 | ±3.36% → ±10.61% | 20 → 20 | = |
| links=1 | 71.4 → 67.1 | 13.0 → 13.5 | 13.2 → 14.6 | 14.2 → 15.0 | 15.8 → 16.4 | 17.2 → 17.1 | ±5.10% → ±4.70% | 20 → 20 | = |
| links=10 | 71.1 → 63.0 | 13.3 → 13.8 | 13.5 → 16.7 | 14.2 → 16.0 | 13.8 → 17.0 | 17.2 → 17.3 | ±4.58% → ±3.91% | 20 → 20 | +23.3% |
| links=100 | 59.4 → 54.3 | 15.3 → 17.3 | 16.8 → 18.3 | 17.0 → 18.4 | 17.9 → 18.6 | 21.0 → 20.4 | ±4.46% → ±1.81% | 20 → 20 | +9.2% |
| geozarr bands | 30.2 → 23.4 | 26.1 → 21.7 | 30.5 → 47.1 | 35.1 → 48.7 | 42.7 → 63.3 | 55.1 → 72.5 | ±12.28% → ±15.05% | 20 → 20 | +54.2% |
| poi selection | 32.8 → 21.1 | 25.1 → 29.7 | 29.8 → 59.1 | 31.3 → 52.9 | 33.3 → 67.3 | 44.0 → 76.8 | ±8.05% → ±14.90% | 20 → 20 | +98.7% |
| select indicator | 17.0 → 18.9 | 38.2 → 33.2 | 61.0 → 56.2 | 62.7 → 56.7 | 75.7 → 64.7 | 94.9 → 86.0 | ±12.49% → ±12.25% | 20 → 20 | = |
| vector rendering | 18.9 → 16.8 | 45.5 → 45.8 | 49.9 → 61.1 | 54.5 → 60.6 | 57.6 → 64.0 | 89.7 → 79.1 | ±9.98% → ±6.49% | 20 → 20 | +22.6% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.0 | 305.3 → 305.2 | 305.3 → 305.2 | 305.5 → 305.2 | 305.6 → 305.4 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.3 | 411.6 → 392.1 | 440.9 → 423.2 | 442.1 → 438.3 | 453.4 → 439.9 | 483.9 → 644.4 | ±2.25% → ±6.55% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.5 | 716.3 → 610.6 | 751.3 → 650.7 | 773.8 → 654.2 | 790.6 → 673.9 | 923.8 → 737.9 | ±3.65% → ±2.43% | 20 → 20 | -13.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
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
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11958K | 206 |

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
