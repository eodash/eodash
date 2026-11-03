### Benchmarks

Previous run → this run. Baseline [`3bd369e7258db23481438a2fdf67b2ed97d6cf6b`](https://github.com/eodash/eodash/commit/3bd369e7258db23481438a2fdf67b2ed97d6cf6b), 2026-10-28T12:53:57.683Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 156.2 → 114.7 | 5.2 → 6.3 | 6.4 → 8.1 | 6.6 → 10.0 | 7.2 → 10.1 | 8.6 → 25.1 | ±7.78% → ±23.77% | 20 → 20 | = |
| date snap | 112.6 → 79.8 | 7.2 → 7.8 | 8.9 → 12.9 | 9.3 → 13.5 | 10.2 → 14.5 | 14.3 → 23.3 | ±11.58% → ±13.70% | 20 → 20 | +44.9% |
| layer datetime | 103.3 → 92.6 | 8.5 → 8.8 | 8.9 → 10.6 | 11.3 → 12.7 | 9.9 → 12.1 | 40.8 → 45.4 | ±35.52% → ±35.01% | 20 → 20 | = |
| links=10 | 65.7 → 57.6 | 13.5 → 13.9 | 15.3 → 17.6 | 15.4 → 17.4 | 16.9 → 17.8 | 18.5 → 18.0 | ±5.48% → ±2.31% | 20 → 20 | +15.4% |
| links=1 | 66.0 → 57.5 | 13.3 → 16.2 | 15.8 → 17.3 | 15.3 → 17.4 | 16.9 → 17.6 | 17.4 → 18.9 | ±5.25% → ±1.53% | 20 → 20 | +9.2% |
| links=100 | 54.9 → 51.8 | 15.8 → 17.4 | 18.4 → 19.2 | 18.3 → 19.4 | 18.8 → 19.6 | 20.2 → 21.8 | ±2.77% → ±2.25% | 20 → 20 | +4.6% |
| geozarr bands | 22.5 → 23.1 | 42.2 → 24.1 | 44.0 → 46.8 | 44.5 → 49.0 | 45.4 → 49.0 | 48.6 → 90.1 | ±1.90% → ±17.86% | 20 → 20 | +6.3% |
| poi selection | 24.1 → 16.5 | 29.3 → 37.2 | 36.0 → 70.1 | 46.5 → 65.4 | 61.1 → 76.7 | 81.1 → 84.4 | ±17.68% → ±11.26% | 20 → 20 | +94.9% |
| select indicator | 16.9 → 13.8 | 33.8 → 39.5 | 68.3 → 86.3 | 65.1 → 79.5 | 80.9 → 95.5 | 92.1 → 107.0 | ±13.31% → ±12.81% | 20 → 20 | +26.4% |
| vector rendering | 16.4 → 14.8 | 46.0 → 54.1 | 59.3 → 64.2 | 64.2 → 71.0 | 63.0 → 73.6 | 112.1 → 124.8 | ±13.03% → ±12.78% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.0 → 305.1 | 305.2 → 305.3 | 305.3 → 305.4 | 305.3 → 305.5 | 305.7 → 305.6 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.1 | 427.3 → 463.1 | 451.0 → 482.1 | 458.3 → 487.4 | 462.3 → 491.1 | 562.6 → 546.3 | ±3.66% → ±2.03% | 20 → 20 | +6.9% |
| mirrored selection | 1.2 → 0.9 | 808.1 → 1017.0 | 850.9 → 1050.9 | 871.5 → 1058.0 | 919.4 → 1068.9 | 965.4 → 1163.1 | ±3.20% → ±1.69% | 20 → 20 | +23.5% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
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
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
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
