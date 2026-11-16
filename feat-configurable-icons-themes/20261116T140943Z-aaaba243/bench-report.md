### Benchmarks

Previous run → this run. Baseline [`60d8d936ba028251f73f0ebb64405d548078db53`](https://github.com/eodash/eodash/commit/60d8d936ba028251f73f0ebb64405d548078db53), 2026-11-16T11:00:55.316Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- geozarr bands: dragging a band rebuilds the source
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 209.7 → 116.3 | 3.5 → 6.4 | 4.8 → 8.2 | 4.9 → 9.4 | 5.4 → 10.8 | 5.8 → 20.2 | ±6.37% → ±17.86% | 20 → 20 | +69.8% |
| date snap | 113.8 → 87.5 | 2.7 → 7.4 | 10.0 → 12.0 | 9.8 → 12.4 | 10.2 → 16.0 | 14.4 → 18.1 | ±10.47% → ±13.31% | 20 → 20 | +19.4% |
| layer datetime | 112.9 → 93.9 | 8.5 → 8.8 | 8.7 → 10.6 | 8.9 → 11.1 | 8.8 → 12.8 | 11.1 → 16.1 | ±3.36% → ±10.07% | 20 → 20 | +21.8% |
| links=10 | 71.1 → 57.8 | 13.3 → 14.6 | 13.5 → 17.4 | 14.2 → 17.4 | 13.8 → 17.8 | 17.2 → 19.1 | ±4.58% → ±2.76% | 20 → 20 | +28.9% |
| links=1 | 71.4 → 58.5 | 13.0 → 15.4 | 13.2 → 17.1 | 14.2 → 17.1 | 15.8 → 17.4 | 17.2 → 18.6 | ±5.10% → ±2.02% | 20 → 20 | +29.5% |
| links=100 | 59.4 → 51.4 | 15.3 → 17.0 | 16.8 → 18.9 | 17.0 → 19.8 | 17.9 → 20.3 | 21.0 → 26.9 | ±4.46% → ±6.64% | 20 → 20 | +12.2% |
| poi selection | 32.8 → 20.0 | 25.1 → 35.7 | 29.8 → 47.2 | 31.3 → 54.8 | 33.3 → 67.6 | 44.0 → 94.2 | ±8.05% → ±15.60% | 20 → 20 | +58.7% |
| select indicator | 17.0 → 14.2 | 38.2 → 43.1 | 61.0 → 72.0 | 62.7 → 79.2 | 75.7 → 93.2 | 94.9 → 161.1 | ±12.49% → ±18.00% | 20 → 20 | = |
| geozarr bands | 30.2 → 19.4 | 26.1 → 43.8 | 30.5 → 51.8 | 35.1 → 52.3 | 42.7 → 56.2 | 55.1 → 69.6 | ±12.28% → ±6.35% | 20 → 20 | +69.4% |
| vector rendering | 18.9 → 13.5 | 45.5 → 59.5 | 49.9 → 71.9 | 54.5 → 77.6 | 57.6 → 80.7 | 89.7 → 155.5 | ±9.98% → ±14.10% | 20 → 20 | +44.3% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.2 | 305.3 → 305.4 | 305.3 → 305.6 | 305.5 → 305.6 | 305.6 → 307.6 | ±0.02% → ±0.09% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.0 | 411.6 → 460.9 | 440.9 → 503.6 | 442.1 → 504.4 | 453.4 → 529.2 | 483.9 → 552.4 | ±2.25% → ±2.72% | 20 → 20 | +14.2% |
| mirrored selection | 1.3 → 1.0 | 716.3 → 1000.1 | 751.3 → 1034.9 | 773.8 → 1043.6 | 790.6 → 1047.7 | 923.8 → 1154.5 | ±3.65% → ±1.74% | 20 → 20 | +37.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
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
| explore item | none | | | | |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
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
