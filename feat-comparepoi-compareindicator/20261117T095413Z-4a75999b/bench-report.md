### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- geozarr bands: dragging a band rebuilds the source
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 113.8 → 132.2 | 2.7 → 4.4 | 10.0 → 6.7 | 9.8 → 8.3 | 10.2 → 10.0 | 14.4 → 16.0 | ±10.47% → ±16.11% | 20 → 20 | -33.3% |
| explore item | 209.7 → 161.4 | 3.5 → 4.8 | 4.8 → 5.7 | 4.9 → 7.2 | 5.4 → 6.8 | 5.8 → 17.4 | ±6.37% → ±25.25% | 20 → 20 | +17.7% |
| layer datetime | 112.9 → 88.8 | 8.5 → 8.8 | 8.7 → 11.3 | 8.9 → 16.3 | 8.8 → 13.0 | 11.1 → 88.2 | ±3.36% → ±59.46% | 20 → 20 | +29.9% |
| links=1 | 71.4 → 58.3 | 13.0 → 13.2 | 13.2 → 17.1 | 14.2 → 18.2 | 15.8 → 17.6 | 17.2 → 41.2 | ±5.10% → ±17.52% | 20 → 20 | +29.5% |
| links=10 | 71.1 → 58.9 | 13.3 → 14.4 | 13.5 → 17.2 | 14.2 → 17.0 | 13.8 → 17.6 | 17.2 → 18.2 | ±4.58% → ±2.72% | 20 → 20 | +27.4% |
| links=100 | 59.4 → 55.0 | 15.3 → 15.9 | 16.8 → 18.3 | 17.0 → 18.3 | 17.9 → 19.0 | 21.0 → 20.7 | ±4.46% → ±3.40% | 20 → 20 | +9.2% |
| poi selection | 32.8 → 27.2 | 25.1 → 29.3 | 29.8 → 36.9 | 31.3 → 37.5 | 33.3 → 41.9 | 44.0 → 49.1 | ±8.05% → ±7.19% | 20 → 20 | +24.2% |
| select indicator | 17.0 → 15.7 | 38.2 → 36.0 | 61.0 → 67.5 | 62.7 → 68.3 | 75.7 → 81.9 | 94.9 → 101.4 | ±12.49% → ±12.16% | 20 → 20 | = |
| geozarr bands | 30.2 → 22.2 | 26.1 → 39.1 | 30.5 → 45.3 | 35.1 → 45.2 | 42.7 → 46.3 | 55.1 → 51.7 | ±12.28% → ±3.01% | 20 → 20 | +48.1% |
| vector rendering | 18.9 → 16.4 | 45.5 → 49.3 | 49.9 → 60.2 | 54.5 → 62.0 | 57.6 → 66.6 | 89.7 → 82.8 | ±9.98% → ±6.69% | 20 → 20 | +20.7% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.3 | 305.3 → 305.6 | 305.3 → 305.6 | 305.5 → 305.7 | 305.6 → 305.8 | ±0.02% → ±0.02% | 20 → 20 | +0.1% |
| geotiff rendering | 2.3 → 2.2 | 411.6 → 422.4 | 440.9 → 453.6 | 442.1 → 461.0 | 453.4 → 471.6 | 483.9 → 546.3 | ±2.25% → ±3.38% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.2 | 716.3 → 754.9 | 751.3 → 792.8 | 773.8 → 806.7 | 790.6 → 809.6 | 923.8 → 960.9 | ±3.65% → ±3.16% | 20 → 20 | = |

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
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11652K | 206 |

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
